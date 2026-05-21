import React from "react";
import "./BplProModal.scss";
import bPlugins from "../../../../../assets/bPlugins.png";
import { PluginIcon } from "../../../Utils/icons";

const BplProModal = ({ isProModalOpen, onClose }) => {
  if (!isProModalOpen) return null;

  return (
    <div className="bpl-modal-overlay" onClick={onClose}>
      <div className="bpl-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="bpl-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="bpl-modal-icon-container">
          <div className="bpl-modal-icons">
            <div className="bpl-company-logo">
              <img src={bPlugins} alt="" />
            </div>
            <div className="bpl-plugin-logo">
              <PluginIcon />
            </div>
          </div>
          <div className="bpl-premium-icon">🔒</div>
        </div>

        <div className="bpl-content-area">
          <h2>Premium Feature</h2>
          <p>
            Upload more than{" "}
            <span style={{ fontWeight: "bolder" }}>5 files</span> is available
            in pro version.
          </p>

          <div className="bpl-highlight-box">
            <div className="bpl-highlight-icon">✅</div>
            <div className="bpl-highlight-text">
              <strong>Upload Unlimited</strong>
              <span>Upload unlimited files for your library</span>
            </div>
          </div>

          <div className="bpl-benefits">
            <div className="bpl-benefit">
              <span className="bpl-check">✓</span>
              <span>Upload from Dropbox and Google Drive</span>
            </div>
            <div className="bpl-benefit">
              <span className="bpl-check">✓</span>
              <span>Set Height & Width of each document.</span>
            </div>
            <div className="bpl-benefit">
              <span className="bpl-check">✓</span>
              <span>Upload unlimited files for Document Library.</span>
            </div>
            <div className="bpl-benefit">
              <span className="bpl-check">✓</span>
              <span>Priority customer support 24Hours</span>
            </div>
          </div>

          <button type="button" className="bpl-upgrade-btn">
            <a
              href={`${window.bpldeSettings.adminUrl}edit.php?post_type=ppt_viewer&page=bplde-dashboard#/pricing`}
              target="_blank"
              rel="noreferrer"
            >
              Upgrade to Pro
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BplProModal;
