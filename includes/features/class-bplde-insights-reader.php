<?php
/**
 * Document Insights: queries shared by the Free and Pro readers, and the Free "today" route.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Model\InsightsReader')) {
    class InsightsReader
    {
        const ANONYMOUS_EMAIL = 'anonymous@direct.download';

        public function __construct()
        {
            add_action('rest_api_init', [$this, 'register_routes']);
        }

        public function register_routes()
        {
            register_rest_route('docembedder/v1', '/insights/today', [
                'methods'             => 'GET',
                'callback'            => [$this, 'today_route'],
                'permission_callback' => [__CLASS__, 'can_read'],
                'args'                => [
                    'doc'  => ['type' => 'string', 'default' => ''],
                    'file' => ['type' => 'string', 'default' => ''],
                    'post' => ['type' => 'integer', 'default' => 0],
                ],
            ]);
        }

        public static function can_read()
        {
            return current_user_can('manage_options');
        }

        public function today_route(\WP_REST_Request $request)
        {
            $doc   = self::doc_param($request);
            $today = self::today();

            return new \WP_REST_Response([
                'trackingEnabled' => Insights::tracking_enabled(),
                'today'           => $today,
                'firstDay'        => self::first_day($doc),
                'recorded'        => self::recorded_history($doc),
                'summary'         => self::summary($today, $today, $doc),
                'documents'       => $doc ? [] : self::documents($today, $today, 20),
                'doc'             => $doc ? self::describe([$doc])[$doc] : null,
            ], 200);
        }

        /* ---------------------------------------------------------------------------------
         * Small helpers
         * ------------------------------------------------------------------------------ */

        /** Rows are written with the site's calendar day, so they are read back the same way. */
        public static function today()
        {
            return current_time('Y-m-d');
        }

        /**
         * The document a request is about: an explicit key, or the file and id an embed
         * block holds, keyed by the same helper render.php uses so the two always agree.
         */
        public static function doc_param(\WP_REST_Request $request)
        {
            $doc = (string) $request->get_param('doc');
            if ($doc === '' && (string) $request->get_param('file') !== '') {
                $doc = Insights::doc_key(esc_url_raw((string) $request->get_param('file')), absint($request->get_param('post')));
            }

            return Insights::is_doc_key($doc) ? $doc : '';
        }

        public static function days_between($from, $to)
        {
            return (int) floor((strtotime($to) - strtotime($from)) / DAY_IN_SECONDS) + 1;
        }

        private static function doc_clause($doc)
        {
            global $wpdb;

            return $doc ? $wpdb->prepare(' AND doc_key = %s', $doc) : '';
        }

        /* ---------------------------------------------------------------------------------
         * Provenance
         * ------------------------------------------------------------------------------ */

        /** The first day anything was counted, so ranges are never zero-filled before it. */
        public static function first_day($doc = '')
        {
            global $wpdb;

            $table = InsightsSchema::stats_table();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- custom table, clause prepared in doc_clause()
            $day = $wpdb->get_var($wpdb->prepare('SELECT MIN(day) FROM %i WHERE 1=1', $table) . self::doc_clause($doc));

            return $day ? $day : null;
        }

        /**
         * Days already recorded before today: what a licence would read back. Counted with
         * COUNT(DISTINCT day), so idle weeks are not promised as history.
         */
        public static function recorded_history($doc = '')
        {
            global $wpdb;

            $table = InsightsSchema::stats_table();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- custom table, clauses prepared
            $days = (int) $wpdb->get_var($wpdb->prepare('SELECT COUNT(DISTINCT day) FROM %i WHERE day < %s', $table, self::today()) . self::doc_clause($doc));

            return ['days' => $days, 'firstDay' => self::first_day($doc)];
        }

        /** Where a range really starts: never before counting began. */
        public static function clip($from, $doc = '')
        {
            $first = self::first_day($doc);

            return $first && $first > $from ? $first : $from;
        }

        /* ---------------------------------------------------------------------------------
         * Aggregates
         * ------------------------------------------------------------------------------ */

        public static function totals($from, $to, $doc = '')
        {
            global $wpdb;

            $table = InsightsSchema::stats_table();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- custom table, clauses prepared
            $row = $wpdb->get_row($wpdb->prepare(
                'SELECT SUM(views) AS views, SUM(unique_views) AS unique_views, SUM(downloads) AS downloads,
                        SUM(fullscreens) AS fullscreens, SUM(shares) AS shares, SUM(dwell_ms) AS dwell_ms
                 FROM %i WHERE day BETWEEN %s AND %s',
                $table,
                $from,
                $to
            ) . self::doc_clause($doc), ARRAY_A);

            $keys = ['views', 'unique_views', 'downloads', 'fullscreens', 'shares', 'dwell_ms'];
            $out  = [];
            foreach ($keys as $key) {
                $out[$key] = isset($row[$key]) ? (int) $row[$key] : 0;
            }

            return $out;
        }

        /**
         * Real leads (not the anonymous rows the un-gated tracker writes) per document key and
         * day. Grouped in SQL first, so the matching below runs once per document, not per lead.
         *
         * @return array<string,array<string,int>> doc key => day => leads
         */
        public static function lead_counts($from, $to)
        {
            global $wpdb;
            static $cache = [];

            $id = $from . '|' . $to;
            if (isset($cache[$id])) {
                return $cache[$id];
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $rows = (array) $wpdb->get_results($wpdb->prepare(
                "SELECT document_id, document_title, DATE(downloaded_at) AS day, COUNT(*) AS total
                 FROM {$wpdb->prefix}docembedder_leads
                 WHERE email <> %s AND downloaded_at >= %s AND downloaded_at < %s
                 GROUP BY document_id, document_title, DATE(downloaded_at)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                self::ANONYMOUS_EMAIL,
                $from . ' 00:00:00',
                gmdate('Y-m-d', strtotime($to) + DAY_IN_SECONDS) . ' 00:00:00'
            ), ARRAY_A);

            $out = [];
            foreach ($rows as $row) {
                $key = self::lead_key((int) $row['document_id'], (string) $row['document_title']);
                if ($key !== '') {
                    $out[$key][$row['day']] = (isset($out[$key][$row['day']]) ? $out[$key][$row['day']] : 0) + (int) $row['total'];
                }
            }

            return $cache[$id] = $out;
        }

        /**
         * The document a lead belongs to. A saved document files leads under its own id; a
         * Document Embed block under its Media Library attachment, or, for an external URL,
         * under the page it sits on with the file name as the title.
         */
        private static function lead_key($document_id, $title)
        {
            static $cache = [];

            $id = $document_id . '|' . $title;
            if (isset($cache[$id])) {
                return $cache[$id];
            }

            $type = get_post_type($document_id);
            $key  = '';

            if ($type === 'ppt_viewer') {
                $key = 'p:' . $document_id;
            } elseif ($type === 'attachment') {
                $key = Insights::doc_key((string) wp_get_attachment_url($document_id));
            } elseif ($type) {
                foreach (self::page_embeds($document_id) as $file_key => $file) {
                    if ($file['source'] === 'url' && $file['label'] === $title) {
                        $key = $file_key;
                        break;
                    }
                }
            }

            return $cache[$id] = $key;
        }

        /** Leads in a window, for one document or for all of them. */
        public static function leads_total($from, $to, $doc = '')
        {
            $total = 0;
            foreach (self::lead_counts($from, $to) as $key => $days) {
                if (!$doc || $key === $doc) {
                    $total += array_sum($days);
                }
            }

            return $total;
        }

        /** @return array<string,int> leads per day, for one document or for all of them */
        public static function leads_by_day($from, $to, $doc = '')
        {
            $out = [];
            foreach (self::lead_counts($from, $to) as $key => $days) {
                if (!$doc || $key === $doc) {
                    foreach ($days as $day => $n) {
                        $out[$day] = (isset($out[$day]) ? $out[$day] : 0) + $n;
                    }
                }
            }

            return $out;
        }

        /** Library files have no email gate, so they have no leads to count. */
        private static function has_leads($doc)
        {
            return !$doc || self::describe([$doc])[$doc]['source'] !== 'library';
        }

        /**
         * The KPI tiles. "Daily unique views" is an average per day: a visitor is unique per
         * day, so unique counts from different days are never added into one total.
         */
        public static function summary($from, $to, $doc = '')
        {
            $start  = self::clip($from, $doc);
            $totals = self::totals($start, $to, $doc);
            $days   = $start > $to ? 0 : self::days_between($start, $to);

            $leads = self::has_leads($doc) ? self::leads_total($start, $to, $doc) : null;

            return [
                'from'        => $start,
                'to'          => $to,
                'days'        => $days,
                'views'       => $totals['views'],
                'uniqueDaily' => $days ? round($totals['unique_views'] / $days, 1) : 0,
                'downloads'   => $totals['downloads'],
                'fullscreens' => $totals['fullscreens'],
                'shares'      => $totals['shares'],
                'leads'       => $leads,
                'conversion'  => ($leads !== null && $totals['views']) ? round($leads / $totals['views'] * 100, 1) : null,
                'avgDwellMs'  => $totals['views'] ? (int) round($totals['dwell_ms'] / $totals['views']) : 0,
            ];
        }

        /** Views per saved document over a window, keyed by post id, in one query. */
        public static function views_by_post($from, $to)
        {
            global $wpdb;

            $table = InsightsSchema::stats_table();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $rows = $wpdb->get_results($wpdb->prepare(
                'SELECT post_id, SUM(views) AS views FROM %i WHERE post_id > 0 AND day BETWEEN %s AND %s GROUP BY post_id',
                $table,
                $from,
                $to
            ), ARRAY_A);

            return array_map('intval', wp_list_pluck((array) $rows, 'views', 'post_id'));
        }

        /** Per-document rows for the "Top documents" table, busiest first. */
        public static function documents($from, $to, $limit = 100)
        {
            global $wpdb;

            $start = self::clip($from);
            $days  = $start > $to ? 1 : self::days_between($start, $to);
            $table = InsightsSchema::stats_table();

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $rows = $wpdb->get_results($wpdb->prepare(
                'SELECT doc_key, SUM(views) AS views, SUM(unique_views) AS unique_views, SUM(downloads) AS downloads,
                        SUM(fullscreens) AS fullscreens, SUM(shares) AS shares, SUM(dwell_ms) AS dwell_ms
                 FROM %i WHERE day BETWEEN %s AND %s
                 GROUP BY doc_key ORDER BY views DESC, downloads DESC LIMIT %d',
                $table,
                $start,
                $to,
                $limit
            ), ARRAY_A);

            $rows  = (array) $rows;
            $names = self::describe(wp_list_pluck($rows, 'doc_key'));
            $leads = self::lead_counts($start, $to);
            $out   = [];

            foreach ($rows as $row) {
                $key    = $row['doc_key'];
                $views  = (int) $row['views'];
                $lead_n = $names[$key]['source'] === 'library' ? null : (isset($leads[$key]) ? array_sum($leads[$key]) : 0);

                $out[] = array_merge($names[$key], [
                    'views'       => $views,
                    'uniqueDaily' => round((int) $row['unique_views'] / $days, 1),
                    'downloads'   => (int) $row['downloads'],
                    'fullscreens' => (int) $row['fullscreens'],
                    'shares'      => (int) $row['shares'],
                    'leads'       => $lead_n,
                    'conversion'  => ($lead_n !== null && $views) ? round($lead_n / $views * 100, 1) : null,
                    'avgDwellMs'  => $views ? (int) round((int) $row['dwell_ms'] / $views) : 0,
                ]);
            }

            return $out;
        }

        /* ---------------------------------------------------------------------------------
         * Naming documents
         * ------------------------------------------------------------------------------ */

        /**
         * Display data for doc keys. A u: key is only a hash, so its name is recovered from
         * the pages it was viewed on: the embeds on those pages are re-keyed and matched.
         *
         * @param string[] $keys
         * @return array<string,array>
         */
        public static function describe(array $keys)
        {
            $out    = [];
            $hosts  = self::hosts_for(array_filter($keys, function ($key) {
                return Insights::doc_post_id($key) === 0;
            }));

            foreach ($keys as $key) {
                $post_id = Insights::doc_post_id($key);
                $item    = [
                    'key'       => $key,
                    'kind'      => $post_id ? 'saved' : 'embed',
                    'title'     => '',
                    'editUrl'   => '',
                    'hostTitle' => '',
                    'hostUrl'   => '',
                    'hostEdit'  => '',
                    'source'    => $post_id ? 'saved' : '',
                    'leadsId'   => $post_id,
                ];

                if ($post_id) {
                    $post          = get_post($post_id);
                    $item['title'] = $post ? self::post_title($post) : sprintf(
                        /* translators: %d: document id. */
                        __('Document #%d (deleted)', 'document-emberdder'),
                        $post_id
                    );
                    $item['editUrl'] = $post ? (string) get_edit_post_link($post_id, 'raw') : '';
                } else {
                    $host = isset($hosts[$key]) ? $hosts[$key] : 0;
                    $file = $host ? self::find_embedded_file($host, $key) : null;

                    $item['hostTitle'] = $host ? self::post_title(get_post($host)) : '';
                    $item['hostUrl']   = $host ? (string) get_permalink($host) : '';
                    $item['hostEdit']  = $host ? (string) get_edit_post_link($host, 'raw') : '';
                    $item['title']     = $file ? $file['label'] : __('Embedded file', 'document-emberdder');
                    $item['source']    = $file ? $file['source'] : '';
                    // Where Download Leads files this block's leads: its attachment, else the page.
                    if ($file && $file['source'] === 'url') {
                        $attachment      = attachment_url_to_postid($file['url']);
                        $item['leadsId'] = $attachment ? $attachment : $host;
                    }
                }

                $out[$key] = $item;
            }

            return $out;
        }

        private static function post_title($post)
        {
            if (!$post) {
                return '';
            }

            // Plain text: the title is rendered by React and written to CSV, never echoed as HTML.
            $title = trim(html_entity_decode(wp_strip_all_tags(get_the_title($post)), ENT_QUOTES, 'UTF-8'));

            return $title !== '' ? $title : __('(no title)', 'document-emberdder');
        }

        /** The page each url-keyed document was most viewed on. */
        private static function hosts_for(array $keys)
        {
            global $wpdb;

            $keys = array_values(array_unique($keys));
            if (!$keys) {
                return [];
            }

            $table        = InsightsSchema::origins_table();
            $placeholders = implode(',', array_fill(0, count($keys), '%s'));

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $rows = $wpdb->get_results(
                $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $placeholders contains only literal %s tokens; dynamic count is correct
                    'SELECT doc_key, origin_post_id, SUM(views) AS v FROM %i
                     WHERE doc_key IN (' . $placeholders . ') GROUP BY doc_key, origin_post_id ORDER BY v DESC',
                    array_merge([$table], $keys)
                ),
                ARRAY_A
            );

            $hosts = [];
            foreach ((array) $rows as $row) {
                if (!isset($hosts[$row['doc_key']])) {
                    $hosts[$row['doc_key']] = (int) $row['origin_post_id'];
                }
            }

            return $hosts;
        }

        /** @return array{label:string,source:string}|null the embed on $post_id whose key is $key */
        private static function find_embedded_file($post_id, $key)
        {
            $files = self::page_embeds($post_id);

            return isset($files[$key]) ? $files[$key] : null;
        }

        /** Every url embed on a page, parsed once per request. */
        private static function page_embeds($post_id)
        {
            static $cache = [];

            if (!isset($cache[$post_id])) {
                $cache[$post_id] = self::embedded_files($post_id);
            }

            return $cache[$post_id];
        }

        /** @return array<string,array> doc key => label, source ('url' or 'library') and url, for every url embed on a page */
        private static function embedded_files($post_id)
        {
            $post = get_post($post_id);
            if (!$post) {
                return [];
            }

            $files   = [];
            $content = (string) $post->post_content . ' ' . (string) get_post_meta($post_id, '_elementor_data', true);

            $walk = function ($blocks) use (&$walk, &$files) {
                foreach ($blocks as $block) {
                    $attrs = isset($block['attrs']) ? $block['attrs'] : [];
                    if ($block['blockName'] === 'bplde/document-embed' && !empty($attrs['documentSource']['doc'])) {
                        $url = (string) $attrs['documentSource']['doc'];
                        $files[Insights::doc_key($url)] = ['label' => urldecode(wp_basename((string) wp_parse_url($url, PHP_URL_PATH))), 'source' => 'url', 'url' => $url];
                    }
                    if ($block['blockName'] === 'bpldl/document-library' && !empty($attrs['selectedPostId'])) {
                        $files = array_merge($files, self::library_files((int) $attrs['selectedPostId']));
                    }
                    if (!empty($block['innerBlocks'])) {
                        $walk($block['innerBlocks']);
                    }
                }
            };
            $walk(parse_blocks((string) $post->post_content));

            if (preg_match_all('/\[document_library[^\]]*\bid=["\']?(\d+)|"library_id":"?(\d+)/', $content, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $files = array_merge($files, self::library_files((int) (!empty($match[1]) ? $match[1] : $match[2])));
                }
            }

            return $files;
        }

        private static function library_files($library_id)
        {
            $settings = get_post_meta($library_id, 'bplde_settings', true);
            $items    = isset($settings['documentLibrary']['docItems']) ? (array) $settings['documentLibrary']['docItems'] : [];
            $files    = [];

            foreach ($items as $item) {
                if (!empty($item['url'])) {
                    $files[Insights::doc_key($item['url'])] = [
                        'label'  => !empty($item['title'])
                            ? (string) $item['title']
                            : urldecode(wp_basename((string) wp_parse_url($item['url'], PHP_URL_PATH))),
                        'source' => 'library',
                        'url'    => (string) $item['url'],
                    ];
                }
            }

            return $files;
        }
    }
}
