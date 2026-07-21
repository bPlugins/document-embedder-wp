import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { PremiumPanel, PremiumBadge } from "../../../../../../bpl-tools/ProControls";

const Performance = () => {
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
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>{__("Performance & Reliability", "document-emberdder")}</span>
          </div>
          <PremiumBadge label={__("Pro", "document-emberdder")} />
        </div>
      }
      initialOpen={false}
    >
      <PremiumPanel
        title={__("Performance & Reliability", "document-emberdder")}
        description={__("Upgrade to PRO to unlock lazy loading and automatic fallbacks to guarantee fast and reliable document rendering.", "document-emberdder")}
        pricingUrl={window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : ""}
      >
        <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "15px", listStyleType: "disc", fontSize: "13px", color: "#555" }}>
          <li>{__("Lazy Load Documents", "document-emberdder")}</li>
          <li>{__("Auto-Fallback if Google Viewer Fails", "document-emberdder")}</li>
        </ul>
      </PremiumPanel>
    </PanelBody>
  );
};

export default Performance;
