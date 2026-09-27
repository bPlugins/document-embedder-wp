<?php
/**
 * BPLDE_List_Screen class.
 *
 * Dresses the plugin's list tables in the same language as the document editor:
 * an action bar carrying the title, search and Add New, three totals above the
 * table, and a file-type filter beside the stock date and bulk-action controls.
 *
 * One class serves both list screens. Everything that differs between Documents
 * and Document Libraries is copy, so it lives in the screens() map below rather
 * than in a second class; the rendering is shared.
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

        /** Totals are read by both the body class and the header, once per type. */
        private $totals = [];

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
         * The two screens this dresses, and everything that differs between them.
         *
         * 'query_vars' are the request keys that mean "the user narrowed the view",
         * so an empty result is a filtered one rather than an empty library.
         */
        private static function screens() {
            return [
                'ppt_viewer' => [
                    'tiles'        => true,
                    'title'        => __('All Documents', 'document-emberdder'),
                    'search'       => __('Search documents', 'document-emberdder'),
                    'new'          => __('Add New Document', 'document-emberdder'),
                    'query_vars'   => ['s', 'ppv_file_type', 'ppv_document_tags', 'm', 'author', 'post_status'],
                    'empty_icon'   => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 12v6"/><path d="M9 15h6"/>',
                    'empty_title'  => __('Add your first document', 'document-emberdder'),
                    'empty_note'   => __('Upload a PDF, Word file, spreadsheet or slide deck — then paste its shortcode wherever you want it to appear.', 'document-emberdder'),
                    'chips_label'  => __('Supported', 'document-emberdder'),
                    // The list the metabox advertises, so the two never drift apart.
                    'chips'        => ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT', 'RTF', 'CSV', 'ODT', 'ODS', 'ODP'],
                    'empty_foot'   => __('Works with Elementor, Divi, Bricks, WPBakery, Beaver Builder, Oxygen and Breakdance.', 'document-emberdder'),
                    'steps'        => [
                        [
                            'title' => __('Upload or link a file', 'document-emberdder'),
                            'note'  => __('Pick one from the Media Library, or paste a document URL.', 'document-emberdder'),
                        ],
                        [
                            'title' => __('Copy the shortcode', 'document-emberdder'),
                            'note'  => __('Every document gets one, shown right under its title.', 'document-emberdder'),
                        ],
                        [
                            'title' => __('Paste it anywhere', 'document-emberdder'),
                            'note'  => __('Posts, pages, widgets, and every major page builder.', 'document-emberdder'),
                        ],
                    ],
                ],

                'document_library' => [
                    // No totals row: the only number worth stating is how many libraries
                    // there are, and the table already says that.
                    'tiles'        => false,
                    'title'        => __('Document Libraries', 'document-emberdder'),
                    'search'       => __('Search libraries', 'document-emberdder'),
                    'new'          => __('Add New Library', 'document-emberdder'),
                    'query_vars'   => ['s', 'm', 'author', 'post_status'],
                    'empty_icon'   => '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18"/><path d="M9 21V9"/>',
                    'empty_title'  => __('Build your first library', 'document-emberdder'),
                    'empty_note'   => __('A library puts several documents on one page as a searchable, filterable grid or table — one shortcode instead of many.', 'document-emberdder'),
                    'chips_label'  => __('Layouts', 'document-emberdder'),
                    'chips'        => ['GRID', 'LIST', 'TABLE'],
                    'empty_foot'   => __('Libraries draw from the documents you have already added.', 'document-emberdder'),
                    'steps'        => [
                        [
                            'title' => __('Add some documents first', 'document-emberdder'),
                            'note'  => __('A library lists documents from your existing library.', 'document-emberdder'),
                        ],
                        [
                            'title' => __('Choose a layout', 'document-emberdder'),
                            'note'  => __('Pick grid, list or table, and what each row shows.', 'document-emberdder'),
                        ],
                        [
                            'title' => __('Paste the shortcode', 'document-emberdder'),
                            'note'  => __('One shortcode renders the whole collection.', 'document-emberdder'),
                        ],
                    ],
                ],
            ];
        }

        /**
         * The post type of the list screen being viewed, or false.
         *
         * Returning false from the filter leaves the stock list screen with its own
         * heading and search.
         */
        private function active_type() {
            if (!function_exists('get_current_screen')) {
                return false;
            }

            $screen = get_current_screen();

            if (!$screen || $screen->base !== 'edit' || !isset(self::screens()[$screen->post_type])) {
                return false;
            }

            /**
             * Filters whether the redesigned list screen is used.
             *
             * @param bool   $enabled   Default true.
             * @param string $post_type The list screen being rendered.
             */
            return apply_filters('bplde_use_list_layout', true, $screen->post_type) ? $screen->post_type : false;
        }

        public function body_class($classes) {
            $type = $this->active_type();

            if (!$type) {
                return $classes;
            }

            $classes .= ' ' . self::BODY_CLASS . ' ' . self::BODY_CLASS . '-' . str_replace('_', '-', $type) . ' ';

            if ($this->is_empty($type)) {
                $classes .= 'bplde-list-empty ';
            }

            return $classes;
        }

        public function enqueue() {
            if (!$this->active_type()) {
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

        /** Published-ish posts of a type, the number the screen calls its own. */
        private static function post_count($type) {
            $counts = wp_count_posts($type);
            $total  = 0;

            foreach (['publish', 'future', 'draft', 'pending', 'private'] as $status) {
                $total += isset($counts->$status) ? (int) $counts->$status : 0;
            }

            return $total;
        }

        /**
         * The three numbers above the table. Only the document screen shows them, so
         * this runs its aggregate query only when render_header() asks for it.
         */
        private function totals() {
            if (isset($this->totals['ppt_viewer'])) {
                return $this->totals['ppt_viewer'];
            }

            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one aggregate per screen
            $downloads = (int) $wpdb->get_var(
                "SELECT SUM(pm.meta_value)
                 FROM {$wpdb->postmeta} pm
                 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
                 WHERE pm.meta_key = '_de_download_count' AND p.post_type = 'ppt_viewer'"
            );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table
            $leads = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads");

            $this->totals['ppt_viewer'] = [
                ['value' => self::post_count('ppt_viewer'), 'label' => __('Documents', 'document-emberdder'), 'tone' => 'accent', 'icon' => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'],
                ['value' => $downloads, 'label' => __('Downloads', 'document-emberdder'), 'tone' => 'accent', 'icon' => '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>'],
                ['value' => $leads, 'label' => __('Download leads', 'document-emberdder'), 'tone' => 'pop', 'icon' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>'],
            ];

            return $this->totals['ppt_viewer'];
        }

        /**
         * True only when the screen is genuinely empty — not when a search or a filter
         * happens to match nothing, and not while the Trash view is open. Showing
         * "add your first document" to someone who just searched for "invoice" would be
         * both wrong and a dead end.
         */
        private function is_empty($type) {
            $empty = (self::post_count($type) === 0);

            if ($empty) {
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading filter state
                $query = $_GET;

                foreach (self::screens()[$type]['query_vars'] as $key) {
                    if (!empty($query[$key]) && $query[$key] !== 'all') {
                        $empty = false;
                        break;
                    }
                }
            }

            /**
             * Filters whether the list screen shows its empty state.
             *
             * @param bool   $empty True when the screen is empty and unfiltered.
             * @param string $type  The post type being listed.
             */
            return (bool) apply_filters('bplde_list_is_empty', $empty, $type);
        }

        /** The 24×24 stroked icon every tile, hero and button in here uses. */
        private static function icon($paths, $size = 19, $width = '1.7') {
            printf(
                '<svg width="%1$s" height="%1$s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="%2$s"'
                . ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%3$s</svg>',
                esc_attr($size),
                esc_attr($width),
                wp_kses($paths, [
                    'path'   => ['d' => []],
                    'circle' => ['cx' => [], 'cy' => [], 'r' => []],
                    'rect'   => ['x' => [], 'y' => [], 'width' => [], 'height' => [], 'rx' => []],
                ])
            );
        }

        /**
         * The action bar and the totals.
         *
         * admin_notices prints inside #wpbody-content, above .wrap, which is where this
         * belongs. The search is its own GET form rather than a field in #posts-filter,
         * because that form lives further down the page than this bar does.
         */
        public function render_header() {
            $type = $this->active_type();

            if (!$type) {
                return;
            }

            $screen = self::screens()[$type];

            if ($this->is_empty($type)) {
                $this->render_empty_state($type, $screen);
                return;
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading a search term for redisplay
            $search = isset($_GET['s']) ? sanitize_text_field(wp_unslash($_GET['s'])) : '';
            ?>
            <div class="bplde-list-top">
                <div class="bplde-list-top__id">
                    <span class="bplde-list-top__eyebrow"><?php esc_html_e('Document Embedder', 'document-emberdder'); ?></span>
                    <h1 class="bplde-list-top__title"><?php echo esc_html($screen['title']); ?></h1>
                </div>

                <form class="bplde-list-search" method="get" action="<?php echo esc_url(admin_url('edit.php')); ?>" role="search">
                    <input type="hidden" name="post_type" value="<?php echo esc_attr($type); ?>">
                    <label class="screen-reader-text" for="bplde-list-search-input"><?php echo esc_html($screen['search']); ?></label>
                    <?php self::icon('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', 16, '1.8'); ?>
                    <input type="search" id="bplde-list-search-input" name="s" value="<?php echo esc_attr($search); ?>"
                           placeholder="<?php echo esc_attr($screen['search']); ?>">
                </form>

                <a class="bplde-list-top__new" href="<?php echo esc_url(admin_url('post-new.php?post_type=' . $type)); ?>">
                    <?php self::icon('<path d="M12 5v14"/><path d="M5 12h14"/>', 16, '2.2'); ?>
                    <?php echo esc_html($screen['new']); ?>
                </a>
            </div>

            <?php if ($screen['tiles']) { ?>
            <div class="bplde-list-tiles">
                <?php foreach ($this->totals() as $tile) { ?>
                    <div class="bplde-list-tile">
                        <span class="bplde-list-tile__icon bplde-list-tile__icon--<?php echo esc_attr($tile['tone']); ?>">
                            <?php self::icon($tile['icon']); ?>
                        </span>
                        <span>
                            <span class="bplde-list-tile__value"><?php echo esc_html(number_format_i18n($tile['value'])); ?></span>
                            <span class="bplde-list-tile__label"><?php echo esc_html($tile['label']); ?></span>
                        </span>
                    </div>
                <?php } ?>
            </div>
            <?php } ?>
            <?php
        }

        /**
         * The whole screen when there is nothing in it yet: one card with the single
         * action worth taking. The stylesheet hides the views, toolbar and table, so
         * this carries the page's only H1.
         *
         * The Trash link stays because trashed posts are still reachable content;
         * without it, hiding the status views would strand them.
         */
        private function render_empty_state($type, $screen) {
            $counts = wp_count_posts($type);
            $trash  = isset($counts->trash) ? (int) $counts->trash : 0;

            $help_url = admin_url('edit.php?post_type=ppt_viewer&page=bplde-dashboard');
            $sibling  = ($type === 'ppt_viewer')
                ? ['url' => admin_url('edit.php?post_type=document_library'), 'label' => __('Document Library', 'document-emberdder')]
                : ['url' => admin_url('edit.php?post_type=ppt_viewer'), 'label' => __('All Documents', 'document-emberdder')];
            ?>
            <div class="bplde-empty">

                <div class="bplde-empty__hero">
                    <span class="bplde-empty__icon" aria-hidden="true">
                        <?php self::icon($screen['empty_icon'], 34, '1.5'); ?>
                    </span>

                    <h1 class="bplde-empty__title"><?php echo esc_html($screen['empty_title']); ?></h1>

                    <p class="bplde-empty__note"><?php echo esc_html($screen['empty_note']); ?></p>

                    <a class="bplde-empty__cta" href="<?php echo esc_url(admin_url('post-new.php?post_type=' . $type)); ?>">
                        <?php self::icon('<path d="M12 5v14"/><path d="M5 12h14"/>', 17, '2.2'); ?>
                        <?php echo esc_html($screen['new']); ?>
                    </a>

                    <p class="bplde-empty__formats">
                        <span class="bplde-empty__formats-label"><?php echo esc_html($screen['chips_label']); ?></span>
                        <?php foreach ($screen['chips'] as $chip) { ?>
                            <span class="bplde-empty__format"><?php echo esc_html($chip); ?></span>
                        <?php } ?>
                    </p>
                </div>

                <ol class="bplde-empty__steps">
                    <?php foreach ($screen['steps'] as $i => $step) { ?>
                        <li class="bplde-empty__step">
                            <span class="bplde-empty__step-n"><?php echo esc_html(number_format_i18n($i + 1)); ?></span>
                            <span class="bplde-empty__step-title"><?php echo esc_html($step['title']); ?></span>
                            <span class="bplde-empty__step-note"><?php echo esc_html($step['note']); ?></span>
                        </li>
                    <?php } ?>
                </ol>

                <p class="bplde-empty__foot">
                    <?php echo esc_html($screen['empty_foot']); ?>
                    <a href="<?php echo esc_url($help_url); ?>"><?php esc_html_e('Help &amp; demos', 'document-emberdder'); ?></a>
                    <span aria-hidden="true">·</span>
                    <a href="<?php echo esc_url($sibling['url']); ?>"><?php echo esc_html($sibling['label']); ?></a>
                    <?php if ($trash) { ?>
                        <span aria-hidden="true">·</span>
                        <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . $type . '&post_status=trash')); ?>">
                            <?php
                            printf(
                                /* translators: %s: number of items in the trash. */
                                esc_html__('Trash (%s)', 'document-emberdder'),
                                esc_html(number_format_i18n($trash))
                            );
                            ?>
                        </a>
                    <?php } ?>
                </p>

            </div>
            <?php
        }

        /* -------------------------------------------------------------------
           Shared list-table cells. Both post types render the same shortcode
           box and the same status + date pair, so the markup lives here once.
           ----------------------------------------------------------------- */

        /**
         * The copy-to-clipboard shortcode box. The .bplde_front_shortcode wrapper and
         * its input are what assets/js/script.js binds the copy handler to, so the
         * structure is fixed even though the styling is not.
         *
         * @param string $shortcode Full shortcode, e.g. [doc id=12].
         */
        public static function shortcode_cell($shortcode) {
            echo '<div class="bplde_front_shortcode"><input readonly value="' . esc_attr($shortcode) . '">'
                . '<span class="htooltip">' . esc_html__('Copy To Clipboard', 'document-emberdder') . '</span></div>';
        }

        /**
         * Post states as chips.
         *
         * _post_states() joins several states with a comma placed INSIDE each span, so
         * styling them as chips puts the separator inside the chip ("Draft,"). Collapsing
         * them into a single entry of our own markup means core emits one span with no
         * separator at all.
         *
         * @param array  $states   States as core collected them.
         * @param string $warn_key Optional state to mark as a warning rather than neutral.
         */
        public static function state_chips($states, $warn_key = '') {
            if (empty($states)) {
                return $states;
            }

            $chips = '';

            foreach ($states as $key => $label) {
                $tone = ($warn_key && $key === $warn_key) ? ' bplde-state--warn' : '';
                $chips .= '<span class="bplde-state' . $tone . '">'
                    . esc_html(wp_strip_all_tags($label)) . '</span>';
            }

            return ['bplde_states' => $chips];
        }

        /** Post status as a dot-and-label pill, with the date beneath it. */
        public static function status_date_cell($post_id) {
            $status = get_post_status($post_id);
            $labels = [
                'publish' => __('Published', 'document-emberdder'),
                'future'  => __('Scheduled', 'document-emberdder'),
                'draft'   => __('Draft', 'document-emberdder'),
                'pending' => __('Pending', 'document-emberdder'),
                'private' => __('Private', 'document-emberdder'),
            ];
            $label = isset($labels[$status]) ? $labels[$status] : ucfirst($status);

            echo '<span class="bplde-status bplde-status--' . esc_attr($status) . '">'
                . '<span class="bplde-status__dot" aria-hidden="true"></span>' . esc_html($label) . '</span>'
                . '<span class="bplde-date">' . esc_html(get_the_time(get_option('date_format'), $post_id)) . '</span>';
        }

        /**
         * File-type dropdown beside the stock date filter. The taxonomy is registered
         * with a query var, so WordPress resolves ?ppv_file_type=pdf on its own — no
         * pre_get_posts needed. Documents only; libraries have no file of their own.
         */
        public function file_type_filter($post_type) {
            if ($post_type !== 'ppt_viewer' || $this->active_type() !== 'ppt_viewer') {
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
