<?php
// PHP render callback for bplde/document-embed to output React container

if (!defined('ABSPATH')) {
    exit;
}

(function() use ($attributes) {
    $id = wp_unique_id('bplde-embed-');
    $post_id = isset($attributes['docId']) ? intval($attributes['docId']) : get_the_ID();

    // Extract dimensions for placeholder styling
    $displayDimensions = isset($attributes['displayDimensions']) ? $attributes['displayDimensions'] : [];
    $width = isset($displayDimensions['width']) ? $displayDimensions['width'] : [];
    $height = isset($displayDimensions['height']) ? $displayDimensions['height'] : [];

    $w_d = is_string($width) ? $width : ($width['desktop'] ?? '100%');
    $w_t = is_string($width) ? $width : ($width['tablet'] ?? '100%');
    $w_m = is_string($width) ? $width : ($width['mobile'] ?? '100%');

    $h_d = is_string($height) ? $height : ($height['desktop'] ?? '840px');
    $h_t = is_string($height) ? $height : ($height['tablet'] ?? '700px');
    $h_m = is_string($height) ? $height : ($height['mobile'] ?? '400px');

    // Check limit per IP if set
    $limit_reached = false;
    $download_count = 0;

    $downloadManagement = isset($attributes['downloadManagement']) ? $attributes['downloadManagement'] : [];
    $limit = isset($downloadManagement['_de_download_limit']) ? intval($downloadManagement['_de_download_limit']) : 0;

    if ($post_id) {
        $download_count = (int) get_post_meta($post_id, '_de_download_count', true);
    }

    if ($limit > 0 && $post_id) {
        global $wpdb;
        if (class_exists('\BPLDE\Helper\Functions')) {
            $ip = \BPLDE\Helper\Functions::get_client_ip();
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- querying custom table
            $downloaded_count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}docembedder_leads WHERE document_id = %d AND ip_address = %s",
                $post_id,
                $ip
            ));
            if ($downloaded_count >= $limit) {
                $limit_reached = true;
            }
        }
    }

    $user_data = [
        'isLoggedIn' => is_user_logged_in(),
        'userRoles' => is_user_logged_in() ? (array) wp_get_current_user()->roles : [],
        'limitReached' => $limit_reached,
        'downloadCount' => $download_count
    ];

    // Authoring copy for the empty state (it names the field to fill in). On for the document
    // metabox's live preview only — that request is nonce- and capability-verified in
    // BPLDE_Preview before it ever reaches here, and the capability is re-checked so appending
    // the query var to a public URL changes nothing.
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- cosmetic flag, guarded by the capability check below.
    if (!empty($_GET['bplde_preview']) && current_user_can('edit_posts')) {
        $attributes['_de_preview_editing'] = true;
    }

    // Enqueue frontend scripts and styles registered in block.json
    if (function_exists('enqueue_block_assets')) {
        wp_enqueue_script('wp-element');
    }

    // Load the dFlip library only when the PDF Flipbook/Slider viewer is selected.
    // Keeps the default/custom viewer paths untouched (no extra assets for existing users).
    $de_viewer = isset($attributes['documentSource']['viewer']) ? $attributes['documentSource']['viewer'] : 'default';
    if (in_array($de_viewer, ['flipbook', 'slider'], true) && wp_script_is('bplde-dflip-script', 'registered')) {
        wp_enqueue_script('bplde-dflip-script');
        wp_enqueue_style('bplde-dflip-style');
    }
    ?>
    <style>
        #<?php echo esc_html($id); ?> {
            width: <?php echo esc_html($w_d); ?>;
            height: <?php echo esc_html($h_d); ?>;
        }
        @media (max-width: 991px) {
            #<?php echo esc_html($id); ?> {
                width: <?php echo esc_html($w_t); ?>;
                height: <?php echo esc_html($h_t); ?>;
            }
        }
        @media (max-width: 767px) {
            #<?php echo esc_html($id); ?> {
                width: <?php echo esc_html($w_m); ?>;
                height: <?php echo esc_html($h_m); ?>;
            }
        }
    </style>

    <div class="bplde-document-embed-frontend"
         id="<?php echo esc_attr($id); ?>"
         data-attributes="<?php echo esc_attr(wp_json_encode($attributes)); ?>"
         data-user="<?php echo esc_attr(wp_json_encode($user_data)); ?>"
         data-plugin-url="<?php echo esc_url(BPLDE_PLUGIN_DIR); ?>"
         data-post-id="<?php echo esc_attr($post_id); ?>">
        <div class="bplde-loading-placeholder" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;">
            <p><?php esc_html_e('Loading Viewer...', 'document-emberdder'); ?></p>
        </div>
    </div>
    <?php
})();

