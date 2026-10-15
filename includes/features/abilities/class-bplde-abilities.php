<?php
/**
 * AI Agent Access: read-only abilities for the WordPress Abilities API (WordPress 6.9+).
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Abilities;

use BPLDE\Model\DocumentsQuery;
use BPLDE\Model\LeadsQuery;

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/class-bplde-documents-query.php';
require_once __DIR__ . '/class-bplde-leads-query.php';
require_once __DIR__ . '/class-bplde-abilities-reports.php';

if (!class_exists('BPLDE\Abilities\Abilities')) {
    class Abilities
    {
        const CATEGORY      = 'document-embedder';
        const MAX_PER_PAGE  = 100;
        const MAX_SPAN_DAYS = 366;
        const MAX_USED_ON   = 50;
        const TEXT_LIMIT    = 300;

        private static $_instance = null;

        public static function instance()
        {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        private function __construct()
        {
            add_action('wp_abilities_api_categories_init', [$this, 'register_category']);
            add_action('wp_abilities_api_init', [$this, 'register_abilities']);
            add_action('admin_init', [$this, 'privacy_policy']);
        }

        /* ---------------------------------------------------------------------------------
         * Gates
         * ------------------------------------------------------------------------------ */

        /** Both functions: an early Abilities API feature plugin on WordPress < 6.9 had no categories. */
        public static function supported()
        {
            return function_exists('wp_register_ability') && function_exists('wp_register_ability_category');
        }

        private static function setting($key, $default)
        {
            $options = get_option('_ppt_');
            $value   = (is_array($options) && array_key_exists($key, $options)) ? $options[$key] : $default;

            return !in_array($value, ['0', 0, '', false, null], true);
        }

        public static function enabled()
        {
            return self::setting('bplde_ai_abilities', '1');
        }

        /** Off unless the site owner opts in: lead names and emails leave the site with every call. */
        public static function leads_enabled()
        {
            return self::setting('bplde_ai_leads', '0');
        }

        /* ---------------------------------------------------------------------------------
         * Registration
         * ------------------------------------------------------------------------------ */

        public function register_category()
        {
            if (!self::enabled()) {
                return;
            }

            wp_register_ability_category(self::CATEGORY, [
                'label'       => __('Document Embedder', 'document-emberdder'),
                'description' => __('Embedded documents, document libraries, downloads, leads and analytics.', 'document-emberdder'),
            ]);
        }

        public function register_abilities()
        {
            if (!self::enabled()) {
                return;
            }

            self::register('list-documents', [
                'label'               => __('List documents', 'document-emberdder'),
                'description'         => __('Lists saved Document Embedder documents the current user can edit. Each item: id, title, status, file type, viewer, file source, shortcode, tags, lifetime downloads and real email leads. Max 100 per page. Use get-document for one document\'s full settings and the pages that embed it, and get-download-stats for downloads in a date range.', 'document-emberdder'),
                'input_schema'        => self::list_documents_input(),
                'output_schema'       => self::paged_output(self::document_schema()),
                'execute_callback'    => [__CLASS__, 'list_documents'],
                'permission_callback' => [__CLASS__, 'can_edit_posts'],
            ]);

            self::register('get-document', [
                'label'               => __('Get document', 'document-emberdder'),
                'description'         => __('Returns one saved document by id: the list-documents fields plus its stored settings (file URL, viewer, toolbar, download, view/download access, email gate, secure delivery, lightbox, overlay count) and up to 50 published posts or pages that embed it by shortcode or Saved Document block (used_on_truncated says if there are more). Never returns file contents.', 'document-emberdder'),
                'input_schema'        => self::get_document_input(),
                'output_schema'       => self::document_detail_schema(),
                'execute_callback'    => [__CLASS__, 'get_document'],
                'permission_callback' => [__CLASS__, 'can_edit_document'],
            ]);

            self::register('get-download-stats', [
                'label'               => __('Get download stats', 'document-emberdder'),
                'description'         => __('Download and lead counts. With document_id: that document; without: documents ranked by lifetime downloads, plus site totals. lifetime_downloads is the all-time counter. With date_from and date_to (Y-m-d, site timezone, max 366 days) adds downloads_in_range (every logged download) and leads_in_range (real email leads). Read notes before comparing figures.', 'document-emberdder'),
                'input_schema'        => self::download_stats_input(),
                'output_schema'       => self::download_stats_output(),
                'execute_callback'    => [__CLASS__, 'get_download_stats'],
                'permission_callback' => [__CLASS__, 'can_manage_options'],
            ]);

            AbilitiesReports::register_abilities();
        }

        /**
         * The shared category and meta. On 6.9 meta is a free-form array, so `public` (read from 7.1)
         * and `mcp` (read by the MCP Adapter) are stored and ignored there; show_in_rest is set
         * explicitly so neither version has to derive it.
         */
        public static function register($name, array $args)
        {
            $args['category'] = self::CATEGORY;
            $args['meta']     = [
                'annotations'  => ['readonly' => true, 'destructive' => false, 'idempotent' => true],
                'show_in_rest' => true,
                'public'       => true,
                'mcp'          => ['public' => true],
            ];

            return wp_register_ability('document-embedder/' . $name, $args);
        }

        /* ---------------------------------------------------------------------------------
         * Permissions
         * ------------------------------------------------------------------------------ */

        public static function can_edit_posts()
        {
            return current_user_can('edit_posts');
        }

        public static function can_manage_options()
        {
            return current_user_can('manage_options');
        }

        /** An unknown id is left to the callback, which answers bplde_not_found to anyone who may list documents. */
        public static function can_edit_document($input = null)
        {
            $id = absint(self::arg(self::input($input), 'id', 0));

            if (get_post_type($id) !== DocumentsQuery::POST_TYPE) {
                return current_user_can('edit_posts');
            }

            return current_user_can('edit_post', $id);
        }

        /* ---------------------------------------------------------------------------------
         * Execute callbacks
         * ------------------------------------------------------------------------------ */

        public static function list_documents($input = null)
        {
            $input    = self::input($input);
            $page     = self::int_arg($input, 'page', 1, 1, PHP_INT_MAX);
            $per_page = self::int_arg($input, 'per_page', 20, 1, self::MAX_PER_PAGE);
            $type     = get_post_type_object(DocumentsQuery::POST_TYPE);

            if (!$type || !current_user_can($type->cap->edit_posts)) {
                return self::page([], 0, $page, $per_page);
            }

            $missing = self::arg($input, 'missing_file', null);

            $found = DocumentsQuery::find([
                'search'        => self::text_arg($input, 'search'),
                'file_type'     => sanitize_title(self::text_arg($input, 'file_type')),
                'tag'           => sanitize_title(self::text_arg($input, 'tag')),
                'status'        => self::enum_arg($input, 'status', ['any', 'publish', 'draft', 'private', 'pending', 'future'], 'any'),
                'viewer'        => self::enum_arg($input, 'viewer', DocumentsQuery::VIEWERS, ''),
                'missing_file'  => $missing === null ? null : rest_sanitize_boolean($missing),
                'orderby'       => self::enum_arg($input, 'orderby', ['date', 'title', 'downloads'], 'date'),
                'order'         => self::enum_arg($input, 'order', ['asc', 'desc'], 'desc'),
                'page'          => $page,
                'per_page'      => $per_page,
                'editable_only' => true,
            ]);

            return self::page(self::document_items($found['posts']), $found['total'], $page, $per_page);
        }

        public static function get_document($input = null)
        {
            $id   = absint(self::arg(self::input($input), 'id', 0));
            $post = get_post($id);

            if (!$post || $post->post_type !== DocumentsQuery::POST_TYPE) {
                return self::error('bplde_not_found', __('No document exists with that id.', 'document-emberdder'), 404);
            }
            if (!current_user_can('edit_post', $id)) {
                return self::error('bplde_forbidden', __('You are not allowed to read this document.', 'document-emberdder'), 403);
            }

            $items   = self::document_items([$post]);
            $used_on = DocumentsQuery::used_on($id, self::MAX_USED_ON);

            return array_merge($items[0], [
                'settings'          => self::format_settings(DocumentsQuery::settings($id)),
                'used_on'           => array_map([__CLASS__, 'format_host'], $used_on['posts']),
                'used_on_truncated' => $used_on['truncated'],
            ]);
        }

        public static function get_download_stats($input = null)
        {
            $input = self::input($input);
            $range = self::date_range($input);

            if (is_wp_error($range)) {
                return $range;
            }

            $out = [
                'scope' => 'all',
                'range' => $range ? ['from' => $range[0], 'to' => $range[1]] : null,
                'notes' => self::download_notes(),
            ];

            $document_id = absint(self::arg($input, 'document_id', 0));

            if ($document_id) {
                $post = get_post($document_id);
                if (!$post || $post->post_type !== DocumentsQuery::POST_TYPE) {
                    return self::error('bplde_not_found', __('No document exists with that id.', 'document-emberdder'), 404);
                }

                $rows = self::stats_rows([$post], $range);

                return array_merge($out, ['scope' => 'document', 'document' => $rows[0]]);
            }

            $page     = self::int_arg($input, 'page', 1, 1, PHP_INT_MAX);
            $per_page = self::int_arg($input, 'per_page', 20, 1, self::MAX_PER_PAGE);

            $found = DocumentsQuery::find([
                'search'       => '',
                'file_type'    => '',
                'tag'          => '',
                'status'       => 'any',
                'viewer'       => '',
                'missing_file' => null,
                'orderby'      => 'downloads',
                'order'        => 'desc',
                'page'         => $page,
                'per_page'     => $per_page,
            ]);

            return array_merge(
                $out,
                self::page(self::stats_rows($found['posts'], $range), $found['total'], $page, $per_page),
                ['totals' => self::stats_totals($range)]
            );
        }

        /* ---------------------------------------------------------------------------------
         * Mapping
         * ------------------------------------------------------------------------------ */

        /** @param \WP_Post[] $posts */
        private static function document_items(array $posts)
        {
            $leads = LeadsQuery::counts_by_document(wp_list_pluck($posts, 'ID'), ['real_only' => true]);
            $out   = [];

            foreach ($posts as $post) {
                $item             = DocumentsQuery::summary($post, $leads);
                $item['title']    = self::text($item['title']);
                $item['tags']     = array_map([__CLASS__, 'text'], $item['tags']);
                $item['created']  = self::iso($item['created']);
                $item['modified'] = self::iso($item['modified']);
                $out[]            = $item;
            }

            return $out;
        }

        private static function format_settings(array $settings)
        {
            $settings['file_url']              = esc_url_raw($settings['file_url']);
            $settings['viewer']['zoom']        = self::text($settings['viewer']['zoom']);
            $settings['toolbar']['theme']      = self::text($settings['toolbar']['theme']);
            $settings['toolbar']['position']   = self::text($settings['toolbar']['position']);
            $settings['download']['label']     = self::text($settings['download']['label']);
            $settings['download']['behaviour'] = self::text($settings['download']['behaviour']);
            $settings['download']['filename']  = self::text($settings['download']['filename']);

            return $settings;
        }

        private static function format_host(\WP_Post $post)
        {
            return [
                'id'    => (int) $post->ID,
                'title' => self::text($post->post_title),
                'type'  => $post->post_type,
                'url'   => (string) get_permalink($post),
            ];
        }

        /**
         * One query per figure for the whole page of documents.
         *
         * @param \WP_Post[]  $posts
         * @param string[]|null $range
         */
        private static function stats_rows(array $posts, $range)
        {
            $ids   = wp_list_pluck($posts, 'ID');
            $leads = LeadsQuery::counts_by_document($ids, ['real_only' => true]);

            if ($range) {
                $window          = ['from' => $range[0], 'to' => $range[1]];
                $range_downloads = LeadsQuery::counts_by_document($ids, $window);
                $range_leads     = LeadsQuery::counts_by_document($ids, $window + ['real_only' => true]);
            }

            $out = [];
            foreach ($posts as $post) {
                $id    = (int) $post->ID;
                $out[] = [
                    'id'                 => $id,
                    'title'              => self::text($post->post_title),
                    'lifetime_downloads' => (int) get_post_meta($id, '_de_download_count', true),
                    'leads'              => $leads[$id],
                    'downloads_in_range' => $range ? $range_downloads[$id] : null,
                    'leads_in_range'     => $range ? $range_leads[$id] : null,
                ];
            }

            return $out;
        }

        private static function stats_totals($range)
        {
            $window = $range ? ['from' => $range[0], 'to' => $range[1]] : null;

            return [
                'lifetime_downloads' => DocumentsQuery::lifetime_downloads_total(),
                'leads'              => LeadsQuery::count(['real_only' => true]),
                'downloads_in_range' => $window ? LeadsQuery::count($window) : null,
                'leads_in_range'     => $window ? LeadsQuery::count($window + ['real_only' => true]) : null,
            ];
        }

        private static function download_notes()
        {
            return [
                __('lifetime_downloads comes from the document counter; range figures come from the download log, which starts when that log was first created.', 'document-emberdder'),
                __('Real leads exclude the anonymous placeholder rows (anonymous@direct.download). Downloads in range count every log row.', 'document-emberdder'),
                __('The Leads figures on the Download Leads screen, the Documents list and the Download Stats box count every log row, anonymous rows included.', 'document-emberdder'),
            ];
        }

        /* ---------------------------------------------------------------------------------
         * Input and output helpers, shared with AbilitiesReports
         * ------------------------------------------------------------------------------ */

        public static function input($input)
        {
            if (is_object($input)) {
                $input = get_object_vars($input);
            }

            return is_array($input) ? $input : [];
        }

        public static function arg(array $input, $key, $default)
        {
            return array_key_exists($key, $input) ? $input[$key] : $default;
        }

        public static function int_arg(array $input, $key, $default, $min, $max)
        {
            $value = self::arg($input, $key, $default);
            $value = is_numeric($value) ? (int) $value : $default;

            return max($min, min($max, $value));
        }

        public static function enum_arg(array $input, $key, array $allowed, $default)
        {
            $value = self::arg($input, $key, $default);

            return in_array($value, $allowed, true) ? $value : $default;
        }

        public static function text_arg(array $input, $key)
        {
            $value = self::arg($input, $key, '');

            return is_scalar($value) ? sanitize_text_field((string) $value) : '';
        }

        /**
         * Both days or neither, real Y-m-d dates, in order, at most MAX_SPAN_DAYS apart.
         *
         * @return string[]|null|\WP_Error [from, to], or null when no range was asked for
         */
        public static function date_range(array $input)
        {
            $from = self::text_arg($input, 'date_from');
            $to   = self::text_arg($input, 'date_to');

            if ($from === '' && $to === '') {
                return null;
            }
            if ($from === '' || $to === '') {
                return self::error('bplde_invalid_range', __('date_from and date_to must be given together.', 'document-emberdder'), 400);
            }
            if (!self::is_day($from) || !self::is_day($to)) {
                return self::error('bplde_invalid_range', __('date_from and date_to must be real dates in Y-m-d format.', 'document-emberdder'), 400);
            }
            if ($from > $to) {
                return self::error('bplde_invalid_range', __('date_from must not be after date_to.', 'document-emberdder'), 400);
            }
            if ((strtotime($to) - strtotime($from)) / DAY_IN_SECONDS + 1 > self::MAX_SPAN_DAYS) {
                /* translators: %d: maximum number of days. */
                return self::error('bplde_invalid_range', sprintf(__('A date range can span at most %d days.', 'document-emberdder'), self::MAX_SPAN_DAYS), 400);
            }

            return [$from, $to];
        }

        private static function is_day($day)
        {
            return (bool) preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $day, $m) && checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
        }

        public static function error($code, $message, $status)
        {
            return new \WP_Error($code, $message, ['status' => $status]);
        }

        public static function page(array $items, $total, $page, $per_page)
        {
            return [
                'items'       => $items,
                'total'       => (int) $total,
                'page'        => (int) $page,
                'per_page'    => (int) $per_page,
                'total_pages' => (int) ceil($total / max(1, $per_page)),
            ];
        }

        /** Stored titles and names are data from many hands: plain text only, no control characters, capped. */
        public static function text($value)
        {
            $text = wp_check_invalid_utf8((string) $value, true);
            $text = html_entity_decode(wp_strip_all_tags($text), ENT_QUOTES, 'UTF-8');
            $text = trim(preg_replace('/[\x00-\x1F\x7F\s]+/u', ' ', $text));

            return function_exists('mb_substr') ? mb_substr($text, 0, self::TEXT_LIMIT, 'UTF-8') : substr($text, 0, self::TEXT_LIMIT);
        }

        /**
         * ISO 8601 in the site timezone, with offset.
         *
         * @param \DateTimeInterface|string|false|null $value a DateTime, or a site-local MySQL datetime
         */
        public static function iso($value)
        {
            if (is_string($value) && $value !== '' && strpos($value, '0000-00-00') !== 0) {
                $value = date_create_immutable_from_format('Y-m-d H:i:s', $value, wp_timezone());
            }

            return $value instanceof \DateTimeInterface ? $value->format(DATE_ATOM) : null;
        }

        /* ---------------------------------------------------------------------------------
         * Schemas
         * ------------------------------------------------------------------------------ */

        /** Defaults to an empty object, so a call with no input at all is valid. */
        public static function object_input(array $properties, array $required = [])
        {
            $schema = [
                'type'                 => 'object',
                'properties'           => $properties,
                'additionalProperties' => false,
            ];

            if ($required) {
                $schema['required'] = $required;
            } else {
                $schema['default'] = [];
            }

            return $schema;
        }

        public static function paging_input($default_per_page)
        {
            return [
                'page'     => ['type' => 'integer', 'minimum' => 1, 'default' => 1, 'description' => __('Page number, from 1.', 'document-emberdder')],
                'per_page' => ['type' => 'integer', 'minimum' => 1, 'maximum' => self::MAX_PER_PAGE, 'default' => $default_per_page, 'description' => __('Items per page, 1 to 100.', 'document-emberdder')],
            ];
        }

        public static function date_input()
        {
            $day = ['type' => 'string', 'pattern' => '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'];

            return [
                'date_from' => $day + ['description' => __('First day, Y-m-d in the site timezone. Requires date_to.', 'document-emberdder')],
                'date_to'   => $day + ['description' => __('Last day, inclusive, Y-m-d in the site timezone. Requires date_from. At most 366 days after date_from.', 'document-emberdder')],
            ];
        }

        public static function document_id_input($description)
        {
            return ['type' => 'integer', 'minimum' => 1, 'description' => $description];
        }

        public static function paged_output(array $item)
        {
            return [
                'type'       => 'object',
                'properties' => [
                    'items'       => ['type' => 'array', 'items' => $item],
                    'total'       => ['type' => 'integer', 'description' => __('Items matching across all pages.', 'document-emberdder')],
                    'page'        => ['type' => 'integer'],
                    'per_page'    => ['type' => 'integer'],
                    'total_pages' => ['type' => 'integer'],
                ],
                'required'   => ['items', 'total', 'page', 'per_page', 'total_pages'],
            ];
        }

        public static function nullable($type)
        {
            return ['type' => [$type, 'null']];
        }

        private static function list_documents_input()
        {
            return self::object_input(array_merge([
                'search'       => ['type' => 'string', 'maxLength' => 200, 'description' => __('Words to match in the title.', 'document-emberdder')],
                'file_type'    => ['type' => 'string', 'maxLength' => 50, 'description' => __('File type slug, e.g. pdf, docx, xlsx, pptx.', 'document-emberdder')],
                'tag'          => ['type' => 'string', 'maxLength' => 200, 'description' => __('Document tag slug.', 'document-emberdder')],
                'status'       => ['type' => 'string', 'enum' => ['any', 'publish', 'draft', 'private', 'pending', 'future'], 'default' => 'any'],
                'viewer'       => ['type' => 'string', 'enum' => DocumentsQuery::VIEWERS],
                'missing_file' => ['type' => 'boolean', 'description' => __('true: only documents with no file set; false: only documents with one.', 'document-emberdder')],
                'orderby'      => ['type' => 'string', 'enum' => ['date', 'title', 'downloads'], 'default' => 'date'],
                'order'        => ['type' => 'string', 'enum' => ['asc', 'desc'], 'default' => 'desc'],
            ], self::paging_input(20)));
        }

        private static function get_document_input()
        {
            return self::object_input([
                'id' => self::document_id_input(__('Document id (from list-documents).', 'document-emberdder')),
            ], ['id']);
        }

        private static function download_stats_input()
        {
            return self::object_input(array_merge(
                ['document_id' => self::document_id_input(__('One document. Omit for every document plus site totals.', 'document-emberdder'))],
                self::date_input(),
                self::paging_input(20)
            ));
        }

        private static function document_schema()
        {
            return [
                'type'       => 'object',
                'properties' => [
                    'id'          => ['type' => 'integer'],
                    'title'       => ['type' => 'string'],
                    'status'      => ['type' => 'string'],
                    'file_type'   => ['type' => 'string', 'description' => __('File type slug; empty when unknown.', 'document-emberdder')],
                    'viewer'      => ['type' => 'string', 'enum' => DocumentsQuery::VIEWERS],
                    'file_source' => ['type' => ['string', 'null'], 'description' => __('upload, url, google_drive or dropbox; null when no file is set.', 'document-emberdder')],
                    'has_file'    => ['type' => 'boolean'],
                    'shortcode'   => ['type' => 'string'],
                    'tags'        => ['type' => 'array', 'items' => ['type' => 'string']],
                    'downloads'   => ['type' => 'integer', 'description' => __('Lifetime download counter.', 'document-emberdder')],
                    'leads'       => ['type' => 'integer', 'description' => __('Real email leads, lifetime.', 'document-emberdder')],
                    'created'     => self::nullable('string'),
                    'modified'    => self::nullable('string'),
                    'edit_url'    => ['type' => 'string'],
                ],
            ];
        }

        private static function access_schema()
        {
            return [
                'type'       => 'object',
                'properties' => [
                    'mode'  => ['type' => 'string', 'enum' => ['everyone', 'logged_in', 'roles']],
                    'roles' => ['type' => 'array', 'items' => ['type' => 'string']],
                ],
            ];
        }

        private static function document_detail_schema()
        {
            $schema = self::document_schema();

            $schema['properties']['settings'] = [
                'type'       => 'object',
                'properties' => [
                    'file_url' => ['type' => 'string'],
                    'viewer'   => [
                        'type'       => 'object',
                        'properties' => [
                            'type'                => ['type' => 'string'],
                            'fullscreen'          => ['type' => 'boolean'],
                            'fullscreen_new_tab'  => ['type' => 'boolean'],
                            'thumbnails'          => ['type' => 'boolean'],
                            'sidebar_open'        => ['type' => 'boolean'],
                            'reader_mode'         => ['type' => 'boolean'],
                            'on_demand_rendering' => ['type' => 'boolean'],
                            'initial_page'        => ['type' => 'integer'],
                            'zoom'                => ['type' => 'string'],
                        ],
                    ],
                    'toolbar'  => [
                        'type'       => 'object',
                        'properties' => [
                            'show_name' => ['type' => 'boolean'],
                            'theme'     => ['type' => 'string'],
                            'position'  => ['type' => 'string'],
                        ],
                    ],
                    'download' => [
                        'type'       => 'object',
                        'properties' => [
                            'enabled'           => ['type' => 'boolean'],
                            'label'             => ['type' => 'string'],
                            'behaviour'         => ['type' => 'string'],
                            'filename'          => ['type' => 'string'],
                            'per_visitor_limit' => ['type' => 'integer', 'description' => __('0 means unlimited.', 'document-emberdder')],
                            'show_count'        => ['type' => 'boolean'],
                        ],
                    ],
                    'access'   => [
                        'type'       => 'object',
                        'properties' => [
                            'view'            => self::access_schema(),
                            'download'        => self::access_schema(),
                            'email_gate'      => ['type' => 'boolean'],
                            'secure_delivery' => ['type' => 'boolean'],
                        ],
                    ],
                    'lightbox'       => ['type' => 'boolean'],
                    'overlays_count' => ['type' => 'integer'],
                ],
            ];

            $schema['properties']['used_on'] = [
                'type'  => 'array',
                'items' => [
                    'type'       => 'object',
                    'properties' => [
                        'id'    => ['type' => 'integer'],
                        'title' => ['type' => 'string'],
                        'type'  => ['type' => 'string'],
                        'url'   => ['type' => 'string'],
                    ],
                ],
            ];
            $schema['properties']['used_on_truncated'] = ['type' => 'boolean'];

            return $schema;
        }

        private static function download_stats_output()
        {
            $row = [
                'type'       => 'object',
                'properties' => [
                    'id'                 => ['type' => 'integer'],
                    'title'              => ['type' => 'string'],
                    'lifetime_downloads' => ['type' => 'integer'],
                    'leads'              => ['type' => 'integer'],
                    'downloads_in_range' => self::nullable('integer'),
                    'leads_in_range'     => self::nullable('integer'),
                ],
            ];

            $list = self::paged_output($row);

            return [
                'type'       => 'object',
                'properties' => array_merge($list['properties'], [
                    'scope'    => ['type' => 'string', 'enum' => ['document', 'all']],
                    'range'    => [
                        'type'       => ['object', 'null'],
                        'properties' => ['from' => ['type' => 'string'], 'to' => ['type' => 'string']],
                    ],
                    'document' => $row,
                    'totals'   => [
                        'type'       => 'object',
                        'properties' => [
                            'lifetime_downloads' => ['type' => 'integer'],
                            'leads'              => ['type' => 'integer'],
                            'downloads_in_range' => self::nullable('integer'),
                            'leads_in_range'     => self::nullable('integer'),
                        ],
                    ],
                    'notes'    => ['type' => 'array', 'items' => ['type' => 'string']],
                ]),
                'required'   => ['scope', 'range', 'notes'],
            ];
        }

        /* ---------------------------------------------------------------------------------
         * Settings and privacy
         * ------------------------------------------------------------------------------ */

        /** The "AI Agent Access" section of the Codestar settings page. */
        public static function settings_section()
        {
            $unsupported = !self::supported();
            $fields      = [];

            if ($unsupported) {
                // Greyed out, not disabled: a disabled input is not submitted, and saving the page
                // would then store the switches as off for the day the site updates.
                $fields[] = [
                    'type'    => 'notice',
                    'style'   => 'warning',
                    'content' => esc_html__('Requires WordPress 6.9 or newer', 'document-emberdder')
                        . '<style>.bplde-ai-unsupported{opacity:.5;pointer-events:none;}</style>',
                ];
            }

            $fields[] = [
                'id'      => 'bplde_ai_abilities',
                'type'    => 'switcher',
                'title'   => esc_html__('Enable AI agent abilities', 'document-emberdder'),
                'desc'    => esc_html__('Lets AI assistants you connect (through the WordPress MCP Adapter or REST API) read your documents and stats. Only logged-in users with the right permissions can use them.', 'document-emberdder'),
                'default' => true,
            ];

            $fields[] = [
                'id'         => 'bplde_ai_leads',
                'type'       => 'switcher',
                'title'      => esc_html__('Allow AI agents to read leads', 'document-emberdder'),
                'desc'       => esc_html__('Lead names and emails will be sent to the AI service you connect (for example Anthropic or OpenAI). IP addresses are never shared.', 'document-emberdder'),
                'default'    => false,
                'dependency' => ['bplde_ai_abilities', '==', 'true'],
            ];

            if ($unsupported) {
                foreach ($fields as $i => $field) {
                    if (isset($field['id'])) {
                        $fields[$i]['class'] = trim((isset($field['class']) ? $field['class'] : '') . ' bplde-ai-unsupported');
                    }
                }
            }

            return [
                'title'  => esc_html__('AI Agent Access', 'document-emberdder'),
                'fields' => $fields,
            ];
        }

        public function privacy_policy()
        {
            if (!function_exists('wp_add_privacy_policy_content') || !self::enabled()) {
                return;
            }

            $text = '<p class="privacy-policy-tutorial">' . esc_html__('Applies while AI agent abilities are enabled in Document Embedder settings.', 'document-emberdder') . '</p>'
                . '<p><strong class="privacy-policy-tutorial">' . esc_html__('Suggested text:', 'document-emberdder') . ' </strong>'
                . esc_html__('Site administrators may connect AI assistants to this site. Those assistants can read document titles, settings, download counts and document view statistics. If the site owner allows it, they can also read the name and email address you gave when downloading a document, which are then processed by the AI service the site owner uses. Your IP address is never shared with these services.', 'document-emberdder')
                . '</p>';

            wp_add_privacy_policy_content(__('Document Embedder: AI Agent Access', 'document-emberdder'), wp_kses_post($text));
        }
    }
}
