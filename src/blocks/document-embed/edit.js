import { useBlockProps } from "@wordpress/block-editor";
import { Button, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import Settings from "./components/Backend/settings";
import Viewer from "./components/Common/Viewer";

const Edit = ({ attributes, setAttributes, isSelected }) => {
  const { documentSource } = attributes;
  const { doc } = documentSource;

  const openLibraryModal = () => {
    const frame = wp.media({
      title: __("Select Document", "document-emberdder"),
      multiple: false,
      button: { text: __("Use this document", "document-emberdder") },
    });
    frame.on("select", () => {
      const file = frame.state().get("selection").first().toJSON();
      if (file?.url) {
        setAttributes({
          documentSource: {
            ...documentSource,
            doc: file.url,
          },
          docId: file.id,
        });
      }
    });
    frame.open();
  };

  return (
    <div {...useBlockProps()}>
      <Settings attributes={attributes} setAttributes={setAttributes} />

      {doc ? (
        <div className="bplde-editor-preview-wrapper">
          <Viewer
            attributes={attributes}
            userData={{ isLoggedIn: true, userRoles: ["administrator"] }}
            pluginUrl={window.ppvBlocks?.pluginUrl || ""}
            postId={0}
            id="editor-preview"
          />
          <div className={`bplde-editor-preview-overlay ${isSelected ? "is-selected" : ""}`} />
        </div>
      ) : (
        <div className="bplde-placeholder">
          <span className="dashicons dashicons-media-document bplde-placeholder-icon"></span>
          <h3 className="bplde-placeholder-title">
            {__("Document Embedder Placeholder", "document-emberdder")}
          </h3>
          <p className="bplde-placeholder-text">
            {__("Upload a document file or select one from your media library.", "document-emberdder")}
          </p>
          <div className="bplde-placeholder-controls">
            <Button isPrimary onClick={openLibraryModal} className="bplde-placeholder-button">
              {__("Choose/Upload File", "document-emberdder")}
            </Button>
            <TextControl
              className="bplde-placeholder-input"
              value={doc}
              placeholder={__("Or paste Document URL...", "document-emberdder")}
              onChange={(val) =>
                setAttributes({
                  documentSource: {
                    ...documentSource,
                    doc: val,
                  },
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Edit;
