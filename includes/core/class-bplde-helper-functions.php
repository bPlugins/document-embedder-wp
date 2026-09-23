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

        /**
         * Where every "See Pro pricing" link in the admin points.
         *
         * The Help & Demos dashboard carries its own pricing page, so the links stay
         * inside WordPress instead of bouncing through the Freemius screen. It is a
         * HashRouter route, hence the fragment.
         *
         * @return string
         */
        public static function pricing_url()
        {
            $url = admin_url('edit.php?post_type=ppt_viewer&page=bplde-dashboard') . '#/pricing';

            return (string) apply_filters('bplde_pricing_url', $url);
        }

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
                <a href="' . esc_url(self::pricing_url()) . '" class="bplde-panel__cta">' . esc_html__('See Pro pricing', 'document-emberdder') . '</a>
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
         * The per-IP download limit configured for a document.
         *
         * Read through the 'ppv' container on purpose. The metabox that authors this setting
         * runs under the 'ppv' prefix, so every one of its fields lands in that single
         * serialized meta row -- a standalone '_de_download_limit' row has never been written
         * by anything in the plugin, and reading one back always yielded an empty string.
         *
         * @param int $document_id Document ID.
         * @return int Configured limit, or 0 for "No Limit".
         */
        public static function download_limit($document_id)
        {
            return max(0, (int) self::meta((int) $document_id, '_de_download_limit', 0));
        }

        /**
         * How many downloads of a document are already recorded against an IP.
         *
         * @param int         $document_id Document ID.
         * @param string|null $ip          Client IP; defaults to the current request's.
         * @return int
         */
        public static function download_count_for_ip($document_id, $ip = null)
        {
            global $wpdb;

            $ip = (null === $ip) ? self::get_client_ip() : $ip;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table
            return (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d AND ip_address = %s",
                (int) $document_id,
                $ip
            ));
        }

        /**
         * Whether an IP has used up its allowance for a document.
         *
         * This is the question to ask *before* recording a download. Every recorded row counts
         * against the limit and feeds the download counter, so a refusal decided after the
         * insert is a download that never happened but was still charged for.
         *
         * @param int         $document_id Document ID.
         * @param string|null $ip          Client IP; defaults to the current request's.
         * @return bool
         */
        public static function download_limit_reached($document_id, $ip = null)
        {
            $limit = self::download_limit($document_id);

            if ($limit <= 0) {
                return false;
            }

            return self::download_count_for_ip($document_id, $ip) >= $limit;
        }

        /**
         * Backstop for the delivery endpoint: whether an IP has more recorded downloads than
         * its allowance permits.
         *
         * Deliberately looser than download_limit_reached(). By the time a request reaches the
         * delivery route the row for the download in flight has already been written, so an
         * equal count is the last legitimate download rather than an over-run. What actually
         * stops a single issued URL being replayed is spend_download_token(), not this.
         *
         * @param int         $document_id Document ID.
         * @param string|null $ip          Client IP; defaults to the current request's.
         * @return bool
         */
        public static function download_allowance_exceeded($document_id, $ip = null)
        {
            $limit = self::download_limit($document_id);

            if ($limit <= 0) {
                return false;
            }

            return self::download_count_for_ip($document_id, $ip) > $limit;
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
         * How many times one issued download URL may deliver the file.
         *
         * Not 1. This endpoint answers a Range request with the whole body, so a browser
         * resuming an interrupted transfer starts over rather than continuing, and at one
         * delivery per grant a single dropped connection would cost the visitor a download
         * they were entitled to. Two is the smallest number that survives that without
         * turning the URL into an open tap.
         *
         * @return int
         */
        public static function download_token_max_uses()
        {
            /**
             * Filters how many deliveries one issued download URL is good for.
             *
             * @param int $uses Deliveries per grant. Defaults to 2.
             */
            return max(1, (int) apply_filters('bplde_download_token_max_uses', 2));
        }

        /**
         * How long after its first delivery a token may still be re-used.
         *
         * The spare delivery exists to cover a transfer that dropped, which happens within
         * minutes. Past this window the grant is done even if a use is left, so a link cannot
         * sit around for the rest of its 12-hour lifetime holding a second download.
         *
         * @return int Seconds.
         */
        public static function download_token_retry_window()
        {
            /**
             * Filters the window during which a download URL may be re-used.
             *
             * @param int $window Seconds. Defaults to 10 minutes.
             */
            return max(0, (int) apply_filters('bplde_download_token_retry_window', 10 * MINUTE_IN_SECONDS));
        }

        /**
         * Records one delivery against an issued token, and reports whether it was allowed.
         *
         * Without this a signed URL is good for unlimited downloads until it expires: the
         * limit counts rows in the leads table, those rows are written when a URL is minted
         * and never when the file is actually sent, so replaying one URL spends nothing.
         *
         * Call this at the point the response is committed to sending the file, never earlier
         * -- a request that turns out to fail an access check must not burn the visitor's link.
         *
         * @param string $token Verified download token from the request.
         * @return bool Whether this delivery may proceed.
         */
        public static function spend_download_token($token)
        {
            if (!is_string($token) || '' === $token) {
                return false;
            }

            // Keyed on a hash so the token itself is never written to the options table.
            $key   = 'bplde_dl_' . md5($token);
            $state = get_transient($key);
            $now   = time();

            if (!is_array($state) || !isset($state['uses'], $state['first'])) {
                $state = array('uses' => 0, 'first' => $now);
            }

            if ((int) $state['uses'] >= self::download_token_max_uses()) {
                return false;
            }

            if ((int) $state['uses'] > 0 && ($now - (int) $state['first']) > self::download_token_retry_window()) {
                return false;
            }

            $state['uses'] = (int) $state['uses'] + 1;

            // Outlives the token deliberately. If this record expired first, the token would
            // go back to being replayable for whatever is left of its own lifetime.
            set_transient($key, $state, self::download_token_ttl() + HOUR_IN_SECONDS);

            return true;
        }

        /**
         * Issues a download token for a document.
         *
         * Returned as "<timestamp>.<nonce>.<hash>", with both the timestamp and the random
         * nonce inside the signed material. The timestamp makes the token carry its own expiry
         * and stops it being back-dated; the nonce makes each grant a distinct string.
         *
         * That nonce is not decoration. Without it the token is fully determined by
         * (document, IP, second), so two links issued in the same second are byte-identical
         * and per-token delivery accounting silently collapses them into one grant -- which
         * would cap a document at two downloads per second even with the limit set to
         * "No Limit". The token is dot-delimited, so the segment has to stay alphanumeric.
         *
         * The compound string is passed straight through as the de_nonce query arg by the
         * existing front-end code, which needs no change to keep working.
         *
         * @param int    $document_id Document ID the token is issued for.
         * @param int    $timestamp   Issue time; defaults to now. Pass the embedded value to verify.
         * @param string $nonce       Random segment; defaults to a fresh one. Pass the embedded value to verify.
         * @return string
         */
        public static function create_download_token($document_id, $timestamp = 0, $nonce = '')
        {
            $timestamp = $timestamp ? (int) $timestamp : time();
            $nonce     = ('' === $nonce) ? wp_generate_password(12, false, false) : $nonce;
            $ip        = self::get_client_ip();

            $hash = wp_hash((int) $document_id . '|' . $ip . '|' . $timestamp . '|' . $nonce . '|de_download', 'nonce');

            return $timestamp . '.' . $nonce . '.' . $hash;
        }

        /**
         * Re-derives a token in the superseded two-segment format.
         *
         * Kept only so links minted before the nonce was added keep working for the rest of
         * their 12-hour lifetime. The signed material has to stay byte-identical to the old
         * create_download_token() or those links break on upgrade.
         *
         * @param int $document_id Document ID.
         * @param int $timestamp   Issue time embedded in the token.
         * @return string
         */
        private static function create_legacy_download_token($document_id, $timestamp)
        {
            $timestamp = (int) $timestamp;
            $ip        = self::get_client_ip();

            return $timestamp . '.' . wp_hash((int) $document_id . '|' . $ip . '|' . $timestamp . '|de_download', 'nonce');
        }

        /**
         * Whether a token's embedded issue time is inside the accepted window.
         *
         * @param int $timestamp Issue time embedded in the token.
         * @return bool
         */
        private static function download_token_time_valid($timestamp)
        {
            $age = time() - (int) $timestamp;

            // Reject expired tokens, and anything dated more than a few minutes ahead of the
            // server clock, which would otherwise extend the window indefinitely.
            return !($age > self::download_token_ttl() || $age < -(5 * MINUTE_IN_SECONDS));
        }

        /**
         * Verifies a download token against a document.
         *
         * Accepts both the current three-segment format and the superseded two-segment one,
         * so URLs already in flight when this ships stay valid until they expire on their own.
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

            $parts = explode('.', $token);

            // Current format: <timestamp>.<nonce>.<hash>
            if (3 === count($parts)) {
                list($timestamp, $nonce, $hash) = $parts;

                if ('' === $hash || '' === $nonce || !ctype_digit($timestamp) || !ctype_alnum($nonce)) {
                    return false;
                }

                if (!self::download_token_time_valid($timestamp)) {
                    return false;
                }

                return hash_equals(self::create_download_token($document_id, (int) $timestamp, $nonce), $token);
            }

            // Legacy format: <timestamp>.<hash>
            if (2 === count($parts)) {
                list($timestamp, $hash) = $parts;

                if ('' === $hash || !ctype_digit($timestamp)) {
                    return false;
                }

                if (!self::download_token_time_valid($timestamp)) {
                    return false;
                }

                return hash_equals(self::create_legacy_download_token($document_id, (int) $timestamp), $token);
            }

            return false;
        }
    }
}
