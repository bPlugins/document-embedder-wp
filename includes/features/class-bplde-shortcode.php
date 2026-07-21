<?php
/**
 * BPLDE Shortcode Controller.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

use BPLDE\Helper\Functions;
use BPLDE\Helper\DefaultArgs;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Shortcode')) {
    class Shortcode {
        protected static $_instance = null;

        public function __construct()
        {
            add_shortcode('doc', [$this, 'doc']);
        }

        public static function instance()
        {
            if (self::$_instance === null) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function doc($atts)
        {
            $post_type = get_post_type($atts['id']);

            if ($post_type != 'ppt_viewer') {
                return false;
            }

            $post_id = $atts['id'];
            $post = get_post($post_id);
            if (post_password_required($post)) {
                return get_the_password_form($post);
            }

            switch ($post->post_status) {
                case 'publish':
                    return $this->html($atts['id'], $atts);

                case 'private':
                    if (current_user_can('read_private_posts')) {
                        return $this->html($atts['id'], $atts);
                    }
                    return '';

                case 'draft':
                case 'pending':
                case 'future':
                    if (current_user_can('edit_post', $post_id)) {
                        return $this->html($atts['id'], $atts);
                    }
                    return '';

                default:
                    return '';
            }
        }

        public function doc_data($id, $atts = [])
        {
            $width = Functions::meta($id, 'width', ['width' => '100', 'unit' => '%']);
            $height = Functions::meta($id, 'height', ['height' => 600, 'unit' => 'px']);

            $result = [
                'doc' => Functions::meta($id, 'doc', ''),
                'width' => $width['width'] . $width['unit'],
                'height' => $height['height'] . $height['unit'],
                'width_tablet' => Functions::meta($id, 'width_tablet', ''),
                'width_mobile' => Functions::meta($id, 'width_mobile', ''),
                'height_tablet' => Functions::meta($id, 'height_tablet', ''),
                'height_mobile' => Functions::meta($id, 'height_mobile', ''),
                'showName' => Functions::meta($id, 'showName'),
                'download' => Functions::meta($id, 'download', '0'),
                'downloadButtonText' => Functions::meta($id, 'downloadButtonText', Functions::meta($id, '_de_download_label', 'Download')),
                '_de_download_position' => Functions::meta($id, '_de_download_position', 'toolbar'),
                '_de_toolbar_theme' => Functions::meta($id, '_de_toolbar_theme', 'dark'),
                '_de_toolbar_bg_color' => Functions::meta($id, '_de_toolbar_bg_color', '#343434'),
                '_de_toolbar_text_color' => Functions::meta($id, '_de_toolbar_text_color', '#ffffff'),
                '_de_download_behavior' => Functions::meta($id, '_de_download_behavior', 'download'),
                '_de_download_filename' => Functions::meta($id, '_de_download_filename', ''),
                '_de_download_show_count' => Functions::meta($id, '_de_download_show_count', '0'),
                '_de_download_limit' => Functions::meta($id, '_de_download_limit', '0'),
                'viewer' => Functions::meta($id, 'viewer', 'default'),
                'enableFullscreen' => Functions::meta($id, 'enableFullscreen', false),
                'onDemandRendering' => Functions::meta($id, 'onDemandRendering', false),
                'fullscreenNewTab' => Functions::meta($id, 'fullscreenNewTab', false),
                'readerMode' => Functions::meta($id, 'readerMode', false),
                'toggleThumbnails' => Functions::meta($id, 'toggleThumbnails', false),
                'sidebarOpen' => Functions::meta($id, 'sidebarOpen', false),
                'loadLatestVersion' => Functions::meta($id, 'loadLatestVersion', false),
                'hrScrollbar' => Functions::meta($id, 'hrScrollbar', false),
                'initialPage' => Functions::meta($id, 'initialPage', 1),
                'defaultZoom' => Functions::meta($id, 'defaultZoom', ''),
                'gviewFallback' => Functions::meta($id, 'gviewFallback', true),
                'lazyLoad' => Functions::meta($id, 'lazyLoad', false),
                'lightbox_trigger_type' => Functions::meta($id, 'lightbox_trigger_type', 'button'),
                'lightbox_trigger_selector' => Functions::meta($id, 'lightbox_trigger_selector', ''),
                'lightbox_trigger_image' => self::extract_media_url(Functions::meta($id, 'lightbox_trigger_image', '')),
                'lightbox_trigger_image_width' => Functions::meta($id, 'lightbox_trigger_image_width', '300px'),
                'lightbox_trigger_image_height' => Functions::meta($id, 'lightbox_trigger_image_height', 'auto'),
                'lightbox_trigger_image_radius' => Functions::meta($id, 'lightbox_trigger_image_radius', '8px'),
                'lightbox_trigger_image_align' => Functions::meta($id, 'lightbox_trigger_image_align', 'left'),
                'lightbox_trigger_image_fit' => Functions::meta($id, 'lightbox_trigger_image_fit', 'cover'),
                'id' => $id
            ];

            if (empty($result['_de_download_label'])) {
                $result['_de_download_label'] = $result['downloadButtonText'] ? $result['downloadButtonText'] : 'Download';
            }

            $override_map = [
                'download' => 'download',
                'download_label' => '_de_download_label',
                'download_position' => '_de_download_position',
                'download_behavior' => '_de_download_behavior',
                'download_filename' => '_de_download_filename',
                'download_limit' => '_de_download_limit',
                'show_count' => '_de_download_show_count',
                'toolbar_theme' => '_de_toolbar_theme',
                'toolbar_bg_color' => '_de_toolbar_bg_color',
                'toolbar_text_color' => '_de_toolbar_text_color',
            ];
            foreach ($override_map as $att_key => $data_key) {
                if (isset($atts[$att_key])) {
                    if (in_array($atts[$att_key], ['yes', 'true', '1'], true)) {
                        $result[$data_key] = '1';
                    } elseif (in_array($atts[$att_key], ['no', 'false', '0'], true)) {
                        $result[$data_key] = '0';
                    } else {
                        $result[$data_key] = $atts[$att_key];
                    }
                }
            }

            // Check Limit per IP
            $limit = (int) $result['_de_download_limit'];
            $result['limit_reached'] = false;
            if ($limit > 0) {
                global $wpdb;
                $ip = Functions::get_client_ip();
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table
                $downloaded_count = $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d AND ip_address = %s",
                    $id,
                    $ip
                ));

                if ((int) $downloaded_count >= $limit) {
                    $result['limit_reached'] = true;
                }
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log("DE DEBUG: Limit Check for ID $id. IP: $ip, Count: $downloaded_count, Limit: $limit, Reached: " . ($result['limit_reached'] ? 'YES' : 'NO'));
            } else {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log("DE DEBUG: Limit Check for ID $id SKIPPED (Limit is 0)");
            }

            $result = apply_filters('bplde_doc_data', $result, $id);
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- backward compatibility hook
            return apply_filters('ppv_doc_data', $result, $id);
        }

        /**
         * Normalize a media field value to a plain URL string.
         * CSF 'media' fields may store an array (url/id/…); the block editor stores a URL string.
         */
        public static function extract_media_url($value)
        {
            if (is_array($value)) {
                return isset($value['url']) ? $value['url'] : '';
            }
            return $value ? $value : '';
        }

        public static function get_block_attributes($data)
        {
            $parse_dim = function ($prop, $default, $type = 'width') {
                if (is_array($prop)) {
                    if (isset($prop[$type]) && $prop[$type] !== '') {
                        return $prop[$type] . (isset($prop['unit']) ? $prop['unit'] : 'px');
                    }
                    return $default;
                }
                $val = !empty($prop) ? $prop : $default;
                return is_numeric($val) ? $val . 'px' : $val;
            };

            $w_d = $parse_dim(isset($data['width']) ? $data['width'] : '', '100%', 'width');
            $w_t = $parse_dim(isset($data['width_tablet']) ? $data['width_tablet'] : '', $w_d, 'width');
            $w_m = $parse_dim(isset($data['width_mobile']) ? $data['width_mobile'] : '', $w_t, 'width');

            $h_d = $parse_dim(isset($data['height']) ? $data['height'] : '', '600px', 'height');
            $h_t = $parse_dim(isset($data['height_tablet']) ? $data['height_tablet'] : '', $h_d, 'height');
            $h_m = $parse_dim(isset($data['height_mobile']) ? $data['height_mobile'] : '', $h_t, 'height');

            $viewer = isset($data['viewer']) ? $data['viewer'] : 'default';
            // Full-Screen and On-Demand Rendering are Custom-PDF-viewer-only features.
            // Gate them server-side so they can never alter the Default (Google Drive) viewer path,
            // even if the raw meta value is somehow truthy on a non-custom viewer.
            $is_custom_viewer = ($viewer === 'custom');
            $is_custom_or_flipbook_or_slider = in_array($viewer, ['custom', 'flipbook', 'slider'], true);
            $truthy = ['1', 1, 'true', true, 'yes'];

            return [
                'docId' => isset($data['id']) ? intval($data['id']) : 0,
                'documentSource' => [
                    'doc' => isset($data['doc']) ? $data['doc'] : '',
                    'viewer' => $viewer,
                    'googleDrive' => isset($data['googleDrive']) && in_array($data['googleDrive'], ['1', 1, 'true', true, 'yes'], true),
                    'enableFullscreen' => false,
                    'onDemandRendering' => false,
                    'fullscreenNewTab' => false,
                    'readerMode' => false,
                    'toggleThumbnails' => false,
                    'sidebarOpen' => false,
                    'loadLatestVersion' => false,
                    'hrScrollbar' => false,
                    'initialPage' => 1,
                    'defaultZoom' => '',
                ],
                'toolbar' => [
                    'showName' => isset($data['showName']) && in_array($data['showName'], ['1', 1, 'true', true, 'yes'], true),
                    'download' => isset($data['download']) && in_array($data['download'], ['1', 1, 'true', true, 'yes'], true),
                    '_de_download_position' => isset($data['_de_download_position']) ? $data['_de_download_position'] : 'toolbar',
                    'theme' => 'dark',
                    'toolbar_bg_color' => '#343434',
                    'toolbar_text_color' => '#ffffff',
                ],
                'displayDimensions' => [
                    'width' => [
                        'desktop' => $w_d,
                        'tablet' => $w_t,
                        'mobile' => $w_m,
                    ],
                    'height' => [
                        'desktop' => $h_d,
                        'tablet' => $h_t,
                        'mobile' => $h_m,
                    ]
                ],
                'securityRestrictions' => [
                    'disablePopout' => false,
                    'loading_icon' => false,
                ],
                'downloadManagement' => [
                    'downloadButtonText' => isset($data['downloadButtonText']) ? $data['downloadButtonText'] : 'Download',
                    '_de_download_behavior' => isset($data['_de_download_behavior']) ? $data['_de_download_behavior'] : 'download',
                    '_de_download_filename' => isset($data['_de_download_filename']) ? $data['_de_download_filename'] : '',
                    '_de_download_show_count' => isset($data['_de_download_show_count']) && in_array($data['_de_download_show_count'], ['1', 1, 'true', true, 'yes'], true),
                    '_de_download_limit' => isset($data['_de_download_limit']) ? intval($data['_de_download_limit']) : 0,
                    '_de_download_access' => 'everyone',
                    '_de_download_access_roles' => [],
                    '_de_download_access_message' => 'Access Denied',
                    '_de_email_gate' => false,
                ],
                'lightbox' => [
                    'lightbox' => false,
                    'lightbox_btn_text' => 'View Document',
                    'lightbox_btn_color' => '#ffffff',
                    'lightbox_btn_background' => '#333333',
                    'lightbox_btn_size' => 'medium',
                    'lightbox_trigger_type' => 'button',
                    'lightbox_trigger_selector' => '',
                    'lightbox_trigger_image' => '',
                    'lightbox_trigger_image_width' => '300px',
                    'lightbox_trigger_image_height' => 'auto',
                    'lightbox_trigger_image_radius' => '8px',
                    'lightbox_trigger_image_align' => 'left',
                    'lightbox_trigger_image_fit' => 'cover',
                ],
                'performance' => [
                    'lazyLoad' => false,
                    'gviewFallback' => true,
                ]
            ];
        }

        public function html($id, $atts = [])
        {
            $data = $this->doc_data($id, $atts);
            $data = DefaultArgs::parseArgs($data);

            $block = [
                'blockName' => 'bplde/document-embed',
                'attrs' => self::get_block_attributes($data),
                'innerHTML' => '',
                'innerContent' => [],
            ];

            wp_enqueue_script('bplde-document-embed-view-script');
            wp_enqueue_style('bplde-document-embed-style');

            $viewer = isset($data['viewer']) ? $data['viewer'] : 'default';
            if (in_array($viewer, ['flipbook', 'slider'], true) && wp_script_is('bplde-dflip-script', 'registered')) {
                wp_enqueue_script('bplde-dflip-script');
                wp_enqueue_style('bplde-dflip-style');
            }

            $output = render_block($block);
            $output = apply_filters('bplde_shortcode_html', $output, $data);
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- backward compatibility hook
            return apply_filters('ppv_shortcode_html', $output, $data);
        }
    }

    Shortcode::instance();
}
