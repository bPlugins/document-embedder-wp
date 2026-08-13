<?php
/**
 * PPTViewer Post Type Class.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\PostType;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('PPTViewer')) {
    class PPTViewer {
        protected static $_instance = null;
        protected $post_type = 'ppt_viewer';

        public function __construct() {
            add_action('init', [$this, 'register_taxonomy']);
            add_action('init', [$this, 'register_post_type']);

            if (is_admin()) {
                add_filter("manage_{$this->post_type}_posts_columns", [$this, 'postTypeColumns'], 1);
                add_action("manage_{$this->post_type}_posts_custom_column", [$this, 'postTypeContent'], 10, 2);
                add_filter('post_row_actions', [$this, 'removeRowAction'], 10, 2);
                add_action('admin_head-post.php', [$this, 'ppv_hide_publishing_actions']);
                add_action('admin_head-post-new.php', [$this, 'ppv_hide_publishing_actions']);
                add_filter('gettext', [$this, 'ppv_change_publish_button'], 10, 3);
                add_filter('post_updated_messages', [$this, 'ppv_updated_messages']);
                add_action('edit_form_after_title', [$this, 'shortcode_area']);
            }
        }

        public static function instance()
        {
            if (self::$_instance === null) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function register_post_type()
        {
            $cpt_title = __('Document Embedder', 'document-emberdder');
            $show_in_menu = true;

            register_post_type($this->post_type, array(
                'labels' => array(
                    'name' => $cpt_title,
                    'singular_name' => __('Doc Embedder', 'document-emberdder'),
                    'all_items' => __('Doc Embedder', 'document-emberdder'),
                    'add_new' => __('Add New Doc', 'document-emberdder'),
                    'add_new_item' => __('Add New Doc', 'document-emberdder'),
                    'edit_item' => __('Edit', 'document-emberdder'),
                    'new_item' => __('New item', 'document-emberdder'),
                    'view_item' => __('View item', 'document-emberdder'),
                    'search_items' => __('Search', 'document-emberdder'),
                    'not_found' => __('Sorry, we couldn\'t find the power point file you are looking for.', 'document-emberdder')
                ),
                'public' => false,
                'show_ui' => true,
                'publicly_queryable' => true,
                'exclude_from_search' => true,
                'menu_position' => 14,
                'show_in_rest' => true,
                'menu_icon' => BPLDE_PLUGIN_DIR . 'assets/img/doc.png',
                'has_archive' => false,
                'hierarchical' => false,
                'capability_type' => 'page',
                'rewrite' => array('slug' => 'ppt_viewer'),
                'supports' => array('title'),
                'show_in_menu' => $show_in_menu
            ));
        }

        public function register_taxonomy()
        {
            $post_type = $this->post_type;
            $slug = 'ppv_document_tags';
            $title = 'Tags';
            $is_hierarchical = false;
            register_taxonomy(
                $slug,
                $post_type,
                array(
                    'labels' => array(
                        'name' => $title . '',
                        'singular_name' => $title,
                        'search_items' => "Search " . $title . "s",
                        'all_items' => "All " . $title . "s",
                        'edit_item' => "Edit $title",
                        'update_item' => "Update $title",
                        'add_new_item' => "Add New $title",
                        'new_item_name' => "New $title Name",
                        'menu_name' => $title . 's'
                    ),
                    'hierarchical' => $is_hierarchical,
                    'show_ui' => true,
                    'show_admin_column' => true,
                    'show_in_menu' => false,
                    'query_var' => true,
                    'rewrite' => array('slug' => $slug),
                    'show_in_rest' => true
                )
            );
            register_taxonomy(
                "ppv_file_type",
                $post_type,
                array(
                    'labels' => array(
                        'name' => 'File Type',
                        'search_items' => "Search File Type",
                        'all_items' => "All File Types",
                    ),
                    'hierarchical' => $is_hierarchical,
                    'show_ui' => false,
                    'show_admin_column' => true,
                    'show_in_menu' => false,
                    'query_var' => true,
                    'rewrite' => array('slug' => $slug),
                    'show_in_rest' => true
                )
            );
        }

        public function postTypeColumns($columns)
        {
            $new = [
                'cb' => $columns['cb'],
                'title' => $columns['title'],
                'shortcode' => 'Shortcode',
                'taxonomy-ppv_document_tags' => 'Tags',
                'taxonomy-ppv_file_type' => 'File Type',
                'download_count' => 'Downloads',
                'download_leads' => 'Download Leads',
                'date' => $columns['date'],
            ];
            return $new;
        }

        public function postTypeContent($column_name, $post_id)
        {
            switch ($column_name) {
                case 'shortcode':
                    echo '<div class="bplde_front_shortcode"><input style="text-align: center; border: none; outline: none; background-color: #2664eb; color: #fff; padding: 4px 10px; border-radius: 3px;" value="[doc id=' . esc_attr($post_id) . ']" ><span class="htooltip">Copy To Clipboard</span></div>';
                    break;
                case 'download_count':
                    $count = get_post_meta($post_id, '_de_download_count', true);
                    echo '<strong>' . intval($count) . '</strong>';
                    break;
                case 'download_leads':
                    $leads_link = admin_url('edit.php?post_type=ppt_viewer&page=bplde-download-leads&filter_document_id=' . $post_id);
                    echo '<a href="' . esc_url($leads_link) . '" class="button button-small">View Download Leads</a>';
                    break;
            }
        }

        public function shortcode_area()
        {
            global $post;
            if ($post->post_type !== $this->post_type) {
                return;
            }

            $shortcode = "[doc id='" . esc_attr($post->ID) . "']";
            ?>
            <div class="bplde_shortcode_area_after_title">
                <label><?php esc_html_e('Copy and paste this shortcode into your posts, pages and widget', 'document-emberdder'); ?></label>
                <div class="shortcode_area">
                    <button class="button button-bplugins button-large bplde_shortcode_copy_btn"
                        data-clipboard-text="<?php echo esc_attr($shortcode); ?>"><?php echo esc_html($shortcode); ?></button>
                    <svg class="bplde_shortcode_copy_btn" data-type="icon"
                        data-clipboard-text="<?php echo esc_attr($shortcode); ?>" width="22px" height="22px"
                        viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8 4V16C8 17.1046 8.89543 18 10 18L18 18C19.1046 18 20 17.1046 20 16V7.24162C20 6.7034 19.7831 6.18789 19.3982 5.81161L16.0829 2.56999C15.7092 2.2046 15.2074 2 14.6847 2H10C8.89543 2 8 2.89543 8 4Z"
                            stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V9C4 7.89543 4.89543 7 6 7H8"
                            stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <script>
                document.addEventListener('click', function (e) {
                    var el = e.target.closest('.bplde_shortcode_copy_btn');
                    if (!el) return;
                    e.preventDefault();

                    var text = el.dataset.clipboardText;

                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                    } else {
                        var tempInput = document.createElement('input');
                        tempInput.value = text;
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        document.execCommand('copy');
                        document.body.removeChild(tempInput);
                    }

                    if (el.dataset.type === 'icon') {
                        el.style.width = '18px';
                        setTimeout(function () {
                            el.style.width = '22px';
                        }, 200);
                    } else {
                        el.textContent = 'Copied!';
                        setTimeout(function () {
                            el.textContent = text;
                        }, 2000);
                    }
                });
            </script>
            <?php
        }

        public function removeRowAction($row)
        {
            global $post;
            if ($post->post_type == 'ppt_viewer') {
                unset($row['view']);
                unset($row['inline hide-if-no-js']);
            }
            return $row;
        }

        public function ppv_hide_publishing_actions()
        {
            global $post;
            if ($post && $post->post_type == $this->post_type) {
                echo '<style type="text/css">#misc-publishing-actions,#minor-publishing-actions{display:none;}</style>';
            }
        }

        public function ppv_change_publish_button($translation, $text, $domain)
        {
            if (!is_admin()) {
                return $translation;
            }

            if (!function_exists('get_current_screen')) {
                return $translation;
            }

            $screen = \get_current_screen();
            if (!$screen || $screen->post_type !== 'ppt_viewer' || $screen->base !== 'post') {
                return $translation;
            }

            if ('default' === $domain && 'Publish' === $text) {
                return __('Save', 'document-emberdder');
            }

            return $translation;
        }

        public function ppv_updated_messages($messages)
        {
            $messages['ppt_viewer'][1] = __('Updated', 'document-emberdder');
            return $messages;
        }
    }

    PPTViewer::instance();
}
