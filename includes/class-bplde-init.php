<?php
/**
 * BPLDE Main Initialization Class.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDEDocumentEmbedder')) {
    class BPLDEDocumentEmbedder
    {

        public function __construct() {
            add_action('plugins_loaded', [$this, 'load_dependencies'], 5);
            add_filter('plugin_action_links_' . plugin_basename(BPLDE__FILE__), [$this, 'add_action_links']);
        }

        public function load_dependencies()
        {
            if (is_admin()) {
                \BPLDE_Admin_Assets::instance();

                // Not in the composer classmap (generated before these files existed), so
                // they are required by hand rather than left to the autoloader.
                require_once BPLDE_PLUGIN_PATH . 'includes/admin/class-bplde-edit-layout.php';
                \BPLDE_Edit_Layout::instance();

                require_once BPLDE_PLUGIN_PATH . 'includes/admin/class-bplde-list-screen.php';
                \BPLDE_List_Screen::instance();
            }
            // Registers the front-end preview route too, so it must load on both sides.
            \BPLDE_Preview::instance();
            new BPLDE_Document_Library();
            // Through instance(), not new: the edit-screen layout re-renders this class's
            // cards and needs the one object that already owns the hooks.
            BPLDE_Document_Embedder::instance();
        }

        public function add_action_links($links) {
            $help_link = '<a href="' . admin_url('edit.php?post_type=ppt_viewer&page=bplde-dashboard') . '"><span style="color: #f18500; font-weight: 600;">' . __('Get Helped', 'document-emberdder') . '</span></a>';
            array_unshift($links, $help_link);
            return $links;
        }

        public static function activate() {
            global $wpdb;

            $table_name = $wpdb->prefix . 'docembedder_leads';
            $charset_collate = $wpdb->get_charset_collate();

            $sql = "CREATE TABLE $table_name (
                id int(11) NOT NULL AUTO_INCREMENT,
                name varchar(100) NOT NULL,
                email varchar(150) NOT NULL,
                document_id int(11) NOT NULL,
                document_title varchar(255) NOT NULL,
                downloaded_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
                ip_address varchar(45) NOT NULL,
                PRIMARY KEY  (id)
            ) $charset_collate;";

            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
            dbDelta($sql);
        }
    }
}
