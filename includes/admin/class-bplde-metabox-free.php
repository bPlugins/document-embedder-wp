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
    class BPLDE_Metabox_Free
    {

        public static function init()
        {
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
                'title' => __('General', 'document-emberdder'),
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
                    [
                        'id' => 'showName',
                        'type' => 'switcher',
                        'title' => esc_html__('Display File Name at the Top', 'document-emberdder'),
                        'desc' => 'Not available for Google Drive and Dropbox',
                        'default' => 0
                    ],
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                        __('Beautiful Lightbox View Overlay', 'document-emberdder'),
                        __('Dropbox & Google Drive Cloud Picker Integration', 'document-emberdder'),
                        __('Professional Document Loading Icon', 'document-emberdder'),
                        __('Disable Popout to Prevent Direct File Theft', 'document-emberdder'),
                        __('High-Fidelity Microsoft Office Online Viewer', 'document-emberdder'),
                        __('Native Video & Image Support in Viewer', 'document-emberdder'),
                    ))
                )
            ));

            \CSF::createSection($prefix, array(
                'title' => __('Download Management', 'document-emberdder'),
                'fields' => array(
                    [
                        'id' => 'download',
                        'type' => 'switcher',
                        'title' => esc_html__('Show Download Button', 'document-emberdder'),
                        'desc' => esc_html__('Not available for Google Drive and Dropbox', 'document-emberdder'),
                        'default' => true
                    ],
                    [
                        'id' => 'downloadButtonText',
                        'type' => 'text',
                        'title' => esc_html__('Download Button Text', 'document-emberdder'),
                        'default' => 'Download',
                        'dependency' => ['download', '==', 'true'],
                    ],
                    [
                        'id' => '_de_download_position',
                        'type' => 'select',
                        'title' => esc_html__('Download Position', 'document-emberdder'),
                        'options' => [
                            'toolbar' => 'Toolbar (Default)',
                            'below' => 'Below Embed',
                        ],
                        'default' => 'toolbar',
                        'dependency' => ['download', '==', 'true'],
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
                        'dependency' => ['download', '==', 'true'],
                    ],
                    [
                        'id' => '_de_download_filename',
                        'type' => 'text',
                        'title' => esc_html__('Custom Filename', 'document-emberdder'),
                        'desc' => esc_html__('Optional custom filename for the download. Note: This will not work if Download Behavior is set to "Open in New Tab".', 'document-emberdder'),
                        'dependency' => ['download', '==', 'true'],
                    ],
                    [
                        'id' => '_de_download_show_count',
                        'type' => 'switcher',
                        'title' => esc_html__('Show Download Count', 'document-emberdder'),
                        'desc' => esc_html__('Display the total number of times this document has been downloaded.', 'document-emberdder'),
                        'default' => false,
                        'dependency' => ['download', '==', 'true'],
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
                        'dependency' => ['download', '==', 'true'],
                    ],
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                        __('Email Gate to Collect Leads before Downloading', 'document-emberdder'),
                        __('Download Access Control by Login Status', 'document-emberdder'),
                        __('Restrict Download Access to Specific User Roles', 'document-emberdder'),
                        __('Dedicated Leads Dashboard & Stats Tracking', 'document-emberdder'),
                        __('One-Click Lead Data Export to CSV', 'document-emberdder'),
                    )),
                )
            ));
        }
    }

    BPLDE_Metabox_Free::init();
}
