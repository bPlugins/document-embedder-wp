<?php
/**
 * BPLDE_Edit_Layout class.
 *
 * Rearranges the Add/Edit Doc screen into the "split workspace" layout: publish
 * controls in a bar above the form, the configuration panel on the left, the live
 * preview pinned beside it, and the remaining cards in one strip underneath.
 *
 * Nothing here touches vendor/Codestar or the markup CSF renders — the Document
 * Configuration panel is left exactly as the framework draws it, in the same
 * 'advanced' context it has always used. What moves is either a core meta box
 * re-rendered through its own core function (Publish, Tags) or one of this
 * plugin's cards re-rendered through the callback it already used, so no save
 * path, nonce or field name changes.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Edit_Layout')) {
    class BPLDE_Edit_Layout {

        /** Body class every rule in admin-layout.css is scoped to. */
        const BODY_CLASS = 'bplde-l2';

        private static $_instance = null;

        public static function instance() {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_filter('admin_body_class', [$this, 'body_class']);
            add_action('admin_enqueue_scripts', [$this, 'enqueue'], 100);
            // add_meta_boxes_{$post_type} runs after add_meta_boxes, so every box this
            // plugin registers already exists by the time the boxes are relocated.
            add_action('add_meta_boxes_ppt_viewer', [$this, 'relocate_boxes'], 100);
            add_action('edit_form_top', [$this, 'render_top_bar']);
            add_action('dbx_post_sidebar', [$this, 'render_strip']);
        }

        /**
         * The single document edit screen, and only when the layout is switched on.
         * The filter is the escape hatch: returning false anywhere restores the stock
         * WordPress column layout with every box back in the side column.
         */
        private function is_active() {
            if (!function_exists('get_current_screen')) {
                return false;
            }

            $screen = get_current_screen();
            if (!$screen || $screen->base !== 'post' || $screen->post_type !== 'ppt_viewer') {
                return false;
            }

            /**
             * Filters whether the split-workspace layout is used on the document editor.
             *
             * @param bool $enabled Default true.
             */
            return (bool) apply_filters('bplde_use_split_layout', true);
        }

        /**
         * post_submit_meta_box() and post_tags_meta_box() live in this file. It is
         * already loaded by the time the edit form runs, but requiring it keeps the
         * calls safe if that ever stops being true.
         */
        private function require_meta_box_functions() {
            if (!function_exists('post_submit_meta_box') || !function_exists('post_tags_meta_box')) {
                require_once ABSPATH . 'wp-admin/includes/meta-boxes.php';
            }
        }

        public function body_class($classes) {
            if (!$this->is_active()) {
                return $classes;
            }

            return $classes . ' ' . self::BODY_CLASS . ' ';
        }

        public function enqueue() {
            if (!$this->is_active()) {
                return;
            }

            $path = BPLDE_PLUGIN_PATH . 'assets/css/admin-layout.css';

            wp_enqueue_style(
                'bplde-admin-layout',
                BPLDE_PLUGIN_DIR . 'assets/css/admin-layout.css',
                ['ppv-admin'],
                file_exists($path) ? (string) filemtime($path) : BPLDE_VER
            );

            /*
             * post.js only starts the tag box when it finds a postbox whose id begins
             * with "tagsdiv-" (wp-admin/js/post.js). Relocating the Tags box into the
             * strip removes that postbox, so the Add button, the remove crosses and the
             * suggestions all stay dead unless the box is started here instead.
             */
            wp_add_inline_script(
                'post',
                'jQuery( function() { if ( window.tagBox ) { window.tagBox.init(); } } );'
            );
        }

        /**
         * Take the boxes this layout re-renders elsewhere out of the side column, so
         * nothing is drawn twice. The configuration panel and the live preview are
         * deliberately absent from this list — they stay registered meta boxes.
         */
        public function relocate_boxes() {
            if (!$this->is_active()) {
                return;
            }

            $boxes = [
                'submitdiv',                    // core Publish box -> top bar
                // Core names the taxonomy box 'tagsdiv-{taxonomy}' when the taxonomy is
                // flat and '{taxonomy}div' when it is hierarchical. ppv_document_tags is
                // flat today; both spellings are cleared so a change of mind upstream
                // cannot leave the box rendering twice.
                'tagsdiv-ppv_document_tags',    // core Tags box    -> bottom strip
                'ppv_document_tagsdiv',
                'ppv_download_stats',           // plugin card      -> bottom strip
                'bplde_builders',               // plugin card      -> bottom strip
                'bplde_pro_teaser',             // plugin card      -> bottom strip
            ];

            foreach ($boxes as $box) {
                remove_meta_box($box, 'ppt_viewer', 'side');
            }
        }

        /**
         * The bar above the form.
         *
         * edit_form_top fires inside form#post and after the nonces, so the Publish
         * box rendered here submits exactly as it does in the side column — same
         * #publish button, same trash link, same spinner. The core page heading is
         * hidden in CSS and reproduced here so the screen keeps a single H1.
         */
        public function render_top_bar($post) {
            if (!$this->is_active() || !($post instanceof WP_Post)) {
                return;
            }

            $this->require_meta_box_functions();

            $statuses = [
                'publish'    => __('Published', 'document-emberdder'),
                'draft'      => __('Draft', 'document-emberdder'),
                'auto-draft' => __('Draft', 'document-emberdder'),
                'pending'    => __('Pending', 'document-emberdder'),
                'private'    => __('Private', 'document-emberdder'),
            ];

            $status = isset($statuses[$post->post_status]) ? $statuses[$post->post_status] : ucfirst($post->post_status);
            $is_new = in_array($post->post_status, ['auto-draft'], true);
            $heading = $is_new
                ? __('Add New Doc', 'document-emberdder')
                : __('Edit Doc', 'document-emberdder');
            ?>
            <div class="bplde-topbar">
                <div class="bplde-topbar__id">
                    <span class="bplde-topbar__eyebrow"><?php esc_html_e('Document Embedder', 'document-emberdder'); ?></span>
                    <h1 class="bplde-topbar__title"><?php echo esc_html($heading); ?></h1>
                </div>

                <span class="bplde-topbar__status bplde-topbar__status--<?php echo esc_attr($post->post_status); ?>">
                    <span class="bplde-topbar__dot" aria-hidden="true"></span>
                    <?php echo esc_html($status); ?>
                </span>

                <?php if (!$is_new) : ?>
                    <a class="bplde-topbar__new" href="<?php echo esc_url(admin_url('post-new.php?post_type=ppt_viewer')); ?>">
                        <?php esc_html_e('Add New Doc', 'document-emberdder'); ?>
                    </a>
                <?php endif; ?>

                <div class="bplde-topbar__actions">
                    <?php post_submit_meta_box($post); ?>
                </div>
            </div>
            <?php
        }

        /**
         * The full-width strip under both columns.
         *
         * dbx_post_sidebar fires inside #post-body after both postbox containers, which
         * is what lets the strip span the grid. Every card is rendered by the same
         * callback that drew it in the side column.
         */
        public function render_strip($post) {
            if (!$this->is_active() || !($post instanceof WP_Post)) {
                return;
            }

            $this->require_meta_box_functions();

            $embedder = class_exists('BPLDE_Document_Embedder') ? BPLDE_Document_Embedder::instance() : null;
            ?>
            <div class="bplde-strip">

                <section class="bplde-strip__col bplde-strip__col--tags">
                    <div class="bplde-strip__card">
                        <h2 class="bplde-strip__heading"><?php esc_html_e('Tags', 'document-emberdder'); ?></h2>
                        <?php
                        post_tags_meta_box($post, ['args' => ['taxonomy' => 'ppv_document_tags']]);
                        ?>
                    </div>
                </section>

                <?php if ($embedder && method_exists($embedder, 'render_stats_metabox')) : ?>
                    <section class="bplde-strip__col bplde-strip__col--stats">
                        <div class="bplde-strip__card">
                            <h2 class="bplde-strip__heading"><?php esc_html_e('Download stats', 'document-emberdder'); ?></h2>
                            <?php $embedder->render_stats_metabox($post); ?>
                        </div>
                    </section>
                <?php endif; ?>

                <?php if ($embedder && method_exists($embedder, 'render_builders_metabox')) : ?>
                    <section class="bplde-strip__col bplde-strip__col--builders">
                        <?php $embedder->render_builders_metabox(); ?>
                    </section>
                <?php endif; ?>

                <?php if ($embedder && method_exists($embedder, 'render_pro_teaser_metabox')) : ?>
                    <section class="bplde-strip__col bplde-strip__col--pro">
                        <?php $embedder->render_pro_teaser_metabox(); ?>
                    </section>
                <?php endif; ?>

            </div>
            <?php
        }
    }
}
