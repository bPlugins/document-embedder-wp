<?php
/**
 * BPLDE Document Library CPT.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Document_Library_CPT')) {
    class BPLDE_Document_Library_CPT
    {

        protected static $_instance = null;
        protected $post_type = 'document_library';

        public static function instance()
        {
            if (self::$_instance === null) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        private function __construct()
        {
            add_action('init', [$this, 'register_cpt']);
            add_filter('use_block_editor_for_post_type', [$this, 'disable_block_editor'], 10, 2);
            add_action('admin_head', [$this, 'cleanup_admin_ui']);
            add_action('edit_form_after_title', [$this, 'render_react_root']);
            add_action('init', [$this, 'remove_title_from_cpt']);
            add_filter("manage_{$this->post_type}_posts_columns", [$this, 'postTypeColumns'], 1);
            add_action("manage_{$this->post_type}_posts_custom_column", [$this, 'postTypeContent'], 10, 2);
            add_filter("manage_edit-{$this->post_type}_sortable_columns", [$this, 'sortableColumns']);
            add_filter('display_post_states', [$this, 'postStates'], 10, 2);
        }

        /**
         * Register Document Library CPT
         */
        public function register_cpt()
        {
            register_post_type('document_library', [
                'labels' => [
                    'name' => __('Document Library', 'document-emberdder'),
                    'singular_name' => __('Document Library', 'document-emberdder'),
                    'add_new_item' => __('Add New Library', 'document-emberdder'),
                    'edit_item' => __('Edit Library', 'document-emberdder'),
                ],
                'public' => false,
                'show_ui' => true,
                'show_in_menu' => 'edit.php?post_type=ppt_viewer',
                'supports' => ['title'],
                'capability_type' => 'post',
                'show_in_rest' => true,
            ]);
        }

        /**
         * Disable Gutenberg
         */
        public function disable_block_editor($use, $post_type)
        {
            if ($post_type === 'document_library') {
                return false;
            }
            return $use;
        }

        /**
         * Remove default WP UI junk
         */
        public function cleanup_admin_ui() {
            $screen = get_current_screen();

            if (!$screen || $screen->post_type !== 'document_library') {
                return;
            }

            remove_meta_box('submitdiv', 'document_library', 'side');
            remove_meta_box('slugdiv', 'document_library', 'normal');
        }

        /**
         * Render React root instead of editor
         */
        public function render_react_root($post) {
            if ($post->post_type !== 'document_library') {
                return;
            }
            ?>
            <style>
                #wpcontent,
                #poststuff {
                    padding: 0;
                }

                .wrap,
                #post-body {
                    margin: 0 !important;
                }

                .wp-heading-inline,
                .postbox-container,
                #screen-meta-links,
                .page-title-action {
                    display: none !important;
                }

                #poststuff h2 {
                    font-size: 18px;
                    padding: 0 !important;
                    margin: 0 !important;
                }
            </style>
            <div id="bpldeDocumentLibraryWrapper" data-post-id="<?php echo esc_attr($post->ID); ?>" data-is-premium="0">
            </div>
            <?php
        }

        function remove_title_from_cpt() {
            remove_post_type_support('document_library', 'title');
        }

        /**
         * Same shape as the document list, so one stylesheet dresses both. The date
         * column is the plugin's own rather than core's, because it carries the post
         * status as a pill alongside the date.
         */
        public function postTypeColumns($columns)
        {
            return [
                'cb'         => $columns['cb'],
                'title'      => $columns['title'],
                'shortcode'  => __('Shortcode', 'document-emberdder'),
                'bplde_date' => __('Date', 'document-emberdder'),
            ];
        }

        public function postTypeContent($column_name, $post_id)
        {
            switch ($column_name) {
                case 'shortcode':
                    \BPLDE_List_Screen::shortcode_cell('[document_library id=' . $post_id . ']');
                    break;

                case 'bplde_date':
                    \BPLDE_List_Screen::status_date_cell($post_id);
                    break;
            }
        }

        /** Draft / Pending / Private as chips, the same as the document list. */
        public function postStates($states, $post)
        {
            if (!$post instanceof \WP_Post || $post->post_type !== $this->post_type) {
                return $states;
            }

            return \BPLDE_List_Screen::state_chips($states);
        }

        /** Sortable by date, as the column it replaces was. */
        public function sortableColumns($columns)
        {
            $columns['bplde_date'] = 'date';
            return $columns;
        }
    }
}

BPLDE_Document_Library_CPT::instance();
