<?php
/**
 * BPLDE Helper Functions Class.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Helper;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Functions')) {
    class Functions
    {

        public static function meta($id, $key, $default = false)
        {
            $meta = get_post_meta($id, 'ppv', true);
            if (isset($meta[$key])) {
                return $meta[$key];
            } else {
                return $default;
            }
        }


        /**
         * The locked-feature panel that closes every Pro-only section of the metabox.
         *
         * Built on the same .bplde-panel surface as the side-column cards, so the whole edit
         * screen speaks one visual language. The section name is what the copy leans on —
         * without it every section would read as the same advert repeated eight times.
         *
         * @param string[] $features Field names this section keeps locked.
         * @param string   $section  Section title, used in the supporting line.
         */
        public static function bplde_pro_feature_list($features, $section = '') {
            $count = count($features);

            $title = sprintf(
                /* translators: %d: number of locked settings in this section. */
                _n(
                    '%d setting this section keeps locked',
                    '%d settings this section keeps locked',
                    $count,
                    'document-emberdder'
                ),
                $count
            );

            $note = $section
                ? sprintf(
                    /* translators: %s: section name, e.g. "Access & Security". */
                    __('%s is available on Document Embedder Pro.', 'document-emberdder'),
                    $section
                )
                : __('These settings are available on Document Embedder Pro.', 'document-emberdder');

            $html = '<div class="bplde-panel">
            <p class="bplde-panel__badge">' . esc_html__('Pro Version', 'document-emberdder') . '</p>
            <h4 class="bplde-panel__title">' . esc_html($title) . '</h4>
            <p class="bplde-panel__note">' . esc_html($note) . '</p>
            <ul class="bplde-panel__list bplde-panel__list--wide">';

            foreach ($features as $feature) {
                $html .= '<li>' . esc_html($feature) . '</li>';
            }

            $html .= '</ul>
            <div class="bplde-panel__foot-row">
                <a href="' . esc_url(admin_url('edit.php?post_type=ppt_viewer&page=document-emberdder-pricing')) . '" class="bplde-panel__cta">' . esc_html__('See Pro pricing', 'document-emberdder') . '</a>
                <p class="bplde-panel__foot">' . esc_html__('14-day refund policy · Trusted by 10,000+ WordPress sites', 'document-emberdder') . '</p>
            </div>
        </div>';

            return array(
                'type' => 'content',
                'content' => $html
            );
        }

        public static function bplde_new_title ($title) {
            return '
                <div class="bplde-new-title">
                    <h4>' . $title . '</h4>
                    <span class="bplde-new-badge">NEW</span>
                </div>
            ';
        }

        public static function get_client_ip()
        {
            $ipaddress = '';
            if (isset($_SERVER['HTTP_CLIENT_IP']) && !empty($_SERVER['HTTP_CLIENT_IP'])) {
                $ipaddress = sanitize_text_field(wp_unslash($_SERVER['HTTP_CLIENT_IP']));
            } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ipaddress = explode(',', sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR'])))[0];
            } elseif (isset($_SERVER['HTTP_X_FORWARDED']) && !empty($_SERVER['HTTP_X_FORWARDED'])) {
                $ipaddress = sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED']));
            } elseif (isset($_SERVER['HTTP_FORWARDED_FOR']) && !empty($_SERVER['HTTP_FORWARDED_FOR'])) {
                $ipaddress = explode(',', sanitize_text_field(wp_unslash($_SERVER['HTTP_FORWARDED_FOR'])))[0];
            } elseif (isset($_SERVER['HTTP_FORWARDED']) && !empty($_SERVER['HTTP_FORWARDED'])) {
                $ipaddress = sanitize_text_field(wp_unslash($_SERVER['HTTP_FORWARDED']));
            } elseif (isset($_SERVER['REMOTE_ADDR']) && !empty($_SERVER['REMOTE_ADDR'])) {
                $ipaddress = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']));
            } else {
                $ipaddress = 'UNKNOWN';
            }

            return trim($ipaddress);
        }
    }
}
