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
            // Leads retrieval endpoint
            register_rest_route( 'docembedder/v1', '/leads/(?P<id>\d+)', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_leads'],
                'permission_callback' => function() {
                    return current_user_can( 'manage_options' );
                }
            ] );

            // Gated download endpoint. Public by design -- it backs the lead-capture form
            // that anonymous visitors submit -- so the permission callback cannot carry the
            // authorization. The handler checks the requested document itself instead.
            register_rest_route( 'docembedder/v1', '/gate-download', [
                'methods'             => 'POST',
                'callback'            => [$this, 'handle_gate_download'],
                'permission_callback' => '__return_true'
            ] );

            // Direct/secure download endpoint. Also reachable anonymously, for documents on
            // public pages; authorization is per-document inside the handler.
            register_rest_route( 'docembedder/v1', '/download/(?P<id>\d+)', [
                'methods'             => 'GET',
                'callback'            => [$this, 'handle_direct_download'],
                'permission_callback' => '__return_true'
            ] );
        }

        public function get_leads( $request ) {
            global $wpdb;
            $doc_id = intval( $request['id'] );
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $leads = $wpdb->get_results( $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d ORDER BY downloaded_at DESC",
                $doc_id
            ), ARRAY_A );

            return new \WP_REST_Response( [
                'success'   => true,
                'data'      => $leads,
                'doc_title' => get_the_title( $doc_id )
            ], 200 );
        }

        public function handle_export_csv() {
            \BPLDE\Model\AJAXCall::instance()->handle_export_csv();
        }

        public function handle_gate_download( \WP_REST_Request $request ) {
            global $wpdb;
            $name        = sanitize_text_field( $request->get_param( 'name' ) );
            $raw_email   = sanitize_text_field( $request->get_param( 'email' ) );
            $document_id = intval( $request->get_param( 'document_id' ) );

            if ( empty( $name ) || empty( $raw_email ) || ! is_email( $raw_email ) || ! filter_var( $raw_email, FILTER_VALIDATE_EMAIL ) || ! preg_match( '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $raw_email ) || empty( $document_id ) ) {
                return new \WP_REST_Response( ['success' => false, 'message' => 'Please enter a valid email address.'], 400 );
            }

            $email = sanitize_email( $raw_email );

            // Authorize the document before anything else touches it. This route takes no
            // nonce at all, so without this check it hands a signed download URL for any ID
            // to any anonymous caller. Deliberately indistinguishable from a missing
            // document, so it cannot be used to probe which IDs exist.
            if ( ! \BPLDE\Helper\Functions::can_read_document( $document_id ) ) {
                return new \WP_REST_Response( ['success' => false, 'message' => 'Document not found.'], 404 );
            }

            // Verify access restrictions
            $meta = get_post_meta( $document_id, 'ppv', true );
            $access = isset( $meta['_de_download_access'] ) ? $meta['_de_download_access'] : '';
            if ( $access === 'loggedin' && ! is_user_logged_in() ) {
                return new \WP_REST_Response( ['success' => false, 'message' => 'Unauthorized - Login required.'], 401 );
            }
            if ( $access === 'roles' ) {
                if ( ! is_user_logged_in() ) {
                    return new \WP_REST_Response( ['success' => false, 'message' => 'Unauthorized.'], 401 );
                }
                $allowed_roles = isset( $meta['_de_download_access_roles'] ) ? (array) $meta['_de_download_access_roles'] : [];
                $user          = wp_get_current_user();
                $user_roles    = (array) $user->roles;
                if ( empty( array_intersect( $allowed_roles, $user_roles ) ) ) {
                    return new \WP_REST_Response( ['success' => false, 'message' => 'Forbidden.'], 403 );
                }
            }

            $document_title = get_the_title( $document_id );

            // Insert into db
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- direct insert to custom table
            $wpdb->insert(
                $wpdb->prefix . 'docembedder_leads',
                [
                    'name'           => $name,
                    'email'          => $email,
                    'document_id'    => $document_id,
                    'document_title' => $document_title,
                    'downloaded_at'  => current_time( 'mysql' ),
                    'ip_address'     => \BPLDE\Helper\Functions::get_client_ip()
                ],
                ['%s', '%s', '%d', '%s', '%s', '%s']
            );

            // Increment count
            $count = (int) get_post_meta( $document_id, '_de_download_count', true );
            update_post_meta( $document_id, '_de_download_count', $count + 1 );

            // Generate signed, time-limited URL
            $timestamp = time();
            $nonce     = \BPLDE\Helper\Functions::create_download_token( $document_id, $timestamp );
            $url       = rest_url( "docembedder/v1/download/{$document_id}?de_nonce={$nonce}&t={$timestamp}" );

            // Carry the caller's REST identity across to the download route, so a logged-in
            // user keeps their capabilities there. Anonymous callers get the URL unchanged.
            if ( is_user_logged_in() ) {
                $url = add_query_arg( '_wpnonce', wp_create_nonce( 'wp_rest' ), $url );
            }

            return new \WP_REST_Response( ['success' => true, 'url' => $url], 200 );
        }

        public function handle_direct_download( \WP_REST_Request $request ) {
            $document_id = intval( $request->get_param( 'id' ) );
            $nonce       = $request->get_param( 'de_nonce' );
            $ip          = \BPLDE\Helper\Functions::get_client_ip();

            // Authorize the document before the token is even considered. A valid token only
            // proves this plugin minted the URL; it says nothing about whether the holder is
            // entitled to the file, so the document check has to come first and has to stand
            // on its own.
            if ( ! \BPLDE\Helper\Functions::can_read_document( $document_id ) ) {
                return new \WP_REST_Response( 'Not found', 404 );
            }

            // Verify access restrictions
            $meta = get_post_meta( $document_id, 'ppv', true );
            $access = isset( $meta['_de_download_access'] ) ? $meta['_de_download_access'] : '';
            if ( $access === 'loggedin' && ! is_user_logged_in() ) {
                return new \WP_REST_Response( 'Unauthorized - Login required', 401 );
            }
            if ( $access === 'roles' ) {
                if ( ! is_user_logged_in() ) {
                    return new \WP_REST_Response( 'Unauthorized', 401 );
                }
                $allowed_roles = isset( $meta['_de_download_access_roles'] ) ? (array) $meta['_de_download_access_roles'] : [];
                $user          = wp_get_current_user();
                $user_roles    = (array) $user->roles;
                if ( empty( array_intersect( $allowed_roles, $user_roles ) ) ) {
                    return new \WP_REST_Response( 'Forbidden', 403 );
                }
            }

            // Token Verification (UID-independent)
            if ( ! \BPLDE\Helper\Functions::verify_download_token( $nonce, $document_id ) ) {
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
                    return new \WP_REST_Response( 'Download limit reached.', 403 );
                }
            }

            // Get file path
            $data_array = get_post_meta( $document_id, 'ppv', true );
            $doc_url    = isset( $data_array['doc'] ) ? $data_array['doc'] : '';
            
            if ( empty( $doc_url ) ) {
                $doc_url = wp_get_attachment_url( $document_id );
                if ( ! $doc_url ) {
                    return new \WP_REST_Response( 'File not found', 404 );
                }
            }

            $attachment_id = attachment_url_to_postid( $doc_url );
            if ( ! $attachment_id && 'attachment' === get_post_type( $document_id ) ) {
                // Fall back to the requested ID when the stored URL does not resolve to a
                // media item -- the document-embed block stores the attachment ID directly.
                $attachment_id = $document_id;
            }

            $is_local      = false;
            $file_path     = '';

            if ( $attachment_id ) {
                $file_path = get_attached_file( $attachment_id );
                $is_local  = true;
            } else {
                $upload_dir = wp_upload_dir();
                $parsed_doc = wp_parse_url( $doc_url, PHP_URL_PATH );
                $parsed_base = wp_parse_url( $upload_dir['baseurl'], PHP_URL_PATH );
                
                if ( $parsed_doc && $parsed_base && strpos( $parsed_doc, $parsed_base ) === 0 ) {
                    $file_path = str_replace( $parsed_base, $upload_dir['basedir'], $parsed_doc );
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
            $custom_filename_param = $request->get_param( 'filename' );
            if ( ! empty( $custom_filename_param ) ) {
                $custom_filename = $custom_filename_param;
            } else {
                $custom_filename = isset( $data_array['_de_download_filename'] ) ? $data_array['_de_download_filename'] : '';
            }
            $filename = ! empty( $custom_filename ) ? $custom_filename : basename( $file_path );

            // The filename arrives from the query string and goes straight into a response
            // header. esc_attr() does not remove CR/LF, so strip control characters and
            // quotes here. Nothing else is rewritten, so ordinary filenames -- spaces and
            // all -- reach the browser exactly as before.
            $filename = preg_replace( '/[\x00-\x1F\x7F"\\\\]/', '', $filename );

            if ( '' === trim( $filename ) ) {
                $filename = basename( $file_path );
            }
            
            $behavior_param = $request->get_param( 'behavior' );
            if ( ! empty( $behavior_param ) ) {
                $behavior = $behavior_param;
            } else {
                $behavior = isset( $data_array['_de_download_behavior'] ) ? $data_array['_de_download_behavior'] : 'download';
            }
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
