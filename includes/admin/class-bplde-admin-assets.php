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
                ]);
            }

            // 5. Enqueue Leads Page Inline Styles
            if ($hook === 'ppt_viewer_page_bplde-download-leads') {
                wp_add_inline_style('wp-admin', '
                    .bplde-custom-table-container { 
                        margin-top: 20px; 
                        background: #fff; 
                        border: 0; 
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); 
                        border-radius: 8px;
                        padding: 24px;
                    }
                    .bplde-header-actions { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        margin-bottom: 24px;
                    }
                    .bplde-header-left, .bplde-header-right {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                    }
                    .bplde-btn { 
                        display: inline-flex; 
                        align-items: center; 
                        justify-content: center; 
                        height: 38px; 
                        padding: 0 18px; 
                        border-radius: 6px; 
                        font-weight: 500; 
                        font-size: 13px; 
                        text-decoration: none; 
                        cursor: pointer; 
                        transition: all 0.2s ease; 
                        border: 1px solid transparent;
                    }
                    .bplde-btn-back { 
                        background: #f3f4f6; 
                        color: #374151; 
                        border-color: #d1d5db;
                    }
                    .bplde-btn-back:hover { 
                        background: #e5e7eb; 
                        color: #1f2937;
                    }
                    .bplde-btn-title { 
                        background: #eff6ff; 
                        color: #1d4ed8; 
                        border-color: #bfdbfe;
                    }
                    .bplde-btn-title:hover { 
                        background: #dbeafe; 
                        color: #1e3a8a;
                    }
                    .bplde-btn-export { 
                        background: #10b981; 
                        color: #fff; 
                    }
                    .bplde-btn-export:hover { 
                        background: #059669; 
                        color: #fff;
                    }
                    .bplde-btn-filter {
                        background: #3b82f6; 
                        color: #fff;
                    }
                    .bplde-btn-filter:hover {
                        background: #2563eb; 
                        color: #fff;
                    }
                    .bplde-btn-clear {
                        background: transparent;
                        color: #6b7280;
                        border-color: #d1d5db;
                    }
                    .bplde-btn-clear:hover {
                        color: #374151;
                        background: #f9fafb;
                    }
                    .bplde-btn-delete {
                        background: transparent;
                        color: #ef4444;
                        border: 1px solid #fca5a5;
                    }
                    .bplde-btn-delete:hover {
                        background: #fee2e2;
                        color: #dc2626;
                    }
                    .bplde-filters-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #f3f4f6;
                    }
                    .bplde-filters-left {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                    }
                    .bplde-input {
                        height: 38px;
                        border-radius: 6px;
                        border: 1px solid #d1d5db;
                        padding: 0 12px;
                        font-size: 13px;
                        box-shadow: none;
                        color: #374151;
                    }
                    .bplde-input:focus {
                        border-color: #3b82f6;
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                    .bplde-custom-table { 
                        width: 100%; 
                        border-collapse: separate; 
                        border-spacing: 0;
                        text-align: left; 
                    }
                    .bplde-custom-table th { 
                        background: transparent; 
                        padding: 14px 16px; 
                        font-weight: 600; 
                        color: #6b7280; 
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 1px solid #e5e7eb; 
                    }
                    .bplde-custom-table td { 
                        padding: 16px 16px; 
                        border-bottom: 1px solid #f3f4f6; 
                        color: #1f2937; 
                        vertical-align: middle; 
                        font-size: 14px;
                    }
                    .bplde-custom-table tbody tr {
                        transition: background-color 0.15s ease;
                    }
                    .bplde-custom-table tbody tr:hover { 
                        background: #f9fafb; 
                    }
                    .bplde-custom-table tbody tr:last-child td {
                        border-bottom: none;
                    }
                    .bplde-checkbox {
                        accent-color: #3b82f6;
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                    }
                    .bplde-pagination { 
                        margin-top: 24px;
                        display: flex; 
                        justify-content: flex-end; 
                        gap: 6px; 
                    }
                    .bplde-pagination a, .bplde-pagination span { 
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 32px;
                        height: 32px;
                        padding: 0 8px; 
                        border: 1px solid #e5e7eb; 
                        background: #fff; 
                        border-radius: 6px; 
                        text-decoration: none; 
                        color: #4b5563; 
                        font-size: 13px;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    }
                    .bplde-pagination .current { 
                        background: #3b82f6; 
                        color: #fff; 
                        border-color: #3b82f6; 
                    }
                    .bplde-pagination a:hover { 
                        border-color: #d1d5db;
                        color: #1f2937;
                    }
                ');
            }
        }
    }
}
