<?php
/**
 * BPLDE_Settings_Free Class.
 *
 * In the free build the Settings screen has no fields to save, so instead of a
 * CodeStar options page with Save / Reset buttons that write nothing, it renders
 * a plain page that explains what Pro adds.
 *
 * The Pro build keeps the CodeStar page untouched: Pro stores real credentials
 * under the `_ppt_` option (Google Drive keys, Dropbox app key) which
 * BPLDE_Block reads, and those fields need somewhere to live.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Settings_Free')) {
    class BPLDE_Settings_Free {

        /** Unchanged from the CodeStar page, so every existing link still lands. */
        const MENU_SLUG = 'settings';
        const PARENT_SLUG = 'edit.php?post_type=ppt_viewer';
        const BODY_CLASS = 'bplde-settings';

        /** Page hook returned by add_submenu_page(), used to scope the stylesheet. */
        private static $hook = '';

        public static function init() {
            if (self::use_banner()) {
                add_action('admin_menu', ['BPLDE_Settings_Free', 'add_page']);
                add_filter('admin_body_class', ['BPLDE_Settings_Free', 'body_class']);
                add_action('admin_enqueue_scripts', ['BPLDE_Settings_Free', 'enqueue']);
                return;
            }

            self::register_csf_page();
        }

        /**
         * One line to go back to the CodeStar options page:
         *   add_filter( 'bplde_use_settings_banner', '__return_false' );
         */
        public static function use_banner() {
            $has_pro = defined('BPLDE_HAS_PRO') && BPLDE_HAS_PRO;

            return (bool) apply_filters('bplde_use_settings_banner', !$has_pro);
        }

        /* -------------------------------------------------------------------
           The original CodeStar page, kept verbatim for the Pro build.
           ----------------------------------------------------------------- */

        private static function register_csf_page() {
            if (!class_exists('CSF')) {
                return;
            }

            $prefix = '_ppt_';

            \CSF::createOptions($prefix, [
                'menu_title' => __('Settings', 'document-emberdder'),
                'menu_slug' => self::MENU_SLUG,
                'menu_type' => 'submenu',
                'menu_parent' => self::PARENT_SLUG,
                'theme' => 'light',
                'framework_title' => 'Settings',
                'footer_credit' => 'Thanks for being with bPlugins'
            ]);

            \CSF::createSection($prefix, array(
                'title' => __('Premium Integrations', 'document-emberdder'),
                'fields' => array(
                    \BPLDE\Helper\Functions::bplde_pro_feature_list(array(
                            __('Google Drive API Integration to embed files directly', 'document-emberdder'),
                            __('Dropbox API Integration to embed files directly', 'document-emberdder'),
                            __('Secure Email Gate to Collect Leads before Downloading', 'document-emberdder'),
                            __('Download Access Control by Login Status & User Roles', 'document-emberdder'),
                            __('Dedicated Leads Dashboard & Stats Tracking', 'document-emberdder'),
                        ),
                        __('Premium Integrations', 'document-emberdder'))
                )
            ));
        }

        /* -------------------------------------------------------------------
           Free build
           ----------------------------------------------------------------- */

        public static function add_page() {
            self::$hook = add_submenu_page(
                self::PARENT_SLUG,
                __('Settings', 'document-emberdder'),
                self::menu_title(),
                'manage_options',
                self::MENU_SLUG,
                ['BPLDE_Settings_Free', 'render_page']
            );
        }

        /**
         * Sidebar label with the Pro badge beside it. Styled inline because the
         * sidebar is on every admin screen and this is cheaper than loading a
         * stylesheet everywhere for one chip -- the Help & Demos item already
         * colours itself the same way.
         */
        private static function menu_title() {
            $badge = '<span class="bplde-menu-badge" style="display:inline-block;margin-left:6px;padding:1px 5px;'
                . 'background:#a3e635;color:#1a2e05;font-size:9px;font-weight:700;line-height:1.5;'
                . 'letter-spacing:.06em;text-transform:uppercase;vertical-align:middle;">'
                . esc_html__('Pro', 'document-emberdder') . '</span>';

            return __('Settings', 'document-emberdder') . $badge;
        }

        private static function is_current_screen() {
            $screen = function_exists('get_current_screen') ? get_current_screen() : null;

            return $screen && self::$hook && $screen->id === self::$hook;
        }

        public static function body_class($classes) {
            if (self::is_current_screen()) {
                $classes .= ' ' . self::BODY_CLASS . ' ';
            }

            return $classes;
        }

        public static function enqueue($hook) {
            if ($hook !== self::$hook) {
                return;
            }

            $relative = 'assets/css/admin-settings.css';
            $path = BPLDE_PLUGIN_PATH . $relative;

            wp_enqueue_style(
                'bplde-admin-settings',
                BPLDE_PLUGIN_DIR . $relative,
                array(),
                file_exists($path) ? (string) filemtime($path) : BPLDE_VER
            );
        }

        /**
         * Feature groups shown under the hero. Filterable so the Pro build or a
         * site owner can adjust the copy without touching this file.
         */
        private static function groups() {
            return (array) apply_filters('bplde_settings_feature_groups', array(
                array(
                    'icon' => 'viewers',
                    'title' => __('Three more viewers', 'document-emberdder'),
                    'items' => array(
                        __('Custom PDF engine', 'document-emberdder'),
                        __('Flipbook with page turn', 'document-emberdder'),
                        __('Slider viewer', 'document-emberdder'),
                    ),
                ),
                array(
                    'icon' => 'leads',
                    'title' => __('Capture leads', 'document-emberdder'),
                    'items' => array(
                        __('Email gate before download', 'document-emberdder'),
                        __('Leads dashboard and stats', 'document-emberdder'),
                        __('CSV export', 'document-emberdder'),
                    ),
                ),
                array(
                    'icon' => 'access',
                    'title' => __('Control access', 'document-emberdder'),
                    'items' => array(
                        __('Limit by login status and user role', 'document-emberdder'),
                        __('Print, copy and right-click block', 'document-emberdder'),
                        __('Disable popout to stop direct file theft', 'document-emberdder'),
                    ),
                ),
                array(
                    'icon' => 'cloud',
                    'title' => __('Cloud integrations', 'document-emberdder'),
                    'items' => array(
                        __('Google Drive embeds', 'document-emberdder'),
                        __('Dropbox embeds', 'document-emberdder'),
                        __('No re-uploading files', 'document-emberdder'),
                    ),
                ),
                array(
                    'icon' => 'experience',
                    'title' => __('Viewer experience', 'document-emberdder'),
                    'items' => array(
                        __('Toolbar themes', 'document-emberdder'),
                        __('Zoom and lightbox', 'document-emberdder'),
                        __('Professional loading icon', 'document-emberdder'),
                    ),
                ),
                array(
                    'icon' => 'overlay',
                    'title' => __('Interactive overlays', 'document-emberdder'),
                    'accent' => true,
                    'items' => array(
                        __('Hotspots on any page', 'document-emberdder'),
                        __('Links, notes and buttons', 'document-emberdder'),
                        __('Works in every viewer', 'document-emberdder'),
                    ),
                ),
            ));
        }

        private static function icon($name) {
            $paths = array(
                'viewers' => '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16"/>',
                'leads' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>',
                'access' => '<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
                'cloud' => '<path d="M18 16a4 4 0 0 0-1-7.9A6 6 0 1 0 6 15"/><path d="M12 12v8"/><path d="M9 17l3 3 3-3"/>',
                'experience' => '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18"/>',
                'overlay' => '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
            );

            return isset($paths[$name]) ? $paths[$name] : '';
        }

        /** Shapes allowed inside the inline icons below. */
        private static function icon_html() {
            return array(
                'path' => array('d' => array()),
                'rect' => array('x' => array(), 'y' => array(), 'width' => array(), 'height' => array(), 'rx' => array()),
                'circle' => array('cx' => array(), 'cy' => array(), 'r' => array()),
            );
        }

        public static function render_page() {
            if (!current_user_can('manage_options')) {
                return;
            }

            ?>
            <div class="wrap bplde-settings-wrap">
                <h1 class="screen-reader-text"><?php esc_html_e('Settings', 'document-emberdder'); ?></h1>
                <hr class="wp-header-end">

                <div class="bplde-settings-hero">
                    <div class="bplde-settings-hero__copy">
                        <span class="bplde-settings-hero__badge"><?php esc_html_e('Pro', 'document-emberdder'); ?></span>
                        <h2 class="bplde-settings-hero__title"><?php esc_html_e('The free version ends here.', 'document-emberdder'); ?></h2>
                        <p class="bplde-settings-hero__note"><?php esc_html_e('Document Embedder Pro adds three more viewers, lead capture, access control and cloud integrations — everything on this page is switched on by a licence key.', 'document-emberdder'); ?></p>
                    </div>

                    <div class="bplde-settings-hero__actions">
                        <a class="bplde-settings-cta" href="<?php echo esc_url(\BPLDE\Helper\Functions::pricing_url()); ?>">
                            <?php esc_html_e('See Pro pricing', 'document-emberdder'); ?>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                                <path d="M5 12h14" />
                                <path d="M13 6l6 6-6 6" />
                            </svg>
                        </a>
                        <p class="bplde-settings-hero__trust"><?php esc_html_e('14-day refund policy · trusted by 9,000+ sites', 'document-emberdder'); ?></p>
                    </div>
                </div>

                <div class="bplde-settings-groups">
                    <?php foreach (self::groups() as $group) : ?>
                        <div class="bplde-settings-group">
                            <span class="bplde-settings-group__icon<?php echo empty($group['accent']) ? '' : ' bplde-settings-group__icon--pop'; ?>">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                                    <?php echo wp_kses(self::icon($group['icon']), self::icon_html()); ?>
                                </svg>
                            </span>
                            <h3 class="bplde-settings-group__title"><?php echo esc_html($group['title']); ?></h3>
                            <ul class="bplde-settings-group__list">
                                <?php foreach ($group['items'] as $item) : ?>
                                    <li><?php echo esc_html($item); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php
        }
    }

    add_action('init', ['BPLDE_Settings_Free', 'init'], 5);
}
