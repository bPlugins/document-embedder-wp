import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { PremiumPanel, PremiumBadge } from "../../../../../../bpl-tools/ProControls";

const ViewerFeatures = () => {
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
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>{__("Controls", "document-emberdder")}</span>
          </div>
          <PremiumBadge label={__("Pro", "document-emberdder")} />
        </div>
      }
      initialOpen={false}
    >
      <PremiumPanel
        title={__("Advanced Viewer Controls", "document-emberdder")}
        description={__("Upgrade to PRO to unlock advanced viewing capabilities for the Custom PDF, Flipbook, and Slider viewers.", "document-emberdder")}
        pricingUrl={window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : ""}
      >
        <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "15px", listStyleType: "disc", fontSize: "13px", color: "#555" }}>
          <li>{__("Reader Mode (Minimalist View)", "document-emberdder")}</li>
          <li>{__("Thumbnail Navigation & Sidebar", "document-emberdder")}</li>
          <li>{__("Horizontal Scrollbar", "document-emberdder")}</li>
          <li>{__("Load Latest Version (Bypass Cache)", "document-emberdder")}</li>
          <li>{__("Full-Screen Controls", "document-emberdder")}</li>
          <li>{__("On-Demand Page Rendering", "document-emberdder")}</li>
          <li>{__("Custom Initial Page & Zoom Level", "document-emberdder")}</li>
        </ul>
      </PremiumPanel>
    </PanelBody>
  );
};

export default ViewerFeatures;
