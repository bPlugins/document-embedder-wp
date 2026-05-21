<?php
/**
 * BPLDE Shortcode Controller.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

use BPLDE\Helper\Functions;
use BPLDE\Helper\DefaultArgs;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'Shortcode' ) ) {
    class Shortcode {
        protected static $_instance = null;
        
        public function __construct() {
            add_shortcode( 'doc', [$this, 'doc'] );
        }

        public static function instance() {
            if ( self::$_instance === null ) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function doc( $atts ) {
            $post_type = get_post_type( $atts['id'] );

            if ( $post_type != 'ppt_viewer' ) {
                return false;
            }

            $post_id = $atts['id'];
            $post    = get_post( $post_id );
            if ( post_password_required( $post ) ) {
                return get_the_password_form( $post );
            }

            switch ( $post->post_status ) {
                case 'publish':
                    return $this->html( $atts['id'], $atts );

                case 'private':
                    if ( current_user_can( 'read_private_posts' ) ) {
                        return $this->html( $atts['id'], $atts );
                    }
                    return '';

                case 'draft':
                case 'pending':
                case 'future':
                    if ( current_user_can( 'edit_post', $post_id ) ) {
                        return $this->html( $atts['id'], $atts );
                    }
                    return '';

                default:
                    return '';
            }
        }

        public function html( $id, $atts = [] ) {
            $data = $this->doc_data( $id, $atts );
            $data = DefaultArgs::parseArgs( $data );
            return $this->render_template( $data );
        }

        public function doc_data( $id, $atts = [] ) {
            $width  = Functions::meta( $id, 'width', ['width' => '100', 'unit' => '%'] );
            $height = Functions::meta( $id, 'height', ['height' => 600, 'unit' => 'px'] );

            $result = [
                'doc'                         => Functions::meta( $id, 'doc', '' ),
                'width'                       => $width['width'] . $width['unit'],
                'height'                      => $height['height'] . $height['unit'],
                'width_tablet'                => Functions::meta( $id, 'width_tablet', '' ),
                'width_mobile'                => Functions::meta( $id, 'width_mobile', '' ),
                'height_tablet'               => Functions::meta( $id, 'height_tablet', '' ),
                'height_mobile'               => Functions::meta( $id, 'height_mobile', '' ),
                'showName'                    => Functions::meta( $id, 'showName' ),
                'download'                    => Functions::meta( $id, 'download', '0' ),
                'downloadButtonText'          => Functions::meta( $id, 'downloadButtonText', Functions::meta( $id, '_de_download_label', 'Download' ) ),
                '_de_download_position'       => Functions::meta( $id, '_de_download_position', 'toolbar' ),
                '_de_download_behavior'       => Functions::meta( $id, '_de_download_behavior', 'download' ),
                '_de_download_filename'       => Functions::meta( $id, '_de_download_filename', '' ),
                '_de_download_show_count'     => Functions::meta( $id, '_de_download_show_count', '0' ),
                '_de_download_limit'          => Functions::meta( $id, '_de_download_limit', '0' ),
                'id'                          => $id
            ];

            if ( empty( $result['_de_download_label'] ) ) {
                $result['_de_download_label'] = $result['downloadButtonText'] ? $result['downloadButtonText'] : 'Download';
            }

            $override_map = [
                'download'          => 'download',
                'download_label'    => '_de_download_label',
                'download_position' => '_de_download_position',
                'download_behavior' => '_de_download_behavior',
                'download_filename' => '_de_download_filename',
                'download_limit'    => '_de_download_limit',
                'show_count'        => '_de_download_show_count',
            ];
            foreach ( $override_map as $att_key => $data_key ) {
                if ( isset( $atts[$att_key] ) ) {
                    if ( in_array( $atts[$att_key], ['yes', 'true', '1'], true ) ) {
                        $result[$data_key] = '1';
                    } elseif ( in_array( $atts[$att_key], ['no', 'false', '0'], true ) ) {
                        $result[$data_key] = '0';
                    } else {
                        $result[$data_key] = $atts[$att_key];
                    }
                }
            }

            // Check Limit per IP
            $limit = (int) $result['_de_download_limit'];
            $result['limit_reached'] = false;
            if ( $limit > 0 ) {
                global $wpdb;
                $ip = Functions::get_client_ip();
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table
                $downloaded_count = $wpdb->get_var( $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d AND ip_address = %s",
                    $id,
                    $ip
                ) );

                if ( (int) $downloaded_count >= $limit ) {
                    $result['limit_reached'] = true;
                }
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log( "DE DEBUG: Limit Check for ID $id. IP: $ip, Count: $downloaded_count, Limit: $limit, Reached: " . ( $result['limit_reached'] ? 'YES' : 'NO' ) );
            } else {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log( "DE DEBUG: Limit Check for ID $id SKIPPED (Limit is 0)" );
            }

            $result = apply_filters( 'bplde_doc_data', $result, $id );
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- backward compatibility hook
            return apply_filters( 'ppv_doc_data', $result, $id );
        }

        public function render_template( $data ) {
            $parse_dim = function ( $prop, $default, $type = 'width' ) {
                if ( is_array( $prop ) ) {
                    if ( isset( $prop[$type] ) && $prop[$type] !== '' ) {
                        return $prop[$type] . ( isset( $prop['unit'] ) ? $prop['unit'] : 'px' );
                    }
                    return $default;
                }
                $val = ! empty( $prop ) ? $prop : $default;
                return is_numeric( $val ) ? $val . 'px' : $val;
            };

            $w_d = $parse_dim( isset( $data['width'] ) ? $data['width'] : '', '100%', 'width' );
            $w_t = $parse_dim( isset( $data['width_tablet'] ) ? $data['width_tablet'] : '', $w_d, 'width' );
            $w_m = $parse_dim( isset( $data['width_mobile'] ) ? $data['width_mobile'] : '', $w_t, 'width' );

            $h_d = $parse_dim( isset( $data['height'] ) ? $data['height'] : '', '600px', 'height' );
            $h_t = $parse_dim( isset( $data['height_tablet'] ) ? $data['height_tablet'] : '', $h_d, 'height' );
            $h_m = $parse_dim( isset( $data['height_mobile'] ) ? $data['height_mobile'] : '', $h_t, 'height' );

            $unique_id = 'de_' . uniqid();

            ob_start();
            ?>
            <style>
                .ppv_container.<?php echo esc_attr( $unique_id ); ?> {
                    width: <?php echo esc_attr( $w_d ); ?>;
                    height: <?php echo esc_attr( $h_d ); ?>;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                @media (max-width: 991px) {
                    .ppv_container.<?php echo esc_attr( $unique_id ); ?> {
                        width: <?php echo esc_attr( $w_t ); ?>;
                        height: <?php echo esc_attr( $h_t ); ?>;
                    }
                }

                @media (max-width: 767px) {
                    .ppv_container.<?php echo esc_attr( $unique_id ); ?> {
                        width: <?php echo esc_attr( $w_m ); ?>;
                        height: <?php echo esc_attr( $h_m ); ?>;
                    }
                }

                .<?php echo esc_attr( $unique_id ); ?>.document-preview {
                    width: 100%;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .<?php echo esc_attr( $unique_id ); ?>iframe {
                    width: 100%;
                    height: 100%;
                    flex: 1;
                    border: none;
                }

                .ppv-loading {
                    width: inherit;
                    position: absolute;
                    top: 50%;
                    left: 0;
                    font-family: sans-serif;
                    color: #666;
                    z-index: 1;
                    display: flex;
                    justify-content: center;
                }
            </style>
            <?php
            $base_url = '//docs.google.com/gview?embedded=true&url=';

            if ( $data['doc'] == '' ) {
                echo '<h2>Ooops... You forgot to Select a document. Please select a file or paste a external document link to show here. </h2>';
            } else {
                $is_download_allowed = false;
                $dl_flag             = isset( $data['download'] ) ? $data['download'] : false;
                if ( in_array( $dl_flag, ['1', 1, 'true', true, 'yes'], true ) ) {
                    $is_download_allowed = true;

                    // Check IP limit
                    if ( isset( $data['limit_reached'] ) && $data['limit_reached'] ) {
                        $is_download_allowed = false;
                    }
                }

                // Prepare download button HTML
                $download_btn_html = '';
                if ( isset( $data['limit_reached'] ) && $data['limit_reached'] && in_array( $dl_flag, ['1', 1, 'true', true, 'yes'], true ) ) {
                    $download_btn_html   = '<button disabled style="background: transparent; padding: 4px 10px; border-radius: 4px; border: 1px solid #ff4d4d; color: #ff4d4d; cursor: not-allowed;" title="Download limit reached for your IP.">Limit Reached</button>';
                    $is_download_allowed = false; // Ensure logic below respects this
                } elseif ( $is_download_allowed ) {
                    // Count HTML
                    $download_count_html = '';
                    $show_count_flag     = isset( $data['_de_download_show_count'] ) ? $data['_de_download_show_count'] : false;
                    if ( in_array( $show_count_flag, ['1', 1, 'true', true, 'yes'], true ) ) {
                        $count = get_post_meta( $data['id'], '_de_download_count', true );
                        if ( ! $count ) {
                            $count = 0;
                        }
                        $download_count_html = '<span class="ppv-download-count" style="font-size: 12px; color: #cececf; border: 1px solid #cececf; padding: 3px 10px; border-radius: 4px;">' . esc_html( $count ) . ' downloads</span>';
                    }

                    $btn_label = isset( $data['downloadButtonText'] ) && ! empty( $data['downloadButtonText'] ) ? esc_html( $data['downloadButtonText'] ) : 'Download';

                    $dl_attr     = '';
                    $target_attr = '';
                    $href        = esc_url( $data['doc'] );
                    $behavior    = isset( $data['_de_download_behavior'] ) ? $data['_de_download_behavior'] : 'download';
                    if ( $behavior === 'newtab' ) {
                        $target_attr = ' target="_blank"';
                    } else {
                        if ( ! empty( $data['_de_download_filename'] ) ) {
                            $dl_attr = ' download="' . esc_attr( $data['_de_download_filename'] ) . '"';
                        } else {
                            $dl_attr = ' download';
                        }
                    }
                    $download_btn_html = '<a class="s_pdf_download_link" style="display: flex;"  href="' . $href . '"' . $target_attr . $dl_attr . '><button style="background: transparent; padding: 4px 10px; border-radius: 4px; border: 1px solid #cececf; color: #cececf; cursor: pointer;" class="ppv_download_bttn ppv-direct-download" data-behavior="' . esc_attr( $behavior ) . '" data-doc-id="' . esc_attr( $data['id'] ) . '">' . $btn_label . '</button></a>';
                    $download_btn_html .= $download_count_html;
                }

                $has_download_ui = ! empty( $download_btn_html );
                // Handle Position logic
                $position = isset( $data['_de_download_position'] ) ? $data['_de_download_position'] : 'above';

                $frame_url = $base_url . $data['doc'];
                $is_google = isset( $data['googleDrive'] ) && in_array( $data['googleDrive'], ['1', 1, 'true', true, 'yes'], true );
                if ( $is_google ) {
                    $frame_url = str_replace( "view", "preview", $data['doc'] );
                }
                ?>
                <div class="ppv_container <?php echo esc_attr( $unique_id ); ?>">

                    <?php
                    $filename                 = basename( $data['doc'] );
                    $show_filename_in_toolbar = isset( $data['showName'] ) && $data['showName'];

                    // Toolbar rendering
                    if ( $position === 'toolbar' && ( $show_filename_in_toolbar || $has_download_ui ) ) {
                        $justify_content = ! $show_filename_in_toolbar ? 'end' : 'space-between';
                        echo '<div class="ppv-toolbar" style="justify-content: ' . esc_attr( $justify_content ) . '">';
                        if ( $show_filename_in_toolbar ) {
                            echo '<span class="ppv-filename">' . esc_html( $filename ) . '</span>';
                        }
                        if ( $has_download_ui ) {
                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is pre-built with escaped values
                            echo '<div class="ppv-toolbar-right">' . $download_btn_html . '</div>';
                        }
                        echo '</div>';
                    } elseif ( $has_download_ui && ( $position === 'above' || empty( $position ) ) ) {
                        // If showName is true but not in toolbar position, we still need to show it somewhere if it was removed from above
                        if ( isset( $data['showName'] ) && $data['showName'] ) {
                            echo '<p style="padding-left:10px;">' . esc_html( $filename ) . '</p>';
                        }
                        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is pre-built with escaped values
                        echo '<p style="padding-left:10px;">' . $download_btn_html . '</p>';
                    } elseif ( isset( $data['showName'] ) && $data['showName'] && ( $position === 'above' || empty( $position ) ) ) {
                        echo '<p style="padding-left:10px;">' . esc_html( $filename ) . '</p>';
                    }
                    ?>
                    <div class="ppv-loading">PDF Loading...</div>
                    <div class="document-preview" style="height: inherit; width: inherit;">
                         <iframe style="width: 100%; height: 100%;" src="<?php echo esc_url( $frame_url ); ?>" frameborder="0"></iframe>
                    </div>
                    <?php
                    // Below element
                    if ( $position === 'below' && ( $show_filename_in_toolbar || $has_download_ui ) ) {
                        $justify_content = ! $show_filename_in_toolbar ? 'end' : 'space-between';
                        echo '<div class="ppv-toolbar" style="justify-content: ' . esc_attr( $justify_content ) . '">';
                        if ( $show_filename_in_toolbar ) {
                            echo '<span class="ppv-filename">' . esc_html( $filename ) . '</span>';
                        }
                        if ( $has_download_ui ) {
                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is pre-built with escaped values
                            echo '<div class="ppv-toolbar-right">' . $download_btn_html . '</div>';
                        }
                        echo '</div>';
                    }
                    ?>
                </div>
                <?php
            }
            $output = ob_get_clean();
            $output = apply_filters( 'bplde_shortcode_html', $output, $data );
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- backward compatibility hook
            return apply_filters( 'ppv_shortcode_html', $output, $data );
        }
    }
    
    Shortcode::instance();
}
