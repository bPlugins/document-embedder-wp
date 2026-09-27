import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { BtnGroup, InlineMediaUpload, Notice } from "../../../../../../bpl-tools/Components";

const DocumentSource = ({ attributes, setAttributes }) => {
  const { documentSource } = attributes;
  const { doc, viewer } = documentSource;

  const updateSource = (key, value) => {
    setAttributes({
      documentSource: {
        ...documentSource,
        [key]: value,
      },
    });
  };

  return (
    <PanelBody
      className="bPlPanelBody"
      title={
        <div className="bplde-panel-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#3858E9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>{__("Document Source", "document-emberdder")}</span>
        </div>
      }
      initialOpen={true}
    >
      <InlineMediaUpload
        className="mt10"
        label={__("Document File", "document-emberdder")}
        value={doc}
        types={[
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ]}
        onChange={(media) => {
          const url = media?.url || media || "";
          updateSource("doc", url);
          if (media?.id) {
            setAttributes({ docId: media.id });
          }
        }}
        placeholder={__("Enter URL or upload file", "document-emberdder")}
      />

      <div className="mt10">
        <BtnGroup
          label={__("Viewer", "document-emberdder")}
          labelPosition="top"
          value={viewer}
          onChange={(val) => updateSource("viewer", val)}
          options={[
            { label: __("Default", "document-emberdder"), value: "default" },
            {
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {__("Custom PDF", "document-emberdder")}
                  <span style={{
                    backgroundColor: "#8b5cf6",
                    color: "#ffffff",
                    fontSize: "9px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    textTransform: "uppercase"
                  }}>
                    {__("PDF Only", "document-emberdder")}
                  </span>
                  <span style={{
                    backgroundColor: "#3858e9",
                    color: "#ffffff",
                    fontSize: "9px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    textTransform: "uppercase"
                  }}>
                    {__("New", "document-emberdder")}
                  </span>
                </span>
              ),
              value: "custom"
            },
            {
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {__("Flipbook", "document-emberdder")}
                  <span style={{
                    backgroundColor: "#8b5cf6",
                    color: "#ffffff",
                    fontSize: "9px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    textTransform: "uppercase"
                  }}>
                    {__("PDF Only", "document-emberdder")}
                  </span>
                  <span style={{
                    backgroundColor: "#3858e9",
                    color: "#ffffff",
                    fontSize: "9px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    textTransform: "uppercase"
                  }}>
                    {__("New", "document-emberdder")}
                  </span>
                </span>
              ),
              value: "flipbook"
            },
            {
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {__("Slider", "document-emberdder")}
                  <span style={{
                    backgroundColor: "#8b5cf6",
                    color: "#ffffff",
                    fontSize: "9px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    textTransform: "uppercase"
                  }}>
                    {__("PDF Only", "document-emberdder")}
                  </span>
                  <span style={{
                    backgroundColor: "#3858e9",
                    color: "#ffffff",
                    fontSize: "9px",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    textTransform: "uppercase"
                  }}>
                    {__("New", "document-emberdder")}
                  </span>
                </span>
              ),
              value: "slider"
            },
          ]}
          help={__("Select the document viewer engine. Note: Custom PDF, Flipbook, and Slider engines only support PDF documents.", "document-emberdder")}
          Component={BtnGroup}
        />
      </div>

      <Notice status="premium" isIcon={true}>
        {__(
          "Skip the manual uploads — embed directly from Google Drive and Dropbox with one click. The cloud document picker is available in Document Embedder Pro.",
          "document-emberdder"
        )}
      </Notice>
    </PanelBody>
  );
};

export default DocumentSource;
