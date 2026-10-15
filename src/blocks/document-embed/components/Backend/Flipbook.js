import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { PremiumPanel } from "../../../../../../bpl-tools/ProControls";
import { normalizeFlipbook } from "../Common/flipbookOptions";

const Flipbook = ({ attributes, setAttributes }) => {
  const { documentSource = {} } = attributes;
  const { viewer = "default" } = documentSource;
  const { style, mobile2D } = normalizeFlipbook(attributes.flipbook);

  if (viewer !== "flipbook") return null;

  // Writes the full normalized settings, so the first change to a flipbook saved before Flip
  // Style existed starts from the look it already has.
  const updateFlipbook = (key, value) => {
    setAttributes({
      flipbook: {
        ...normalizeFlipbook(attributes.flipbook),
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
            stroke="#0f766e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" />
            <path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
          </svg>
          <span>{__("Flipbook", "document-emberdder")}</span>
        </div>
      }
      initialOpen={false}
    >
      <SelectControl
        className="mt10"
        label={__("Flip Style", "document-emberdder")}
        value={style}
        options={[
          { label: __("3D (realistic page curl)", "document-emberdder"), value: "3d" },
          { label: __("Soft (curling pages)", "document-emberdder"), value: "soft" },
          { label: __("Flat (rigid page turn)", "document-emberdder"), value: "flat" },
        ]}
        onChange={(val) => updateFlipbook("style", val)}
        help={__("Browsers without WebGL show 3D as soft. Visitors who prefer reduced motion get the flat page turn.", "document-emberdder")}
      />

      {style === "3d" && (
        <ToggleControl
          className="mt10"
          label={__("Use Soft Style on Phones", "document-emberdder")}
          checked={mobile2D}
          onChange={(val) => updateFlipbook("mobile2D", val)}
          help={__("Phones get the lighter soft style instead of WebGL 3D.", "document-emberdder")}
        />
      )}

      <PremiumPanel
        title={__("More Flipbook Controls", "document-emberdder")}
        description={__("Upgrade to PRO to fine-tune how the flipbook turns its pages.", "document-emberdder")}
        pricingUrl={window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : ""}
      >
        <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "15px", listStyleType: "disc", fontSize: "13px", color: "#555" }}>
          <li>{__("Hard Cover", "document-emberdder")}</li>
          <li>{__("Page Turn Sound", "document-emberdder")}</li>
          <li>{__("Auto Play with Custom Interval", "document-emberdder")}</li>
          <li>{__("Single or Double Page Mode", "document-emberdder")}</li>
          <li>{__("Page Turn Speed", "document-emberdder")}</li>
          <li>{__("3D Page Edge Color", "document-emberdder")}</li>
        </ul>
      </PremiumPanel>
    </PanelBody>
  );
};

export default Flipbook;
