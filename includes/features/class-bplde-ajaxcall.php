<?php
/**
 * BPLDE AJAX Call Controller.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

use BPLDE\Helper\Functions;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'AJAXCall' ) ) {
    class AJAXCall {
        protected static $_instance = null;

        public static function instance() {
            if ( self::$_instance === null ) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            // 1. Leads REST / Export
            add_action( 'wp_ajax_de_export_leads_csv', [$this, 'handle_export_csv'] );

            // 2. Document Library
            add_action( 'wp_ajax_bplde_save_document_library', [$this, 'bplde_save_document_library'] );   
            add_action( 'wp_ajax_bplde_get_single', [$this, 'bplde_get_single'] );
            add_action( 'wp_ajax_bplde_delete_document_library', [$this, 'bplde_delete_document_library'] );
            add_action( 'wp_ajax_bplde_get_all', [$this, 'bplde_get_all'] );

            // 3. Track download
            add_action( 'wp_ajax_de_track_download', [$this, 'de_track_download'] );
            add_action( 'wp_ajax_nopriv_de_track_download', [$this, 'de_track_download'] );

            // 4. Get Doc Meta
            add_action( 'wp_ajax_pdfp_get_doc_meta', [$this, 'single_doc_callback'] );
        }

        // --- Leads CSV Export Handlers ---
        public function handle_export_csv() {
            if ( ! current_user_can( 'manage_options' ) ) {
                wp_die( 'Unauthorized' );
            }

            $doc_id = isset( $_GET['doc_id'] ) ? intval( $_GET['doc_id'] ) : 0;
            if ( ! $doc_id ) {
                wp_die( 'Invalid document ID' );
            }

            check_admin_referer( 'de_export_leads_csv', 'nonce' );

            global $wpdb;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $leads = $wpdb->get_results( $wpdb->prepare(
                "SELECT id, name, email, document_id, document_title, downloaded_at, ip_address FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d ORDER BY downloaded_at DESC",
                $doc_id
            ), ARRAY_A );

            header( 'Content-Type: text/csv' );
            header( 'Content-Disposition: attachment; filename="doc-leads-' . $doc_id . '-' . gmdate( 'Y-m-d' ) . '.csv"' );
            header( 'Pragma: no-cache' );
            header( 'Expires: 0' );

            $output = fopen( 'php://output', 'w' );
            fputcsv( $output, ['ID', 'Name', 'Email', 'Document ID', 'Document Title', 'Downloaded At', 'IP Address'] );

            foreach ( $leads as $lead ) {
                fputcsv( $output, $lead );
            }

            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- php://output has no WP_Filesystem equivalent
            fclose( $output );
            exit;
        }

        // --- Document Library Handlers ---
        public function bplde_save_document_library() {
            check_ajax_referer( 'bplde_nonce', 'nonce' );

            if ( ! current_user_can( 'edit_posts' ) ) {
                wp_send_json_error( ['message' => 'Unauthorized.'] );
            }
        
            $id       = isset( $_POST['id'] ) ? intval( $_POST['id'] ) : 0;
            $title    = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : 'Untitled';
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- recursive sanitization applied via $sanitize_settings() below
            $settings = isset( $_POST['settings'] ) ? json_decode( wp_unslash( $_POST['settings'] ), true ) : [];

            // Deep validation & recursive sanitization of settings array
            $sanitize_settings = function( $array ) use ( &$sanitize_settings ) {
                if ( ! is_array( $array ) ) {
                    return sanitize_text_field( $array );
                }
                $clean = [];
                foreach ( $array as $key => $val ) {
                    $clean_key = preg_replace( '/[^a-zA-Z0-9_\-]/', '', $key );
                    if ( is_array( $val ) ) {
                        $clean[$clean_key] = $sanitize_settings( $val );
                    } else {
                        if ( filter_var( $val, FILTER_VALIDATE_URL ) ) {
                            $clean[$clean_key] = esc_url_raw( $val );
                        } elseif ( is_numeric( $val ) ) {
                            $clean[$clean_key] = $val;
                        } elseif ( is_bool( $val ) ) {
                            $clean[$clean_key] = $val;
                        } else {
                            $clean[$clean_key] = sanitize_text_field( $val );
                        }
                    }
                }
                return $clean;
            };
            $settings = $sanitize_settings( $settings );

            $post_data = [
                'post_title'  => $title,
                'post_type'   => 'document_library',
                'post_status' => 'publish',
            ];
        
            if ( $id > 0 ) {
                if ( ! current_user_can( 'edit_post', $id ) ) {
                    wp_send_json_error( ['message' => 'Unauthorized to edit this document.'] );
                }

                $post_data['ID'] = $id;
                $result = wp_update_post( $post_data, true );
            } else {
                $result = wp_insert_post( $post_data, true );
            }
        
            if ( is_wp_error( $result ) ) {
                wp_send_json_error( ['message' => $result->get_error_message()] );
            } else {
                update_post_meta( $result, 'bplde_settings', $settings );

                wp_send_json_success( [
                    'id'       => $result,
                    'settings' => $settings,
                    'created'  => get_the_date( 'Y/m/d \a\t g:i a', $result )
                ] );
            }
        }

        public function bplde_get_single() {
            check_ajax_referer( 'bplde_nonce', 'nonce' );

            $id = intval( $_GET['id'] ?? 0 );
        
            if ( ! $id ) {
                wp_send_json_error( ['message' => 'Invalid ID'] );
            }

            $post = get_post( $id );

            if ( ! $post ) {
                wp_send_json_error( ['message' => 'Post not found'] );
            }
            
            if ( ! current_user_can( 'edit_post', $id ) ) {
                wp_send_json_error( ['message' => 'Unauthorized.'] );
            }
        
            $settings = get_post_meta( $id, 'bplde_settings', true );
        
            wp_send_json_success( [
                'id'       => $id,
                'title'    => $post->post_title,
                'settings' => $settings,
                'created'  => get_the_date( 'Y/m/d \a\t g:i a', $id )
            ] );
        }

        public function bplde_get_all() {
            check_ajax_referer( 'bplde_nonce', 'nonce' );

            if ( ! current_user_can( 'edit_posts' ) ) {
                wp_send_json_error( ['message' => 'Unauthorized.'] );
            }
        
            $query = new \WP_Query( [
                'post_type'      => 'document_library',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'author'         => get_current_user_id(),
            ] );
        
            $items = [];
            foreach ( $query->posts as $post ) {
                $settings = get_post_meta( $post->ID, 'bplde_settings', true );
        
                $items[] = [
                    'id'       => $post->ID,
                    'title'    => $post->post_title,
                    'settings' => $settings,
                    'created'  => get_the_date( 'Y/m/d \a\t g:i a', $post )
                ];
            }
        
            wp_send_json_success( $items );
        }

        public function bplde_delete_document_library() {
            check_ajax_referer( 'bplde_nonce', 'nonce' );
           
            $id = intval( $_POST['id'] ?? 0 );
            if ( ! $id ) {
                wp_send_json_error( ['message' => 'Invalid ID'] );
            }

            if ( ! current_user_can( 'delete_post', $id ) ) {
                wp_send_json_error( ['message' => 'Unauthorized to delete this document.'] );
            }
            
            wp_delete_post( $id, true );
            wp_send_json_success();
        }

        // --- Track Download Handler ---
        public function de_track_download() {
            check_ajax_referer( 'de_track_download_nonce', 'nonce' );
            
            $document_id = isset( $_POST['document_id'] ) ? intval( $_POST['document_id'] ) : 0;
            if ( $document_id > 0 ) {
                global $wpdb;
                
                // Record in leads table for IP tracking
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- direct insert to custom table
                $inserted = $wpdb->insert(
                    $wpdb->prefix . 'docembedder_leads',
                    [
                        'name'           => 'Anonymous',
                        'email'          => 'anonymous@direct.download',
                        'document_id'    => $document_id,
                        'document_title' => get_the_title( $document_id ),
                        'downloaded_at'  => current_time( 'mysql' ),
                        'ip_address'     => Functions::get_client_ip()
                    ],
                    ['%s', '%s', '%d', '%s', '%s', '%s']
                );

                if ( $inserted === false ) {
                    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                    error_log( "DE DEBUG: DB Insert FAILED for Direct Tracking. Error: " . $wpdb->last_error );
                } else {
                    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                    error_log( "DE DEBUG: DB Insert SUCCESS for Direct Tracking. ID: " . $wpdb->insert_id );
                }

                // Use a custom token instead of a WP nonce to avoid UID-dependency during redirect
                $ip = Functions::get_client_ip();
                $token = wp_hash( $document_id . '|' . $ip . '|' . 'de_download', 'nonce' );

                $count = (int) get_post_meta( $document_id, '_de_download_count', true );
                update_post_meta( $document_id, '_de_download_count', $count + 1 );

                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log( "DE DEBUG: de_track_download called. IP: $ip. Doc: $document_id. Token: $token" );

                wp_send_json_success( [
                    'count' => $count + 1,
                    'nonce' => $token
                ] );
            }
            wp_send_json_error( 'Invalid document ID' );
        }

        // --- Get Doc Meta Handlers ---
        public function single_doc_callback() {
            $id    = isset( $_GET['id'] ) ? sanitize_text_field( wp_unslash( $_GET['id'] ) ) : false;
            $nonce = isset( $_GET['ppv_nonce'] ) ? sanitize_text_field( wp_unslash( $_GET['ppv_nonce'] ) ) : false;
            $user     = wp_get_current_user();
            if ( ! $id || get_post_status( $id ) != 'publish' || ! wp_verify_nonce( $nonce, 'ppv_secret_nonce' ) || ! in_array( 'administrator', $user->roles ) ) {
                return false;
            }

            $data = $this->get_data( $id );
           
            echo wp_json_encode( $data );
            die();
        }

        private function get_data( $id ) {
            $width  = Functions::meta( $id, 'width', ['width' => '100', 'unit' => '%'] );
            $height = Functions::meta( $id, 'height', ['height' => 600, 'unit' => 'px'] );

            return [
                'url'      => Functions::meta( $id, 'doc', '' ),
                'width'    => $width['width'] . $width['unit'],
                'height'   => $height['height'] . $height['unit'],
                'showName' => Functions::meta( $id, 'showName' ),
                'title'    => get_the_title( $id )
            ];
        }
    }

    AJAXCall::instance();
}
