/**
 * Document picker for the Saved Document block.
 *
 * The list is fetched with the typed search term rather than a fixed slice of the
 * documents, so a site with more documents than one page still finds every one of
 * them. The document already selected is fetched on its own and merged in: without
 * that, a selection outside the current page of results would render as a blank
 * field and look lost.
 */

import { ComboboxControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useState, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

export const POST_TYPE = 'ppt_viewer';

const PER_PAGE = 20;

const titleOf = (doc, fallbackId) => {
    const raw = doc?.title?.rendered ?? doc?.title ?? '';
    const title = decodeEntities(raw).trim();

    /* translators: %d: document ID. */
    return title || sprintf(__('Document #%d', 'document-emberdder'), fallbackId);
};

const DocumentSelect = ({ value, onChange, label, help, className }) => {
    const [search, setSearch] = useState('');

    const query = useMemo(
        () => ({
            per_page: PER_PAGE,
            orderby: 'title',
            order: 'asc',
            _fields: 'id,title',
            ...(search ? { search } : {}),
        }),
        [search]
    );

    const { docs, isLoading, current } = useSelect(
        (select) => {
            const { getEntityRecords, getEntityRecord, isResolving } = select(coreStore);

            return {
                docs: getEntityRecords('postType', POST_TYPE, query),
                isLoading: isResolving('getEntityRecords', ['postType', POST_TYPE, query]),
                current: value ? getEntityRecord('postType', POST_TYPE, value) : null,
            };
        },
        [query, value]
    );

    const options = useMemo(() => {
        const list = (docs || []).map((doc) => ({
            value: String(doc.id),
            label: titleOf(doc, doc.id),
        }));

        // Keep the current selection selectable even when the search has filtered it out.
        if (value && !list.some((option) => option.value === String(value))) {
            list.unshift({ value: String(value), label: titleOf(current, value) });
        }

        return list;
    }, [docs, current, value]);

    const hasNoDocuments = !isLoading && !search && options.length === 0;

    return (
        <div className={className}>
            <ComboboxControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label={label ?? __('Select a document', 'document-emberdder')}
                help={
                    help ??
                    (hasNoDocuments
                        ? __('No documents yet. Create one under Document Embedder first.', 'document-emberdder')
                        : __('Start typing to search your documents.', 'document-emberdder'))
                }
                value={value ? String(value) : null}
                options={options}
                onFilterValueChange={setSearch}
                onChange={(next) => onChange(parseInt(next, 10) || 0)}
                placeholder={__('Search documents…', 'document-emberdder')}
                allowReset
            />

            {isLoading && (
                <p className="bplde-saved-doc__loading">
                    <Spinner />
                    <span>{__('Loading documents…', 'document-emberdder')}</span>
                </p>
            )}
        </div>
    );
};

export default DocumentSelect;
