<?php
/**
 * BPLDE_Preview Class.
 *
 * Live preview of a document's configuration on the classic edit screen.
 *
 * The preview is deliberately a READ-ONLY operation. It never touches postmeta, the leads
 * table or any option: it shims the single `ppv` postmeta read for the duration of one
 * request so the ordinary [doc] shortcode renders the values currently sitting in the
 * metabox form instead of the saved ones.
 *
 * That is why no rendering code had to be duplicated here: the viewer engines and the
 * pdf.js asset decisions all keep running exactly as they do for a visitor.
 *
 * @package DocumentEmbedder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE_Preview')) {
    class BPLDE_Preview {

        /**
         * Query var that turns a front-end request into a preview render.
         */
        const QUERY_VAR = 'bplde_preview';

        /**
         * Nonce action prefix; the document id is appended so a nonce is per-document.
         */
        const NONCE_ACTION = 'bplde_preview_';

        /**
         * Keys whose values are URLs and must not go through sanitize_text_field.
         */
        const URL_KEYS = ['doc', 'lightbox_trigger_image', 'url', 'link_url'];

        private static $_instance = null;

        public static function instance() {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct() {
            add_action('add_meta_boxes_ppt_viewer', [$this, 'add_preview_metabox']);
            add_filter('get_user_option_meta-box-order_ppt_viewer', [$this, 'force_preview_box_order']);
            add_action('admin_footer', [$this, 'print_preview_form']);
            add_action('template_redirect', [$this, 'maybe_render_preview']);
        }

        /* ---------------------------------------------------------------------------------
         * Admin side
         * ------------------------------------------------------------------------------ */

        /**
         * Sit below the CSF configuration box.
         *
         * Context matters more than priority here: WordPress renders the whole 'normal'
         * context before 'advanced', so a box in 'normal' always lands above the CSF metabox
         * whatever its priority. CSF registers at context 'advanced', priority 'default'
         * (vendor/Codestar/classes/metabox-options.class.php), so matching the context and
         * dropping to 'low' is what actually puts this underneath it.
         */
        public function add_preview_metabox($post) {
            add_meta_box(
                'bplde_live_preview',
                __('Live Preview (Click to Show/Hide)', 'document-emberdder'),
                [$this, 'render_metabox'],
                'ppt_viewer',
                'advanced',
                'low'
            );
        }

        /**
         * Keep the preview box under the configuration box for users whose saved metabox order
         * still places it somewhere else.
         *
         * do_meta_boxes() re-registers every id in the saved order at priority 'sorted' in its
         * SAVED context, which overrides wherever the box was registered. A user who used this
         * screen while the box lived in 'normal' therefore keeps getting it above the
         * configuration forever. Dropping our id from the order that is read (nothing is
         * written back, so the user's ordering of every other box is untouched) lets the
         * registration above stand.
         */
        public function force_preview_box_order($order) {
            if (!is_array($order)) {
                return $order;
            }

            foreach ($order as $context => $ids) {
                if (!is_string($ids) || strpos($ids, 'bplde_live_preview') === false) {
                    continue;
                }

                $kept = array_filter(explode(',', $ids), function ($id) {
                    return $id !== 'bplde_live_preview';
                });

                $order[$context] = implode(',', $kept);
            }

            return $order;
        }

        public function render_metabox($post) {
            $devices = [
                'desktop' => __('Desktop', 'document-emberdder'),
                'tablet'  => __('Tablet', 'document-emberdder'),
                'mobile'  => __('Mobile', 'document-emberdder'),
            ];
            ?>
            <div class="bplde-preview" id="bplde-preview">
                <div class="bplde-preview-bar">
                    <span class="bplde-preview-status" aria-live="polite"></span>
                    <div class="bplde-preview-actions">
                        <div class="bplde-preview-devices">
                            <?php foreach ($devices as $device => $label) : ?>
                                <button type="button"
                                        class="bplde-preview-device<?php echo $device === 'desktop' ? ' is-active' : ''; ?>"
                                        data-device="<?php echo esc_attr($device); ?>">
                                    <?php echo esc_html($label); ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                        <button type="button" class="bplde-preview-refresh bplde-preview-device">
                            <?php esc_html_e('Refresh', 'document-emberdder'); ?>
                        </button>
                    </div>
                </div>
                <div class="bplde-preview-stage">
                    <?php // No src: an initial about:blank navigation would race the first POST and win. ?>
                    <iframe id="bplde-preview-frame"
                            name="bplde-preview-frame"
                            title="<?php esc_attr_e('Document live preview', 'document-emberdder'); ?>"></iframe>
                </div>
                <p class="bplde-preview-note">
                    <?php esc_html_e('Unsaved settings are shown here as visitors would see them. Nothing is saved until you press Update.', 'document-emberdder'); ?>
                </p>
            </div>
            <?php
        }

        /**
         * The form that carries the unsaved values to the preview request.
         *
         * Printed on admin_footer, at body level, because metabox markup lives INSIDE
         * form#post — a nested <form> is invalid HTML and browsers drop it, which would take
         * the post form down with it. This form is also the reason form#post is never itself
         * submitted or modified by the preview.
         */
        public function print_preview_form() {
            $screen = get_current_screen();
            if (!$screen || $screen->post_type !== 'ppt_viewer' || $screen->base !== 'post') {
                return;
            }

            global $post;
            $post_id = ($post instanceof WP_Post) ? $post->ID : 0;
            if (!$post_id) {
                return;
            }
            ?>
            <form id="bplde-preview-form"
                  method="post"
                  target="bplde-preview-frame"
                  action="<?php echo esc_url(self::preview_url($post_id)); ?>"
                  style="display:none;"
                  aria-hidden="true"></form>

            <?php
            // Scroll-to-preview button. Printed at body level rather than in the metabox
            // because a position:fixed element is easier to reason about there, and it must not
            // sit inside form#post where a stray submit could be triggered.
            ?>
            <button type="button"
                    id="bplde-preview-jump"
                    class="bplde-preview-jump"
                    title="<?php esc_attr_e('Go to Live Preview', 'document-emberdder'); ?>">
                <span class="bplde-preview-jump-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                         stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </span>
                <span><?php esc_html_e('Live Preview', 'document-emberdder'); ?></span>
            </button>
            <?php
        }

        /**
         * Front-end URL that renders the preview document.
         */
        public static function preview_url($post_id) {
            return add_query_arg(
                [
                    self::QUERY_VAR => 1,
                    'post'          => (int) $post_id,
                    '_wpnonce'      => wp_create_nonce(self::NONCE_ACTION . (int) $post_id),
                ],
                home_url('/')
            );
        }

        /**
         * Origin the preview iframe will post its height from, for the parent's origin check.
         */
        public static function preview_origin() {
            $parts  = wp_parse_url(home_url('/'));
            $scheme = isset($parts['scheme']) ? $parts['scheme'] : 'http';
            $host   = isset($parts['host']) ? $parts['host'] : '';
            $port   = isset($parts['port']) ? ':' . $parts['port'] : '';

            return $host ? $scheme . '://' . $host . $port : '';
        }

        /**
         * Data the preview script needs. Kept here so the enqueue site stays a one-liner.
         */
        public static function script_data() {
            return [
                'origin' => self::preview_origin(),
                'i18n'   => [
                    'updating' => __('Updating preview…', 'document-emberdder'),
                    'ready'    => __('Preview up to date', 'document-emberdder'),
                ],
            ];
        }

        /* ---------------------------------------------------------------------------------
         * Preview render
         * ------------------------------------------------------------------------------ */

        public function maybe_render_preview() {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- the nonce is verified immediately below.
            if (empty($_GET[self::QUERY_VAR])) {
                return;
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- part of the request being verified.
            $post_id = isset($_GET['post']) ? intval($_GET['post']) : 0;
            $nonce   = isset($_GET['_wpnonce']) ? sanitize_text_field(wp_unslash($_GET['_wpnonce'])) : '';

            if (!$post_id || !wp_verify_nonce($nonce, self::NONCE_ACTION . $post_id)) {
                self::render_notice(
                    __('This preview link has expired. Reload the editor to continue previewing.', 'document-emberdder')
                );
            }

            if (get_post_type($post_id) !== 'ppt_viewer' || !current_user_can('edit_post', $post_id)) {
                self::render_notice(
                    __('You are not allowed to preview this document.', 'document-emberdder')
                );
            }

            // Unsaved metabox values, merged over the saved ones so a field that is not in the
            // DOM keeps its stored value.
            // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- nonce verified above, sanitized by self::sanitize_draft().
            $draft = self::sanitize_draft(isset($_POST['ppv']) ? wp_unslash($_POST['ppv']) : []);
            $saved = get_post_meta($post_id, 'ppv', true);
            $saved = is_array($saved) ? $saved : [];
            $merged = array_merge($saved, $draft);

            // A field the form rendered but submitted nothing for was genuinely emptied. Without
            // this, the saved value would survive the merge and the preview would keep showing
            // a setting the user has just cleared.
            foreach (self::rendered_keys() as $key) {
                if (!isset($draft[$key])) {
                    unset($merged[$key]);
                }
            }

            // The whole point of the class: intercept the ONE read every setting flows through
            // (Functions::meta → get_post_meta($id, 'ppv', true)) for this post id and key only.
            // In memory, for this request, removed the moment the markup is captured.
            $shim = function ($value, $object_id, $meta_key) use ($post_id, $merged) {
                if ((int) $object_id === $post_id && $meta_key === 'ppv') {
                    return [$merged];
                }
                return $value;
            };
            add_filter('get_post_metadata', $shim, 10, 3);

            // Render BEFORE wp_head(): the renderer enqueues the block view script and the
            // styles while it runs, and those have to be registered before the head is printed.
            $html = self::render_document($post_id);

            remove_filter('get_post_metadata', $shim, 10);

            self::suppress_admin_bar();

            nocache_headers();
            header('Content-Type: text/html; charset=' . get_option('blog_charset'));
            ?><!doctype html>
            <html <?php language_attributes(); ?>>
            <head>
                <meta charset="<?php bloginfo('charset'); ?>">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="robots" content="noindex,nofollow">
                <?php wp_head(); ?>
                <style>
                    html, body { margin: 0; padding: 0; background: #fff; }
                    body.bplde-preview-document { overflow-x: hidden; }
                </style>
            </head>
            <body class="bplde-preview-document">
                <?php
                // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered block markup, escaped at render time.
                echo $html;
                ?>
                <?php wp_footer(); ?>
                <script>
                    /* Report the rendered height so the editor can size the iframe to its content. */
                    (function () {
                        var origin = <?php echo wp_json_encode(self::preview_origin()); ?>;
                        var last = 0;
                        var send = function () {
                            var height = Math.ceil(document.documentElement.scrollHeight);
                            if (!height || Math.abs(height - last) < 4) { return; }
                            last = height;
                            try {
                                window.parent.postMessage({ type: 'bplde-preview-height', height: height }, origin);
                            } catch (e) {}
                        };
                        window.addEventListener('load', send);
                        [200, 800, 2000, 4000].forEach(function (delay) { setTimeout(send, delay); });
                        if (window.ResizeObserver) {
                            new window.ResizeObserver(send).observe(document.body);
                        }
                    })();
                </script>
            </body>
            </html>
            <?php
            exit;
        }

        /**
         * Render the document exactly as the front end would, but without the shortcode's
         * post-status gate.
         *
         * [doc] refuses to render anything whose status is not publish/private/draft/pending/
         * future — and a document that has never been saved is an 'auto-draft', so going
         * through the shortcode would show the author an empty preview until they published.
         * Skipping that gate is safe here because edit_post was already verified for this
         * user and this post; everything after it (doc_data → get_block_attributes →
         * render_block) is the same code path a visitor gets.
         */
        private static function render_document($post_id) {
            if (class_exists('\BPLDE\Model\Shortcode')) {
                return \BPLDE\Model\Shortcode::instance()->html($post_id);
            }

            return do_shortcode('[doc id="' . $post_id . '"]');
        }

        /**
         * The preview is a front-end request, so the admin bar would otherwise render inside
         * the iframe and push the document down by 32px.
         */
        private static function suppress_admin_bar() {
            $GLOBALS['show_admin_bar'] = false;
            remove_action('wp_footer', 'wp_admin_bar_render', 1000);
            add_action('wp_enqueue_scripts', function () {
                wp_dequeue_style('admin-bar');
                wp_dequeue_script('admin-bar');
            }, 100);
        }

        /**
         * Top-level ppv keys the metabox form rendered, as reported by the preview script.
         *
         * Only used to detect emptied fields, so anything that is not a plain field id is
         * discarded rather than trusted.
         */
        private static function rendered_keys() {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified in the caller.
            $raw = isset($_POST['bplde_rendered_keys']) ? sanitize_text_field(wp_unslash($_POST['bplde_rendered_keys'])) : '';

            if ($raw === '') {
                return [];
            }

            $keys = array_map('trim', explode(',', $raw));

            return array_filter($keys, function ($key) {
                return $key !== '' && preg_match('/^[A-Za-z0-9_-]+$/', $key);
            });
        }

        /**
         * Recursively sanitize the posted draft.
         */
        private static function sanitize_draft($draft) {
            if (!is_array($draft)) {
                return [];
            }

            $clean = [];

            foreach ($draft as $key => $value) {
                if (is_string($key) && !preg_match('/^[A-Za-z0-9_-]+$/', $key)) {
                    continue;
                }

                if (is_array($value)) {
                    $clean[$key] = self::sanitize_draft($value);
                    continue;
                }

                $clean[$key] = in_array($key, self::URL_KEYS, true)
                    ? esc_url_raw((string) $value)
                    : sanitize_text_field((string) $value);
            }

            return $clean;
        }

        /**
         * A readable message inside the iframe rather than a bare wp_die().
         */
        private static function render_notice($message) {
            nocache_headers();
            status_header(403);
            header('Content-Type: text/html; charset=' . get_option('blog_charset'));
            ?><!doctype html>
            <html <?php language_attributes(); ?>>
            <head>
                <meta charset="<?php bloginfo('charset'); ?>">
                <meta name="robots" content="noindex,nofollow">
                <style>
                    body { margin: 0; font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                           color: #4b5563; background: #fff; display: flex; align-items: center;
                           justify-content: center; min-height: 220px; padding: 24px; text-align: center; }
                </style>
            </head>
            <body><p><?php echo esc_html($message); ?></p></body>
            </html>
            <?php
            exit;
        }


    }
}
