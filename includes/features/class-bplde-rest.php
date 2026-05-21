<?php
/**
 * BPLDE Consolidated REST Controller.
 * Handles leads retrieval, gate downloads, and secure direct downloads.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Rest;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( RESTController::class ) ) {
    class RESTController {
        public function __construct() {
            add_action( 'rest_api_init', [$this, 'register_endpoints'] );
        }

        public function register_endpoints() {
            // Direct/secure download endpoint
            register_rest_route( 'docembedder/v1', '/download/(?P<id>\d+)', [
                'methods'             => 'GET',
                'callback'            => [$this, 'handle_direct_download'],
                'permission_callback' => '__return_true'
            ] );
        }

        public function handle_direct_download( \WP_REST_Request $request ) {
            $document_id = intval( $request->get_param( 'id' ) );
            $nonce       = $request->get_param( 'de_nonce' );
            $timestamp   = $request->get_param( 't' );
            $is_gate     = ! empty( $timestamp );
            $ip          = \BPLDE\Helper\Functions::get_client_ip();

            // Token Verification (UID-independent)
            $expected_token = wp_hash( $document_id . '|' . $ip . '|' . 'de_download', 'nonce' );
            if ( ! hash_equals( $expected_token, $nonce ) ) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log( "DE DEBUG: Token verification failed for doc: $document_id. Expected: $expected_token. Received: $nonce. IP: $ip" );
                return new \WP_REST_Response( 'Forbidden - Invalid Token', 403 );
            }

            // Limit Check
            $limit = get_post_meta( $document_id, '_de_download_limit', true );
            if ( ! empty( $limit ) && (int) $limit > 0 ) {
                global $wpdb;
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table
                $downloaded_count = $wpdb->get_var( $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d AND ip_address = %s",
                    $document_id,
                    $ip
                ) );

                if ( (int) $downloaded_count > (int) $limit ) { 
                    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                    error_log( "DE DEBUG: API limit reached. IP: $ip, Count: $downloaded_count, Limit: $limit" );
                    return new \WP_REST_Response( 'Download limit reached.', 403 );
                }
            }

            // Get file path
            $data_array = get_post_meta( $document_id, 'ppv', true );
            $doc_url    = isset( $data_array['doc'] ) ? $data_array['doc'] : '';
            
            if ( empty( $doc_url ) ) {
                return new \WP_REST_Response( 'File not found', 404 );
            }

            $attachment_id = attachment_url_to_postid( $doc_url );
            $is_local      = false;
            $file_path     = '';

            if ( $attachment_id ) {
                $file_path = get_attached_file( $attachment_id );
                $is_local  = true;
            } else {
                $upload_dir = wp_upload_dir();
                if ( strpos( $doc_url, $upload_dir['baseurl'] ) === 0 ) {
                    $file_path = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $doc_url );
                    $is_local  = true;
                }
            }

            if ( $is_local ) {
                $real_file_path  = realpath( $file_path );
                $upload_dir_info = wp_upload_dir();
                $real_upload_dir = realpath( $upload_dir_info['basedir'] );

                if ( ! $real_file_path || ! $real_upload_dir || strpos( $real_file_path, $real_upload_dir ) !== 0 ) {
                    return new \WP_REST_Response( 'Forbidden - Invalid File Path', 403 );
                }

                if ( ! file_exists( $file_path ) ) {
                    return new \WP_REST_Response( 'File not found', 404 );
                }
            } else {
                // External URL, redirect safely
                wp_safe_redirect( $doc_url );
                exit;
            }

            // Headers
            $custom_filename = isset( $data_array['_de_download_filename'] ) ? $data_array['_de_download_filename'] : '';
            $filename        = ! empty( $custom_filename ) ? $custom_filename : basename( $file_path );
            
            $behavior    = isset( $data_array['_de_download_behavior'] ) ? $data_array['_de_download_behavior'] : 'download';
            $disposition = ( $behavior === 'newtab' ) ? 'inline' : 'attachment';

            $finfo     = finfo_open( FILEINFO_MIME_TYPE );
            $mime_type = finfo_file( $finfo, $file_path );
            finfo_close( $finfo );

            header( 'Content-Type: ' . $mime_type );
            header( 'Content-Disposition: ' . $disposition . '; filename="' . esc_attr( $filename ) . '"' );
            header( 'Content-Length: ' . filesize( $file_path ) );
            header( 'Cache-Control: private, max-age=0, must-revalidate' );
            header( 'Pragma: public' );

            if ( ob_get_level() ) {
                ob_end_clean();
            }

            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile -- direct file streaming has no WP_Filesystem equivalent
            readfile( $file_path );
            exit;
        }
    }
}
