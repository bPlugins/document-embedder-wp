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

        /**
         * Neutralises spreadsheet formula injection in exported lead data.
         *
         * Name and email arrive from a public form, and the export is opened by an admin in
         * Excel or Sheets, where a leading =, +, - or @ is evaluated as a formula.
         *
         * @param mixed $value Raw field value.
         * @return mixed
         */
        public static function escape_csv_field($value)
        {
            if (is_string($value) && '' !== $value && in_array($value[0], array('=', '+', '-', '@', "\t", "\r"), true)) {
                return "'" . $value;
            }

            return $value;
        }

        /**
         * Whether the current request is allowed to resolve a document by ID.
         *
         * Every public entry point that turns a request-supplied ID into a file has to ask
         * this first. A download token only proves the plugin issued the URL, never that the
         * holder is entitled to the document, so authorization belongs here, at the point the
         * ID enters, rather than at the point the file is streamed.
         *
         * Three different kinds of ID legitimately arrive here, and the rule differs per kind:
         *
         *  - ppt_viewer / document_library / ordinary posts. These are addressable content,
         *    and their IDs are sequential and guessable, so an unpublished one must never be
         *    resolvable by an anonymous visitor. This is the case the security report covers.
         *  - Attachments. The document-embed block stores the media ID (docId: media.id), so
         *    this is the common path. Judged on the attachment's own status only, deliberately
         *    ignoring the parent's: media uploaded while editing one post is routinely embedded
         *    in another, and the parent is often an unrelated draft. Nothing leaks by allowing
         *    it, because the webserver already serves that exact file at its public upload URL
         *    without consulting WordPress at all.
         *  - The containing page, via the render.php get_the_ID() fallback for older embeds.
         *    Covered by the published-post rule.
         *
         * @param int $document_id Post, attachment, or document ID from the request.
         * @return bool
         */
        public static function can_read_document($document_id)
        {
            $document_id = (int) $document_id;

            if ($document_id <= 0) {
                return false;
            }

            $post = get_post($document_id);

            if (!$post) {
                return false;
            }

            if (current_user_can('read_post', $post->ID)) {
                // Author, editor, or admin of this document: always allowed.
                $allowed = true;
            } elseif ('attachment' === $post->post_type) {
                // Raw post_status on purpose. get_post_status() resolves an attachment's
                // "inherit" to the parent's status, which would deny a file that happens to
                // hang off a draft post but is embedded on a published one -- a routine
                // result of uploading media from inside one post and reusing it in another.
                $allowed = in_array($post->post_status, array('inherit', 'publish'), true);
            } else {
                $allowed = ('publish' === get_post_status($post)) && !post_password_required($post);
            }

            /**
             * Filters whether a document may be resolved by the current request.
             *
             * Escape hatch for sites that deliberately expose an unpublished document to
             * anonymous visitors. Off by default: the safe answer is the default answer.
             *
             * @param bool     $allowed     Whether the request is authorized.
             * @param int      $document_id The requested document ID.
             * @param \WP_Post $post        The resolved post object.
             */
            return (bool) apply_filters('bplde_can_read_document', $allowed, $document_id, $post);
        }

        /**
         * How long an issued download token stays valid.
         *
         * @return int Seconds.
         */
        public static function download_token_ttl()
        {
            /**
             * Filters the download token lifetime.
             *
             * @param int $ttl Seconds. Defaults to 12 hours.
             */
            return (int) apply_filters('bplde_download_token_ttl', 12 * HOUR_IN_SECONDS);
        }

        /**
         * Issues a download token for a document.
         *
         * Returned as "<timestamp>.<hash>" with the timestamp inside the signed material, so
         * the token carries its own expiry and cannot be back-dated. The compound string is
         * passed straight through as the de_nonce query arg by the existing front-end code,
         * which needs no change to keep working.
         *
         * @param int $document_id Document ID the token is issued for.
         * @param int $timestamp   Issue time; defaults to now. Pass the embedded value to verify.
         * @return string
         */
        public static function create_download_token($document_id, $timestamp = 0)
        {
            $timestamp = $timestamp ? (int) $timestamp : time();
            $ip        = self::get_client_ip();

            return $timestamp . '.' . wp_hash((int) $document_id . '|' . $ip . '|' . $timestamp . '|de_download', 'nonce');
        }

        /**
         * Verifies a download token against a document.
         *
         * @param string $token       Token from the request.
         * @param int    $document_id Document ID being requested.
         * @return bool
         */
        public static function verify_download_token($token, $document_id)
        {
            if (!is_string($token) || false === strpos($token, '.')) {
                return false;
            }

            list($timestamp, $hash) = explode('.', $token, 2);

            if ('' === $hash || !ctype_digit($timestamp)) {
                return false;
            }

            $age = time() - (int) $timestamp;

            // Reject expired tokens, and anything dated more than a few minutes ahead of the
            // server clock, which would otherwise extend the window indefinitely.
            if ($age > self::download_token_ttl() || $age < -(5 * MINUTE_IN_SECONDS)) {
                return false;
            }

            return hash_equals(self::create_download_token($document_id, (int) $timestamp), $token);
        }
    }
}
