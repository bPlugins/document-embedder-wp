<?php
/**
 * Document Insights tables.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Model\InsightsSchema')) {
    class InsightsSchema
    {
        const VERSION = 1;
        const OPTION  = 'bplde_insights_db_version';

        public static function stats_table()
        {
            global $wpdb;
            return $wpdb->prefix . 'bplde_doc_stats';
        }

        public static function origins_table()
        {
            global $wpdb;
            return $wpdb->prefix . 'bplde_doc_origins';
        }

        /**
         * Cheap enough for every request: one autoloaded option read. The option is per site,
         * so on multisite each site builds its own tables the first time it is visited.
         */
        public static function maybe_install()
        {
            if ((int) get_option(self::OPTION, 0) < self::VERSION) {
                self::install();
            }
        }

        public static function install()
        {
            global $wpdb;

            $charset_collate = $wpdb->get_charset_collate();
            $stats           = self::stats_table();
            $origins         = self::origins_table();

            require_once ABSPATH . 'wp-admin/includes/upgrade.php';

            dbDelta("CREATE TABLE $stats (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                doc_key VARCHAR(64) NOT NULL,
                post_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
                day DATE NOT NULL,
                views INT UNSIGNED NOT NULL DEFAULT 0,
                unique_views INT UNSIGNED NOT NULL DEFAULT 0,
                downloads INT UNSIGNED NOT NULL DEFAULT 0,
                fullscreens INT UNSIGNED NOT NULL DEFAULT 0,
                shares INT UNSIGNED NOT NULL DEFAULT 0,
                dwell_ms BIGINT UNSIGNED NOT NULL DEFAULT 0,
                last_seen DATETIME NULL DEFAULT NULL,
                PRIMARY KEY  (id),
                UNIQUE KEY doc_day (doc_key,day),
                KEY post_day (post_id,day),
                KEY day (day)
            ) $charset_collate;");

            dbDelta("CREATE TABLE $origins (
                doc_key VARCHAR(64) NOT NULL,
                origin_post_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
                day DATE NOT NULL,
                views INT UNSIGNED NOT NULL DEFAULT 0,
                UNIQUE KEY doc_origin_day (doc_key,origin_post_id,day)
            ) $charset_collate;");

            update_option(self::OPTION, self::VERSION);
        }
    }
}
