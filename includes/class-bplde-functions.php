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

                <?php
                $template = self::library_template( $form_data );
                if ( 'grid' !== $template ) :
                    echo self::layout_skeleton_markup( $form_data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup
                else :
                ?>
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
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Fills in a missing document description from its Media Library entry
     * (caption first, then description). Files added from the Media Library
     * were saved with an empty description, so this is where the text people
     * wrote in WordPress comes from. A description set in the library wins.
     *
     * @param array $form_data Saved library settings.
     * @return array
     */
    public static function with_attachment_descriptions( $form_data ) {
        if ( ! is_array( $form_data ) || empty( $form_data['documentLibrary']['docItems'] ) || ! is_array( $form_data['documentLibrary']['docItems'] ) ) {
            return $form_data;
        }

        foreach ( $form_data['documentLibrary']['docItems'] as $i => $doc ) {
            if ( ! is_array( $doc ) || ( isset( $doc['description'] ) && '' !== trim( (string) $doc['description'] ) ) ) {
                continue;
            }

            // Items added by URL carry a timestamp id, not an attachment id.
            $attachment_id = isset( $doc['id'] ) ? absint( $doc['id'] ) : 0;
            if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) ) {
                continue;
            }

            $text = wp_get_attachment_caption( $attachment_id );
            if ( ! $text ) {
                $text = get_post_field( 'post_content', $attachment_id );
            }

            $text = trim( wp_strip_all_tags( (string) $text ) );
            if ( '' !== $text ) {
                $form_data['documentLibrary']['docItems'][ $i ]['description'] = $text;
            }
        }

        return $form_data;
    }

    /**
     * Layouts a Document Library can use. Anything else is treated as Grid.
     *
     * @return string[]
     */
    public static function library_templates() {
        return [ 'grid', 'list' ];
    }

    /**
     * The layout a library renders with. Libraries saved before layouts existed
     * have no template key and render as Grid, as they always did.
     *
     * @param array $form_data Saved library settings.
     * @return string
     */
    public static function library_template( $form_data ) {
        $template = is_array( $form_data ) && isset( $form_data['template'] ) ? $form_data['template'] : 'grid';
        return in_array( $template, self::library_templates(), true ) ? $template : 'grid';
    }

    /**
     * Placeholder for the List layout, shaped like what loads in so the page
     * doesn't jump when the script takes over.
     *
     * @param array $form_data Saved library settings.
     * @return string
     */
    private static function layout_skeleton_markup( $form_data ) {
        $items = isset( $form_data['documentLibrary']['docItems'] ) && is_array( $form_data['documentLibrary']['docItems'] )
            ? count( $form_data['documentLibrary']['docItems'] )
            : 0;
        $rows  = min( $items, 8 );

        if ( $rows < 1 ) {
            return '';
        }

        ob_start();
        ?>
        <div class="bplDl-list">
            <ul class="bplDl-list-items">
                <?php for ( $i = 0; $i < $rows; $i++ ) : ?>
                    <li class="bplDl-list-row">
                        <div class="skeleton" style="width: 36px; height: 44px; border-radius: 5px; flex: none;"></div>
                        <div class="bplDl-list-body">
                            <div class="skeleton" style="height: 18px; width: 50%;"></div>
                            <div class="skeleton" style="height: 14px; width: 30%;"></div>
                        </div>
                        <div class="skeleton" style="height: 32px; width: 120px; border-radius: 6px;"></div>
                    </li>
                <?php endfor; ?>
            </ul>
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

if ( ! function_exists( 'bplde_new_badge' ) ) {
    function bplde_new_badge( $label = 'NEW' ) {
        return '<span class="bplde-new-badge">' . esc_html( $label ) . '</span>';
    }
}

if ( ! function_exists( 'bplde_pdf_only_badge' ) ) {
    function bplde_pdf_only_badge( $label = 'PDF Only' ) {
        return '<span class="bplde-pdf-only-badge">' . esc_html( $label ) . '</span>';
    }
}


