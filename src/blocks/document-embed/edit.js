import { useBlockProps } from "@wordpress/block-editor";
import Settings from "./components/Backend/settings";
import SourcePicker from "./components/Backend/SourcePicker";
import Viewer from "./components/Common/Viewer";

const Edit = ({ attributes, setAttributes, isSelected }) => {
  const { documentSource } = attributes;
  const { doc } = documentSource;

  const selectDocument = ({ doc: url, docId }) => {
    setAttributes({
      documentSource: {
        ...documentSource,
        doc: url,
      },
      docId,
    });
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
            isEditor
          />
          <div className={`bplde-editor-preview-overlay ${isSelected ? "is-selected" : ""}`} />
        </div>
      ) : (
        <SourcePicker onSelect={selectDocument} />
      )}
    </div>
  );
};

export default Edit;
