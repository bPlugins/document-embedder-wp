<?php
/**
 * BPLDE_Settings_Free Class.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Settings_Free')) {
    class BPLDE_Settings_Free {

        public static function init() {
            if (!class_exists('CSF')) {
                return;
            }

            $parent_slug = 'edit.php?post_type=ppt_viewer';
            $prefix = '_ppt_';

            \CSF::createOptions($prefix, [
                'menu_title' => __('Settings', 'document-emberdder'),
                'menu_slug' => 'settings',
                'menu_type' => 'submenu',
                'menu_parent' => $parent_slug,
                'theme' => 'light',
                'framework_title' => 'Settings',
                'footer_credit' => 'Thanks for being with bPlugins'
            ]);

            \CSF::createSection($prefix, array(
                'title' => __('Premium Integrations', 'document-emberdder'),
                'fields' => array(
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                            __('Google Drive API Integration to embed files directly', 'document-emberdder'),
                            __('Dropbox API Integration to embed files directly', 'document-emberdder'),
                            __('Secure Email Gate to Collect Leads before Downloading', 'document-emberdder'),
                            __('Download Access Control by Login Status & User Roles', 'document-emberdder'),
                            __('Dedicated Leads Dashboard & Stats Tracking', 'document-emberdder'),
                        ))
                )
            ));
        }
    }

    BPLDE_Settings_Free::init();
}
