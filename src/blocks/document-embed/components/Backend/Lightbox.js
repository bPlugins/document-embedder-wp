import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { PremiumPanel, PremiumBadge } from "../../../../../../bpl-tools/ProControls";

const Lightbox = () => {
  return (
    <PanelBody
      className="bPlPanelBody"
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
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
              <rect x="8" y="8" width="13" height="13" rx="2" ry="2" />
              <path d="M16 8V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" />
            </svg>
            <span>{__("Modal Pop Up (Lightbox)", "document-emberdder")}</span>
          </div>
          <PremiumBadge label={__("Pro", "document-emberdder")} />
        </div>
      }
      initialOpen={false}
    >
      <PremiumPanel
        title={__("Modal Pop Up (Lightbox)", "document-emberdder")}
        description={__("Upgrade to PRO to open documents in a beautiful lightbox popup overlay, keeping users on your page.", "document-emberdder")}
        pricingUrl={window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : ""}
      >
        <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "15px", listStyleType: "disc", fontSize: "13px", color: "#555" }}>
          <li>{__("Enable Lightbox Overlay", "document-emberdder")}</li>
          <li>{__("Custom Trigger (Button, Image, or CSS Selector)", "document-emberdder")}</li>
          <li>{__("Custom Button Colors & Sizes", "document-emberdder")}</li>
        </ul>
      </PremiumPanel>
    </PanelBody>
  );
};

export default Lightbox;
