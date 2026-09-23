/**
 * Saved Document — editor view.
 *
 * The preview is the plugin's own renderer, loaded from the same nonce-guarded
 * preview route the document edit screen uses, so the block shows what a visitor
 * gets: the selected viewer engine, the toolbar and the saved dimensions. The
 * route reports its rendered height back over postMessage, which is what sizes
 * the frame here.
 */

import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import { Placeholder, Disabled, Spinner, ToolbarGroup, ToolbarButton, Button, Notice } from '@wordpress/components';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import DocumentSelect from './DocumentSelect';
import Settings from './settings';

const DOC_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const MIN_HEIGHT = 240;
const MAX_HEIGHT = 1400;

const Edit = ({ attributes, setAttributes }) => {
    const { selected, data: legacy } = attributes;

    // Content saved before the block stored the id in `selected` kept it here.
    const docId = selected || parseInt(legacy?.tringle_text, 10) || 0;

    const [isPicking, setIsPicking] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [height, setHeight] = useState(MIN_HEIGHT);
    const frameRef = useRef(null);

    // Carry a legacy id forward once, so render.php and the sidebar agree on one source.
    useEffect(() => {
        if (!selected && docId) {
            setAttributes({ selected: docId });
        }
    }, []);

    const selectDocument = useCallback(
        (next) => {
            setAttributes({ selected: next });
            setIsPicking(false);
        },
        [setAttributes]
    );

    useEffect(() => {
        if (!docId) {
            setPreviewUrl('');
            setError('');
            return undefined;
        }

        let cancelled = false;
        setPreviewUrl('');
        setError('');
        setHeight(MIN_HEIGHT);

        apiFetch({ path: `/docembedder/v1/preview-url/${docId}` })
            .then((response) => {
                if (!cancelled) {
                    setPreviewUrl(response?.url || '');
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.message || __('This document could not be previewed.', 'document-emberdder'));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [docId]);

    // The preview page posts its rendered height; match on the frame that sent it so
    // several blocks on one page do not resize each other.
    useEffect(() => {
        const onMessage = (event) => {
            if (!frameRef.current || event.source !== frameRef.current.contentWindow) {
                return;
            }
            if (event.data?.type !== 'bplde-preview-height') {
                return;
            }

            const reported = parseInt(event.data.height, 10);
            if (reported > 0) {
                setHeight(Math.min(Math.max(reported, MIN_HEIGHT), MAX_HEIGHT));
            }
        };

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    const blockProps = useBlockProps({ className: 'bplde-saved-doc' });

    if (!docId || isPicking) {
        return (
            <div {...blockProps}>
                <Placeholder
                    icon={DOC_ICON}
                    label={__('Saved Document', 'document-emberdder')}
                    instructions={__(
                        'Choose a document you already created. Its viewer, toolbar and size settings come with it.',
                        'document-emberdder'
                    )}
                    className="bplde-saved-doc__placeholder"
                >
                    <DocumentSelect
                        className="bplde-saved-doc__picker"
                        value={docId}
                        onChange={selectDocument}
                        label={null}
                    />

                    <div className="bplde-saved-doc__placeholder-actions">
                        <Button
                            variant="link"
                            href="post-new.php?post_type=ppt_viewer"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {__('Create a new document', 'document-emberdder')}
                        </Button>

                        {isPicking && !!docId && (
                            <Button variant="tertiary" onClick={() => setIsPicking(false)}>
                                {__('Cancel', 'document-emberdder')}
                            </Button>
                        )}
                    </div>
                </Placeholder>
            </div>
        );
    }

    return (
        <>
            <Settings docId={docId} onSelect={selectDocument} />

            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton onClick={() => setIsPicking(true)}>
                        {__('Change document', 'document-emberdder')}
                    </ToolbarButton>
                </ToolbarGroup>
            </BlockControls>

            <div {...blockProps}>
                {error && (
                    <Notice status="warning" isDismissible={false}>
                        {error}
                    </Notice>
                )}

                {!error && !previewUrl && (
                    <div className="bplde-saved-doc__loading bplde-saved-doc__loading--stage">
                        <Spinner />
                        <span>{__('Loading preview…', 'document-emberdder')}</span>
                    </div>
                )}

                {!error && !!previewUrl && (
                    <Disabled>
                        <iframe
                            ref={frameRef}
                            className="bplde-saved-doc__frame"
                            src={previewUrl}
                            title={__('Document preview', 'document-emberdder')}
                            style={{ height: `${height}px` }}
                        />
                    </Disabled>
                )}
            </div>
        </>
    );
};

export default Edit;
