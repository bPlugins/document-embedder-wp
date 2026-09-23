<?php
/**
 * BPLDE_List_Screen class.
 *
 * Dresses the Doc Embedder list table in the same language as the document editor:
 * an action bar carrying the title, search and Add New, three totals above the
 * table, and a file-type filter beside the stock date and bulk-action controls.
 *
 * The table itself is still WP_List_Table. Columns are declared through
 * manage_*_posts_columns, rendered through manage_*_posts_custom_column and
 * filtered through restrict_manage_posts — the documented route in every case.
 * Only the surrounding chrome is CSS over core markup.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_List_Screen')) {
    class BPLDE_List_Screen {

        /** Body class every rule in admin-list.css is scoped to. */
        const BODY_CLASS = 'bplde-list';

        private static $_instance = null;

        /** Totals are read by both the body class and the header. */
        private $totals = null;

        public static function instance() {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_filter('admin_body_class', [$this, 'body_class']);
            add_action('admin_enqueue_scripts', [$this, 'enqueue'], 100);
            // After the upgrade notice, which registers on the same hook at priority 10.
            add_action('admin_notices', [$this, 'render_header'], 20);
            add_action('restrict_manage_posts', [$this, 'file_type_filter']);
        }

        /**
         * The document list, and only when the layout is switched on. Returning false
         * from the filter leaves the stock list screen with its own heading and search.
         */
        private function is_active() {
            if (!function_exists('get_current_screen')) {
                return false;
            }

            $screen = get_current_screen();
            if (!$screen || $screen->base !== 'edit' || $screen->post_type !== 'ppt_viewer') {
                return false;
            }

            /**
             * Filters whether the redesigned document list screen is used.
             *
             * @param bool $enabled Default true.
             */
            return (bool) apply_filters('bplde_use_list_layout', true);
        }

        public function body_class($classes) {
            if (!$this->is_active()) {
                return $classes;
            }

            $classes .= ' ' . self::BODY_CLASS . ' ';

            if ($this->is_library_empty()) {
                $classes .= 'bplde-list-empty ';
            }

            return $classes;
        }

        public function enqueue() {
            if (!$this->is_active()) {
                return;
            }

            $path = BPLDE_PLUGIN_PATH . 'assets/css/admin-list.css';

            wp_enqueue_style(
                'bplde-admin-list',
                BPLDE_PLUGIN_DIR . 'assets/css/admin-list.css',
                ['ppv-admin'],
                file_exists($path) ? (string) filemtime($path) : BPLDE_VER
            );
        }

        /**
         * Documents, downloads and leads across the whole post type.
         */
        private function totals() {
            if ($this->totals !== null) {
                return $this->totals;
            }

            global $wpdb;

            $counts    = wp_count_posts('ppt_viewer');
            $documents = 0;

            foreach (['publish', 'future', 'draft', 'pending', 'private'] as $status) {
                $documents += isset($counts->$status) ? (int) $counts->$status : 0;
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one aggregate per screen
            $downloads = (int) $wpdb->get_var(
                "SELECT SUM(pm.meta_value)
                 FROM {$wpdb->postmeta} pm
                 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
                 WHERE pm.meta_key = '_de_download_count' AND p.post_type = 'ppt_viewer'"
            );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $leads = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads");

            $this->totals = [
                'documents' => $documents,
                'downloads' => $downloads,
                'leads'     => $leads,
            ];

            return $this->totals;
        }

        /**
         * True only when the library is genuinely empty — not when a search or a filter
         * happens to match nothing, and not while the Trash view is open. Showing
         * "add your first document" to someone who just searched for "invoice" would be
         * both wrong and a dead end.
         */
        private function is_library_empty() {
            $totals = $this->totals();
            $empty  = ($totals['documents'] === 0);

            if ($empty) {
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading filter state
                $query = $_GET;

                foreach (['s', 'ppv_file_type', 'ppv_document_tags', 'm', 'author', 'post_status'] as $key) {
                    if (!empty($query[$key]) && $query[$key] !== 'all') {
                        $empty = false;
                        break;
                    }
                }
            }

            /**
             * Filters whether the list screen shows its empty state.
             *
             * @param bool $empty Whether the document library is empty and unfiltered.
             */
            return (bool) apply_filters('bplde_list_is_empty', $empty);
        }

        /**
         * The action bar and the totals.
         *
         * admin_notices prints inside #wpbody-content, above .wrap, which is where this
         * belongs. The search is its own GET form rather than a field in #posts-filter,
         * because that form lives further down the page than this bar does.
         */
        public function render_header() {
            if (!$this->is_active()) {
                return;
            }

            if ($this->is_library_empty()) {
                $this->render_empty_state();
                return;
            }

            $totals = $this->totals();
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading a search term for redisplay
            $search = isset($_GET['s']) ? sanitize_text_field(wp_unslash($_GET['s'])) : '';

            $tiles = [
                [
                    'value' => $totals['documents'],
                    'label' => __('Documents', 'document-emberdder'),
                    'tone'  => 'accent',
                    'icon'  => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
                ],
                [
                    'value' => $totals['downloads'],
                    'label' => __('Downloads', 'document-emberdder'),
                    'tone'  => 'accent',
                    'icon'  => '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>',
                ],
                [
                    'value' => $totals['leads'],
                    'label' => __('Download leads', 'document-emberdder'),
                    'tone'  => 'pop',
                    'icon'  => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>',
                ],
            ];
            ?>
            <div class="bplde-list-top">
                <div class="bplde-list-top__id">
                    <span class="bplde-list-top__eyebrow"><?php esc_html_e('Document Embedder', 'document-emberdder'); ?></span>
                    <h1 class="bplde-list-top__title"><?php esc_html_e('All Documents', 'document-emberdder'); ?></h1>
                </div>

                <form class="bplde-list-search" method="get" action="<?php echo esc_url(admin_url('edit.php')); ?>" role="search">
                    <input type="hidden" name="post_type" value="ppt_viewer">
                    <label class="screen-reader-text" for="bplde-list-search-input"><?php esc_html_e('Search documents', 'document-emberdder'); ?></label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
                    </svg>
                    <input type="search" id="bplde-list-search-input" name="s" value="<?php echo esc_attr($search); ?>"
                           placeholder="<?php esc_attr_e('Search documents', 'document-emberdder'); ?>">
                </form>

                <a class="bplde-list-top__new" href="<?php echo esc_url(admin_url('post-new.php?post_type=ppt_viewer')); ?>">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 5v14" /><path d="M5 12h14" />
                    </svg>
                    <?php esc_html_e('Add New Doc', 'document-emberdder'); ?>
                </a>
            </div>

            <div class="bplde-list-tiles">
                <?php foreach ($tiles as $tile) { ?>
                    <div class="bplde-list-tile">
                        <span class="bplde-list-tile__icon bplde-list-tile__icon--<?php echo esc_attr($tile['tone']); ?>">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <?php echo wp_kses($tile['icon'], ['path' => ['d' => []], 'circle' => ['cx' => [], 'cy' => [], 'r' => []]]); ?>
                            </svg>
                        </span>
                        <span>
                            <span class="bplde-list-tile__value"><?php echo esc_html(number_format_i18n($tile['value'])); ?></span>
                            <span class="bplde-list-tile__label"><?php echo esc_html($tile['label']); ?></span>
                        </span>
                    </div>
                <?php } ?>
            </div>
            <?php
        }

        /**
         * The whole screen when there is nothing in it yet: one card with the single
         * action worth taking. The stylesheet hides the views, toolbar and table, so
         * this carries the page's only H1.
         *
         * The Trash link stays because trashed documents are still reachable content;
         * without it, hiding the status views would strand them.
         */
        private function render_empty_state() {
            $counts = wp_count_posts( 'ppt_viewer' );
            $trash  = isset( $counts->trash ) ? (int) $counts->trash : 0;

            // The list the metabox advertises, so the two never drift apart.
            $formats = [ 'PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT', 'RTF', 'CSV', 'ODT', 'ODS', 'ODP' ];

            $steps = [
                [
                    'title' => __( 'Upload or link a file', 'document-emberdder' ),
                    'note'  => __( 'Pick one from the Media Library, or paste a document URL.', 'document-emberdder' ),
                ],
                [
                    'title' => __( 'Copy the shortcode', 'document-emberdder' ),
                    'note'  => __( 'Every document gets one, shown right under its title.', 'document-emberdder' ),
                ],
                [
                    'title' => __( 'Paste it anywhere', 'document-emberdder' ),
                    'note'  => __( 'Posts, pages, widgets, and every major page builder.', 'document-emberdder' ),
                ],
            ];

            $help_url    = admin_url( 'edit.php?post_type=ppt_viewer&page=bplde-dashboard' );
            $library_url = admin_url( 'edit.php?post_type=document_library' );
            ?>
            <div class="bplde-empty">

                <div class="bplde-empty__hero">
                    <span class="bplde-empty__icon" aria-hidden="true">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" /><path d="M12 12v6" /><path d="M9 15h6" />
                        </svg>
                    </span>

                    <h1 class="bplde-empty__title"><?php esc_html_e( 'Add your first document', 'document-emberdder' ); ?></h1>

                    <p class="bplde-empty__note">
                        <?php esc_html_e( 'Upload a PDF, Word file, spreadsheet or slide deck — then paste its shortcode wherever you want it to appear.', 'document-emberdder' ); ?>
                    </p>

                    <a class="bplde-empty__cta" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=ppt_viewer' ) ); ?>">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M12 5v14" /><path d="M5 12h14" />
                        </svg>
                        <?php esc_html_e( 'Add New Doc', 'document-emberdder' ); ?>
                    </a>

                    <p class="bplde-empty__formats">
                        <span class="bplde-empty__formats-label"><?php esc_html_e( 'Supported', 'document-emberdder' ); ?></span>
                        <?php foreach ( $formats as $format ) { ?>
                            <span class="bplde-empty__format"><?php echo esc_html( $format ); ?></span>
                        <?php } ?>
                    </p>
                </div>

                <ol class="bplde-empty__steps">
                    <?php foreach ( $steps as $i => $step ) { ?>
                        <li class="bplde-empty__step">
                            <span class="bplde-empty__step-n"><?php echo esc_html( number_format_i18n( $i + 1 ) ); ?></span>
                            <span class="bplde-empty__step-title"><?php echo esc_html( $step['title'] ); ?></span>
                            <span class="bplde-empty__step-note"><?php echo esc_html( $step['note'] ); ?></span>
                        </li>
                    <?php } ?>
                </ol>

                <p class="bplde-empty__foot">
                    <?php esc_html_e( 'Works with Elementor, Divi, Bricks, WPBakery, Beaver Builder, Oxygen and Breakdance.', 'document-emberdder' ); ?>
                    <a href="<?php echo esc_url( $help_url ); ?>"><?php esc_html_e( 'Help &amp; demos', 'document-emberdder' ); ?></a>
                    <span aria-hidden="true">·</span>
                    <a href="<?php echo esc_url( $library_url ); ?>"><?php esc_html_e( 'Document Library', 'document-emberdder' ); ?></a>
                    <?php if ( $trash ) { ?>
                        <span aria-hidden="true">·</span>
                        <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=ppt_viewer&post_status=trash' ) ); ?>">
                            <?php
                            printf(
                                /* translators: %s: number of documents in the trash. */
                                esc_html__( 'Trash (%s)', 'document-emberdder' ),
                                esc_html( number_format_i18n( $trash ) )
                            );
                            ?>
                        </a>
                    <?php } ?>
                </p>

            </div>
            <?php
        }

        /**
         * File-type dropdown beside the stock date filter. The taxonomy is registered
         * with a query var, so WordPress resolves ?ppv_file_type=pdf on its own — no
         * pre_get_posts needed.
         */
        public function file_type_filter($post_type) {
            if ($post_type !== 'ppt_viewer' || !$this->is_active()) {
                return;
            }

            $terms = get_terms(['taxonomy' => 'ppv_file_type', 'hide_empty' => true]);

            if (empty($terms) || is_wp_error($terms)) {
                return;
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading a filter value for redisplay
            $current = isset($_GET['ppv_file_type']) ? sanitize_text_field(wp_unslash($_GET['ppv_file_type'])) : '';
            ?>
            <label class="screen-reader-text" for="bplde-file-type"><?php esc_html_e('Filter by file type', 'document-emberdder'); ?></label>
            <select name="ppv_file_type" id="bplde-file-type">
                <option value=""><?php esc_html_e('All file types', 'document-emberdder'); ?></option>
                <?php foreach ($terms as $term) { ?>
                    <option value="<?php echo esc_attr($term->slug); ?>" <?php selected($current, $term->slug); ?>>
                        <?php echo esc_html(strtoupper($term->name)); ?>
                    </option>
                <?php } ?>
            </select>
            <?php
        }
    }
}
