import { Save } from "lucide-react";
import { LeftArrow } from "../../Utils/icons";
import "./EditorHeader.scss";

const EditorHeader = ({
  title = "",
  onBackClick,
  onSave,
  onChange,
  titleText,
  saveButtonText = "SAVE",
  isSaving,
  editingId = null,
  copiedId = null,
  handleCopyShortcode
}) => {
  
  return (
    <header className="editor-header">
      {/* LEFT SIDE */}
      <div className="left-section">
        <button type="button" className="back-btn" onClick={onBackClick}>
          <a href="/wp-admin/edit.php?post_type=document_library">
            <LeftArrow />
            Back To List
          </a>
        </button>

        <div className="divider" />

        {/* Eyebrow over heading, the same shape the document editor's top bar uses. */}
        <div className="editor-header__id">
          <span className="editor-header__eyebrow">Document Embedder</span>
          <h1>{title}</h1>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="right-section">
        <span className={`editor-header__status editor-header__status--${editingId > 0 ? "saved" : "new"}`}>
          <span className="editor-header__dot" aria-hidden="true" />
          {editingId > 0 ? "Saved" : "Not saved yet"}
        </span>

        <button
          className="save-btn"
          disabled={isSaving}
          onClick={onSave}
        >
          <Save />
          {isSaving ? "Saving..." : saveButtonText}
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;