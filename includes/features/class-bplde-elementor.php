<?php
/**
 * BPLDE Elementor integration.
 *
 * Registers the "Document Embedder" Elementor widget and its panel category. Every hook here
 * is an Elementor action, so nothing runs (and the widget file, which extends an Elementor
 * class, is never loaded) unless Elementor is active.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Elementor')) {
    class BPLDE_Elementor {
        const CATEGORY = 'document-embedder';

        protected static $_instance = null;

        public static function instance() {
            if (self::$_instance === null) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_action('elementor/elements/categories_registered', [$this, 'register_category']);
            add_action('elementor/widgets/register', [$this, 'register_widgets']);
            add_action('elementor/editor/after_enqueue_scripts', [$this, 'editor_scripts']);
        }

        /**
         * The widget's "Edit Document" / "Edit Library" buttons fire `bplde:edit:<source>` on the
         * editor channel; open the post picked in the matching `<source>_id` setting.
         */
        public function editor_scripts() {
            $edit_url = admin_url('post.php?action=edit&post=');
            wp_add_inline_script('elementor-editor', sprintf(
                '(function () {
                    var bind = function () {
                        ["document", "library"].forEach(function (source) {
                            elementor.channels.editor.on("bplde:edit:" + source, function (view) {
                                var settings = view.container ? view.container.settings : view.elementSettingsModel;
                                var id = settings && parseInt(settings.get(source + "_id"), 10);
                                if (id) {
                                    window.open(%s + id, "_blank");
                                }
                            });
                        });
                    };
                    if (window.elementor && elementor.channels) {
                        bind();
                    } else {
                        jQuery(window).on("elementor:init", bind);
                    }
                })();',
                wp_json_encode($edit_url)
            ));
        }

        public function register_category($elements_manager) {
            $elements_manager->add_category(self::CATEGORY, [
                'title' => __('Document Embedder', 'document-emberdder'),
                'icon'  => 'eicon-document-file',
            ]);
        }

        public function register_widgets($widgets_manager) {
            require_once BPLDE_PLUGIN_PATH . 'includes/features/elementor/class-bplde-elementor-widget.php';
            $widgets_manager->register(new \BPLDE_Elementor_Widget());
        }
    }
}
