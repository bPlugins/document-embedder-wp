<?php
/**
 * BPLDE Menu Class.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Admin;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Menu')) {
    class BPLDE_Menu {

        private static $_instance = null;

        public static function instance() {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        private function __construct() {
            add_action('admin_menu', [$this, 'add_menus']);
            add_action('admin_menu', [$this, 'remove_menus'], 999);
            add_action('admin_menu', [$this, 'reorder_menus'], 9999);
        }

        /**
         * Add submenus under PPT Viewer post type
         */
        public function add_menus() {
            // Add Help & Demos submenu
            add_submenu_page(
                'edit.php?post_type=ppt_viewer',
                __('Help & Demos', 'document-emberdder'),
                __('<span style="color: #f18500;">Help & Demos</span>', 'document-emberdder'),
                'manage_options',
                'bplde-dashboard',
                [$this, 'render_dashboard_page']
            );

            // Add Leads submenu (registered but hidden from menu tree via remove_menus)
            if (class_exists('\BPLDE\Admin\LeadsPage')) {
                add_submenu_page(
                    'edit.php?post_type=ppt_viewer',
                    'Download Leads',
                    'Download Leads',
                    'manage_options',
                    'bplde-download-leads',
                    [\BPLDE\Admin\LeadsPage::instance(), 'render_page']
                );
            }
        }

        /**
         * Hide the registered leads page from the admin sidebar menu tree
         */
        public function remove_menus() {
            remove_submenu_page('edit.php?post_type=ppt_viewer', 'bplde-download-leads');
        }

        /**
         * Reorder submenus under PPT Viewer to push Help & Demos to the end
         */
        public function reorder_menus() {
            global $submenu;

            $parent = 'edit.php?post_type=ppt_viewer';
            $slug = 'bplde-dashboard';

            if (!isset($submenu[$parent])) {
                return;
            }

            foreach ($submenu[$parent] as $index => $item) {
                if ($item[2] === $slug) {
                    $menu_item = $item;
                    unset($submenu[$parent][$index]);
                    $submenu[$parent][] = $menu_item; // push to end
                    break;
                }
            }
        }

        /**
         * Render callback for Help & Demos page
         */
        public function render_dashboard_page() {
            ?>
            <style>
                #wpcontent {
                    padding-left: 0 !important;
                }
            </style>
            <div id='bpldeDashboard' data-info='<?php echo esc_attr(wp_json_encode([
                'version' => BPLDE_VER,
                'isPremium' => false,
                'hasPro' => BPLDE_HAS_PRO,
                'licenseActiveNonce' => wp_create_nonce('bPlLicenseActivation'),
                'exportLeadsNonce' => wp_create_nonce('de_export_leads_csv')
            ])); ?>'></div>
            <?php
        }
    }

    BPLDE_Menu::instance();
}
