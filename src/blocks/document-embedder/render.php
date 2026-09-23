<?php
/**
 * Saved Document — front-end render.
 *
 * `selected` carries a default of 0, so it is always set once the block API has applied
 * defaults; testing isset() alone sent pre-`selected` content down the [doc id=0] path and
 * rendered nothing. Preferring a positive id and only then falling back keeps that older
 * content working.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$bplde_doc_id = isset( $attributes['selected'] ) ? absint( $attributes['selected'] ) : 0;

if ( ! $bplde_doc_id && isset( $attributes['data']['tringle_text'] ) ) {
    $bplde_doc_id = absint( $attributes['data']['tringle_text'] );
}

if ( $bplde_doc_id ) {
    echo do_shortcode( '[doc id=' . $bplde_doc_id . ']' );
}
