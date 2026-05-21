<?php
/**
 * BPLDE Gutenberg Blocks registration class.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Block')) {
    class BPLDE_Block  {
        public function __construct() {
            add_action('init', [$this, 'init']);
            add_action('enqueue_block_assets', [$this, 'bplde_block_assets']);
        }

        public function init()
        {
            wp_register_script('ppv-blocks', BPLDE_PLUGIN_DIR . 'build/editor.js', array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'jquery'), BPLDE_VER, true);

            wp_localize_script('ppv-blocks', 'ppvBlocks', [
                'siteUrl' => site_url(),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'ppv_nonce' => wp_create_nonce('ppv_secret_nonce')
            ]);

            register_block_type(BPLDE_PLUGIN_PATH . 'build/blocks/document-embedder');

            register_block_type('kahf-kit/kahf-banner-k27f', array(
                'editor_script' => 'ppv-blocks',
                'render_callback' => function ($attr, $content) {
                    return wpautop($content);
                }
            ));

            // Document library block registration
            register_block_type(BPLDE_PLUGIN_PATH . 'build/blocks/document-library');
            wp_set_script_translations('document-emberdder', 'document-library', plugin_dir_path(BPLDE__FILE__) . 'languages');
        }

        public function bplde_block_assets() {
            wp_localize_script(
                'bpldl-document-library-editor-script',
                'bpldlData',
                [
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('bplde_nonce')
                ]
            );
            wp_localize_script(
                'bpldl-document-library-view-script',
                'bpldlData',
                [
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('bplde_nonce')
                ]
            );
        }
    }
}
