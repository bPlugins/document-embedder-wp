<?php
/**
 * Document Insights: document identity, counting rules and the write path.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Model\Insights')) {
    class Insights
    {
        const COUNTERS     = ['views', 'unique_views', 'downloads', 'fullscreens', 'shares', 'dwell_ms'];
        const SCRIPT       = 'bplde-insights';
        const PRUNE_HOOK   = 'bplde_insights_prune';
        const RESET_ACTION = 'bplde_insights_reset';
        const CACHE_GROUP  = 'bplde_insights';

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
            add_action('init', [$this, 'register_tracker']);
            add_action('init', [$this, 'schedule_prune']);
            add_action(self::PRUNE_HOOK, [__CLASS__, 'prune']);
            add_action('admin_init', [$this, 'privacy_policy']);
            add_action('admin_post_' . self::RESET_ACTION, [$this, 'handle_reset']);
            add_action('admin_notices', [$this, 'reset_notice']);
            add_action('before_delete_post', [$this, 'delete_document_stats'], 10, 2);
        }

        /* ---------------------------------------------------------------------------------
         * Document identity
         * ------------------------------------------------------------------------------ */

        /**
         * Scheme, query and fragment vary for the same file (http/https, cache-busters, a
         * Drive usp= tail), so only the lower-cased host and the path identify it.
         */
        public static function normalize_url($url)
        {
            $url = trim((string) $url);
            if ($url === '') {
                return '';
            }

            $parts = wp_parse_url($url);
            if (empty($parts)) {
                return $url;
            }

            $host = isset($parts['host']) ? strtolower($parts['host']) : '';
            $path = isset($parts['path']) ? $parts['path'] : '';

            return $host . rtrim($path, '/');
        }

        public static function doc_key($file_url, $document_id = 0)
        {
            $document_id = (int) $document_id;
            if ($document_id > 0 && get_post_type($document_id) === 'ppt_viewer') {
                return 'p:' . $document_id;
            }

            $normalized = self::normalize_url($file_url);

            return $normalized === '' ? '' : 'u:' . sha1($normalized);
        }

        public static function is_doc_key($key)
        {
            return (bool) preg_match('/^(p:[1-9][0-9]{0,18}|u:[0-9a-f]{40})$/', (string) $key);
        }

        public static function doc_post_id($key)
        {
            return strpos((string) $key, 'p:') === 0 ? (int) substr($key, 2) : 0;
        }

        /**
         * Stateless and non-expiring, so a key in a page cached for weeks still verifies,
         * while a key nobody issued cannot be written to the table.
         */
        public static function sign($key)
        {
            return substr(hash_hmac('sha256', (string) $key, wp_salt('auth')), 0, 16);
        }

        public static function verify($key, $sig)
        {
            return self::is_doc_key($key) && is_string($sig) && hash_equals(self::sign($key), $sig);
        }

        /* ---------------------------------------------------------------------------------
         * Settings
         * ------------------------------------------------------------------------------ */

        private static function setting($key, $default)
        {
            $options = get_option('_ppt_');

            return (is_array($options) && array_key_exists($key, $options)) ? $options[$key] : $default;
        }

        public static function tracking_enabled()
        {
            return !in_array(self::setting('bplde_insights_enable', '1'), ['0', 0, '', false], true);
        }

        public static function excluded_roles()
        {
            $roles = self::setting('bplde_insights_exclude_roles', ['administrator']);

            return array_values(array_filter(array_map('sanitize_key', (array) $roles)));
        }

        /** Months of history to keep; 0 keeps everything. */
        public static function retention_months()
        {
            $value = (string) self::setting('bplde_insights_retention', 'forever');

            return in_array($value, ['12', '24'], true) ? (int) $value : 0;
        }

        /* ---------------------------------------------------------------------------------
         * Who and what is counted
         * ------------------------------------------------------------------------------ */

        /**
         * Core resets the user to 0 on a REST request without a nonce, which is what the
         * tracking beacon is, so the logged-in cookie is read directly. Only ever used to
         * suppress a count.
         */
        public static function current_visitor_id()
        {
            $user_id = get_current_user_id();
            if ($user_id > 0 || !function_exists('wp_validate_auth_cookie')) {
                return $user_id;
            }

            return max(0, (int) wp_validate_auth_cookie('', 'logged_in'));
        }

        private static function server($key)
        {
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized here
            return isset($_SERVER[$key]) ? sanitize_text_field(wp_unslash($_SERVER[$key])) : '';
        }

        public static function is_bot()
        {
            $ua = strtolower(self::server('HTTP_USER_AGENT'));
            if ($ua === '') {
                return true;
            }

            $needles = [
                'bot', 'crawl', 'spider', 'slurp', 'headless', 'phantomjs', 'puppeteer', 'playwright',
                'lighthouse', 'pingdom', 'gtmetrix', 'monitoring', 'preview', 'facebookexternalhit',
                'wordpress/', 'curl/', 'wget/', 'python-requests', 'go-http-client', 'java/',
            ];

            foreach ($needles as $needle) {
                if (strpos($ua, $needle) !== false) {
                    return true;
                }
            }

            return false;
        }

        private static function is_prefetch()
        {
            $purpose = strtolower(self::server('HTTP_SEC_PURPOSE') . ' ' . self::server('HTTP_PURPOSE') . ' ' . self::server('HTTP_X_PURPOSE') . ' ' . self::server('HTTP_X_MOZ'));

            return strpos($purpose, 'prefetch') !== false || strpos($purpose, 'preview') !== false;
        }

        /** The request came from an editor or preview screen, judged by its referer. */
        private static function from_editor()
        {
            $referer = self::server('HTTP_REFERER');
            if ($referer === '') {
                return false;
            }

            $markers = ['/wp-admin/', 'preview=true', 'bplde_preview=', 'elementor-preview=', 'customize_changeset_uuid='];
            foreach ($markers as $marker) {
                if (strpos($referer, $marker) !== false) {
                    return true;
                }
            }

            return false;
        }

        private static function excluded_by_role()
        {
            $roles = self::excluded_roles();
            $user  = self::current_visitor_id();

            if (!$roles || !$user) {
                return false;
            }

            $userdata = get_userdata($user);

            return $userdata && (bool) array_intersect($roles, (array) $userdata->roles);
        }

        /** Decided per request, never at render time, so a cached page cannot bake it in. */
        public static function should_count()
        {
            return self::tracking_enabled()
                && !self::is_bot()
                && !self::is_prefetch()
                && !self::from_editor()
                && !self::excluded_by_role();
        }

        /**
         * True while rendering for an editor, a preview or a REST/AJAX editor request, where
         * no key may be emitted at all.
         */
        public static function is_editing_context()
        {
            // phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only context checks
            if ((is_admin() && !wp_doing_ajax()) || (function_exists('wp_is_serving_rest_request') && wp_is_serving_rest_request())) {
                return true;
            }

            if (is_preview() || is_customize_preview() || !empty($_GET['bplde_preview']) || isset($_GET['elementor-preview'])) {
                return true;
            }

            if (wp_doing_ajax() && isset($_REQUEST['action']) && $_REQUEST['action'] === 'elementor_ajax') {
                return true;
            }
            // phpcs:enable

            if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::$instance->preview)
                && \Elementor\Plugin::$instance->preview->is_preview_mode()) {
                return true;
            }

            return false;
        }

        /**
         * Rotates with the site's calendar day and is never stored next to a count, so a hash
         * cannot be traced back to an address or matched across days.
         */
        public static function visitor_hash()
        {
            $day  = current_time('Y-m-d');
            $salt = get_option('bplde_insights_salt');

            if (!is_array($salt) || !isset($salt['day'], $salt['salt']) || $salt['day'] !== $day) {
                $salt = ['day' => $day, 'salt' => wp_generate_password(32, false, false)];
                update_option('bplde_insights_salt', $salt, false);
            }

            return hash('sha256', $salt['salt'] . '|' . self::server('REMOTE_ADDR') . '|' . self::server('HTTP_USER_AGENT'));
        }

        /**
         * Claim a key for $ttl seconds. Returns false when it was already claimed. With a
         * persistent object cache wp_cache_add() is atomic; otherwise a transient, which
         * always carries an expiry so the rows are swept from wp_options.
         */
        public static function claim($key, $ttl)
        {
            if (wp_using_ext_object_cache()) {
                return wp_cache_add($key, 1, self::CACHE_GROUP, $ttl);
            }

            $key = 'bplde_i_' . $key;
            if (get_transient($key)) {
                return false;
            }

            set_transient($key, 1, $ttl);
            return true;
        }

        /** Increment a short-lived counter and return its new value. */
        public static function bump($key, $ttl)
        {
            if (wp_using_ext_object_cache()) {
                wp_cache_add($key, 0, self::CACHE_GROUP, $ttl);
                return (int) wp_cache_incr($key, 1, self::CACHE_GROUP);
            }

            $key  = 'bplde_i_' . $key;
            $hits = (int) get_transient($key) + 1;
            set_transient($key, $hits, $ttl);

            return $hits;
        }

        public static function event_key($visitor, $doc_key, $type)
        {
            return substr(md5($visitor . '|' . $doc_key . '|' . $type), 0, 24);
        }

        /* ---------------------------------------------------------------------------------
         * Write path
         * ------------------------------------------------------------------------------ */

        /**
         * One upsert per document per request. INSERT … ON DUPLICATE KEY UPDATE col = col + n
         * is atomic, so concurrent visitors can never overwrite each other's increments.
         */
        public static function record($doc_key, array $counts, $origin = 0)
        {
            global $wpdb;

            $counts = array_filter(
                array_map('intval', array_intersect_key($counts, array_flip(self::COUNTERS))),
                function ($n) {
                    return $n > 0;
                }
            );

            if (!$counts || !self::is_doc_key($doc_key)) {
                return;
            }

            $table   = InsightsSchema::stats_table();
            $day     = current_time('Y-m-d');
            $columns = array_keys($counts);
            $now     = current_time('mysql');
            $values  = array_merge([$doc_key, self::doc_post_id($doc_key), $day], array_values($counts), [$now]);
            $updates = [];

            foreach ($counts as $column => $n) {
                $updates[] = "{$column} = {$column} + %d";
                $values[]  = $n;
            }
            $values[] = $now;

            // Column names come from self::COUNTERS only, never from the request.
            // %i safely escapes the table identifier; $columns and $updates are from self::COUNTERS.
            $sql = 'INSERT INTO %i (doc_key, post_id, day, ' . implode(', ', $columns) . ', last_seen)'
                . ' VALUES (%s, %d, %s, ' . implode(', ', array_fill(0, count($columns), '%d')) . ', %s)'
                . ' ON DUPLICATE KEY UPDATE ' . implode(', ', $updates) . ', last_seen = %s';

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $wpdb->query(
                // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $sql built from self::COUNTERS only; dynamic placeholder count is correct
                $wpdb->prepare($sql, array_merge([$table], $values))
            );

            // Downloads write a zero-view row too, so a file that is only ever downloaded can
            // still be named from the page it lives on.
            $origin = (int) $origin;
            if ($origin > 0 && (!empty($counts['views']) || !empty($counts['downloads']))) {
                $views   = isset($counts['views']) ? $counts['views'] : 0;
                $origins = InsightsSchema::origins_table();
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
                $wpdb->query($wpdb->prepare(
                    'INSERT INTO %i (doc_key, origin_post_id, day, views) VALUES (%s, %d, %s, %d) ON DUPLICATE KEY UPDATE views = views + %d',
                    $origins,
                    $doc_key,
                    $origin,
                    $day,
                    $views,
                    $views
                ));
            }
        }

        /**
         * A download the server delivers itself. Each token is counted on its first delivery
         * only, so a browser retry inside the reuse grace window is not a second download.
         */
        public static function record_download($doc_key, $token = '', $origin = 0)
        {
            if (!self::is_doc_key($doc_key) || !self::should_count()) {
                return;
            }

            if ($token !== '' && !self::claim('dl_' . md5((string) $token), \BPLDE\Helper\Functions::download_token_ttl())) {
                return;
            }

            if (!self::claim('e_' . self::event_key(self::visitor_hash(), $doc_key, 'download'), 2)) {
                return;
            }

            self::record($doc_key, ['downloads' => 1], $origin);
        }

        /* ---------------------------------------------------------------------------------
         * Front-end markup
         * ------------------------------------------------------------------------------ */

        public function register_tracker()
        {
            $asset_file = BPLDE_PLUGIN_PATH . 'build/insights-tracker.asset.php';
            $asset      = file_exists($asset_file) ? include $asset_file : ['dependencies' => [], 'version' => BPLDE_VER];

            wp_register_script(
                self::SCRIPT,
                BPLDE_PLUGIN_DIR . 'build/insights-tracker.js',
                $asset['dependencies'],
                $asset['version'],
                ['in_footer' => true, 'strategy' => 'defer']
            );

            wp_add_inline_script(
                self::SCRIPT,
                'window.bpldeInsights = ' . wp_json_encode(['url' => rest_url('docembedder/v1/track')]) . ';',
                'before'
            );
        }

        /**
         * The data attributes that make an element countable, or an empty array when nothing
         * should be counted here. Enqueues the tracker as a side effect, so a page without a
         * key never loads it.
         *
         * @param string $doc_key A key from doc_key().
         * @param array  $extra   Additional data attributes.
         * @return array<string,string>
         */
        public static function markup($doc_key, array $extra = [])
        {
            if (!self::is_doc_key($doc_key) || !self::tracking_enabled() || self::is_editing_context()) {
                return [];
            }

            wp_enqueue_script(self::SCRIPT);

            // On an archive the queried object is a term, which is not a host page.
            $host = get_queried_object();

            return array_merge([
                'data-bplde-doc'    => $doc_key,
                'data-bplde-sig'    => self::sign($doc_key),
                'data-bplde-origin' => (string) ($host instanceof \WP_Post ? $host->ID : 0),
            ], $extra);
        }

        /* ---------------------------------------------------------------------------------
         * Housekeeping
         * ------------------------------------------------------------------------------ */

        public function schedule_prune()
        {
            if (!wp_next_scheduled(self::PRUNE_HOOK)) {
                wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', self::PRUNE_HOOK);
            }
        }

        public static function prune()
        {
            global $wpdb;

            $months = self::retention_months();
            if (!$months) {
                return;
            }

            $cutoff = (new \DateTime('now', wp_timezone()))->modify("-{$months} months")->format('Y-m-d');

            foreach ([InsightsSchema::stats_table(), InsightsSchema::origins_table()] as $table) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
                $wpdb->query($wpdb->prepare('DELETE FROM %i WHERE day < %s', $table, $cutoff));
            }
        }

        public function delete_document_stats($post_id, $post = null)
        {
            global $wpdb;

            $post_type = ($post instanceof \WP_Post) ? $post->post_type : get_post_type($post_id);
            if ($post_type !== 'ppt_viewer') {
                return;
            }

            foreach ([InsightsSchema::stats_table(), InsightsSchema::origins_table()] as $table) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
                $wpdb->delete($table, ['doc_key' => 'p:' . (int) $post_id], ['%s']);
            }
        }

        public function privacy_policy()
        {
            if (!function_exists('wp_add_privacy_policy_content')) {
                return;
            }

            $text = '<p class="privacy-policy-tutorial">' . esc_html__('Applies while Insights is enabled in Document Embedder settings.', 'document-emberdder') . '</p>'
                . '<p><strong class="privacy-policy-tutorial">' . esc_html__('Suggested text:', 'document-emberdder') . ' </strong>'
                . esc_html__('When you view or download a document embedded on this site, we count the view, the download, the use of full-screen mode and how long the document was on your screen. These are stored as daily totals per document. To avoid counting the same visit twice, a one-way hash of your IP address and browser is kept in temporary storage for at most one day and is never saved with the totals. No cookies are set and your IP address is not stored.', 'document-emberdder')
                . '</p>';

            wp_add_privacy_policy_content(__('Document Embedder', 'document-emberdder'), wp_kses_post($text));
        }

        public static function reset_url()
        {
            return wp_nonce_url(admin_url('admin-post.php?action=' . self::RESET_ACTION), self::RESET_ACTION);
        }

        public function handle_reset()
        {
            if (!current_user_can('manage_options')) {
                wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'document-emberdder'), 403);
            }

            check_admin_referer(self::RESET_ACTION);

            global $wpdb;
            foreach ([InsightsSchema::stats_table(), InsightsSchema::origins_table()] as $table) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table, no input
                $wpdb->query($wpdb->prepare('DELETE FROM %i', $table));
            }

            $back = wp_get_referer() ? wp_get_referer() : admin_url('edit.php?post_type=ppt_viewer&page=settings');
            wp_safe_redirect(add_query_arg('bplde_insights_reset', '1', $back));
            exit;
        }

        public function reset_notice()
        {
            if (!current_user_can('manage_options')) {
                return;
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display-only flag set by handle_reset()
            if (empty($_GET['bplde_insights_reset'])) {
                return;
            }

            printf(
                '<div class="notice notice-success is-dismissible"><p>%s</p></div>',
                esc_html__('Insights data has been reset.', 'document-emberdder')
            );
        }

        /** The Insights section of the Codestar settings page, shared by the Free and Pro builds. */
        public static function settings_section()
        {
            $roles = [];
            foreach (wp_roles()->get_names() as $slug => $name) {
                $roles[$slug] = translate_user_role($name);
            }

            $reset = sprintf(
                '<a href="%1$s" class="button" onclick="return confirm(\'%2$s\');">%3$s</a><p class="description">%4$s</p>',
                esc_url(self::reset_url()),
                esc_js(__('Delete every recorded view, download and time-on-screen figure? Leads and download counts are not affected. This cannot be undone.', 'document-emberdder')),
                esc_html__('Reset Insights data', 'document-emberdder'),
                esc_html__('Deletes all Insights history. Download Leads and the lifetime download count on each document are kept.', 'document-emberdder')
            );

            return [
                'title'  => esc_html__('Insights', 'document-emberdder'),
                'fields' => [
                    [
                        'id'      => 'bplde_insights_enable',
                        'type'    => 'switcher',
                        'title'   => esc_html__('Enable Insights', 'document-emberdder'),
                        'desc'    => esc_html__('Counts views, downloads, full-screen use and time on screen for embedded documents. Anonymous: no IP addresses are stored and no cookies are set.', 'document-emberdder'),
                        'default' => true,
                    ],
                    [
                        'id'         => 'bplde_insights_exclude_roles',
                        'type'       => 'checkbox',
                        'title'      => esc_html__('Exclude roles', 'document-emberdder'),
                        'desc'       => esc_html__('Visits by logged-in users with these roles are not counted.', 'document-emberdder'),
                        'options'    => $roles,
                        'default'    => ['administrator'],
                        'dependency' => ['bplde_insights_enable', '==', 'true'],
                    ],
                    [
                        'id'      => 'bplde_insights_retention',
                        'type'    => 'select',
                        'title'   => esc_html__('Data retention', 'document-emberdder'),
                        'desc'    => esc_html__('Older daily totals are deleted once a day.', 'document-emberdder'),
                        'options' => [
                            'forever' => esc_html__('Keep forever', 'document-emberdder'),
                            '12'      => esc_html__('12 months', 'document-emberdder'),
                            '24'      => esc_html__('24 months', 'document-emberdder'),
                        ],
                        'default' => 'forever',
                    ],
                    [
                        'type'    => 'content',
                        'title'   => esc_html__('Reset', 'document-emberdder'),
                        'content' => $reset,
                    ],
                ],
            ];
        }
    }

    Insights::instance();
}
