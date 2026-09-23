<?php
/**
 * BPLDE Admin Assets Class.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Admin_Assets')) {
    class BPLDE_Admin_Assets {

        private static $_instance = null;

        public static function instance() {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        }

        private function asset_version($relative_path) {
            $path = BPLDE_PLUGIN_PATH . $relative_path;

            return file_exists($path) ? (string) filemtime($path) : BPLDE_VER;
        }

        public function enqueue_admin_assets($hook) {
            $screen = get_current_screen();
            if (!$screen) {
                return;
            }

            // 1. Enqueue general ppv-admin assets for PPT Viewer and Document Library edit screens, and plugins page
            if ($hook === 'plugins.php' || $screen->post_type === 'ppt_viewer' || $screen->post_type === 'document_library') {

                // If Pro is active and we are on ppt_viewer screen, register/enqueue Google Drive and Dropbox dependencies
                $dependencies = [];

                // Enqueue main script.js
                wp_enqueue_script('ppv-admin', BPLDE_PLUGIN_DIR . 'assets/js/script.js', $dependencies, BPLDE_VER, true);
                wp_localize_script('ppv-admin', 'ppvAdmin', array(
                    'ajaxUrl' => admin_url('admin-ajax.php')
                ));

                // Keep ppt-admin handle registered/enqueued as well to avoid breaking any other expectations
                wp_enqueue_script('ppt-admin', BPLDE_PLUGIN_DIR . 'assets/js/script.js', $dependencies, BPLDE_VER, true);

                // Enqueue main style.css
                wp_enqueue_style('ppv-admin', BPLDE_PLUGIN_DIR . 'assets/css/style.css', array(), BPLDE_VER);
            }

            // 1b. Live preview on the document edit screen only.
            if ($screen->post_type === 'ppt_viewer' && $screen->base === 'post' && class_exists('BPLDE_Preview')) {
                wp_enqueue_script('bplde-preview', BPLDE_PLUGIN_DIR . 'assets/js/preview.js', array('jquery'), $this->asset_version('assets/js/preview.js'), true);
                wp_localize_script('bplde-preview', 'bpldePreview', \BPLDE_Preview::script_data());
            }

            // 2. Enqueue Admin Dashboard Page
            if ($hook === 'ppt_viewer_page_bplde-dashboard') {
                if (file_exists(BPLDE_PLUGIN_PATH . 'build/admin-dashboard.asset.php')) {
                    $asset_file = include BPLDE_PLUGIN_PATH . 'build/admin-dashboard.asset.php';
                    $deps = array_merge($asset_file['dependencies'], ['wp-util']);
                } else {
                    $deps = ['wp-util'];
                }
                wp_enqueue_script('bplde-dashboard', BPLDE_PLUGIN_DIR . 'build/admin-dashboard.js', $deps, BPLDE_VER, true);
                wp_enqueue_style('bplde-dashboard', BPLDE_PLUGIN_DIR . 'build/admin-dashboard.css', array(), BPLDE_VER);
            }

            // 3. Enqueue Document Library CPT Post Edit Screen
            if ($screen->post_type === 'document_library' && $screen->base === 'post') {
                $current_user_id = get_current_user_id();
                $nickname = get_user_meta($current_user_id, 'nickname', true);

                wp_enqueue_media();

                wp_enqueue_script(
                    'bplde-document-library-script',
                    BPLDE_PLUGIN_DIR . 'build/all-library.js',
                    ['react', 'react-dom', 'wp-media-utils', 'wp-components', 'wp-i18n'],
                    BPLDE_VER,
                    true
                );

                wp_enqueue_style(
                    'bplde-document-library-style',
                    BPLDE_PLUGIN_DIR . 'build/all-library.css',
                    ['wp-components'],
                    BPLDE_VER
                );

                wp_localize_script('bplde-document-library-script', 'bpldeSettings', [
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'athorName' => $nickname,
                    'adminUrl' => admin_url(),
                    'nonce' => wp_create_nonce('bplde_nonce'),
                    // Used by the library preview modal to load the bundled pdf.js viewer.
                    'pluginUrl' => BPLDE_PLUGIN_DIR,
                    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                    'postId' => isset($_GET['post']) ? intval($_GET['post']) : 0,
                ]);
            }

            // 4. Enqueue Document Library Submenu Page
            if ($hook === 'ppt_viewer_page_document-library') {
                $current_user_id = get_current_user_id();
                $nickname = get_user_meta($current_user_id, 'nickname', true);

                wp_enqueue_script(
                    'bplde-all-library-script',
                    BPLDE_PLUGIN_DIR . 'build/all-library.js',
                    ['react', 'react-dom', 'wp-media-utils', 'wp-components'],
                    BPLDE_VER,
                    true
                );
                wp_enqueue_style(
                    'bplde-all-library-style',
                    BPLDE_PLUGIN_DIR . 'build/all-library.css',
                    ['wp-components'],
                    BPLDE_VER
                );

                wp_localize_script('bplde-all-library-script', 'bpldeSettings', [
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'athorName' => $nickname,
                    'adminUrl' => admin_url(),
                    'nonce' => wp_create_nonce('bplde_nonce'),
                    // Used by the library preview modal to load the bundled pdf.js viewer.
                    'pluginUrl' => BPLDE_PLUGIN_DIR,
                ]);
            }

            // 5. Enqueue Leads Page
            if ($hook === 'ppt_viewer_page_bplde-download-leads') {
                $leads_css = BPLDE_PLUGIN_PATH . 'assets/css/admin-leads.css';

                wp_enqueue_style(
                    'bplde-admin-leads',
                    BPLDE_PLUGIN_DIR . 'assets/css/admin-leads.css',
                    [],
                    file_exists($leads_css) ? (string) filemtime($leads_css) : BPLDE_VER
                );
            }
        }
    }
}
