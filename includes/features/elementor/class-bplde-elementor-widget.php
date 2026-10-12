<?php
/**
 * BPLDE Elementor widget.
 *
 * Source is picked in the panel: a document, a library, or (as the escape hatch) a pasted
 * [doc] / [document_library] shortcode. Everything renders through the plugin's own shortcodes,
 * so the widget shows exactly what a shortcode on the page would. The widget has no
 * content_template, so Elementor re-renders it server-side on every change and the preview
 * updates as soon as a setting changes.
 *
 * Only this plugin's two shortcodes are run; anything else in the shortcode field is ignored,
 * so the widget can't be used as a back door for arbitrary shortcodes.
 *
 * Style controls: the viewer and library print their own CSS scoped to an element id, and the
 * viewer's buttons carry inline styles. Elementor's {{WRAPPER}} is class-only, so every style
 * selector goes through sel(), which adds two :not(#id) clauses (two id-level weights) to beat
 * the id-scoped rules, and properties that fight inline styles are marked !important.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Elementor_Widget')) {
    class BPLDE_Elementor_Widget extends \Elementor\Widget_Base {
        const SHORTCODES = ['doc', 'document_library'];
        const SCOPE      = '{{WRAPPER}} .bplde-elementor-widget:not(#bplde-a):not(#bplde-b)';

        public function get_name() {
            return 'bplde-document-embedder';
        }

        public function get_title() {
            return __('Document Embedder', 'document-emberdder');
        }

        public function get_icon() {
            return 'eicon-document-file';
        }

        public function get_categories() {
            return [\BPLDE_Elementor::CATEGORY];
        }

        public function get_keywords() {
            return ['document', 'pdf', 'embed', 'library', 'word', 'excel', 'powerpoint', 'shortcode'];
        }

        // Declared here (rather than left to the shortcode's own wp_enqueue_* calls) because the
        // editor renders the widget over AJAX, where late enqueues never reach the preview iframe.
        // dFlip is heavy and only needed by flipbook/slider documents: on the live page the
        // shortcode enqueues it on demand, so it is only preloaded inside the editor preview.
        public function get_script_depends() {
            $handles = ['bplde-document-embed-view-script', 'bpldl-document-library-view-script'];
            if ($this->is_editor_preview()) {
                $handles[] = 'bplde-dflip-script';
            }
            return $handles;
        }

        public function get_style_depends() {
            $handles = ['bplde-document-embed-style', 'bpldl-document-library-style'];
            if ($this->is_editor_preview()) {
                $handles[] = 'bplde-dflip-style';
            }
            return $handles;
        }

        protected function register_controls() {
            $this->register_content_controls();
            $this->register_dimension_controls();
            $this->register_container_style_controls();
            $this->register_document_style_controls();
            $this->register_library_style_controls();
        }

        /* ---------------------------------------------------------------------------------- *
         * Content
         * ---------------------------------------------------------------------------------- */

        private function register_content_controls() {
            $this->start_controls_section('section_source', [
                'label' => __('Source', 'document-emberdder'),
                'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
            ]);

            $this->add_control('source', [
                'label'   => __('Show', 'document-emberdder'),
                'type'    => \Elementor\Controls_Manager::CHOOSE,
                'default' => 'document',
                'toggle'  => false,
                'options' => [
                    'document'  => ['title' => __('Document', 'document-emberdder'), 'icon' => 'eicon-document-file'],
                    'library'   => ['title' => __('Library', 'document-emberdder'), 'icon' => 'eicon-folder-o'],
                    'shortcode' => ['title' => __('Shortcode', 'document-emberdder'), 'icon' => 'eicon-shortcode'],
                ],
            ]);

            $this->add_control('document_id', [
                'label'       => __('Document', 'document-emberdder'),
                'type'        => \Elementor\Controls_Manager::SELECT2,
                'label_block' => true,
                'multiple'    => false,
                'options'     => $this->post_options('ppt_viewer'),
                'condition'   => ['source' => 'document'],
            ]);

            $this->add_source_links('document', 'ppt_viewer', __('Edit Document', 'document-emberdder'), __('Add New Document', 'document-emberdder'));

            $this->add_control('library_id', [
                'label'       => __('Library', 'document-emberdder'),
                'type'        => \Elementor\Controls_Manager::SELECT2,
                'label_block' => true,
                'multiple'    => false,
                'options'     => $this->post_options('document_library'),
                'condition'   => ['source' => 'library'],
            ]);

            $this->add_control('library_template', [
                'label'       => __('Layout', 'document-emberdder'),
                'type'        => \Elementor\Controls_Manager::SELECT,
                'default'     => '',
                'options'     => [
                    ''     => __('Library default', 'document-emberdder'),
                    'grid' => __('Grid', 'document-emberdder'),
                    'list' => __('List', 'document-emberdder'),
                ],
                'description' => __('Shows the library in another layout on this page only.', 'document-emberdder'),
                'condition'   => ['source' => 'library'],
            ]);

            $this->add_source_links('library', 'document_library', __('Edit Library', 'document-emberdder'), __('Add New Library', 'document-emberdder'));

            $this->add_control('shortcode', [
                'label'       => __('Shortcode', 'document-emberdder'),
                'type'        => \Elementor\Controls_Manager::TEXT,
                'label_block' => true,
                'placeholder' => '[doc id="123"]',
                'dynamic'     => ['active' => true],
                'description' => sprintf(
                    /* translators: 1: document shortcode, 2: library shortcode */
                    __('Paste a document shortcode such as %1$s or a library shortcode such as %2$s.', 'document-emberdder'),
                    '<code>[doc id="123"]</code>',
                    '<code>[document_library id="45"]</code>'
                ),
                'condition'   => ['source' => 'shortcode'],
            ]);

            $this->end_controls_section();
        }

        /**
         * "Edit" (opens the selected post; handled by the editor script in BPLDE_Elementor) and
         * "Add new" / "Manage" links under a source picker.
         */
        private function add_source_links($source, $post_type, $edit_label, $add_label) {
            $this->add_control($source . '_edit', [
                'type'        => \Elementor\Controls_Manager::BUTTON,
                'text'        => $edit_label,
                'button_type' => 'default',
                'event'       => 'bplde:edit:' . $source,
                'show_label'  => false,
                'condition'   => ['source' => $source, $source . '_id!' => ''],
            ]);

            $this->add_control($source . '_links', [
                'type'            => \Elementor\Controls_Manager::RAW_HTML,
                'raw'             => sprintf(
                    '<a href="%1$s" target="_blank">%2$s</a> &nbsp;|&nbsp; <a href="%3$s" target="_blank">%4$s</a>',
                    esc_url(admin_url('post-new.php?post_type=' . $post_type)),
                    esc_html($add_label),
                    esc_url(admin_url('edit.php?post_type=' . $post_type)),
                    esc_html__('Manage all', 'document-emberdder')
                ),
                'content_classes' => 'elementor-descriptor',
                'condition'       => ['source' => $source],
            ]);
        }

        /**
         * id => title options for a picker. Only built where the panel actually shows them (the
         * editor is an admin request); on the live page the saved id is all that's needed, so
         * the query is skipped there.
         */
        private function post_options($post_type) {
            static $cache = [];

            if (!is_admin()) {
                return [];
            }
            if (isset($cache[$post_type])) {
                return $cache[$post_type];
            }

            $statuses = get_post_stati(['show_in_admin_all_list' => true], 'objects');
            $posts    = get_posts([
                'post_type'        => $post_type,
                'post_status'      => array_keys($statuses),
                'posts_per_page'   => -1,
                'orderby'          => 'title',
                'order'            => 'ASC',
                'suppress_filters' => false,
            ]);

            $options = [];
            foreach ($posts as $post) {
                $title = $post->post_title !== '' ? $post->post_title : __('(no title)', 'document-emberdder');
                $label = sprintf('%s (#%d)', $title, $post->ID);
                if ($post->post_status !== 'publish' && isset($statuses[$post->post_status])) {
                    $label .= ' — ' . $statuses[$post->post_status]->label;
                }
                $options[(string) $post->ID] = $label;
            }

            return $cache[$post_type] = $options;
        }

        private function register_dimension_controls() {
            $this->start_controls_section('section_dimensions', [
                'label'     => __('Size', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_CONTENT,
                'condition' => ['source' => ['document', 'shortcode']],
            ]);

            $this->add_control('dimensions_note', [
                'type'            => \Elementor\Controls_Manager::RAW_HTML,
                'raw'             => esc_html__('Leave empty to use the size saved with the document. Applies to documents, not libraries.', 'document-emberdder'),
                'content_classes' => 'elementor-descriptor',
            ]);

            // The outer element keeps the size; the viewer inside is told to fill it. The lightbox
            // exclusion matches the pro widget; free never sets data-lightbox, so it is a no-op here.
            $outer = self::SCOPE . ' .bplde-document-embed-frontend:not(:has(> [data-lightbox="1"]))';
            $inner = self::SCOPE . ' .ppv_container:not([data-lightbox="1"])';

            $this->add_responsive_control('doc_width', [
                'label'      => __('Width', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', '%', 'vw'],
                'range'      => [
                    'px' => ['min' => 100, 'max' => 2000],
                    '%'  => ['min' => 10, 'max' => 100],
                    'vw' => ['min' => 10, 'max' => 100],
                ],
                'selectors'  => [
                    $outer => 'width: {{SIZE}}{{UNIT}} !important; max-width: 100%;',
                    $inner => 'width: 100% !important;',
                ],
            ]);

            $this->add_responsive_control('doc_height', [
                'label'      => __('Height', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', 'vh'],
                'range'      => [
                    'px' => ['min' => 100, 'max' => 2000],
                    'vh' => ['min' => 10, 'max' => 100],
                ],
                'selectors'  => [
                    $outer => 'height: {{SIZE}}{{UNIT}} !important;',
                    $inner => 'height: 100% !important;',
                ],
            ]);

            $this->add_responsive_control('doc_align', [
                'label'     => __('Alignment', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::CHOOSE,
                'options'   => [
                    'flex-start' => ['title' => __('Left', 'document-emberdder'), 'icon' => 'eicon-text-align-left'],
                    'center'     => ['title' => __('Center', 'document-emberdder'), 'icon' => 'eicon-text-align-center'],
                    'flex-end'   => ['title' => __('Right', 'document-emberdder'), 'icon' => 'eicon-text-align-right'],
                ],
                'selectors' => [
                    '{{WRAPPER}} .bplde-elementor-widget' => 'display: flex; flex-direction: column; align-items: {{VALUE}};',
                ],
            ]);

            $this->end_controls_section();
        }

        /* ---------------------------------------------------------------------------------- *
         * Style
         * ---------------------------------------------------------------------------------- */

        private function register_container_style_controls() {
            $this->start_controls_section('style_container', [
                'label' => __('Container', 'document-emberdder'),
                'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
            ]);

            $wrapper = '{{WRAPPER}} .bplde-elementor-widget';

            $this->add_group_control(\Elementor\Group_Control_Background::get_type(), [
                'name'     => 'container_background',
                'types'    => ['classic', 'gradient'],
                'selector' => $wrapper,
            ]);

            $this->add_responsive_control('container_padding', [
                'label'      => __('Padding', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'selectors'  => [$wrapper => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Border::get_type(), [
                'name'      => 'container_border',
                'selector'  => $wrapper,
                'separator' => 'before',
            ]);

            $this->add_responsive_control('container_radius', [
                'label'      => __('Border Radius', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%'],
                'selectors'  => [$wrapper => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}; overflow: hidden;'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Box_Shadow::get_type(), [
                'name'     => 'container_shadow',
                'selector' => $wrapper,
            ]);

            $this->end_controls_section();
        }

        private function register_document_style_controls() {
            $doc_condition = ['source' => ['document', 'shortcode']];

            // Toolbar ----------------------------------------------------------------------
            $this->start_controls_section('style_toolbar', [
                'label'     => __('Document Toolbar', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => $doc_condition,
            ]);

            $this->add_control('toolbar_bg', [
                'label'     => __('Background', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$this->sel('.ppv-toolbar') => 'background: {{VALUE}} !important; border-color: {{VALUE}} !important;'],
            ]);

            $this->add_control('toolbar_name_color', [
                'label'     => __('File Name Color', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$this->sel('.ppv-toolbar .ppv-filename') => 'color: {{VALUE}} !important;'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Typography::get_type(), [
                'name'     => 'toolbar_name_typography',
                'label'    => __('File Name Typography', 'document-emberdder'),
                'selector' => $this->sel('.ppv-toolbar .ppv-filename'),
            ]);

            $this->add_responsive_control('toolbar_padding', [
                'label'      => __('Padding', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em'],
                'selectors'  => [$this->sel('.ppv-toolbar') => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;'],
            ]);

            $this->end_controls_section();

            // Download / fullscreen buttons --------------------------------------------------
            $this->start_controls_section('style_doc_buttons', [
                'label'     => __('Document Buttons', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => $doc_condition,
            ]);

            $this->add_button_style_controls(
                'doc_btn',
                [$this->sel('.ppv_download_bttn', '.ppv_fullscreen_bttn')],
                [$this->sel('.ppv_download_bttn:hover', '.ppv_fullscreen_bttn:hover')],
                true
            );

            $this->end_controls_section();
        }

        private function register_library_style_controls() {
            $lib_condition = ['source' => ['library', 'shortcode']];

            // Grid -------------------------------------------------------------------------
            $this->start_controls_section('style_library_grid', [
                'label'     => __('Library Grid', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => $lib_condition,
            ]);

            $this->add_responsive_control('lib_columns', [
                'label'       => __('Columns', 'document-emberdder'),
                'type'        => \Elementor\Controls_Manager::NUMBER,
                'min'         => 1,
                'max'         => 6,
                'description' => __('Grid layout only.', 'document-emberdder'),
                'selectors'   => [$this->sel('.bplDl-grid') => 'grid-template-columns: repeat({{VALUE}}, minmax(0, 1fr)) !important;'],
            ]);

            $this->add_responsive_control('lib_gap', [
                'label'      => __('Gap', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range'      => ['px' => ['min' => 0, 'max' => 80]],
                'selectors'  => [$this->sel('.bplDl-grid') => 'gap: {{SIZE}}{{UNIT}} !important;'],
            ]);

            $this->add_control('lib_content_bg', [
                'label'     => __('Library Background', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$this->sel('.bplDl-content') => 'background: {{VALUE}} !important;'],
            ]);

            $this->end_controls_section();

            // Cards ------------------------------------------------------------------------
            $this->start_controls_section('style_library_cards', [
                'label'     => __('Library Items', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => $lib_condition,
            ]);

            $items       = $this->sel('.bplDl-card', '.bplDl-list-row');
            $items_hover = $this->sel('.bplDl-card:hover', '.bplDl-list-row:hover');

            $this->start_controls_tabs('lib_item_tabs');

            $this->start_controls_tab('lib_item_normal', ['label' => __('Normal', 'document-emberdder')]);
            $this->add_control('lib_item_bg', [
                'label'     => __('Background', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$items => 'background: {{VALUE}} !important;'],
            ]);
            $this->end_controls_tab();

            $this->start_controls_tab('lib_item_hover', ['label' => __('Hover', 'document-emberdder')]);
            $this->add_control('lib_item_bg_hover', [
                'label'     => __('Background', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$items_hover => 'background: {{VALUE}} !important;'],
            ]);
            $this->add_control('lib_item_border_hover', [
                'label'     => __('Border Color', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$items_hover => 'border-color: {{VALUE}} !important;'],
            ]);
            $this->end_controls_tab();

            $this->end_controls_tabs();

            $this->add_group_control(\Elementor\Group_Control_Border::get_type(), [
                'name'      => 'lib_card_border',
                'label'     => __('Card Border', 'document-emberdder'),
                'selector'  => $this->sel('.bplDl-card'),
                'separator' => 'before',
            ]);

            $this->add_responsive_control('lib_card_radius', [
                'label'      => __('Card Border Radius', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%'],
                'selectors'  => [$this->sel('.bplDl-card') => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;'],
            ]);

            $this->add_responsive_control('lib_card_padding', [
                'label'      => __('Card Padding', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em'],
                'selectors'  => [$this->sel('.bplDl-card') => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Box_Shadow::get_type(), [
                'name'     => 'lib_card_shadow',
                'label'    => __('Card Shadow', 'document-emberdder'),
                'selector' => $this->sel('.bplDl-card'),
            ]);

            $this->end_controls_section();

            // Text -------------------------------------------------------------------------
            $this->start_controls_section('style_library_text', [
                'label'     => __('Library Text', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => $lib_condition,
            ]);

            $name = $this->sel('.bplDl-name', '.bplDl-list-title');
            $meta = $this->sel('.bplDl-size', '.bplDl-meta', '.bplDl-list-meta');

            $this->add_control('lib_name_color', [
                'label'     => __('File Name Color', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'selectors' => [$name => 'color: {{VALUE}} !important;'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Typography::get_type(), [
                'name'     => 'lib_name_typography',
                'label'    => __('File Name Typography', 'document-emberdder'),
                'selector' => $name,
            ]);

            $this->add_control('lib_meta_color', [
                'label'     => __('Meta Color', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::COLOR,
                'separator' => 'before',
                'selectors' => [$meta => 'color: {{VALUE}} !important;'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Typography::get_type(), [
                'name'     => 'lib_meta_typography',
                'label'    => __('Meta Typography', 'document-emberdder'),
                'selector' => $meta,
            ]);

            $this->end_controls_section();

            // Buttons ----------------------------------------------------------------------
            $this->start_controls_section('style_library_buttons', [
                'label'     => __('Library Buttons', 'document-emberdder'),
                'tab'       => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => $lib_condition,
            ]);

            $this->add_control('lib_view_heading', [
                'label' => __('View Button', 'document-emberdder'),
                'type'  => \Elementor\Controls_Manager::HEADING,
            ]);
            $this->add_button_style_controls(
                'lib_view_btn',
                [$this->sel('.bplDl-btn.bplDl-view-btn')],
                [$this->sel('.bplDl-btn.bplDl-view-btn:hover')],
                false,
                false
            );

            $this->add_control('lib_download_heading', [
                'label'     => __('Download Button', 'document-emberdder'),
                'type'      => \Elementor\Controls_Manager::HEADING,
                'separator' => 'before',
            ]);
            $this->add_button_style_controls(
                'lib_download_btn',
                [$this->sel('.bplDl-btn.bplDl-download-btn')],
                [$this->sel('.bplDl-btn.bplDl-download-btn:hover')],
                false,
                false
            );

            $this->add_responsive_control('lib_btn_radius', [
                'label'      => __('Border Radius', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%'],
                'separator'  => 'before',
                'selectors'  => [$this->sel('.bplDl-btn') => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;'],
            ]);

            $this->add_group_control(\Elementor\Group_Control_Typography::get_type(), [
                'name'     => 'lib_btn_typography',
                'selector' => $this->sel('.bplDl-btn'),
            ]);

            $this->end_controls_section();
        }

        /**
         * Normal/hover colour tabs, plus (when $with_box) radius, padding and font size.
         * Every value is !important: the viewer's buttons are styled inline.
         *
         * @param bool $with_border Adds border colour, for outline-style buttons.
         */
        private function add_button_style_controls($prefix, array $normal, array $hover, $with_border, $with_box = true) {
            $normal = implode(', ', $normal);
            $hover  = implode(', ', $hover);

            $this->start_controls_tabs($prefix . '_tabs');

            foreach (['normal' => $normal, 'hover' => $hover] as $state => $selector) {
                $suffix = $state === 'hover' ? '_hover' : '';
                $this->start_controls_tab($prefix . '_tab_' . $state, [
                    'label' => $state === 'hover' ? __('Hover', 'document-emberdder') : __('Normal', 'document-emberdder'),
                ]);

                $this->add_control($prefix . '_color' . $suffix, [
                    'label'     => __('Text Color', 'document-emberdder'),
                    'type'      => \Elementor\Controls_Manager::COLOR,
                    'selectors' => [$selector => 'color: {{VALUE}} !important;'],
                ]);
                $this->add_control($prefix . '_bg' . $suffix, [
                    'label'     => __('Background', 'document-emberdder'),
                    'type'      => \Elementor\Controls_Manager::COLOR,
                    'selectors' => [$selector => 'background: {{VALUE}} !important;'],
                ]);
                if ($with_border) {
                    $this->add_control($prefix . '_border' . $suffix, [
                        'label'     => __('Border Color', 'document-emberdder'),
                        'type'      => \Elementor\Controls_Manager::COLOR,
                        'selectors' => [$selector => 'border-color: {{VALUE}} !important;'],
                    ]);
                }

                $this->end_controls_tab();
            }

            $this->end_controls_tabs();

            if (!$with_box) {
                return;
            }

            $this->add_responsive_control($prefix . '_font_size', [
                'label'      => __('Font Size', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', 'em'],
                'range'      => ['px' => ['min' => 8, 'max' => 32]],
                'separator'  => 'before',
                'selectors'  => [$normal => 'font-size: {{SIZE}}{{UNIT}} !important;'],
            ]);

            $this->add_responsive_control($prefix . '_padding', [
                'label'      => __('Padding', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em'],
                'selectors'  => [$normal => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;'],
            ]);

            $this->add_responsive_control($prefix . '_radius', [
                'label'      => __('Border Radius', 'document-emberdder'),
                'type'       => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%'],
                'selectors'  => [$normal => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} !important;'],
            ]);
        }

        /**
         * Scoped, specificity-boosted selector list (see the file header).
         */
        private function sel(...$parts) {
            return implode(', ', array_map(function ($part) {
                return self::SCOPE . ' ' . $part;
            }, $parts));
        }

        /* ---------------------------------------------------------------------------------- *
         * Render
         * ---------------------------------------------------------------------------------- */

        protected function render() {
            $settings  = $this->get_settings_for_display();
            $source    = isset($settings['source']) ? $settings['source'] : 'document';
            $shortcode = $this->build_shortcode($source, $settings);

            if ($shortcode === null) {
                return;
            }

            $output = do_shortcode($shortcode);

            if (trim((string) $output) === '') {
                $this->editor_notice(__('Nothing to show. Check that the document exists and is published.', 'document-emberdder'));
                return;
            }

            echo '<div class="bplde-elementor-widget">' . $output . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the plugin's own shortcode output, escaped by its renderers
        }

        /**
         * The shortcode to run for the chosen source, or null (after printing an editor notice)
         * when the settings don't describe something renderable yet.
         */
        private function build_shortcode($source, array $settings) {
            if ($source === 'document') {
                $id = absint(isset($settings['document_id']) ? $settings['document_id'] : 0);
                if (!$id) {
                    $this->editor_notice(__('Select a document in the widget settings.', 'document-emberdder'));
                    return null;
                }
                return sprintf('[doc id="%d"]', $id);
            }

            if ($source === 'library') {
                $id = absint(isset($settings['library_id']) ? $settings['library_id'] : 0);
                if (!$id) {
                    $this->editor_notice(__('Select a library in the widget settings.', 'document-emberdder'));
                    return null;
                }
                $template = sanitize_key(isset($settings['library_template']) ? $settings['library_template'] : '');
                return $template !== ''
                    ? sprintf('[document_library id="%d" template="%s"]', $id, $template)
                    : sprintf('[document_library id="%d"]', $id);
            }

            $text = trim((string) (isset($settings['shortcode']) ? $settings['shortcode'] : ''));
            if ($text === '') {
                $this->editor_notice(__('Paste a Document Embedder shortcode in the widget settings to show a document or library here.', 'document-emberdder'));
                return null;
            }

            $matched = $this->find_shortcode($text);
            if (!$matched) {
                $this->editor_notice(__('That is not a Document Embedder shortcode. Use [doc id="…"] or [document_library id="…"].', 'document-emberdder'));
                return null;
            }

            // [doc] reads $atts['id'] without checking it, so stop here instead of emitting notices.
            if (empty($matched['atts']['id']) || !absint($matched['atts']['id'])) {
                $this->editor_notice(__('The shortcode needs a numeric id, e.g. [doc id="123"].', 'document-emberdder'));
                return null;
            }

            return $matched['shortcode'];
        }

        /**
         * First [doc] or [document_library] shortcode in the field, as its raw text plus parsed atts.
         */
        private function find_shortcode($text) {
            if (!preg_match('/' . get_shortcode_regex(self::SHORTCODES) . '/', $text, $m)) {
                return null;
            }
            // Groups 1 and 6 are the [[escaped]] brackets; an escaped shortcode is meant to print literally.
            if ($m[1] === '[' && $m[6] === ']') {
                return null;
            }
            return [
                'shortcode' => $m[0],
                'atts'      => (array) shortcode_parse_atts($m[3]),
            ];
        }

        private function editor_notice($message) {
            if (!$this->is_editor_preview()) {
                return;
            }
            printf(
                '<div class="bplde-elementor-notice" style="padding:24px;border:1px dashed #c3c4c7;border-radius:4px;background:#f6f7f7;color:#50575e;text-align:center;font-size:14px;line-height:1.5;">%s</div>',
                esc_html($message)
            );
        }

        private function is_editor_preview() {
            $elementor = \Elementor\Plugin::$instance;
            return $elementor->editor->is_edit_mode() || $elementor->preview->is_preview_mode();
        }
    }
}
