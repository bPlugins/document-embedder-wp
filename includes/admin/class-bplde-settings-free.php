<?php
/**
 * BPLDE_Settings_Free Class.
 *
 * The free Settings screen is the same CodeStar options page the Pro build uses,
 * holding the two settings the free version has (Insights, AI Agent Access). The
 * "free version ends here" hero and the Pro feature cards are printed below it.
 *
 * Both sections write the `_ppt_` option, so the choices survive an upgrade.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Settings_Free')) {
    class BPLDE_Settings_Free {

        const PREFIX = '_ppt_';
        const MENU_SLUG = 'settings';
        const PARENT_SLUG = 'edit.php?post_type=ppt_viewer';
        const BODY_CLASS = 'bplde-settings';

        /** Hook suffix WordPress gives the CodeStar submenu page. */
        const PAGE_HOOK = 'ppt_viewer_page_settings';

        public static function init() {
            if (!class_exists('CSF')) {
                return;
            }

            \CSF::createOptions(self::PREFIX, [
                'menu_title' => __('Settings', 'document-emberdder'),
                'menu_slug' => self::MENU_SLUG,
                'menu_type' => 'submenu',
                'menu_parent' => self::PARENT_SLUG,
                'theme' => 'light',
                'framework_title' => __('Settings', 'document-emberdder'),
                'footer_credit' => __('Thanks for being with bPlugins', 'document-emberdder')
            ]);

            if (class_exists('\BPLDE\Model\Insights')) {
                \CSF::createSection(self::PREFIX, \BPLDE\Model\Insights::settings_section());
            }

            if (class_exists('\BPLDE\Abilities\Abilities', false)) {
                \CSF::createSection(self::PREFIX, \BPLDE\Abilities\Abilities::settings_section());
            }

            add_filter('admin_body_class', ['BPLDE_Settings_Free', 'body_class']);
            add_action('admin_enqueue_scripts', ['BPLDE_Settings_Free', 'enqueue']);
            add_action('csf_options_after', ['BPLDE_Settings_Free', 'render_pro_cards']);
        }

        private static function is_current_screen() {
            $screen = function_exists('get_current_screen') ? get_current_screen() : null;

            return $screen && $screen->id === self::PAGE_HOOK;
        }

        public static function body_class($classes) {
            if (self::is_current_screen()) {
                $classes .= ' ' . self::BODY_CLASS . ' ';
            }

            return $classes;
        }

        public static function enqueue($hook) {
            if ($hook !== self::PAGE_HOOK) {
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
                    'icon' => 'insights',
                    'title' => __('Insights history', 'document-emberdder'),
                    'items' => array(
                        __('Date ranges and a daily chart', 'document-emberdder'),
                        __('Top documents and host pages', 'document-emberdder'),
                        __('Per-document view and CSV export', 'document-emberdder'),
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
                        __('Box embeds', 'document-emberdder'),
                    ),
                ),
                array(
                    'icon' => 'experience',
                    'title' => __('Viewer experience', 'document-emberdder'),
                    'items' => array(
                        __('Toolbar themes, zoom and lightbox', 'document-emberdder'),
                        __('Flipbook hard cover, sound and auto play', 'document-emberdder'),
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
                'insights' => '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
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

        /** Printed after the CodeStar panel; `csf_options_after` fires for every CodeStar options page. */
        public static function render_pro_cards() {
            if (!self::is_current_screen() || !current_user_can('manage_options')) {
                return;
            }

            ?>
            <div class="bplde-settings-wrap">
                <div class="bplde-settings-hero">
                    <div class="bplde-settings-hero__copy">
                        <span class="bplde-settings-hero__badge"><?php esc_html_e('Pro', 'document-emberdder'); ?></span>
                        <h2 class="bplde-settings-hero__title"><?php esc_html_e('The free version ends here.', 'document-emberdder'); ?></h2>
                        <p class="bplde-settings-hero__note"><?php esc_html_e('Document Embedder Pro adds Insights history, lead capture, access control and cloud integrations — everything below is switched on by a licence key.', 'document-emberdder'); ?></p>
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
