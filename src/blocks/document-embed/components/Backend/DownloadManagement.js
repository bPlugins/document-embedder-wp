import { PanelBody, ToggleControl, SelectControl, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { MultiSelectControl } from "../../../../../../bpl-tools/Components";

const DownloadManagement = ({ attributes, setAttributes }) => {
  const { downloadManagement } = attributes;
  const {
    downloadButtonText,
    _de_download_behavior,
    _de_download_filename,
    _de_download_show_count,
    _de_download_limit,
    _de_download_access,
    _de_download_access_roles = [],
    _de_download_access_message,
    _de_email_gate,
  } = downloadManagement;

  const updateDownload = (key, value) => {
    setAttributes({
      downloadManagement: {
        ...downloadManagement,
        [key]: value,
      },
    });
  };

  const rolesOptions = window.ppvBlocks?.roles || [];

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
      <ToggleControl
        className="mt10"
        label={__("Email Gate", "document-emberdder")}
        checked={_de_email_gate}
        onChange={(val) => updateDownload("_de_email_gate", val)}
        help={__("Enable to require users to enter their name and email before downloading. Leads are saved in the Leads menu.", "document-emberdder")}
      />

      <SelectControl
        className="mt10"
        label={__("Download Access", "document-emberdder")}
        value={_de_download_access}
        options={[
          { label: __("Everyone", "document-emberdder"), value: "everyone" },
          { label: __("Logged In Users", "document-emberdder"), value: "loggedin" },
          { label: __("Specific Roles", "document-emberdder"), value: "roles" },
        ]}
        onChange={(val) => updateDownload("_de_download_access", val)}
      />

      {_de_download_access === "roles" && (
        <div className="mt10">
          <label className="components-base-control__label" style={{ display: "block", marginBottom: "5px" }}>
            {__("Select Roles", "document-emberdder")}
          </label>
          <MultiSelectControl
            value={_de_download_access_roles}
            options={rolesOptions}
            onChange={(val) => updateDownload("_de_download_access_roles", val)}
          />
        </div>
      )}

      {_de_download_access !== "everyone" && (
        <TextControl
          className="mt10"
          label={__("Access Denied Message", "document-emberdder")}
          value={_de_download_access_message}
          onChange={(val) => updateDownload("_de_download_access_message", val)}
          help={__("Message shown when download is restricted (e.g. \"Login to download\"). Empty message will show nothing.", "document-emberdder")}
        />
      )}

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
        help={__("Optional custom filename for the download. Note: This will not work if Download Behavior is set to \"Open in New Tab\".", "document-emberdder")}
      />

      <ToggleControl
        className="mt10"
        label={__("Show Download Count", "document-emberdder")}
        checked={_de_download_show_count}
        onChange={(val) => updateDownload("_de_download_show_count", val)}
        help={__("Display the total number of times this document has been downloaded.", "document-emberdder")}
      />

      <TextControl
        className="mt10"
        label={__("Download Limit", "document-emberdder")}
        type="number"
        value={_de_download_limit}
        onChange={(val) => updateDownload("_de_download_limit", parseInt(val) || 0)}
        help={__("Limit the number of downloads allowed per user IP address.", "document-emberdder")}
      />
    </PanelBody>
  );
};

export default DownloadManagement;
