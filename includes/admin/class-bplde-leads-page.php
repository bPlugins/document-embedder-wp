<?php
/**
 * BPLDE Leads Page Class.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Admin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'LeadsPage' ) ) {
    class LeadsPage {

        private static $_instance = null;

        public static function instance() {
            if ( is_null( self::$_instance ) ) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_action( 'admin_init', [$this, 'handle_export'] );
            add_action( 'admin_init', [$this, 'handle_bulk_delete'] );
        }
        
        public function handle_bulk_delete() {
            if ( isset( $_POST['delete_selected'] ) && isset( $_POST['bulk_delete'] ) && is_array( $_POST['bulk_delete'] ) ) {
                if ( ! current_user_can( 'manage_options' ) ) {
                    return;
                }
                
                check_admin_referer( 'bplde_bulk_delete_leads' );

                global $wpdb;
                $ids = array_map( 'intval', $_POST['bulk_delete'] );
                
                if ( ! empty( $ids ) ) {
                    $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- dynamic IN clause with intval-sanitized IDs
                    $wpdb->query( $wpdb->prepare(
                        "DELETE FROM {$wpdb->prefix}docembedder_leads WHERE id IN ($placeholders)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
                        ...$ids
                    ) );
                }
                
                $redirect_url = remove_query_arg( ['paged'], wp_get_referer() );
                wp_safe_redirect( $redirect_url );
                exit;
            }
        }

        public function handle_export() {
            if ( isset( $_GET['page'] ) && $_GET['page'] === 'bplde-download-leads' && isset( $_GET['export_leads'] ) ) {
                if ( ! current_user_can( 'manage_options' ) ) {
                    return;
                }

                check_admin_referer( 'bplde_export_leads' );

                global $wpdb;
                
                $sql = "SELECT id, name, email, document_id, document_title, downloaded_at, ip_address FROM {$wpdb->prefix}docembedder_leads WHERE 1=1";
                $params = [];
                
                if ( ! empty( $_GET['filter_document_id'] ) ) {
                    $sql .= " AND document_id = %d";
                    $params[] = intval( $_GET['filter_document_id'] );
                }
                if ( ! empty( $_GET['email_search'] ) ) {
                    $search = '%' . $wpdb->esc_like( sanitize_text_field( wp_unslash( $_GET['email_search'] ) ) ) . '%';
                    $sql .= " AND (email LIKE %s OR name LIKE %s)";
                    $params[] = $search;
                    $params[] = $search;
                }
                if ( ! empty( $_GET['date_filter'] ) ) {
                    $date = sanitize_text_field( wp_unslash( $_GET['date_filter'] ) );
                    $sql .= " AND DATE(downloaded_at) = %s";
                    $params[] = $date;
                }
                
                $sql .= " ORDER BY downloaded_at DESC";
                
                if ( ! empty( $params ) ) {
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- query built with prepare() clauses
                    $leads = $wpdb->get_results( $wpdb->prepare( $sql, ...$params ), ARRAY_A );
                } else {
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- static query
                    $leads = $wpdb->get_results( $wpdb->prepare( $sql ), ARRAY_A );
                }

                header( 'Content-Type: text/csv' );
                header( 'Content-Disposition: attachment; filename="document-leads-' . gmdate( 'Y-m-d' ) . '.csv"' );
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
        }

        public function render_page() {
            if ( ! current_user_can( 'manage_options' ) ) {
                wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'document-emberdder' ) );
            }

            global $wpdb;
            
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only filter params, no state change
            $document_filter = isset( $_REQUEST['filter_document_id'] ) ? intval( $_REQUEST['filter_document_id'] ) : '';
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.MissingUnslash
            $email_search = isset( $_REQUEST['email_search'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['email_search'] ) ) : '';
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.MissingUnslash
            $date_filter = isset( $_REQUEST['date_filter'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['date_filter'] ) ) : '';
            
            $doc_title = '';
            if ( $document_filter ) {
                $doc_title = get_the_title( $document_filter );
                if ( ! $doc_title ) {
                    $doc_title = "Document #" . $document_filter;
                }
            }

            $per_page = 20;
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only pagination param
            $page_number = isset( $_GET['paged'] ) ? max( 1, intval( $_GET['paged'] ) ) : 1;
            
            $count_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE 1=1";
            $where = '';
            $params = [];
            if ( $document_filter ) {
                $where .= " AND document_id = %d";
                $params[] = $document_filter;
            }
            if ( $email_search ) {
                $search_term = '%' . $wpdb->esc_like( $email_search ) . '%';
                $where .= " AND (email LIKE %s OR name LIKE %s)";
                $params[] = $search_term;
                $params[] = $search_term;
            }
            if ( $date_filter ) {
                $where .= " AND DATE(downloaded_at) = %s";
                $params[] = $date_filter;
            }

            if ( ! empty( $params ) ) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- query built with prepare() clauses
                $total_items = $wpdb->get_var( $wpdb->prepare( $count_sql . $where, ...$params ) );
            } else {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- static base query
                $total_items = $wpdb->get_var( $wpdb->prepare( $count_sql ) );
            }

            $sql = "SELECT * FROM {$wpdb->prefix}docembedder_leads WHERE 1=1" . $where;
            $sql .= " ORDER BY downloaded_at DESC LIMIT %d OFFSET %d";

            $query_params = $params;
            $query_params[] = $per_page;
            $query_params[] = ( $page_number - 1 ) * $per_page;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- query built with prepare() clauses
            $leads = $wpdb->get_results( $wpdb->prepare( $sql, ...$query_params ), ARRAY_A );
            $total_pages = ceil( $total_items / $per_page );
            
            // Export URL with safe CSRF nonce
            $export_args = [
                'export_leads' => '1',
                '_wpnonce'     => wp_create_nonce( 'bplde_export_leads' )
            ];
            if ( $document_filter ) $export_args['filter_document_id'] = $document_filter;
            if ( $email_search ) $export_args['email_search'] = $email_search;
            if ( $date_filter ) $export_args['date_filter'] = $date_filter;
            $export_url = add_query_arg( $export_args, admin_url( 'edit.php?post_type=ppt_viewer&page=bplde-download-leads' ) );
            
            $back_url = admin_url( 'edit.php?post_type=ppt_viewer' );
            $doc_edit_url = $document_filter ? get_edit_post_link( $document_filter ) : '#';

            ?>
            <div class="wrap" style="background: #f0f0f1;">
                <h1 class="wp-heading-inline">Download Leads</h1>
                <hr class="wp-header-end">
                
                <div class="bplde-custom-table-container">
                    <form method="post" action="">
                        <?php wp_nonce_field( 'bplde_bulk_delete_leads' ); ?>
                        <div class="bplde-header-actions">
                        <div class="bplde-header-left">
                            <a href="<?php echo esc_url( $back_url ); ?>" class="bplde-btn bplde-btn-back">
                                &arr; Back To Doc List
                            </a>
                            
                            <?php if ( $document_filter && $doc_title ): ?>
                                <a href="<?php echo esc_url( $doc_edit_url ); ?>" class="bplde-btn bplde-btn-title">
                                    <?php echo esc_html( $doc_title ); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                        
                        <div class="bplde-header-right">
                            <button type="submit" name="delete_selected" class="bplde-btn bplde-btn-delete"
                                onclick="return confirm('Are you sure you want to delete the selected leads? This cannot be undone.');">
                                Delete Selected
                            </button>
                            
                            <a href="<?php echo esc_url( $export_url ); ?>" class="bplde-btn bplde-btn-export">
                                <span style="margin-right: 6px;">&darr;</span> Export Data
                            </a>
                            
                        </div>
                    </div>

                    <div class="bplde-filters-row">
                            <div class="bplde-filters-left">
                                <input type="date" name="date_filter" value="<?php echo esc_attr( $date_filter ); ?>" class="bplde-input">
                                <input type="text" name="email_search" value="<?php echo esc_attr( $email_search ); ?>" placeholder="Search Email or Name..." class="bplde-input" style="width: 240px;">
                                <button type="submit" formaction="" formmethod="get" class="bplde-btn bplde-btn-filter">Filter</button>
                                
                                <input type="hidden" name="post_type" value="ppt_viewer">
                                <input type="hidden" name="page" value="bplde-download-leads">
                                <?php if ( $document_filter ): ?>
                                    <input type="hidden" name="filter_document_id" value="<?php echo esc_attr( $document_filter ); ?>">
                                <?php endif; ?>
                                
                                <?php if ( $email_search || $date_filter ): ?>
                                    <?php 
                                        $clear_url = admin_url( 'edit.php?post_type=ppt_viewer&page=bplde-download-leads' );
                                        if ( $document_filter ) {
                                            $clear_url = add_query_arg( 'filter_document_id', $document_filter, $clear_url );
                                        }
                                    ?>
                                    <a href="<?php echo esc_url( $clear_url ); ?>" class="bplde-btn bplde-btn-clear">Clear Filters</a>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div style="overflow-x: auto;">
                            <table class="bplde-custom-table">
                                <thead>
                                    <tr>
                                        <th style="width: 40px; text-align: center;"><input type="checkbox" class="bplde-checkbox" onclick="document.querySelectorAll('.bplde-row-checkbox').forEach(cb => cb.checked = this.checked);"></th>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <?php if ( ! $document_filter ): ?>
                                            <th>Document Title</th>
                                        <?php endif; ?>
                                        <th>IP Address</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if ( empty( $leads ) ): ?>
                                        <tr>
                                            <td colspan="<?php echo $document_filter ? 6 : 7; ?>" style="text-align: center; padding: 60px; color: #9ca3af;">
                                                No leads found matching your criteria.
                                            </td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ( $leads as $lead ): ?>
                                            <tr>
                                                <td style="text-align: center;">
                                                    <input type="checkbox" name="bulk_delete[]" value="<?php echo esc_attr( $lead['id'] ); ?>" class="bplde-checkbox bplde-row-checkbox">
                                                </td>
                                                <td><strong style="color: #6b7280;">#<?php echo esc_html( $lead['id'] ); ?></strong></td>
                                                <td><span style="font-weight: 500; color: #111827;"><?php echo esc_html( $lead['name'] ); ?></span></td>
                                                <td><a href="mailto:<?php echo esc_attr( $lead['email'] ); ?>" style="color: #3b82f6; text-decoration: none;"><?php echo esc_html( $lead['email'] ); ?></a></td>
                                                <?php if ( ! $document_filter ): ?>
                                                    <td>
                                                        <?php 
                                                        $link = get_edit_post_link( $lead['document_id'] );
                                                        if ( $link ) {
                                                            printf( '<a href="%s" style="color: #4b5563; text-decoration: none; font-weight: 500;">%s</a>', esc_url( $link ), esc_html( $lead['document_title'] ) );
                                                        } else {
                                                            echo esc_html( $lead['document_title'] );
                                                        }
                                                        ?>
                                                    </td>
                                                <?php endif; ?>
                                                <td><span class="code" style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #4b5563;"><?php echo esc_html( $lead['ip_address'] ); ?></span></td>
                                                <td><?php echo esc_html( wp_date( get_option( 'date_format' ) . ' \a\t ' . get_option( 'time_format' ), strtotime( $lead['downloaded_at'] ) ) ); ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </form>
                    
                    <?php if ( $total_pages > 1 ): ?>
                        <div class="bplde-pagination">
                            <?php
                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- paginate_links() returns safe HTML
                            echo paginate_links( [
                                'base'      => add_query_arg( 'paged', '%#%' ),
                                'format'    => '',
                                'prev_text' => '&arr; Prev',
                                'next_text' => 'Next &rarr;',
                                'total'     => $total_pages,
                                'current'   => $page_number
                            ] );
                            ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php
        }
    }

    LeadsPage::instance();
}
