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
            add_action('enqueue_block_editor_assets', [$this, 'bplde_editor_dflip_assets']);
        }

        public function init() {
            if (file_exists(BPLDE_PLUGIN_PATH . 'assets/dflip/js/dflip.min.js')) {
                wp_register_script('bplde-dflip-script', BPLDE_PLUGIN_DIR . 'assets/dflip/js/dflip.min.js', array('jquery'), BPLDE_VER, true);
                wp_add_inline_script('bplde-dflip-script', 'window.dFlipLocation = "' . BPLDE_PLUGIN_DIR . 'assets/dflip/";', 'before');
                wp_register_style('bplde-dflip-style', BPLDE_PLUGIN_DIR . 'assets/dflip/css/dflip.min.css', array(), BPLDE_VER);
            }

            wp_register_script('ppv-blocks', BPLDE_PLUGIN_DIR . 'build/editor.js', array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'jquery'), BPLDE_VER, true);

            global $wp_roles;
            $roles = array();
            if (!empty($wp_roles->roles)) {
                foreach ($wp_roles->roles as $key => $role) {
                    $roles[] = array(
                        'value' => $key,
                        'label' => translate_user_role($role['name'])
                    );
                }
            }

            wp_localize_script('ppv-blocks', 'ppvBlocks', [
                'siteUrl' => site_url(),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'ppv_nonce' => wp_create_nonce('ppv_secret_nonce'),
                'roles' => $roles,
                'pluginUrl' => BPLDE_PLUGIN_DIR,
                'isPremium' => false,
            ]);

            if ( ! \WP_Block_Type_Registry::get_instance()->is_registered( 'meta-box/document-embedder' ) ) {
                register_block_type(BPLDE_PLUGIN_PATH . 'build/blocks/document-embedder');
            }
            register_block_type(BPLDE_PLUGIN_PATH . 'build/blocks/document-embed');

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
            $option = get_option('_ppt_', []);
            
            global $wp_roles;
            $roles = array();
            if (!empty($wp_roles->roles)) {
                foreach ($wp_roles->roles as $key => $role) {
                    $roles[] = array(
                        'value' => $key,
                        'label' => translate_user_role($role['name'])
                    );
                }
            }

            $ppv_blocks_data = [
                'siteUrl'     => site_url(),
                'ajaxUrl'     => admin_url('admin-ajax.php'),
                'ppv_nonce'   => wp_create_nonce('ppv_secret_nonce'),
                'roles'       => $roles,
                'pluginUrl'   => BPLDE_PLUGIN_DIR,
                'settingsUrl' => admin_url('edit.php?post_type=ppt_viewer&page=settings'),
                'isPremium'   => false,
                'credentials' => [
                    'google' => [
                        'api_key'        => $option['google_apikey'] ?? '',
                        'client_id'      => $option['google_client_id'] ?? '',
                        'project_number' => $option['google_project_number'] ?? '',
                    ],
                    'dropbox' => [
                        'app_key'        => $option['dropbox_app_key'] ?? '',
                    ]
                ]
            ];

            wp_localize_script('ppv-blocks', 'ppvBlocks', $ppv_blocks_data);
            wp_localize_script('bplde-document-embed-editor-script', 'ppvBlocks', $ppv_blocks_data);
            wp_localize_script('bplde-document-embedder-editor-script', 'ppvBlocks', $ppv_blocks_data);
            wp_localize_script('bpldl-document-library-editor-script', 'ppvBlocks', $ppv_blocks_data);

            // 'pluginUrl' lets the library preview modal load the bundled pdf.js viewer instead of
            // Google Docs Viewer, which cannot render files it can't download (local/staging sites,
            // intranets, protected uploads).
            $bpldl_data = [
                'ajax_url'  => admin_url('admin-ajax.php'),
                'nonce'     => wp_create_nonce('bplde_nonce'),
                'pluginUrl' => BPLDE_PLUGIN_DIR,
            ];

            wp_localize_script('bpldl-document-library-editor-script', 'bpldlData', $bpldl_data);
            wp_localize_script('bpldl-document-library-view-script', 'bpldlData', $bpldl_data);
        }

        public function bplde_editor_dflip_assets() {
            if (is_admin() && wp_script_is('bplde-dflip-script', 'registered')) {
                wp_enqueue_script('bplde-dflip-script');
                wp_enqueue_style('bplde-dflip-style');
            }
        }
    }
}
