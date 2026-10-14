<?php
/**
 * Document Insights admin screen.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Admin;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Admin\InsightsPage')) {
    class InsightsPage
    {
        const SLUG   = 'bplde-insights';
        const SCREEN = 'ppt_viewer_page_bplde-insights';

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
            add_filter('admin_body_class', [$this, 'body_class']);
        }

        public static function url($doc = '')
        {
            $url = admin_url('edit.php?post_type=ppt_viewer&page=' . self::SLUG);

            return $doc ? add_query_arg('doc', rawurlencode($doc), $url) : $url;
        }

        /** Scope for the Insights stylesheet, the same way the Leads screen is scoped. */
        public function body_class($classes)
        {
            $screen = function_exists('get_current_screen') ? get_current_screen() : null;

            if ($screen && $screen->id === self::SCREEN) {
                $classes .= ' bplde-insights ';
            }

            return $classes;
        }

        /**
         * Every saved document, whether or not it has been viewed yet, plus the url-keyed
         * files that have recorded data: the picker must work before the first view exists.
         */
        private static function document_options()
        {
            global $wpdb;

            $ids = get_posts([
                'post_type'        => 'ppt_viewer',
                'post_status'      => ['publish', 'private', 'draft', 'pending', 'future'],
                'numberposts'      => 500,
                'orderby'          => 'title',
                'order'            => 'ASC',
                'fields'           => 'ids',
                'suppress_filters' => false,
            ]);

            $table = \BPLDE\Model\InsightsSchema::stats_table();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table, no input
            $url_keys = (array) $wpdb->get_col($wpdb->prepare('SELECT DISTINCT doc_key FROM %i WHERE post_id = 0 LIMIT 200', $table));

            $keys = array_merge(array_map(function ($id) {
                return 'p:' . (int) $id;
            }, $ids), $url_keys);

            $out = [];
            foreach (\BPLDE\Model\InsightsReader::describe($keys) as $item) {
                // Library files are reached from the Top documents table instead.
                if ($item['source'] === 'library') {
                    continue;
                }
                $out[] = ['key' => $item['key'], 'kind' => $item['kind'], 'title' => $item['title'], 'host' => $item['hostTitle'], 'source' => $item['source']];
            }

            return $out;
        }

        private static function excluded_role_names()
        {
            $names = wp_roles()->get_names();
            $out   = [];

            foreach (\BPLDE\Model\Insights::excluded_roles() as $role) {
                $out[] = isset($names[$role]) ? translate_user_role($names[$role]) : $role;
            }

            return $out;
        }

        public function render_page()
        {
            if (!current_user_can('manage_options')) {
                wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'document-emberdder'));
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only view parameter
            $doc = isset($_GET['doc']) ? sanitize_text_field(wp_unslash($_GET['doc'])) : '';

            $info = [
                // The free build ships no history readers, so it always shows today's view.
                'isPro'           => false,
                'trackingEnabled' => \BPLDE\Model\Insights::tracking_enabled(),
                'doc'             => \BPLDE\Model\Insights::is_doc_key($doc) ? $doc : '',
                'today'           => current_time('Y-m-d'),
                'pageUrl'         => self::url(),
                'pricingUrl'      => \BPLDE\Helper\Functions::pricing_url(),
                'settingsUrl'     => admin_url('edit.php?post_type=ppt_viewer&page=settings'),
                'leadsUrl'        => admin_url('edit.php?post_type=ppt_viewer&page=bplde-download-leads'),
                'documents'       => self::document_options(),
                'excludedRoles'   => self::excluded_role_names(),
            ];
            ?>
            <div class="wrap bplde-insights-wrap">
                <?php // .wp-header-end stays as the marker common.js moves admin notices to. ?>
                <hr class="wp-header-end">
                <div id="bpldeInsights" data-info="<?php echo esc_attr(wp_json_encode($info)); ?>"></div>
            </div>
            <?php
        }
    }

    InsightsPage::instance();
}
