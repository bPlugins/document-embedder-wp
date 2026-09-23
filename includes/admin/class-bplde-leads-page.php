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
            add_action( 'admin_init', [$this, 'set_page_title'] );
            add_filter( 'admin_body_class', [$this, 'body_class'] );
        }

        /**
         * Scope for admin-leads.css, matching how the editor and list screens are scoped.
         */
        public function body_class( $classes ) {
            $screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

            if ( $screen && $screen->id === 'ppt_viewer_page_bplde-download-leads' ) {
                $classes .= ' bplde-leads ';
            }

            return $classes;
        }

        /**
         * Set the global title for the hidden leads page to prevent PHP deprecation notices
         * in wp-admin/admin-header.php on PHP 8.1+.
         */
        public function set_page_title() {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Page routing doesn't require a nonce.
            if ( isset( $_GET['page'] ) && $_GET['page'] === 'bplde-download-leads' ) {
                global $title;
                $title = __( 'Download Leads', 'document-emberdder' );
            }
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
                    /*
                     * No filters means no values to bind, and wpdb::prepare() raises
                     * "must have a placeholder" when handed a query without one. The
                     * string here is built only from literals and $wpdb->prefix.
                     */
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- no user input in this query
                    $leads = $wpdb->get_results( $sql, ARRAY_A );
                }

                header( 'Content-Type: text/csv' );
                header( 'Content-Disposition: attachment; filename="document-leads-' . gmdate( 'Y-m-d' ) . '.csv"' );
                header( 'Pragma: no-cache' );
                header( 'Expires: 0' );

                $output = fopen( 'php://output', 'w' );
                fputcsv( $output, ['ID', 'Name', 'Email', 'Document ID', 'Document Title', 'Downloaded At', 'IP Address'] );

                foreach ( $leads as $lead ) {
                    fputcsv( $output, array_map( ['\BPLDE\Helper\Functions', 'escape_csv_field'], $lead ) );
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
                // Same reason as above: nothing to bind, so prepare() would only warn.
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- no user input in this query
                $total_items = $wpdb->get_var( $count_sql );
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
            
            $has_filters = ( $email_search || $date_filter );
            $is_filtered = ( $has_filters || $document_filter );

            /*
             * The tiles describe the rows actually on screen, so they carry the same
             * WHERE clause the table does. Global totals over a filtered table read as
             * a contradiction — "36 leads" above an empty list for a document that has
             * none — which is exactly how this was first built.
             */
            $agg_sql = "SELECT COUNT(*) AS total, COUNT(DISTINCT email) AS emails, COUNT(DISTINCT document_id) AS docs
                        FROM {$wpdb->prefix}docembedder_leads WHERE 1=1" . $where;

            if ( ! empty( $params ) ) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- built with prepare() clauses
                $totals = $wpdb->get_row( $wpdb->prepare( $agg_sql, ...$params ), ARRAY_A );
            } else {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- static aggregate
                $totals = $wpdb->get_row( $agg_sql, ARRAY_A );
            }

            $totals = is_array( $totals ) ? $totals : [ 'total' => 0, 'emails' => 0, 'docs' => 0 ];

            // Only worth a second query when the view is narrowed; otherwise it is the same number.
            if ( $is_filtered ) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
                $library_total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads" );
            } else {
                $library_total = (int) $totals['total'];
            }

            $show_all_url = admin_url( 'edit.php?post_type=ppt_viewer&page=bplde-download-leads' );

            $back_url = admin_url( 'edit.php?post_type=ppt_viewer' );
            $doc_edit_url = $document_filter ? get_edit_post_link( $document_filter ) : '#';

            ?>
            <div class="wrap bplde-leads-wrap">
                <?php // .wp-header-end stays as the marker common.js moves admin notices to. ?>
                <hr class="wp-header-end">

                <form method="post" action="">
                    <?php wp_nonce_field( 'bplde_bulk_delete_leads' ); ?>

                    <div class="bplde-leads-top">
                        <div class="bplde-leads-top__id">
                            <span class="bplde-leads-top__eyebrow"><?php esc_html_e( 'Document Embedder', 'document-emberdder' ); ?></span>
                            <h1 class="bplde-leads-top__title"><?php esc_html_e( 'Download Leads', 'document-emberdder' ); ?></h1>
                        </div>

                        <button type="submit" name="delete_selected" class="bplde-leads-btn bplde-leads-btn--danger"
                            onclick="return confirm('<?php echo esc_js( __( 'Delete the selected leads? This cannot be undone.', 'document-emberdder' ) ); ?>');">
                            <?php esc_html_e( 'Delete selected', 'document-emberdder' ); ?>
                        </button>

                        <a href="<?php echo esc_url( $export_url ); ?>" class="bplde-leads-btn bplde-leads-btn--primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" />
                            </svg>
                            <?php esc_html_e( 'Export CSV', 'document-emberdder' ); ?>
                        </a>
                    </div>

                    <div class="bplde-leads-tiles">
                        <div class="bplde-leads-tile">
                            <span class="bplde-leads-tile__value"><?php echo esc_html( number_format_i18n( (int) $totals['total'] ) ); ?></span>
                            <span class="bplde-leads-tile__label">
                                <?php
                                echo $is_filtered
                                    ? esc_html__( 'Leads in this view', 'document-emberdder' )
                                    : esc_html__( 'Total leads', 'document-emberdder' );
                                ?>
                            </span>
                        </div>
                        <div class="bplde-leads-tile">
                            <span class="bplde-leads-tile__value"><?php echo esc_html( number_format_i18n( (int) $totals['emails'] ) ); ?></span>
                            <span class="bplde-leads-tile__label"><?php esc_html_e( 'Unique emails', 'document-emberdder' ); ?></span>
                        </div>
                        <div class="bplde-leads-tile">
                            <span class="bplde-leads-tile__value"><?php echo esc_html( number_format_i18n( (int) $totals['docs'] ) ); ?></span>
                            <span class="bplde-leads-tile__label"><?php esc_html_e( 'Documents with leads', 'document-emberdder' ); ?></span>
                        </div>
                    </div>

                    <?php if ( $is_filtered ) : ?>
                        <p class="bplde-leads-scope">
                            <?php
                            printf(
                                /* translators: 1: leads in the filtered view, 2: leads in the whole library. */
                                esc_html__( 'Filtered view — showing %1$s of %2$s leads in the library.', 'document-emberdder' ),
                                esc_html( number_format_i18n( (int) $totals['total'] ) ),
                                esc_html( number_format_i18n( $library_total ) )
                            );
                            ?>
                            <a href="<?php echo esc_url( $show_all_url ); ?>"><?php esc_html_e( 'Show all leads', 'document-emberdder' ); ?></a>
                        </p>
                    <?php endif; ?>

                    <div class="bplde-leads-toolbar">
                        <a href="<?php echo esc_url( $back_url ); ?>" class="bplde-leads-back">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M19 12H5" /><path d="M11 18l-6-6 6-6" />
                            </svg>
                            <?php esc_html_e( 'All documents', 'document-emberdder' ); ?>
                        </a>

                        <?php if ( $document_filter && $doc_title ) : ?>
                            <a href="<?php echo esc_url( $doc_edit_url ); ?>" class="bplde-leads-doc"><?php echo esc_html( $doc_title ); ?></a>
                        <?php endif; ?>

                        <div class="bplde-leads-toolbar__spacer"></div>

                        <input type="date" name="date_filter" value="<?php echo esc_attr( $date_filter ); ?>" class="bplde-leads-input"
                               aria-label="<?php esc_attr_e( 'Filter by date', 'document-emberdder' ); ?>">
                        <input type="search" name="email_search" value="<?php echo esc_attr( $email_search ); ?>" class="bplde-leads-input bplde-leads-input--search"
                               placeholder="<?php esc_attr_e( 'Search email or name', 'document-emberdder' ); ?>"
                               aria-label="<?php esc_attr_e( 'Search email or name', 'document-emberdder' ); ?>">
                        <button type="submit" formaction="" formmethod="get" class="bplde-leads-btn"><?php esc_html_e( 'Filter', 'document-emberdder' ); ?></button>

                        <input type="hidden" name="post_type" value="ppt_viewer">
                        <input type="hidden" name="page" value="bplde-download-leads">
                        <?php if ( $document_filter ) : ?>
                            <input type="hidden" name="filter_document_id" value="<?php echo esc_attr( $document_filter ); ?>">
                        <?php endif; ?>

                        <?php if ( $has_filters ) : ?>
                            <?php
                            $clear_url = admin_url( 'edit.php?post_type=ppt_viewer&page=bplde-download-leads' );
                            if ( $document_filter ) {
                                $clear_url = add_query_arg( 'filter_document_id', $document_filter, $clear_url );
                            }
                            ?>
                            <a href="<?php echo esc_url( $clear_url ); ?>" class="bplde-leads-clear"><?php esc_html_e( 'Clear', 'document-emberdder' ); ?></a>
                        <?php endif; ?>
                    </div>

                    <div class="bplde-leads-card">
                        <div class="bplde-leads-scroll">
                            <table class="bplde-leads-table">
                                <thead>
                                    <tr>
                                        <th class="bplde-leads-table__check"><input type="checkbox" class="bplde-leads-checkall" aria-label="<?php esc_attr_e( 'Select all leads', 'document-emberdder' ); ?>" onclick="document.querySelectorAll('.bplde-row-checkbox').forEach(cb => cb.checked = this.checked);"></th>
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
                                            <td colspan="<?php echo $document_filter ? 6 : 7; ?>" class="bplde-leads-none">
                                                <?php
                                                if ( $has_filters ) {
                                                    esc_html_e( 'No leads match those filters.', 'document-emberdder' );
                                                } elseif ( $document_filter ) {
                                                    esc_html_e( 'No leads for this document yet.', 'document-emberdder' );
                                                } else {
                                                    esc_html_e( 'No leads captured yet. They appear here once someone downloads an email-gated document.', 'document-emberdder' );
                                                }
                                                ?>
                                            </td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ( $leads as $lead ): ?>
                                            <tr>
                                                <td class="bplde-leads-table__check">
                                                    <input type="checkbox" name="bulk_delete[]" value="<?php echo esc_attr( $lead['id'] ); ?>" class="bplde-row-checkbox" aria-label="<?php esc_attr_e( 'Select this lead', 'document-emberdder' ); ?>">
                                                </td>
                                                <td><span class="bplde-leads-id">#<?php echo esc_html( $lead['id'] ); ?></span></td>
                                                <td><span class="bplde-leads-name"><?php echo esc_html( $lead['name'] ); ?></span></td>
                                                <td><a class="bplde-leads-email" href="mailto:<?php echo esc_attr( $lead['email'] ); ?>"><?php echo esc_html( $lead['email'] ); ?></a></td>
                                                <?php if ( ! $document_filter ): ?>
                                                    <td>
                                                        <?php 
                                                        $link = get_edit_post_link( $lead['document_id'] );
                                                        if ( $link ) {
                                                            printf( '<a class="bplde-leads-doclink" href="%s">%s</a>', esc_url( $link ), esc_html( $lead['document_title'] ) );
                                                        } else {
                                                            /*
                                                             * Captured before documents took their leads with them, so the
                                                             * document is gone but the lead remains. Say so rather than
                                                             * leaving a title that silently links nowhere.
                                                             */
                                                            printf(
                                                                '<span class="bplde-leads-gone-title">%s</span><span class="bplde-leads-gone">%s</span>',
                                                                esc_html( $lead['document_title'] ? $lead['document_title'] : __( 'Untitled', 'document-emberdder' ) ),
                                                                esc_html__( 'deleted', 'document-emberdder' )
                                                            );
                                                        }
                                                        ?>
                                                    </td>
                                                <?php endif; ?>
                                                <td><span class="bplde-leads-ip"><?php echo esc_html( $lead['ip_address'] ); ?></span></td>
                                                <td class="bplde-leads-date"><?php echo esc_html( wp_date( get_option( 'date_format' ) . ' \a\t ' . get_option( 'time_format' ), strtotime( $lead['downloaded_at'] ) ) ); ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>

                        <div class="bplde-leads-foot">
                            <span class="bplde-leads-foot__count">
                                <?php
                                $range_start = $total_items ? ( ( $page_number - 1 ) * $per_page ) + 1 : 0;
                                $range_end   = min( $page_number * $per_page, (int) $total_items );

                                if ( $total_items > $per_page ) {
                                    printf(
                                        /* translators: 1: first row shown, 2: last row shown, 3: total rows. */
                                        esc_html__( 'Showing %1$s–%2$s of %3$s leads', 'document-emberdder' ),
                                        esc_html( number_format_i18n( $range_start ) ),
                                        esc_html( number_format_i18n( $range_end ) ),
                                        esc_html( number_format_i18n( (int) $total_items ) )
                                    );
                                } else {
                                    printf(
                                        /* translators: %s: number of leads matching the current filters. */
                                        esc_html( _n( '%s lead', '%s leads', (int) $total_items, 'document-emberdder' ) ),
                                        esc_html( number_format_i18n( (int) $total_items ) )
                                    );
                                }
                                ?>
                            </span>

                            <?php if ( $total_pages > 1 ) : ?>
                                <div class="bplde-leads-pagination">
                                    <?php
                                    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- paginate_links() returns safe HTML
                                    echo paginate_links( [
                                        'base'      => add_query_arg( 'paged', '%#%' ),
                                        'format'    => '',
                                        'prev_text' => '&larr;',
                                        'next_text' => '&rarr;',
                                        'total'     => $total_pages,
                                        'current'   => $page_number,
                                    ] );
                                    ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </form>
            </div>
            <?php
        }
    }

    LeadsPage::instance();
}
