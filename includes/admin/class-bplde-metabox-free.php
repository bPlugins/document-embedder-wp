<?php
/**
 * BPLDE_Metabox_Free Class.
 *
 * The Document Configuration metabox.
 *
 * Four sections, each holding its real CSF fields and then a single
 * type => content field naming what Document Embedder Pro adds. Field ids are
 * never changed: CSF stores the whole metabox under one `ppv` meta key, so
 * moving a field between sections is safe, but renaming its id would orphan the
 * value saved against every existing document.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Metabox_Free')) {
    class BPLDE_Metabox_Free {

        /**
         * Section heading icon. Drawn with currentColor so the stylesheet owns the
         * colour instead of the hex that used to be hard-coded into every title.
         *
         * @param string $paths Inner SVG shapes.
         */
        private static function icon($paths) {
            return '<svg class="bplde-sec-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"'
                . ' fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'
                . ' aria-hidden="true" focusable="false">' . $paths . '</svg>';
        }

        public static function init() {
            if (!class_exists('CSF')) {
                return;
            }

            $prefix = 'ppv';

            \CSF::createMetabox($prefix, array(
                'title' => __('Document Configuration', 'document-emberdder'),
                'post_type' => 'ppt_viewer',
                'theme' => 'light'
            ));

            /* -----------------------------------------------------------------
               1. General — the file, the engine and the size it renders at.
               ----------------------------------------------------------------- */

            \CSF::createSection($prefix, array(
                'id'    => 'de_section_general',
                'title' => self::icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>')
                    . __('General', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'doc',
                        'type' => 'upload',
                        'title' => esc_html__('Document File', 'document-emberdder'),
                        'attributes' => array('id' => 'picker_field'),
                        'desc' => '<p class="bplde-supported"><strong>' . esc_html__('Supported Files:', 'document-emberdder') . '</strong> '
                            . '<span>pdf, doc, docx, ppt, pptx, txt, rtf, csv, odt, ods, odp.</span></p>',
                    ],
                    [
                        'id' => 'viewer',
                        'type' => 'button_set',
                        'title' => esc_html__('Viewer', 'document-emberdder'),
                        'desc' => esc_html__('Select the document viewer engine. Note: Custom PDF, Flipbook, and Slider engines only support PDF documents.', 'document-emberdder'),
                        'default' => 'default',
                        'options' => [
                            'default' => esc_html__('Default', 'document-emberdder'),
                            'custom' => esc_html__('Custom PDF', 'document-emberdder') . bplde_pdf_only_badge(),
                            'flipbook' => esc_html__('Flipbook', 'document-emberdder') . bplde_pdf_only_badge(),
                            'slider' => esc_html__('Slider', 'document-emberdder') . bplde_pdf_only_badge(),
                        ],
                    ],
                    [
                        'id' => 'device_preview',
                        'type' => 'button_set',
                        'title' => esc_html__('Set Height & Width For', 'document-emberdder'),
                        'options' => [
                            'desktop' => '<i class="fas fa-desktop"></i> Desktop',
                            'tablet' => '<i class="fas fa-tablet-alt"></i> Tablet',
                            'mobile' => '<i class="fas fa-mobile-alt"></i> Mobile',
                        ],
                        'default' => 'desktop',
                    ],
                    [
                        'id' => 'width',
                        'type' => 'dimensions',
                        'title' => esc_html__('Width (Desktop)', 'document-emberdder'),
                        'height' => false,
                        'default' => ['width' => '100', 'unit' => '%'],
                        'dependency' => ['device_preview', '==', 'desktop']
                    ],
                    [
                        'id' => 'width_tablet',
                        'type' => 'dimensions',
                        'title' => esc_html__('Width (Tablet)', 'document-emberdder'),
                        'height' => false,
                        'dependency' => ['device_preview', '==', 'tablet']
                    ],
                    [
                        'id' => 'width_mobile',
                        'type' => 'dimensions',
                        'title' => esc_html__('Width (Mobile)', 'document-emberdder'),
                        'height' => false,
                        'dependency' => ['device_preview', '==', 'mobile']
                    ],
                    [
                        'id' => 'height',
                        'type' => 'dimensions',
                        'title' => esc_html__('Height (Desktop)', 'document-emberdder'),
                        'width' => false,
                        'default' => ['height' => 600, 'unit' => 'px'],
                        'dependency' => ['device_preview', '==', 'desktop']
                    ],
                    [
                        'id' => 'height_tablet',
                        'type' => 'dimensions',
                        'title' => esc_html__('Height (Tablet)', 'document-emberdder'),
                        'width' => false,
                        'dependency' => ['device_preview', '==', 'tablet']
                    ],
                    [
                        'id' => 'height_mobile',
                        'type' => 'dimensions',
                        'title' => esc_html__('Height (Mobile)', 'document-emberdder'),
                        'width' => false,
                        'dependency' => ['device_preview', '==', 'mobile']
                    ],
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(
                        array(
                            __('Disable Popout to prevent direct file theft', 'document-emberdder'),
                            __('Enable a professional loading icon', 'document-emberdder'),
                        ),
                        __('General', 'document-emberdder')
                    )
                )
            ));

            /* -----------------------------------------------------------------
               2. Viewer & Display — everything the visitor sees and can touch.
                  Absorbs the old Controls, Toolbar and Modal Pop Up sections.
               ----------------------------------------------------------------- */

            \CSF::createSection($prefix, array(
                'id'    => 'de_section_viewer',
                'title' => self::icon('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>')
                    . __('Viewer & Display', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'showName',
                        'type' => 'switcher',
                        'title' => esc_html__('Display File Name', 'document-emberdder'),
                        'desc' => esc_html__('Enable to display the document name. Not available for Google Drive and Dropbox.', 'document-emberdder'),
                        'default' => 0
                    ],
                    [
                        'id' => '_de_download_position',
                        'type' => 'select',
                        'title' => esc_html__('Toolbar Position', 'document-emberdder'),
                        'options' => [
                            'toolbar' => 'Toolbar (Default)',
                            'below' => 'Below Embed',
                        ],
                        'desc' => esc_html__('Choose where the toolbar appears.', 'document-emberdder'),
                        'default' => 'toolbar',
                    ],
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(
                        array(
                            __('Reader Mode for minimalist distraction-free reading', 'document-emberdder'),
                            __('Dark / Light / Custom Toolbar Themes', 'document-emberdder'),
                            __('Toggle Thumbnail Navigation sidebar', 'document-emberdder'),
                            __('Custom Toolbar Background & Text Colors', 'document-emberdder'),
                            __('Force Sidebar Open by default on load', 'document-emberdder'),
                            __('Beautiful Lightbox View Overlay (open document in a modal popup)', 'document-emberdder'),
                            __('Horizontal Scrollbar support for wide layouts', 'document-emberdder'),
                            __('Custom Lightbox Trigger Button (text, colors, and sizes)', 'document-emberdder'),
                            __('Enable Full-Screen button or Open in a New Tab', 'document-emberdder'),
                            __('Specify Custom Initial Page and Default Zoom Level', 'document-emberdder'),
                            __('Load Latest Version automatically (cache bypass)', 'document-emberdder'),
                            __('On-Demand Page Rendering for heavy documents', 'document-emberdder'),
                        ),
                        __('Viewer & Display', 'document-emberdder')
                    )
                )
            ));

            /* -----------------------------------------------------------------
               3. Permissions & Downloads — who may have the file, and what
                  happens when they take it. Absorbs Access & Security.
               ----------------------------------------------------------------- */

            \CSF::createSection($prefix, array(
                'id'    => 'de_section_permissions',
                'title' => self::icon('<rect x="3" y="11" width="18" height="11" rx="1"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>')
                    . __('Permissions & Downloads', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'download',
                        'type' => 'switcher',
                        'title' => esc_html__('Enable Download Button', 'document-emberdder'),
                        'desc' => esc_html__('Enable to show a download button for the document. Not available for Google Drive and Dropbox.', 'document-emberdder'),
                        'default' => true
                    ],
                    [
                        'id' => 'downloadButtonText',
                        'type' => 'text',
                        'title' => esc_html__('Download Button Text', 'document-emberdder'),
                        'default' => 'Download',
                        'desc' => esc_html__('Specify the text for the download button.', 'document-emberdder'),
                        'dependency' => ['download', '==', '1'],
                    ],
                    [
                        'id' => '_de_download_behavior',
                        'type' => 'select',
                        'title' => esc_html__('Download Behavior', 'document-emberdder'),
                        'options' => [
                            'download' => 'Force Save Dialog',
                            'newtab' => 'Open in New Tab',
                        ],
                        'default' => 'download',
                        'dependency' => ['download', '==', '1'],
                    ],
                    [
                        'id' => '_de_download_filename',
                        'type' => 'text',
                        'title' => esc_html__('Custom Filename', 'document-emberdder'),
                        'desc' => esc_html__('Optional custom filename for the download. Note: This will not work if Download Behavior is set to "Open in New Tab".', 'document-emberdder'),
                        'dependency' => ['download', '==', '1'],
                    ],
                    [
                        'id' => '_de_download_show_count',
                        'type' => 'switcher',
                        'title' => esc_html__('Show Download Count', 'document-emberdder'),
                        'desc' => esc_html__('Display the total number of times this document has been downloaded.', 'document-emberdder'),
                        'default' => false,
                        'dependency' => ['download', '==', '1'],
                    ],
                    [
                        'id' => '_de_download_limit',
                        'type' => 'select',
                        'title' => esc_html__("Download Limit", 'document-emberdder'),
                        'desc' => esc_html__('Limit the number of downloads allowed per user IP address.', 'document-emberdder'),
                        'options' => [
                            '0' => 'No Limit',
                            '1' => '1',
                            '3' => '3',
                            '5' => '5'
                        ],
                        'default' => '0',
                        'dependency' => ['download', '==', '1'],
                    ],
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(
                        array(
                            __('Email Gate to collect leads before downloading', 'document-emberdder'),
                            __('View Access Control — gate the viewer by login status or role', 'document-emberdder'),
                            __('Download Access Control by login status or specific roles', 'document-emberdder'),
                            __('Allowed Roles (View) — pick exactly who can open the document', 'document-emberdder'),
                            __('Dedicated Leads Dashboard & stats tracking', 'document-emberdder'),
                            __('Custom Restricted Message shown in place of the viewer', 'document-emberdder'),
                            __('One-click lead data export to CSV', 'document-emberdder'),
                            __('Secure Document Delivery', 'document-emberdder') . ' <span class="bplde-pdf-only-badge">' . __('PDF only', 'document-emberdder') . '</span>',
                        ),
                        __('Permissions & Downloads', 'document-emberdder')
                    )
                )
            ));

            /* -----------------------------------------------------------------
               4. Advanced Settings — specialised and technical features, kept
                  out of the way. Absorbs Interactive Overlays and Performance.
               ----------------------------------------------------------------- */

            \CSF::createSection($prefix, array(
                'id'    => 'de_section_advanced',
                'title' => self::icon('<line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>')
                    . __('Advanced Settings', 'document-emberdder'),
                'fields' => array(
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(
                        array(
                            __('Interactive Overlays', 'document-emberdder') . ' <span class="bplde-pdf-only-badge">' . __('PDF only', 'document-emberdder') . '</span> — ' . __('unlimited notes, highlights, links and calls-to-action', 'document-emberdder'),
                            __('Lazy Load documents to speed up page load time', 'document-emberdder'),
                            __('Per-overlay Page picker to target the exact page', 'document-emberdder'),
                            __('Google View Fallback for failed viewer loads', 'document-emberdder'),
                            __('Percentage-based Position and Size that stay aligned at any zoom', 'document-emberdder'),
                            __('Link URL to turn any overlay into a clickable area', 'document-emberdder'),
                            __('Rich Content box with safe HTML for notes and calls-to-action', 'document-emberdder'),
                        ),
                        __('Advanced Settings', 'document-emberdder')
                    )
                )
            ));
        }
    }

    add_action('init', ['BPLDE_Metabox_Free', 'init'], 5);

}
