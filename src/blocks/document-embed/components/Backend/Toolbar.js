import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ColorControl, Notice } from "../../../../../../bpl-tools/Components";

const Toolbar = ({ attributes, setAttributes }) => {
  const { toolbar, documentSource = {} } = attributes;
  const { viewer = "default" } = documentSource;
  const { showName, download, _de_download_position, theme = "dark", toolbar_bg_color = "#343434", toolbar_text_color = "#ffffff" } = toolbar;

  const updateToolbar = (key, value) => {
    setAttributes({
      toolbar: {
        ...toolbar,
        [key]: value,
      },
    });
  };

  const isPremium = window.ppvBlocks?.isPremium === true || window.ppvBlocks?.isPremium === '1' || window.ppvBlocks?.isPremium === 1;

  return (
    <PanelBody
      className="bPlPanelBody"
      title = {
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
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>{__("Toolbar", "document-emberdder")}</span>
        </div>
      }
      initialOpen={false}
    >
      <ToggleControl
        className="mt10"
        label={__("Display File Name", "document-emberdder")}
        checked={showName}
        onChange={(val) => updateToolbar("showName", val)}
        help={__("Enable to display the document name. Not available for Google Drive and Dropbox.", "document-emberdder")}
      />

      <ToggleControl
        className="mt10"
        label={__("Enable Download Button", "document-emberdder")}
        checked={download}
        onChange={(val) => updateToolbar("download", val)}
        help={__("Enable to show a download button for the document. Not available for Google Drive and Dropbox.", "document-emberdder")}
      />

      {(download || showName) && (
        <SelectControl
          className="mt10"
          label={__("Toolbar Position", "document-emberdder")}
          value={_de_download_position}
          options={[
            { label: __("Toolbar (Default)", "document-emberdder"), value: "toolbar" },
            { label: __("Below Embed", "document-emberdder"), value: "below" },
          ]}
          onChange={(val) => updateToolbar("_de_download_position", val)}
        />
      )}

      {(download || showName || viewer === "custom") && (
        <>
          {!isPremium ? (
            <Notice status="premium" isIcon={true}>
              {__(
                "Make the toolbar yours — switch between Light, Dark, or fully custom colors to match your brand. Custom toolbar themes are available in Document Embedder Pro.",
                "document-emberdder"
              )}
            </Notice>
          ) : (
            <>
              <SelectControl
                className="mt10"
                label={__("Toolbar Theme", "document-emberdder")}
                value={theme}
                options={[
                  { label: __("Dark (Default)", "document-emberdder"), value: "dark" },
                  { label: __("Light", "document-emberdder"), value: "light" },
                  { label: __("Custom", "document-emberdder"), value: "custom" },
                ]}
                onChange={(val) => updateToolbar("theme", val)}
              />

              {theme === "custom" && (
                <>
                  <ColorControl
                    className="mt10"
                    label={__("Toolbar Background Color", "document-emberdder")}
                    value={toolbar_bg_color}
                    onChange={(val) => updateToolbar("toolbar_bg_color", val)}
                    defaultColor="#343434"
                    disableAlpha={true}
                  />

                  <ColorControl
                    className="mt10"
                    label={__("Toolbar Text Color", "document-emberdder")}
                    value={toolbar_text_color}
                    onChange={(val) => updateToolbar("toolbar_text_color", val)}
                    defaultColor="#ffffff"
                    disableAlpha={true}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </PanelBody>
  );
};

export default Toolbar;
