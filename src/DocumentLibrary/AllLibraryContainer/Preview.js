import { useState } from "react";
import DocumentLibrary from "../../blocks/document-library/Components/Common/DocumentLibrary";

/* The widths the device buttons constrain the preview to. */
const DEVICES = [
  { label: "Desktop", value: "desktop", width: "100%" },
  { label: "Tablet", value: "tablet", width: "768px" },
  { label: "Mobile", value: "mobile", width: "390px" },
];

const PreviewPanel = ({ postId, formData }) => {
  const [device, setDevice] = useState("desktop");
  const width = DEVICES.find((d) => d.value === device).width;
  const documents = formData?.settings?.documentLibrary?.docItems || [];

  return (
    <div className="live-preview">
      <div className="preview-header">
        <h2>Live preview</h2>

        <div className="bpldl-devices" role="group" aria-label="Preview width">
          {DEVICES.map((d) => (
            <button
              type="button"
              key={d.value}
              className={`bpldl-device${device === d.value ? " is-active" : ""}`}
              aria-pressed={device === d.value}
              onClick={() => setDevice(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <span className="preview-badge">
          <span className="preview-badge__dot" aria-hidden="true" />
          Live
        </span>
      </div>

      <div className="preview-content">
        {documents.length === 0 && (
          <p className="bpldl-preview-note">
            Add a document and it will appear here. Nothing is saved until you press Save.
          </p>
        )}

        <div className="bplde-preview" style={{ maxWidth: width, marginInline: device === "desktop" ? 0 : "auto" }}>
          <div className="preview-content" id="live-preview-1">
            <DocumentLibrary
              postId={postId}
              isAdmin={true}
              settingsData={formData.settings}
              id="live-preview-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
