<?php
/*
 * Plugin Name: Document Embedder
 * Plugin URI:  http://documentembedder.com/
 * Description: Embed Any document easily in wordpress such as word, excel, powerpoint, pdf and more
 * Version:     2.1.2
 * Author:      bPlugins
 * Author URI:  http://bplugins.com
 * License:     GPLv2 or later
 * Text Domain: document-emberdder
 * Domain Path: /languages
 * @fs_premium_only /includes/features/class-bplde-shortcode-pro.php, /includes/core/class-bplde-pro-document-embedder.php, /includes/admin/class-bplde-pro-metabox.php, /includes/admin/class-bplde-pro-settings.php, /includes/class-bplde-license-activation.php, /includes/features/class-bplde-dropbox-api.php, /includes/features/class-bplde-google-drive-api.php
 */

if (!defined('ABSPATH')) {
    exit;
}

if (function_exists('de_fs')) {
    de_fs()->set_basename(true, __FILE__);
} else {
    /* Some Set-up */
    define('BPLDE_VER', '2.1.2');
    define('BPLDE_PRO_IMPORT', '1.0.0');
    define('BPLDE_PLUGIN_DIR', plugin_dir_url(__FILE__));
    define('BPLDE_PLUGIN_PATH', plugin_dir_path(__FILE__));
    define('BPLDE__FILE__', __FILE__);
    define('BPLDE_IMPORT', '1.0.0');
    define('BPLDE_HAS_PRO', 'document-embedder-premium/document-embedder.php' === plugin_basename(__FILE__));

    if (!function_exists('de_fs')) {
        // Create a helper function for easy SDK access.
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedFunctionFound -- Freemius SDK integration function
        function de_fs()
        {
            global $de_fs;

            if (!isset($de_fs)) {
                // Include Freemius SDK.
                require_once dirname(__FILE__) . '/vendor/freemius/start.php';

                // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Freemius SDK integration global variable
                $de_fs = fs_dynamic_init(array(
                    'id' => '19862',
                    'slug' => 'document-emberdder',
                    'premium_slug' => 'document-embedder-premium',
                    'type' => 'plugin',
                    'public_key' => 'pk_f769b99599446975f5e64d7a6ffbc',
                    'is_premium' => false,
                    'premium_suffix' => 'Pro',
                    'menu' => array(
                        'slug' => 'edit.php?post_type=ppt_viewer',
                        'first-path' => 'edit.php?post_type=ppt_viewer&page=bplde-dashboard',
                        'support' => false,
                    ),
                ));
            }
            return $de_fs;
        }

        // Init Freemius.
        de_fs();
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Freemius SDK integration hook
        do_action('de_fs_loaded');
    }

    if (file_exists(BPLDE_PLUGIN_PATH . 'vendor/autoload.php')) {
        require_once BPLDE_PLUGIN_PATH . 'vendor/autoload.php';
    } else {
        require_once BPLDE_PLUGIN_PATH . 'includes/class-bplde-init.php';
    }
    register_activation_hook(BPLDE__FILE__, ['BPLDEDocumentEmbedder', 'activate']);
    new BPLDEDocumentEmbedder();

}







