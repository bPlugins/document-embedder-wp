import { Save } from "lucide-react";
import { Copy, LeftArrow } from "../../Utils/icons";
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

        <h1>{title}</h1>

        <input
          type="text"
          placeholder="Voice Feedback Title"
          value={titleText}
          onChange={onChange}
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="right-section">
        {editingId > 0 && (
          <div className="shortcode-box">
            <code>[document_library id={`"${editingId}"`}]</code>

            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopyShortcode(editingId)}
            >
              <Copy />
              {copiedId === editingId ? "Copied" : "Copy"}
            </button>
          </div>
        )}

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