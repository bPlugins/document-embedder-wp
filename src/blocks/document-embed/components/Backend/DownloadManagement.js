import { PanelBody, SelectControl, TextControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { Notice } from "../../../../../../bpl-tools/Components";

const DownloadManagement = ({ attributes, setAttributes }) => {
  const { downloadManagement } = attributes;
  const {
    downloadButtonText,
    _de_download_behavior,
    _de_download_filename,
    _de_download_show_count,
  } = downloadManagement;

  const updateDownload = (key, value) => {
    setAttributes({
      downloadManagement: {
        ...downloadManagement,
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{__("Download Management", "document-emberdder")}</span>
        </div>
      }
      initialOpen={false}
    >
      <TextControl
        className="mt10"
        label={__("Download Button Text", "document-emberdder")}
        value={downloadButtonText}
        onChange={(val) => updateDownload("downloadButtonText", val)}
        help={__("Specify the text for the download button.", "document-emberdder")}
      />

      <SelectControl
        className="mt10"
        label={__("Download Behavior", "document-emberdder")}
        value={_de_download_behavior}
        options={[
          { label: __("Force Save Dialog", "document-emberdder"), value: "download" },
          { label: __("Open in New Tab", "document-emberdder"), value: "newtab" },
        ]}
        onChange={(val) => updateDownload("_de_download_behavior", val)}
      />

      <TextControl
        className="mt10"
        label={__("Custom Filename", "document-emberdder")}
        value={_de_download_filename}
        onChange={(val) => updateDownload("_de_download_filename", val)}
        help={__("Optional custom filename for the download.", "document-emberdder")}
      />

      <ToggleControl
        className="mt10"
        label={__("Show Download Count", "document-emberdder")}
        checked={_de_download_show_count}
        onChange={(val) => updateDownload("_de_download_show_count", val)}
        help={__("Display the total number of times this document has been downloaded.", "document-emberdder")}
      />

      <Notice status="premium" isIcon={true}>
        {__(
          "Turn viewers into leads: gate downloads behind an email, restrict access by login or user role, and cap downloads per visitor. Unlock full Download Management in Document Embedder Pro.",
          "document-emberdder"
        )}
      </Notice>
    </PanelBody>
  );
};

export default DownloadManagement;
