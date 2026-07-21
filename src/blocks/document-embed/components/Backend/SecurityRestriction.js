import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { PremiumPanel, PremiumBadge } from "../../../../../../bpl-tools/ProControls";

const SecurityRestriction = () => {
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{__("Security & Restrictions", "document-emberdder")}</span>
          </div>
          <PremiumBadge label={__("Pro", "document-emberdder")} />
        </div>
      }
      initialOpen={false}
    >
      <PremiumPanel
        title={__("Security & Restrictions", "document-emberdder")}
        description={__("Upgrade to PRO to protect your documents by disabling external popouts and customizing loading screens.", "document-emberdder")}
        pricingUrl={window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : ""}
      >
        <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "15px", listStyleType: "disc", fontSize: "13px", color: "#555" }}>
          <li>{__("Disable Popout (Google Drive Viewer)", "document-emberdder")}</li>
          <li>{__("Enable Custom Loading Icon", "document-emberdder")}</li>
        </ul>
      </PremiumPanel>
    </PanelBody>
  );
};

export default SecurityRestriction;
