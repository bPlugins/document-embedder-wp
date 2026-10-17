<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$bplde_library_block_id = wp_unique_id( 'bpldlDocumentLibrary-' );

$bplde_form_data = null;

if ( ! empty( $attributes['selectedPostId'] ) ) {
    $post_id = (int) $attributes['selectedPostId'];

    if ( get_post_type( $post_id ) === 'document_library' ) {
        $bplde_form_data = get_post_meta( $post_id, 'bplde_settings', true );
        if ( empty( $bplde_form_data ) ) {
            $bplde_form_data = [];
        }
        // Libraries saved before 2.4.1 may still hold script URLs.
        if ( class_exists( '\BPLDE\Helper\Functions' ) ) {
            $bplde_form_data = \BPLDE\Helper\Functions::strip_unsafe_urls( $bplde_form_data, [ 'url' ] );
        }
    }
}

?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WP core function ?> id='<?php echo esc_attr( $bplde_library_block_id ); ?>' data-post-data='<?php echo esc_attr( wp_json_encode( $bplde_form_data ) ); ?>'>
    <?php echo bplde_render_skeleton_markup( $bplde_form_data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- plugin function returns safe HTML ?>
</div>