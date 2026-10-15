<?php
/**
 * BPLDE_Source_Picker class.
 *
 * The "Choose a document source" panel at the top of the Document Configuration
 * metabox — the same four sources, in the same order and design, as Document
 * Embedder Pro. Upload / Media Library works here; Google Drive, Dropbox and Box
 * are Pro sources, drawn locked and pointing at the pricing page.
 *
 * The panel never saves anything itself. The Media Library writes the URL it
 * picks into the CSF `doc` upload field (#picker_field) and fires `change` on
 * it, so the save path, the live preview and the stored value stay exactly as
 * they were.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Source_Picker')) {
    class BPLDE_Source_Picker {

        private static $_instance = null;

        public static function instance() {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_action('admin_enqueue_scripts', [$this, 'enqueue'], 20);
        }

        /** The doc edit screen only; the classic metabox never renders anywhere else. */
        private function is_screen() {
            $screen = function_exists('get_current_screen') ? get_current_screen() : null;
            return $screen && 'post' === $screen->base && 'ppt_viewer' === $screen->post_type;
        }

        public function enqueue() {
            if (!$this->is_screen()) {
                return;
            }

            wp_enqueue_media();

            $path = BPLDE_PLUGIN_PATH . 'assets/js/source-picker.js';
            wp_enqueue_script(
                'bplde-source-picker',
                BPLDE_PLUGIN_DIR . 'assets/js/source-picker.js',
                ['jquery'],
                file_exists($path) ? (string) filemtime($path) : BPLDE_VER,
                true
            );

            wp_localize_script('bplde-source-picker', 'bpldeSourcePicker', [
                // For the "Current document" strip: which source the saved URL came from.
                'icons' => [
                    'media'   => self::icon('upload'),
                    'google'  => self::icon('google'),
                    'dropbox' => self::icon('dropbox'),
                    'box'     => self::icon('box'),
                    'url'     => self::icon('link'),
                ],
                'i18n'  => [
                    'mediaTitle'  => __('Select Document', 'document-emberdder'),
                    'mediaButton' => __('Use this document', 'document-emberdder'),
                    'media'       => __('Media Library', 'document-emberdder'),
                    'google'      => __('Google Drive', 'document-emberdder'),
                    'dropbox'     => __('Dropbox', 'document-emberdder'),
                    'box'         => __('Box', 'document-emberdder'),
                    'url'         => __('External URL', 'document-emberdder'),
                    'driveFile'   => __('Google Drive file', 'document-emberdder'),
                ],
            ]);
        }

        /* -----------------------------------------------------------------
           Markup
           ----------------------------------------------------------------- */

        private static function svg($inner, $size = 22, $stroke = true) {
            $attrs = $stroke
                ? ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
                : '';
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' . (int) $size . '" height="' . (int) $size . '"'
                . $attrs . ' aria-hidden="true" focusable="false">' . $inner . '</svg>';
        }

        public static function icon($name, $size = 22) {
            switch ($name) {
                case 'google':
                    return self::svg('<path d="M7.71 3.5h8.58l6.83 11.83h-8.58z" fill="#FFC107"/><path d="M16.29 15.33H2.62L6 20.67h13.67z" fill="#00E676"/><path d="M9.42 15.33L2.62 3.5 6 9.33l6.83 11.34z" fill="#2979FF"/>', $size, false);
                case 'dropbox':
                    return self::svg('<path fill="#0061FE" d="M12.012 1.5L4.851 6.136l7.161 4.673 7.16-4.673L12.012 1.5zm-7.161 9.42l7.161 4.636 7.16-4.636 4.828 3.125-11.988 7.455-11.988-7.455 4.827-3.125zm0 1.93l-4.827 3.125L12.012 23.5l11.988-7.513-4.828-3.125-7.16 4.636-7.161-4.636z"/>', $size, false);
                case 'box':
                    return self::svg('<rect width="24" height="24" rx="5" fill="#0061D5"/><g fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"><path d="M3.6 7.4v8.1"/><circle cx="6.4" cy="13.1" r="2.5"/><circle cx="12.6" cy="13.1" r="2.5"/><path d="M16.6 10.6l4 5M20.6 10.6l-4 5"/></g>', $size, false);
                case 'upload':
                    return self::svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', $size);
                case 'link':
                    return self::svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', $size);
                case 'lock':
                    return self::svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', $size);
                case 'document':
                default:
                    return self::svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', $size);
            }
        }

        private static function card_body($icon, $title, $text, $action, $badge = '') {
            return '<span class="bplde-sp-card__icon">' . self::icon($icon) . '</span>'
                . $badge
                . '<span class="bplde-sp-card__title">' . esc_html($title) . '</span>'
                . '<span class="bplde-sp-card__text">' . esc_html($text) . '</span>'
                . '<span class="bplde-sp-card__action">' . esc_html($action) . '</span>';
        }

        /** A Pro source: a link to pricing, drawn locked. */
        private static function locked_card($icon, $title, $text) {
            $badge = '<span class="bplde-sp-card__badge">' . self::icon('lock', 11) . esc_html__('PRO', 'document-emberdder') . '</span>';

            return '<a class="bplde-sp-card is-locked" href="' . esc_url(\BPLDE\Helper\Functions::pricing_url()) . '">'
                . self::card_body($icon, $title, $text, __('Upgrade to Pro →', 'document-emberdder'), $badge)
                . '</a>';
        }

        public static function markup() {
            ob_start();
            ?>
            <div class="bplde-source-picker">
                <div class="bplde-sp-head">
                    <span class="bplde-sp-head__icon"><?php echo self::icon('document', 20); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                    <div>
                        <span class="bplde-sp-eyebrow"><?php esc_html_e('Document File', 'document-emberdder'); ?></span>
                        <h3 class="bplde-sp-title"><?php esc_html_e('Choose a document source', 'document-emberdder'); ?></h3>
                        <p class="bplde-sp-sub"><strong><?php esc_html_e('Supported Files:', 'document-emberdder'); ?></strong>
                            <span class="bplde-sp-types">pdf, doc, docx, ppt, pptx, txt, rtf, csv, odt, ods, odp</span></p>
                    </div>
                </div>

                <div class="bplde-sp-body">
                    <div class="bplde-sp-current" hidden>
                        <span class="bplde-sp-current__icon"></span>
                        <span class="bplde-sp-current__meta">
                            <span class="bplde-sp-eyebrow"><?php esc_html_e('Current document', 'document-emberdder'); ?></span>
                            <span class="bplde-sp-current__name"></span>
                            <span class="bplde-sp-current__source"></span>
                        </span>
                        <button type="button" class="bplde-sp-current__remove"><?php esc_html_e('Remove', 'document-emberdder'); ?></button>
                    </div>

                    <div class="bplde-sp-grid">
                        <button type="button" class="bplde-sp-card is-primary" data-source="media">
                            <?php
                            // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in card_body().
                            echo self::card_body(
                                'upload',
                                __('Upload / Media Library', 'document-emberdder'),
                                __('Upload a new file or pick one you have already uploaded.', 'document-emberdder'),
                                __('Choose file', 'document-emberdder')
                            );
                            ?>
                        </button>
                        <?php
                        // phpcs:disable WordPress.Security.EscapeOutput -- escaped in locked_card().
                        echo self::locked_card('google', __('Google Drive', 'document-emberdder'), __('Embed files straight from your Drive with Pro.', 'document-emberdder'));
                        echo self::locked_card('dropbox', __('Dropbox', 'document-emberdder'), __('Embed shared files from your Dropbox with Pro.', 'document-emberdder'));
                        echo self::locked_card('box', __('Box', 'document-emberdder'), __('Embed files from your Box account with Pro.', 'document-emberdder'));
                        // phpcs:enable
                        ?>
                    </div>
                </div>
            </div>
            <?php
            return ob_get_clean();
        }

        /** The CSF field that carries the panel. No id, so CSF never saves anything for it. */
        public static function field() {
            return [
                'type'    => 'content',
                'class'   => 'bplde-sp-field',
                'content' => self::markup(),
            ];
        }

        /**
         * The `doc` field itself, restyled as the panel's "Or embed from URL" row. Same id,
         * same #picker_field input, so saved values and the preview are untouched.
         */
        public static function url_field() {
            return [
                'id'         => 'doc',
                'type'       => 'upload',
                'class'      => 'bplde-sp-url-field',
                'title'      => self::icon('link', 15) . esc_html__('Or embed from URL', 'document-emberdder'),
                'attributes' => [
                    'id'          => 'picker_field',
                    'placeholder' => 'https://example.com/document.pdf',
                ],
            ];
        }
    }
}
