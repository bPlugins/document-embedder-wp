import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { PremiumPanel, PremiumBadge } from "../../../../../../bpl-tools/ProControls";

const Overlays = () => {
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span>{__("Interactive Overlays", "document-emberdder")}</span>
          </div>
          <PremiumBadge label={__("Pro", "document-emberdder")} />
        </div>
      }
      initialOpen={false}
    >
      <PremiumPanel
        title={__("Interactive Overlays", "document-emberdder")}
        description={__("Upgrade to PRO to place notes, highlights, links and calls-to-action on individual pages of your document.", "document-emberdder")}
        pricingUrl={window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : ""}
      >
        <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "15px", listStyleType: "disc", fontSize: "13px", color: "#555" }}>
          <li>{__("Overlay Types (Note, Highlight, Link, Call to Action)", "document-emberdder")}</li>
          <li>{__("Per-overlay Page targeting", "document-emberdder")}</li>
          <li>{__("Percentage-based Position (X / Y) and Size (Width / Height)", "document-emberdder")}</li>
          <li>{__("Link URL for clickable overlay areas", "document-emberdder")}</li>
          <li>{__("Rich Content box with safe HTML for Note and Call to Action", "document-emberdder")}</li>
        </ul>
      </PremiumPanel>
    </PanelBody>
  );
};

export default Overlays;
