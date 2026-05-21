<?php
/**
 * BPLDE DefaultArgs Helper Class.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Helper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'DefaultArgs' ) ) {
    class DefaultArgs {

        public static function parseArgs( $data ) {
            $default = self::doc();
            $data    = wp_parse_args( $data, $default );
            return $data;
        }

        public static function doc() {
            return [
                'width'              => '100%',
                'height'             => '600px',
                'width_tablet'       => '',
                'width_mobile'       => '',
                'height_tablet'      => '',
                'height_mobile'      => '',
                'doc'                => '',
                'showName'           => true,
                'download'           => true,
                'downloadButtonText' => 'Download File',
                'googleDrive'        => false,
                'disablePopout'      => false,
            ];
        }
    }
}
