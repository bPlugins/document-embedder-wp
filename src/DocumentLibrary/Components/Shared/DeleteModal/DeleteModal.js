import React from "react";
import "./DeleteModal.scss";
import { Delete } from "../../../Utils/icons";

const DeleteModal = ({ isOpen, onClose, onConfirm, selectedCount = 1 }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="vfd-modal-overlay" onClick={handleOverlayClick}>
      <div className="vfd-modal">
        {/* Header */}
        <div className="vfd-modal-header">
          <div className="vfd-modal-icon">
            <Delete className="icon" />
          </div>
        </div>

        {/* Title */}
        <h3 className="vfd-modal-title">Confirm Deletion</h3>

        {/* Message */}
        <p className="vfd-modal-message">
          Are you sure you want to delete{" "}
          <span className="count">{selectedCount}</span> item
          {selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="vfd-modal-actions">
          <button  type="button" className="vfd-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="vfd-btn delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
