import { PanelBody, ExternalLink } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import DocumentSelect from './DocumentSelect';

/**
 * The sidebar mirrors the picker shown in the block body, so a document can be
 * swapped from either place once one is chosen.
 */
const Settings = ({ docId, onSelect }) => (
    <InspectorControls>
        <PanelBody title={__('Document', 'document-emberdder')} initialOpen>
            <DocumentSelect value={docId} onChange={onSelect} />

            <p className="bplde-saved-doc__hint">
                {__(
                    'Layout, viewer, toolbar and download options come from the document itself.',
                    'document-emberdder'
                )}
            </p>

            {!!docId && (
                <ExternalLink href={`post.php?post=${docId}&action=edit`}>
                    {__('Edit this document', 'document-emberdder')}
                </ExternalLink>
            )}
        </PanelBody>
    </InspectorControls>
);

export default Settings;
