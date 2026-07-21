<?php
/**
 * BPLDE_Metabox_Free Class.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Metabox_Free')) {
    class BPLDE_Metabox_Free {

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

            \CSF::createSection($prefix, array(
                'title' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3858E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="csf-metabox-svg" style="vertical-align: middle; margin-right: 8px; position: relative; top: -1px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' . __('General', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'doc',
                        'type' => 'upload',
                        'title' => esc_html__('Document File', 'document-emberdder'),
                        'attributes' => array('id' => 'picker_field'),
                        'desc' => '<p style="margin-top:8px; font-size:13px; color:#6b7280; line-height:1.6;">
                            <strong style="color:#111827;">Supported Files:</strong> 
                            pdf, doc, docx, ppt, pptx, txt, rtf, csv, odt, ods, odp.
                        </p>',
                    ],
                    [
                        'id' => 'viewer',
                        'type' => 'button_set',
                        'title' => esc_html__('Viewer', 'document-emberdder'),
                        'desc' => esc_html__('Select the document viewer engine. Note: Custom PDF, Flipbook, and Slider engines only support PDF documents.', 'document-emberdder'),
                        'default' => 'default',
                        'options' => [
                            'default' => esc_html__('Default', 'document-emberdder'),
                            'custom' => esc_html__('Custom PDF', 'document-emberdder') . '<span style="background-color:#8b5cf6;color:#ffffff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:bold;line-height:1;text-transform:uppercase;margin-left:5px;">PDF Only</span><span style="background-color:#3858e9;color:#ffffff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:bold;line-height:1;text-transform:uppercase;margin-left:5px;">New</span>',
                            'flipbook' => esc_html__('Flipbook', 'document-emberdder') . '<span style="background-color:#8b5cf6;color:#ffffff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:bold;line-height:1;text-transform:uppercase;margin-left:5px;">PDF Only</span><span style="background-color:#3858e9;color:#ffffff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:bold;line-height:1;text-transform:uppercase;margin-left:5px;">New</span>',
                            'slider' => esc_html__('Slider', 'document-emberdder') . '<span style="background-color:#8b5cf6;color:#ffffff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:bold;line-height:1;text-transform:uppercase;margin-left:5px;">PDF Only</span><span style="background-color:#3858e9;color:#ffffff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:bold;line-height:1;text-transform:uppercase;margin-left:5px;">New</span>',
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
                    array_merge(
                        array('id' => 'de_general_pro_info'),
                        \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                            __('Disable Popout to Prevent Direct File Theft', 'document-emberdder'),
                            __('Enable Professional Loading Icon', 'document-emberdder'),
                        ))
                    )
                )
            ));

            \CSF::createSection($prefix, array(
                'id'    => 'de_section_controls',
                'title' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3858E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="csf-metabox-svg" style="vertical-align: middle; margin-right: 8px; position: relative; top: -1px;"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>' . __('Controls', 'document-emberdder'),
                'fields' => array(
                    array_merge(
                        array('id' => 'de_controls_pro_info'),
                        \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                            __('Reader Mode for minimalist distraction-free reading', 'document-emberdder'),
                            __('Toggle Thumbnail Navigation sidebar', 'document-emberdder'),
                            __('Force Sidebar Open by default on load', 'document-emberdder'),
                            __('Horizontal Scrollbar support for wide layouts', 'document-emberdder'),
                            __('Load Latest Version automatically (cache bypass)', 'document-emberdder'),
                            __('Enable Full-Screen button or Open in a New Tab', 'document-emberdder'),
                            __('On-Demand Page Rendering for heavy documents', 'document-emberdder'),
                            __('Specify Custom Initial Page and Default Zoom Level', 'document-emberdder'),
                        ))
                    )
                )
            ));

            \CSF::createSection($prefix, array(
                'title' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3858E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="csf-metabox-svg" style="vertical-align: middle; margin-right: 8px; position: relative; top: -1px;"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>' . __('Toolbar', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'showName',
                        'type' => 'switcher',
                        'title' => esc_html__('Display File Name', 'document-emberdder'),
                        'desc' => esc_html__('Enable to display the document name. Not available for Google Drive and Dropbox.', 'document-emberdder'),
                        'default' => 0
                    ],
                    [
                        'id' => 'download',
                        'type' => 'switcher',
                        'title' => esc_html__('Show Download Button', 'document-emberdder'),
                        'desc' => esc_html__('Enable to show a download button for the document. Not available for Google Drive and Dropbox.', 'document-emberdder'),
                        'default' => true
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
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                        __('Dark / Light / Custom Toolbar Themes', 'document-emberdder'),
                        __('Custom Toolbar Background & Text Colors', 'document-emberdder'),
                    ))
                )
            ));

            \CSF::createSection($prefix, array(
                'title' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3858E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="csf-metabox-svg" style="vertical-align: middle; margin-right: 8px; position: relative; top: -1px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' . __('Modal Pop Up (Lightbox)', 'document-emberdder'),
                'fields' => array(
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                        __('Beautiful Lightbox View Overlay (Open document in modal popup)', 'document-emberdder'),
                        __('Custom Lightbox Trigger Button (Text, Colors, and Sizes)', 'document-emberdder'),
                    ))
                )
            ));

            \CSF::createSection($prefix, array(
                'title' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3858E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="csf-metabox-svg" style="vertical-align: middle; margin-right: 8px; position: relative; top: -1px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' . __('Download Management', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'downloadButtonText',
                        'type' => 'text',
                        'title' => esc_html__('Download Button Text', 'document-emberdder'),
                        'default' => 'Download',
                        'desc' => esc_html__('Specify the text for the download button.', 'document-emberdder'),
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
                    ],
                    [
                        'id' => '_de_download_filename',
                        'type' => 'text',
                        'title' => esc_html__('Custom Filename', 'document-emberdder'),
                        'desc' => esc_html__('Optional custom filename for the download. Note: This will not work if Download Behavior is set to "Open in New Tab".', 'document-emberdder'),
                    ],
                    [
                        'id' => '_de_download_show_count',
                        'type' => 'switcher',
                        'title' => esc_html__('Show Download Count', 'document-emberdder'),
                        'desc' => esc_html__('Display the total number of times this document has been downloaded.', 'document-emberdder'),
                        'default' => false,
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
                    ],
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                        __('Email Gate to Collect Leads before Downloading', 'document-emberdder'),
                        __('Download Access Control by Login Status / Specific Roles', 'document-emberdder'),
                        __('Dedicated Leads Dashboard & Stats Tracking', 'document-emberdder'),
                        __('One-Click Lead Data Export to CSV', 'document-emberdder'),
                    ))
                )
            ));

            \CSF::createSection($prefix, array(
                'id'    => 'de_section_performance',
                'title' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3858E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="csf-metabox-svg" style="vertical-align: middle; margin-right: 8px; position: relative; top: -1px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' . __('Performance & Reliability', 'document-emberdder'),
                'fields' => array(
                    array_merge(
                        array('id' => 'de_performance_pro_info'),
                        \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                            __('Lazy Load documents to speed up page load time', 'document-emberdder'),
                            __('Google View Fallback for failed viewer loads', 'document-emberdder'),
                        ))
                    )
                )
            ));
        }
    }

    add_action('init', ['BPLDE_Metabox_Free', 'init'], 5);

}
