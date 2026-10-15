<?php
/**
 * Read-only queries on saved documents (ppt_viewer posts) and their settings.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Model\DocumentsQuery')) {
    class DocumentsQuery
    {
        const POST_TYPE = 'ppt_viewer';
        const STATUSES  = ['publish', 'draft', 'private', 'pending', 'future'];
        const VIEWERS   = ['default', 'custom', 'flipbook', 'slider'];

        /** The shortcode's own truthy set, so flags read the same as on the front end. */
        const TRUTHY = ['1', 1, 'true', true, 'yes'];

        /**
         * One WP_Query; meta and term caches are primed for the whole page by WP_Query itself.
         *
         * @param array $args search, file_type, tag, status, viewer, missing_file, orderby, order, page,
         *                    per_page, editable_only
         * @return array{posts:\WP_Post[],total:int}
         */
        public static function find(array $args)
        {
            $query_args = [
                'post_type'           => self::POST_TYPE,
                'post_status'         => $args['status'] === 'any' ? self::STATUSES : [$args['status']],
                'posts_per_page'      => $args['per_page'],
                'paged'               => $args['page'],
                'order'               => strtoupper($args['order']),
                'ignore_sticky_posts' => true,
            ];

            if (!empty($args['editable_only'])) {
                $query_args['perm'] = 'editable';
            }
            if ($args['search'] !== '') {
                $query_args['s'] = $args['search'];
            }

            $tax_query = [];
            if ($args['file_type'] !== '') {
                $tax_query[] = ['taxonomy' => 'ppv_file_type', 'field' => 'slug', 'terms' => $args['file_type']];
            }
            if ($args['tag'] !== '') {
                $tax_query[] = ['taxonomy' => 'ppv_document_tags', 'field' => 'slug', 'terms' => $args['tag']];
            }
            if ($tax_query) {
                $query_args['tax_query'] = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- filter requested by the caller
            }

            $meta_query = [];
            if ($args['viewer'] !== '') {
                $meta_query[] = self::viewer_clause($args['viewer']);
            }
            if ($args['missing_file'] !== null) {
                $meta_query[] = self::file_clause($args['missing_file']);
            }

            if ($meta_query) {
                $query_args['meta_query'] = array_merge(['relation' => 'AND'], $meta_query); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- filter requested by the caller
            }

            $by_downloads = $args['orderby'] === 'downloads';
            if ($by_downloads) {
                add_filter('posts_clauses', [__CLASS__, 'order_by_downloads'], 10, 2);
            } else {
                $query_args['orderby'] = $args['orderby'];
            }

            $query = new \WP_Query($query_args);

            if ($by_downloads) {
                remove_filter('posts_clauses', [__CLASS__, 'order_by_downloads'], 10);
            }

            return ['posts' => $query->posts, 'total' => (int) $query->found_posts];
        }

        /**
         * A never-downloaded document has no counter row, so the counter is LEFT JOINed and read as 0.
         * A meta_query EXISTS/NOT EXISTS pair cannot do this: it sorts those documents by whatever
         * other meta row the join happened to pick.
         */
        public static function order_by_downloads($clauses, $query)
        {
            global $wpdb;

            $direction = $query->get('order') === 'ASC' ? 'ASC' : 'DESC';

            $clauses['join']   .= " LEFT JOIN {$wpdb->postmeta} AS bplde_dl ON (bplde_dl.post_id = {$wpdb->posts}.ID AND bplde_dl.meta_key = '_de_download_count')";
            $clauses['groupby'] = "{$wpdb->posts}.ID";
            $clauses['orderby'] = "MAX(CAST(COALESCE(bplde_dl.meta_value, '0') AS UNSIGNED)) {$direction}, {$wpdb->posts}.ID {$direction}";

            return $clauses;
        }

        /**
         * The settings live in one serialized `ppv` array, so a stored key/value pair is matched by its
         * serialized form, e.g. s:6:"viewer";s:8:"flipbook";
         */
        private static function serialized_pair($key, $value = null)
        {
            $out = 's:' . strlen($key) . ':"' . $key . '";';

            return $value === null ? $out : $out . 's:' . strlen($value) . ':"' . $value . '";';
        }

        private static function viewer_clause($viewer)
        {
            $match = ['key' => 'ppv', 'value' => self::serialized_pair('viewer', $viewer), 'compare' => 'LIKE'];

            if ($viewer !== 'default') {
                return $match;
            }

            // An unset viewer renders with the default engine.
            return [
                'relation' => 'OR',
                $match,
                ['key' => 'ppv', 'compare' => 'NOT EXISTS'],
                ['key' => 'ppv', 'value' => self::serialized_pair('viewer'), 'compare' => 'NOT LIKE'],
            ];
        }

        /** Same rule as the list screen's "No file" chip: an empty or missing ppv['doc']. */
        private static function file_clause($missing)
        {
            $empty = ['key' => 'ppv', 'value' => self::serialized_pair('doc', ''), 'compare' => 'LIKE'];
            $none  = ['key' => 'ppv', 'value' => self::serialized_pair('doc') . 's:', 'compare' => 'NOT LIKE'];

            if ($missing) {
                return ['relation' => 'OR', ['key' => 'ppv', 'compare' => 'NOT EXISTS'], $none, $empty];
            }

            return [
                'relation' => 'AND',
                ['key' => 'ppv', 'value' => self::serialized_pair('doc') . 's:', 'compare' => 'LIKE'],
                ['key' => 'ppv', 'value' => self::serialized_pair('doc', ''), 'compare' => 'NOT LIKE'],
            ];
        }

        /** The fields every document listing shares. Reads only primed caches. */
        public static function summary(\WP_Post $post, array $lead_counts)
        {
            $ppv  = self::ppv($post->ID);
            $doc  = isset($ppv['doc']) && is_string($ppv['doc']) ? $ppv['doc'] : '';
            $type = get_the_terms($post, 'ppv_file_type');
            $tags = get_the_terms($post, 'ppv_document_tags');

            return [
                'id'          => (int) $post->ID,
                'title'       => $post->post_title,
                'status'      => $post->post_status,
                'file_type'   => ($type && !is_wp_error($type)) ? $type[0]->slug : '',
                'viewer'      => self::viewer($ppv),
                'file_source' => self::file_source($doc, $ppv),
                'has_file'    => $doc !== '',
                'shortcode'   => '[doc id="' . (int) $post->ID . '"]',
                'tags'        => ($tags && !is_wp_error($tags)) ? wp_list_pluck($tags, 'name') : [],
                'downloads'   => (int) get_post_meta($post->ID, '_de_download_count', true),
                'leads'       => isset($lead_counts[$post->ID]) ? (int) $lead_counts[$post->ID] : 0,
                'created'     => get_post_datetime($post, 'date'),
                'modified'    => get_post_datetime($post, 'modified'),
                'edit_url'    => (string) get_edit_post_link($post->ID, 'raw'),
            ];
        }

        private static function ppv($post_id)
        {
            $ppv = get_post_meta($post_id, 'ppv', true);

            return is_array($ppv) ? $ppv : [];
        }

        private static function viewer(array $ppv)
        {
            $viewer = isset($ppv['viewer']) ? $ppv['viewer'] : 'default';

            return in_array($viewer, self::VIEWERS, true) ? $viewer : 'default';
        }

        /**
         * Inferred from the URL, the only thing stored. Compared without the scheme so an http upload
         * on an https site still counts as an upload. No per-row attachment lookup.
         */
        private static function file_source($doc, array $ppv)
        {
            if ($doc === '') {
                return null;
            }

            $host = strtolower((string) wp_parse_url($doc, PHP_URL_HOST));

            if (self::flag($ppv, 'googleDrive') || preg_match('/(^|\.)(drive|docs)\.google\.com$/', $host)) {
                return 'google_drive';
            }
            if (preg_match('/(^|\.)(dropbox\.com|dropboxusercontent\.com)$/', $host)) {
                return 'dropbox';
            }

            $uploads  = wp_get_upload_dir();
            $base     = preg_replace('#^https?:#i', '', (string) $uploads['baseurl']);
            $relative = preg_replace('#^https?:#i', '', $doc);

            return ($base !== '' && strpos($relative, $base . '/') === 0) ? 'upload' : 'url';
        }

        private static function flag(array $ppv, $key, $default = false)
        {
            return in_array(isset($ppv[$key]) ? $ppv[$key] : $default, self::TRUTHY, true);
        }

        private static function value(array $ppv, $key, $default)
        {
            return isset($ppv[$key]) ? $ppv[$key] : $default;
        }

        /**
         * Stored settings, normalised with the defaults and viewer rules the Pro shortcode uses, so a
         * document reads the same in both plugins. Pro fields are reported as stored (they survive a
         * downgrade): this describes the document, it does not render it.
         */
        public static function settings($post_id)
        {
            $ppv    = self::ppv($post_id);
            $viewer = self::viewer($ppv);
            $pdfjs  = in_array($viewer, ['custom', 'flipbook', 'slider'], true);
            $custom = $viewer === 'custom';

            $label = self::value($ppv, 'downloadButtonText', self::value($ppv, '_de_download_label', ''));
            $overlays = self::value($ppv, '_de_overlays', []);

            return [
                'file_url' => (string) self::value($ppv, 'doc', ''),
                'viewer'   => [
                    'type'                => $viewer,
                    'fullscreen'          => $pdfjs && self::flag($ppv, 'enableFullscreen'),
                    'fullscreen_new_tab'  => $pdfjs && self::flag($ppv, 'fullscreenNewTab'),
                    'thumbnails'          => $pdfjs && self::flag($ppv, 'toggleThumbnails'),
                    'sidebar_open'        => $pdfjs && self::flag($ppv, 'sidebarOpen'),
                    'reader_mode'         => $pdfjs && self::flag($ppv, 'readerMode'),
                    'on_demand_rendering' => $pdfjs && self::flag($ppv, 'onDemandRendering'),
                    'initial_page'        => $pdfjs ? max(1, (int) self::value($ppv, 'initialPage', 1)) : 1,
                    'zoom'                => $custom ? (string) self::value($ppv, 'defaultZoom', '') : '',
                ],
                'toolbar'  => [
                    'show_name' => self::flag($ppv, 'showName'),
                    'theme'     => (string) self::value($ppv, '_de_toolbar_theme', 'dark'),
                    'position'  => (string) self::value($ppv, '_de_download_position', 'toolbar'),
                ],
                'download' => [
                    'enabled'           => self::flag($ppv, 'download', '0'),
                    'label'             => $label !== '' ? (string) $label : __('Download', 'document-emberdder'),
                    'behaviour'         => (string) self::value($ppv, '_de_download_behavior', 'download'),
                    'filename'          => (string) self::value($ppv, '_de_download_filename', ''),
                    'per_visitor_limit' => max(0, (int) self::value($ppv, '_de_download_limit', 0)),
                    'show_count'        => self::flag($ppv, '_de_download_show_count', '0'),
                ],
                'access'   => [
                    'view'            => self::access_rule($ppv, '_de_view_access', '_de_view_access_roles'),
                    'download'        => self::access_rule($ppv, '_de_download_access', '_de_download_access_roles'),
                    'email_gate'      => self::flag($ppv, '_de_email_gate'),
                    'secure_delivery' => self::flag($ppv, '_de_secure_delivery'),
                ],
                'lightbox'       => self::flag($ppv, 'lightbox'),
                'overlays_count' => is_array($overlays) ? count($overlays) : 0,
            ];
        }

        /** Stored as everyone | loggedin | roles. */
        private static function access_rule(array $ppv, $mode_key, $roles_key)
        {
            $mode = (string) self::value($ppv, $mode_key, 'everyone');
            $mode = $mode === 'loggedin' ? 'logged_in' : $mode;
            $mode = in_array($mode, ['everyone', 'logged_in', 'roles'], true) ? $mode : 'everyone';

            return [
                'mode'  => $mode,
                'roles' => $mode === 'roles' ? array_values(array_filter(array_map('sanitize_key', (array) self::value($ppv, $roles_key, [])))) : [],
            ];
        }

        /**
         * Published posts that embed the document with [doc id=…] or the Saved Document block. The LIKE
         * pre-filter is bounded; each candidate is then confirmed, since "selected":12 also matches 123.
         *
         * @return array{posts:\WP_Post[],truncated:bool}
         */
        public static function used_on($post_id, $cap)
        {
            global $wpdb;

            $post_id   = (int) $post_id;
            $scan      = $cap * 4;
            $shortcode = '%' . $wpdb->esc_like('[doc ') . '%' . $wpdb->esc_like((string) $post_id) . '%';
            $block     = '%' . $wpdb->esc_like('wp:meta-box/document-embedder') . '%';
            $selected  = '%' . $wpdb->esc_like('"selected":' . $post_id) . '%';
            $types     = array_values(array_diff(get_post_types(['public' => true]), ['attachment']));

            if (!$types) {
                return ['posts' => [], 'truncated' => false];
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- bounded content search with no API equivalent, IN list of %s placeholders
            $ids = $wpdb->get_col($wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts}
                 WHERE post_status = 'publish' AND post_type IN (" . implode(',', array_fill(0, count($types), '%s')) . ")
                   AND (post_content LIKE %s OR (post_content LIKE %s AND post_content LIKE %s))
                 ORDER BY post_date DESC, ID DESC LIMIT %d",
                ...array_merge($types, [$shortcode, $block, $selected, $scan + 1])
            ));

            $truncated = count($ids) > $scan;
            $posts     = [];

            _prime_post_caches(array_map('intval', array_slice($ids, 0, $scan)), false, false);

            foreach (array_slice($ids, 0, $scan) as $id) {
                $post = get_post((int) $id);
                if ($post && self::embeds($post->post_content, $post_id)) {
                    if (count($posts) === $cap) {
                        $truncated = true;
                        break;
                    }
                    $posts[] = $post;
                }
            }

            return ['posts' => $posts, 'truncated' => $truncated];
        }

        private static function embeds($content, $post_id)
        {
            if (preg_match('/\[doc\s[^\]]*\bid\s*=\s*["\']?' . $post_id . '(?![0-9])/', $content)) {
                return true;
            }

            $walk = function (array $blocks) use (&$walk, $post_id) {
                foreach ($blocks as $block) {
                    if ($block['blockName'] === 'meta-box/document-embedder' && isset($block['attrs']['selected']) && (int) $block['attrs']['selected'] === $post_id) {
                        return true;
                    }
                    if (!empty($block['innerBlocks']) && $walk($block['innerBlocks'])) {
                        return true;
                    }
                }
                return false;
            };

            return strpos($content, 'wp:meta-box/document-embedder') !== false && $walk(parse_blocks($content));
        }

        /** Same sum as the Documents list header (BPLDE_List_Screen::totals()). */
        public static function lifetime_downloads_total()
        {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one aggregate
            return (int) $wpdb->get_var(
                "SELECT SUM(pm.meta_value)
                 FROM {$wpdb->postmeta} pm
                 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
                 WHERE pm.meta_key = '_de_download_count' AND p.post_type = 'ppt_viewer'"
            );
        }
    }
}
