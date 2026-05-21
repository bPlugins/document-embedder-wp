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
            if ($post->post_type === $this->post_type): ?>
                <div class="ppv_shortcode">
                    <code class="shortcode_copy" data-code="[doc id='<?php echo esc_attr($post->ID); ?>']">
                                        [doc id='<?php echo esc_attr($post->ID); ?>']
                                    </code>

                    <p class="shortcode_desc">
                        <?php echo esc_html__("Copy this shortcode and paste it into your post, page, or text widget content.", 'document-emberdder'); ?>
                    </p>
                </div>

                <script>
                    document.addEventListener('click', function (e) {
                        var el = e.target.closest('.shortcode_copy');
                        if (!el) return;

                        navigator.clipboard.writeText(el.dataset.code).then(function () {
                            var original = el.textContent;
                            el.textContent = 'Copied!';

                            setTimeout(function () {
                                el.textContent = original;
                            }, 1000);
                        });
                    });
                </script>
            <?php endif;
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
