import { PanelBody } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { __, sprintf } from "@wordpress/i18n";
import { dayLabel, num } from "../../../../admin/insights/api";

const FETCH_DELAY = 600;

const Sparkline = ({ values, example = false }) => {
  const w = 240;
  const h = 40;
  const top = Math.max(1, ...values);
  const points = values.map((v, i) => `${((i / Math.max(1, values.length - 1)) * w).toFixed(1)},${(h - 4 - (v / top) * (h - 8)).toFixed(1)}`).join(" ");

  return (
    <svg className={`bplde-ins-panel__spark${example ? " is-example" : ""}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// A smooth example shape for the locked panel; no figure for a past day reaches a free build.
const EXAMPLE = Array.from({ length: 14 }, (_, i) => 0.5 + 0.3 * Math.sin(i / 2.2) + 0.1 * Math.sin(i * 1.3));

const Stat = ({ value, label, tone }) => (
  <div className={`bplde-ins-panel__stat is-${tone}`}>
    <span className="bplde-ins-panel__label">{label}</span>
    <span className="bplde-ins-panel__value">{value}</span>
  </div>
);

const Note = ({ children }) => <p className="bplde-ins-panel__note">{children}</p>;

const Insights = ({ attributes }) => {
  const config = window.ppvBlocks?.insights;
  const file = attributes.documentSource?.doc || "";
  const post = attributes.docId || 0;

  const [state, setState] = useState({ loading: false, today: null, error: false });

  useEffect(() => {
    if (!config?.canView || !file) return undefined;

    let live = true;
    setState((s) => ({ ...s, loading: true, error: false }));

    // Waits for the URL field to settle, so typing a link does not send a request per keystroke.
    const timer = setTimeout(async () => {
      try {
        const today = await apiFetch({ path: addQueryArgs("/docembedder/v1/insights/today", { file, post }) });
        if (live) setState({ loading: false, today, error: false });
      } catch (e) {
        if (live) setState({ loading: false, today: null, error: true });
      }
    }, FETCH_DELAY);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [config?.canView, file, post]);

  if (!config) return null;

  const { loading, today, error } = state;
  const key = today?.doc?.key;
  const firstDay = today?.firstDay;
  const open = key ? addQueryArgs(config.url, { doc: key }) : config.url;

  const provenance = !config.enabled
    ? __("Counting is switched off in Settings.", "document-emberdder")
    : firstDay
    ? sprintf(
        /* translators: %s: date counting began. */
        __("Counting since %s. Resets at midnight, site time.", "document-emberdder"),
        dayLabel(firstDay)
      )
    : __("Counting is on. Nothing recorded for this document yet.", "document-emberdder");

  const body = () => {
    if (!file) return <Note>{__("Choose a document to see how it is read.", "document-emberdder")}</Note>;
    if (!config.canView) return <Note>{__("Only administrators can see Insights.", "document-emberdder")}</Note>;
    if (error) return <Note>{__("Insights could not be loaded.", "document-emberdder")}</Note>;
    if (loading || !today) return <div className="bplde-ins-panel__loading" aria-busy="true" />;

    const s = today.summary;
    return (
      <>
        <div className="bplde-ins-panel__stats">
          <Stat tone="views" label={__("Views today", "document-emberdder")} value={num(s.views)} />
          <Stat tone="downloads" label={__("Downloads today", "document-emberdder")} value={num(s.downloads)} />
        </div>
        <Note>{provenance}</Note>

        <a className="bplde-ins-panel__locked" href={config.pricingUrl} target="_blank" rel="noopener noreferrer">
          <span className="bplde-ins-panel__locked-head">
            <span className="bplde-ins-panel__locked-tag">
              <svg viewBox="0 0 9 11" width="9" height="11" aria-hidden="true">
                <path d="M2 4.5V3.2a2.5 2.5 0 0 1 5 0v1.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <rect x="1" y="4.5" width="7" height="5.5" fill="currentColor" />
              </svg>
              {__("Recording now", "document-emberdder")}
            </span>
            <span className="bplde-ins-panel__example">{__("Example", "document-emberdder")}</span>
          </span>
          <Sparkline values={EXAMPLE} example />
          <span className="bplde-ins-panel__locked-text">
            {__("Yesterday and earlier are being recorded in your own database. Pro reads them back as 30-day totals, a daily chart, your best-performing documents and a CSV export.", "document-emberdder")}
          </span>
        </a>

        <a className="bplde-ins-panel__open" href={open} target="_blank" rel="noopener noreferrer">
          {__("Open in Insights", "document-emberdder")}
        </a>
      </>
    );
  };

  return (
    <PanelBody
      className="bPlPanelBody bplde-ins-panel"
      title={
        <div className="bplde-panel-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M3 3v18h18" />
            <path d="M7 15l4-4 3 3 5-6" />
          </svg>
          <span>{__("Insights", "document-emberdder")}</span>
          <span className="bplde-panel-badge">{__("New", "document-emberdder")}</span>
        </div>
      }
      initialOpen={false}
    >
      {body()}
    </PanelBody>
  );
};

export default Insights;
