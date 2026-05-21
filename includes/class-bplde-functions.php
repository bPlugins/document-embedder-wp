<?php
/**
 * BPLDE Utility Functions Class.
 *
 * @package DocumentEmbedder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class BPLDE_Functions {

    /**
     * Renders the skeleton markup for the Document Library.
     *
     * @param array $form_data Form settings and data.
     * @return string Rendered HTML.
     */
    public static function render_skeleton_markup( $form_data ) {
        ob_start();
        ?>
        <div class="bplDl-container">
            <!-- Header Skeleton -->
            <?php if ( isset( $form_data['header']['isDisplayHeader'] ) && $form_data['header']['isDisplayHeader'] ) : ?>
                <div class="bplDl-header" style="background: white; border: 1px solid #efefef; border-radius: 12px;">
                    <div class="skeleton bplDl-title" style="height: 20px; width: 30%;"></div>
                    <div class="skeleton bplDl-subtitle" style="height: 20px; margin-top: 10px; width: 40%;"></div>
                </div>
            <?php endif; ?>

            <div class="bplDl-content">
                <!-- Toolbar Skeleton -->
                <?php if ( isset( $form_data['documentLibrary']['toolbarBox']['isDisplayToolbar'] ) && $form_data['documentLibrary']['toolbarBox']['isDisplayToolbar'] ) : ?>
                    <div class="bplDl-toolbar" style="border: 1px solid #efefef; border-radius: 12px;">
                        <?php if ( isset( $form_data['documentLibrary']['toolbarBox']['isDisplaySearchBox'] ) && $form_data['documentLibrary']['toolbarBox']['isDisplaySearchBox'] ) : ?>
                            <div class="bplDl-search">
                                <div class="skeleton bplDl-search-icon"></div>
                                <div class="skeleton bplDl-search-input"></div>
                            </div>
                        <?php endif; ?>
                        <?php if ( isset( $form_data['documentLibrary']['toolbarBox']['isDisplayFilterType'] ) && $form_data['documentLibrary']['toolbarBox']['isDisplayFilterType'] ) : ?>
                            <div class="skeleton bplDl-select"></div>
                        <?php endif; ?>
                        <?php if ( isset( $form_data['documentLibrary']['toolbarBox']['isDisplaySortBy'] ) && $form_data['documentLibrary']['toolbarBox']['isDisplaySortBy'] ) : ?>
                            <div class="skeleton bplDl-select-sort"></div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <!-- Document Grid Skeleton -->
                <div class="bplDl-grid" style="grid-template-columns: repeat(<?php echo esc_attr( isset( $form_data['documentLibrary']['docsViewPerRow'] ) ? $form_data['documentLibrary']['docsViewPerRow'] : 3 ); ?> , minmax(0, 1fr));">
                    <?php
                    $items_count = isset( $form_data['documentLibrary']['docItems'] ) && is_array( $form_data['documentLibrary']['docItems'] ) ? count( $form_data['documentLibrary']['docItems'] ) : 0;
                    for ( $i = 0; $i < $items_count; $i++ ) : ?>
                        <div class="bplDl-card" style="border: 1px solid #efefef; border-radius: 8px;">
                            <?php if ( ! empty( $form_data['documentLibrary']['documentBox']['options']['displayIcon'] ) ) : ?>
                                <div class="bplDl-card-top">
                                    <span class="skeleton bplDl-icon"></span>
                                </div>
                            <?php endif; ?>
                            <div class="skeleton bplDl-name" style="height: 20px;"></div>
                            <?php if ( ! empty( $form_data['documentLibrary']['documentBox']['options']['displaySize'] ) ) : ?>
                                <div class="skeleton bplDl-size" style="height: 20px; width: 40%;"></div>
                            <?php endif; ?>
                            <?php if ( ! empty( $form_data['documentLibrary']['documentBox']['options']['displayDate'] ) ) : ?>
                                <div class="skeleton bplDl-meta" style="height: 20px; width: 40%;"></div>
                            <?php endif; ?>

                            <div class="bplDl-actions">
                                <?php if ( ! empty( $form_data['documentLibrary']['documentBox']['viewButton']['isDisplay'] ) ) : ?>
                                    <div class="skeleton bplDl-btn bplDl-view-btn"></div>
                                <?php endif; ?>
                                <?php if ( ! empty( $form_data['documentLibrary']['documentBox']['downloadButton']['isDisplay'] ) ) : ?>
                                    <div class="skeleton bplDl-btn bplDl-download-btn"></div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

/**
 * Backwards compatibility global function wrapper.
 */
if ( ! function_exists( 'bplde_render_skeleton_markup' ) ) {
    function bplde_render_skeleton_markup( $form_data ) {
        return BPLDE_Functions::render_skeleton_markup( $form_data );
    }
}

if ( ! function_exists( 'render_skeleton_markup' ) ) {
    // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedFunctionFound -- backward compatibility global function
    function render_skeleton_markup( $form_data ) {
        return BPLDE_Functions::render_skeleton_markup( $form_data );
    }
}


