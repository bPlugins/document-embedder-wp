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

        public function __construct()
        {
            add_action('plugins_loaded', [$this, 'load_dependencies'], 5);
            add_action('admin_notices', [$this, 'upgrade_notice']);
            add_filter('plugin_action_links_' . plugin_basename(BPLDE__FILE__), [$this, 'add_action_links']);
        }

        public function load_dependencies()
        {
            if (is_admin()) {
                \BPLDE_Admin_Assets::instance();
            }
            new BPLDE_Document_Library();
            new BPLDE_Document_Embedder();
        }

        public function upgrade_notice()
        {
            $page = get_current_screen();
            if (!$page) {
                return;
            }
            $is_document_embedder_page = ($page->base == 'edit' && $page->post_type == 'ppt_viewer') || ($page->base != 'post' && $page->post_type == 'document_library');
            if ($page->base == 'ppt_viewer_page_settings' || $is_document_embedder_page) {
                ?>
                <div class="bplde_upgrade_notice <?php echo esc_attr($is_document_embedder_page ? 'ppt_viewer' : 'settings'); ?> ">
                    <div class="flex">
                        <img src="<?php echo esc_url(BPLDE_PLUGIN_DIR . 'assets/img/icn2.png'); ?>" alt="Document Embedder" />
                        <h3>Document Embedder</h3>
                    </div>
                    <p>The Ultimate Document Embedder Plugin for WordPress, Loved by Over 10,000+ Users.</p>
                    <div>
                        <a href="<?php echo esc_url(admin_url('edit.php?post_type=ppt_viewer&page=document-emberdder-pricing')); ?>"
                            class="button button-primary" target="_blank">Upgrade To Pro <svg
                                enable-background="new 0 0 515.283 515.283" height="16" viewBox="0 0 515.283 515.283" width="16"
                                xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <g>
                                        <g>
                                            <g>
                                                <path
                                                    d="m372.149 515.283h-286.268c-22.941 0-44.507-8.934-60.727-25.155s-25.153-37.788-25.153-60.726v-286.268c0-22.94 8.934-44.506 25.154-60.726s37.786-25.154 60.727-25.154h114.507c15.811 0 28.627 12.816 28.627 28.627s-12.816 28.627-28.627 28.627h-114.508c-7.647 0-14.835 2.978-20.241 8.384s-8.385 12.595-8.385 20.242v286.268c0 7.647 2.978 14.835 8.385 20.243 5.406 5.405 12.594 8.384 20.241 8.384h286.267c7.647 0 14.835-2.978 20.242-8.386 5.406-5.406 8.384-12.595 8.384-20.242v-114.506c0-15.811 12.817-28.626 28.628-28.626s28.628 12.816 28.628 28.626v114.507c0 22.94-8.934 44.505-25.155 60.727-16.221 16.22-37.788 25.154-60.726 25.154zm-171.76-171.762c-7.327 0-14.653-2.794-20.242-8.384-11.179-11.179-11.179-29.306 0-40.485l237.397-237.398h-102.648c-15.811 0-28.626-12.816-28.626-28.627s12.815-28.627 28.626-28.627h171.761c3.959 0 7.73.804 11.16 2.257 3.201 1.354 6.207 3.316 8.837 5.887.001.001.001.001.002.002.019.019.038.037.056.056.005.005.012.011.017.016.014.014.03.029.044.044.01.01.019.019.029.029.011.011.023.023.032.032.02.02.042.041.062.062.02.02.042.042.062.062.011.01.023.023.031.032.011.01.019.019.029.029.016.015.03.029.044.045.005.004.012.011.016.016.019.019.038.038.056.057 0 .001.001.001.002.002 2.57 2.632 4.533 5.638 5.886 8.838 1.453 3.43 2.258 7.2 2.258 11.16v171.761c0 15.811-12.817 28.627-28.628 28.627s-28.626-12.816-28.626-28.627v-102.648l-237.4 237.399c-5.585 5.59-12.911 8.383-20.237 8.383z"
                                                    fill="rgba(255, 255, 255, 1)" />
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </svg></a>
                    </div>
                </div>
                <?php
            }
        }

        public function add_action_links($links)
        {
            $help_link = '<a href="' . admin_url('edit.php?post_type=ppt_viewer&page=bplde-dashboard') . '"><span style="color: #f18500; font-weight: 600;">' . __('Help & Demo\'s', 'document-emberdder') . '</span></a>';
            array_unshift($links, $help_link);
            return $links;
        }

        public static function activate()
        {
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
