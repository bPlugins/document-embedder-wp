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
        if ( empty( $bplde_form_data ) || ! is_array( $bplde_form_data ) ) {
            $bplde_form_data = [];
        }

        $bplde_form_data = BPLDE_Functions::with_attachment_descriptions( $bplde_form_data );

        // [document_library id="5" template="list"] shows the library in another layout on this page only.
        $bplde_template_override = isset( $attributes['template'] ) ? sanitize_key( $attributes['template'] ) : '';
        if ( in_array( $bplde_template_override, BPLDE_Functions::library_templates(), true ) ) {
            $bplde_form_data['template'] = $bplde_template_override;
        }

        // Item URLs become links, previews and a programmatic download click, so a script URL
        // stored before the save handler checked them is dropped here.
        foreach ( [ 'docItems', 'docitems' ] as $bplde_items_key ) {
            if ( empty( $bplde_form_data['documentLibrary'][ $bplde_items_key ] ) || ! is_array( $bplde_form_data['documentLibrary'][ $bplde_items_key ] ) ) {
                continue;
            }
            foreach ( $bplde_form_data['documentLibrary'][ $bplde_items_key ] as $bplde_i => $bplde_item ) {
                if ( is_array( $bplde_item ) && isset( $bplde_item['url'] ) ) {
                    $bplde_form_data['documentLibrary'][ $bplde_items_key ][ $bplde_i ]['url'] = \BPLDE\Helper\Functions::safe_doc_url( $bplde_item['url'] );
                }
            }
        }

        // Document Insights: library downloads are direct links, so each item's download
        // control carries a signed key for the browser to report against.
        if ( class_exists( '\BPLDE\Model\Insights' ) ) {
            foreach ( [ 'docItems', 'docitems' ] as $bplde_items_key ) {
                if ( empty( $bplde_form_data['documentLibrary'][ $bplde_items_key ] ) || ! is_array( $bplde_form_data['documentLibrary'][ $bplde_items_key ] ) ) {
                    continue;
                }
                foreach ( $bplde_form_data['documentLibrary'][ $bplde_items_key ] as $bplde_i => $bplde_item ) {
                    $bplde_insights = ( is_array( $bplde_item ) && ! empty( $bplde_item['url'] ) )
                        ? \BPLDE\Model\Insights::markup( \BPLDE\Model\Insights::doc_key( $bplde_item['url'] ) )
                        : [];
                    if ( $bplde_insights ) {
                        $bplde_form_data['documentLibrary'][ $bplde_items_key ][ $bplde_i ]['insights'] = $bplde_insights;
                    }
                }
            }
        }
    }
}

?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WP core function ?> id='<?php echo esc_attr( $bplde_library_block_id ); ?>' data-post-data='<?php echo esc_attr( wp_json_encode( $bplde_form_data ) ); ?>'>
    <?php echo bplde_render_skeleton_markup( $bplde_form_data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- plugin function returns safe HTML ?>
</div>