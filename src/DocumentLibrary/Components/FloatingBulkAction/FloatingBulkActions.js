import React from 'react';
import './FloatingBulkActions.scss';
import { Check, CheckSquare, Delete, X } from '../../Utils/icons';

const FloatingBulkActions = ({
    selectedCount,
    totalCount,
    onSelectAll,
    onDelete,
    onClear
}) => {
    if (selectedCount === 0) return null;

    const isAllSelected = selectedCount === totalCount;

    return (
        <div className="bplvf-floating-bulk-actions">
            <div className="bplvf-floating-bulk-actions__container">
                <div className="bplvf-floating-bulk-actions__info">
                    <div className="bplvf-floating-bulk-actions__icon">
                        <CheckSquare />
                    </div>
                    <span className="bplvf-floating-bulk-actions__count">
                        {selectedCount} Selected
                    </span>
                </div>

                <div className="bplvf-floating-bulk-actions__divider"></div>

                <div className="bplvf-floating-bulk-actions__buttons">
                    <button
                        className="bplvf-floating-bulk-actions__btn bplvf-floating-bulk-actions__btn--select"
                        onClick={onSelectAll}
                        title={isAllSelected ? 'Deselect All' : 'Select All'}
                    >
                        <Check />
                    </button>

                    <button
                        className="bplvf-floating-bulk-actions__btn bplvf-floating-bulk-actions__btn--delete"
                        onClick={onDelete}
                        title="Delete Selected"
                    >
                        <Delete />
                    </button>

                    <button
                        className="bplvf-floating-bulk-actions__btn bplvf-floating-bulk-actions__btn--clear"
                        onClick={onClear}
                        title="Clear Selection"
                    >
                        <X />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingBulkActions;