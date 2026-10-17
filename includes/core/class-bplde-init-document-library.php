<?php
/**
 * BPLDE Document Library Initialization Class.
 *
 * @package DocumentEmbedder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'BPLDE_Document_Library' ) ) {
    class BPLDE_Document_Library {
        
        public function __construct() {
            add_action( 'plugins_loaded', [$this, 'load_dependencies'] );
            add_shortcode( 'document_library', [$this, 'bplde_document_library_shortcode'] );
        }

        public function load_dependencies() {
            class_exists( '\BPLDE_Document_Library_CPT' );
        }

        public function bplde_document_library_shortcode( $atts ) {
            $atts = shortcode_atts( ['id' => 0], $atts );
            $id   = (int) $atts['id'];

            $post = get_post( $id );

            if ( ! $post || $post->post_type !== 'document_library' ) {
                return '<p>Document Library not found.</p>';
            }

            $block = [
                'blockName'    => 'bpldl/document-library', 
                'attrs'        => ['selectedPostId' => $id],
                'innerBlocks'  => [],
                'innerHTML'    => '',
                'innerContent' => [],
            ];
            
            return render_block( $block );
        }
    }
}
