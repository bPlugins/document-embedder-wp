import "./SettingsHeader.scss";

const SettingsHeader = ({
  title = "",
  onSave,
  onChange,
  titleText,
  saveButtonText,
  isSaving,
  editingId = null,
  copiedId = null,
  handleCopyShortcode,
}) => {
  return (
    <div className="vfd-settings-header">
      <div className="left-header">
        <div className="title">
          <h2>{title}</h2>
          <input
            type="text"
            placeholder="Document Library Title"
            value={titleText}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="right-header">
        {Number(editingId) > 0 && (
          <div className="vfd-shortcode-box">
            <code>[document_library id={`"${editingId}"`}]</code>
            <button
              type="button"
              onClick={() => handleCopyShortcode(editingId)}
            >
              {copiedId === editingId ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
        <button
          type="button"
          className={`save-btn ${isSaving ? "disabled" : ""}`}
          disabled={isSaving}
          onClick={onSave}
        >
          {saveButtonText}
        </button>
      </div>
    </div>
  );
};

export default SettingsHeader;
