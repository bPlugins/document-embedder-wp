<?php
/**
 * BPLDocumentEmbedder class.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Document_Embedder')) {
    class BPLDE_Document_Embedder
    {

        private static $_instance = null;

        public static function instance()
        {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct()
        {
            add_action('plugins_loaded', [$this, 'load_dependencies']);
            add_action('admin_init', [$this, 'assign_file_type_to_all']);
            add_action('save_post_ppt_viewer', [$this, 'sync_post_file_type'], 10, 2);
            add_action('plugins_loaded', [__CLASS__, 'load_textdomain']);
            add_action('wp_enqueue_scripts', [$this, 'ppv_public_scripts']);

            add_action('add_meta_boxes', [$this, 'add_stats_metabox']);

            $db_ver = get_option('de_db_version', '0');
            if (version_compare($db_ver, BPLDE_VER, '<')) {
                $this->ensure_table_exists();
            } 


        }

        public function load_dependencies() {
            class_exists('\BPLDE\Admin\BPLDE_Menu');
            class_exists('\BPLDE\PostType\PPTViewer');
            class_exists('\BPLDE\Model\Shortcode');
            class_exists('\BPLDE\Model\AJAXCall');
            new \BPLDE\Rest\RESTController();
            if (is_admin()) {
                class_exists('\BPLDE\Admin\LeadsPage');
            }

            if (class_exists('\BPLDE_Block')) {
                new \BPLDE_Block();
            }

            if (!class_exists('CSF')) {
                require_once BPLDE_PLUGIN_PATH . 'vendor/Codestar/framework.php';
            }

            class_exists('\BPLDE_Settings_Free');
            class_exists('\BPLDE_Metabox_Free');
        }

        public static function load_textdomain() {
            // phpcs:ignore WordPress.WP.I18n.NoEmptyStrings, PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound -- retained for back-compat with custom language files
            load_plugin_textdomain('document-emberdder', false, dirname(__FILE__) . '/languages');
        }

        public function ppv_public_scripts() {
            wp_enqueue_script('ppv-public', BPLDE_PLUGIN_DIR . 'build/public.js', array('jquery'), BPLDE_VER, true);
            wp_localize_script('ppv-public', 'bplde_obj', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'track_nonce' => wp_create_nonce('de_track_download_nonce'),
                'rest_url' => get_rest_url(null, 'docembedder/v1/')
            ));
            wp_enqueue_style('ppv-public', BPLDE_PLUGIN_DIR . 'build/public.css', array(), BPLDE_VER);
        }

        public function assign_file_type_to_all() {
            if (get_option('de_file_type_migrated', '0') === '1') {
                return;
            }

            $batch_size = 50;
            $offset = intval(get_option('de_migration_offset', 0));

            $args = array(
                'post_type' => 'ppt_viewer',
                'posts_per_page' => $batch_size,
                'offset' => $offset,
                'post_status' => 'any',
                'fields' => 'ids',
            );
            $post_ids = get_posts($args);

            if (empty($post_ids)) {
                update_option('de_file_type_migrated', '1');
                delete_option('de_migration_offset');
                return;
            }

            foreach ($post_ids as $post_id) {
                $data = get_post_meta($post_id, 'ppv', true);
                $file_url = isset($data['doc']) ? $data['doc'] : '';
                if ($file_url) {
                    $ext = strtolower(pathinfo($file_url, PATHINFO_EXTENSION));
                    if ($ext) {
                        wp_set_object_terms($post_id, $ext, 'ppv_file_type', false);
                    }
                }
            }

            update_option('de_migration_offset', $offset + count($post_ids));
        }

        public function sync_post_file_type($post_id, $post = null)
        {
            if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
                return;
            }

            $data = get_post_meta($post_id, 'ppv', true);
            $file_url = isset($data['doc']) ? $data['doc'] : '';
            if ($file_url) {
                $ext = strtolower(pathinfo($file_url, PATHINFO_EXTENSION));
                if ($ext) {
                    wp_set_object_terms($post_id, $ext, 'ppv_file_type', false);
                }
            }
        }

        public function de_track_download()
        {
            \BPLDE\Model\AJAXCall::instance()->de_track_download();
        }

        public function add_stats_metabox()
        {
            add_meta_box(
                'ppv_download_stats',
                'Download Stats',
                [$this, 'render_stats_metabox'],
                'ppt_viewer',
                'side',
                'default'
            );
        }

        public function render_stats_metabox($post)
        {
            global $wpdb;
            $count = get_post_meta($post->ID, '_de_download_count', true);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table
            $leads_count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d", $post->ID));
            $leads_url = admin_url('edit.php?post_type=ppt_viewer&page=bplde-download-leads&filter_document_id=' . $post->ID);
            ?>
            <div class="de-stats-container">
                <p style="font-size: 14px; margin-bottom: 12px;"><strong>Total Downloads:</strong> <?php echo intval($count); ?>
                </p>
                <p style="font-size: 14px; margin-bottom: 18px;"><strong>Total Leads:</strong> <?php echo intval($leads_count); ?>
                </p>
                <a href="<?php echo esc_url($leads_url); ?>" class="button button-primary"
                    style="width: 100%; text-align: center; height: 32px; line-height: 30px;">View Leads</a>
            </div>
            <?php
        }

        public function ensure_table_exists()
        {
            global $wpdb;
            $table_name = $wpdb->prefix . 'docembedder_leads';
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table existence
            if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name)) != $table_name) {
                \BPLDEDocumentEmbedder::activate();
            }
            update_option('de_db_version', BPLDE_VER);
        }

    }
}
