import { useEffect, useState } from "react";
import { __, sprintf } from "@wordpress/i18n";
import { addQueryArgs } from "@wordpress/url";
import { ArrowLeft, BarChart3, CalendarDays, Download, ExternalLink, Info, PencilLine, Users } from "lucide-react";
import { dayLabel, docSubtitle, downloadCsv, loadDocument, loadOverview, loadToday, rangeQuery } from "./api";
import Chart, { Legend } from "./components/Chart";
import LockedHistory from "./components/LockedHistory";
import DocumentPicker from "./components/DocumentPicker";
import Funnel from "./components/Funnel";
import DocumentSearch from "./components/DocumentSearch";
import RangePicker from "./components/RangePicker";
import { DocumentsTable, OriginsTable } from "./components/Tables";
import Tiles from "./components/Tiles";

const PRESETS = ["today", "7", "30", "90"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const initialRange = (isPro) => {
  const params = new URLSearchParams(window.location.search);
  const range = params.get("range");
  if (!isPro) return { range: "today" };
  if (range === "custom" && DAY.test(params.get("from") || "") && DAY.test(params.get("to") || "")) {
    return { range, from: params.get("from"), to: params.get("to") };
  }
  return { range: PRESETS.includes(range) ? range : "30" };
};

const Card = ({ title, aside, children, className = "" }) => (
  <section className={`bplde-ins-card ${className}`}>
    <div className="bplde-ins-card__head">
      <h2 className="bplde-ins-card__title">{title}</h2>
      {aside}
    </div>
    {children}
  </section>
);

const Loading = () => (
  <div className="bplde-ins-loading" aria-busy="true" aria-label={__("Loading insights", "document-emberdder")}>
    <div className="bplde-ins-tiles">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bplde-ins-tile">
          <span className="bplde-ins-skel bplde-ins-skel--value" />
          <span className="bplde-ins-skel bplde-ins-skel--label" />
        </div>
      ))}
    </div>
    <div className="bplde-ins-card">
      <span className="bplde-ins-skel bplde-ins-skel--chart" />
    </div>
  </div>
);

const Empty = ({ trackingEnabled, settingsUrl, excludedRoles = [] }) => (
  <div className="bplde-ins-card bplde-ins-empty">
    <BarChart3 size={28} aria-hidden="true" />
    <h2>{__("Nothing recorded yet", "document-emberdder")}</h2>
    <p>
      {trackingEnabled
        ? __("A view is counted once an embedded document has been at least half on screen for a second.", "document-emberdder")
        : __("Insights is switched off, so nothing is being counted.", "document-emberdder")}
    </p>
    {trackingEnabled && excludedRoles.length > 0 && (
      <p>
        {sprintf(
          /* translators: %s: comma-separated role names, e.g. "Administrator". */
          __("Visits by logged-in %s users are not counted, so your own visits will not appear. Open a page with a document in a private window to see it here.", "document-emberdder"),
          excludedRoles.join(", ")
        )}
      </p>
    )}
    {(!trackingEnabled || excludedRoles.length > 0) && (
      <a className="bplde-ins-btn bplde-ins-btn--primary" href={settingsUrl}>
        {trackingEnabled ? __("Change excluded roles", "document-emberdder") : __("Open settings", "document-emberdder")}
      </a>
    )}
  </div>
);

const LeadsNote = () => (
  <p className="bplde-ins-note">
    <Info size={14} aria-hidden="true" />
    {__("Leads count email-gate submissions for saved documents and Document Embed blocks. Library files have no email gate, so they show no leads.", "document-emberdder")}
  </p>
);

const App = ({ info }) => {
  const { isPro, doc, today, pageUrl, pricingUrl, settingsUrl, leadsUrl } = info;
  const [range, setRange] = useState(() => initialRange(isPro));
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let live = true;
    setData(null);
    setError("");

    const request = !isPro ? loadToday(doc) : doc ? loadDocument(doc, range) : loadOverview(range);
    request
      .then((result) => live && setData(result))
      .catch((e) => live && setError(e?.message || __("Insights could not be loaded.", "document-emberdder")));

    if (isPro) {
      window.history.replaceState(null, "", addQueryArgs(pageUrl, { ...(doc ? { doc } : {}), ...rangeQuery(range) }));
    }

    return () => {
      live = false;
    };
  }, [isPro, doc, range, pageUrl]);

  // Download Leads can filter by one day but not by a range, so a link only narrows to the
  // date when Insights itself is showing a single day.
  const leadsDay = !data ? "" : data.summary.from === data.summary.to ? data.summary.to : "";
  // A document's leads are filed under its own id, a block's attachment, or the block's page.
  const leadsLink = (item, scoped) => {
    if (item && !item.leadsId) return null;
    return addQueryArgs(leadsUrl, { ...(item ? { filter_document_id: item.leadsId } : {}), ...(scoped && leadsDay ? { date_filter: leadsDay } : {}) });
  };
  // Scoped to the day when that day has leads; otherwise every date, and labelled as such.
  const dayHasLeads = Boolean(leadsDay && data?.summary?.leads > 0);
  const leadsFor = (item) => leadsLink(item, dayHasLeads);
  const leadsLabel = dayHasLeads
    ? leadsDay === today
      ? __("View today's leads", "document-emberdder")
      : __("View this day's leads", "document-emberdder")
    : __("View all leads", "document-emberdder");
  const openDoc = (key) => {
    window.location.href = key ? docUrl(key) : isPro ? addQueryArgs(pageUrl, rangeQuery(range)) : pageUrl;
  };
  const docUrl = (key) => addQueryArgs(pageUrl, { doc: key, ...(isPro ? rangeQuery(range) : {}) });
  const tracking = data ? data.trackingEnabled !== false : info.trackingEnabled;
  const title = data?.doc?.title || (doc ? __("Document", "document-emberdder") : __("Insights", "document-emberdder"));
  const hasHistory = Boolean(data?.firstDay);

  const exportCsv = () => {
    setExporting(true);
    downloadCsv(range, doc)
      .catch((e) => setError(e?.message || __("The export failed.", "document-emberdder")))
      .finally(() => setExporting(false));
  };

  return (
    <div className="bplde-ins">
      <div className="bplde-ins-top">
        <div className="bplde-ins-top__id">
          <span className="bplde-ins-top__eyebrow">{__("Document Embedder", "document-emberdder")}</span>
          <h1 className="bplde-ins-top__title">{title}</h1>
          {doc && data?.doc && <span className="bplde-ins-top__sub">{docSubtitle(data.doc)}</span>}
        </div>

        {doc && data?.doc && data?.summary?.leads !== null && leadsFor(data.doc) && (
          <a className="bplde-ins-btn" href={leadsFor(data.doc)}>
            <Users size={16} aria-hidden="true" />
            {leadsLabel}
          </a>
        )}
        {/* A block or library file has no document of its own; its page is where it is managed. */}
        {data?.doc?.hostUrl && (
          <a className="bplde-ins-btn" href={data.doc.hostUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} aria-hidden="true" />
            {__("View page", "document-emberdder")}
          </a>
        )}
        {data?.doc?.hostEdit && (
          <a className="bplde-ins-btn" href={data.doc.hostEdit}>
            <PencilLine size={16} aria-hidden="true" />
            {__("Edit page", "document-emberdder")}
          </a>
        )}
        {data?.doc?.editUrl && (
          <a className="bplde-ins-btn" href={data.doc.editUrl}>
            <PencilLine size={16} aria-hidden="true" />
            {__("Edit document", "document-emberdder")}
          </a>
        )}
        {isPro && (
          <button type="button" className="bplde-ins-btn bplde-ins-btn--primary" onClick={exportCsv} disabled={exporting || !hasHistory}>
            <Download size={16} aria-hidden="true" />
            {exporting ? __("Exporting…", "document-emberdder") : __("Export CSV", "document-emberdder")}
          </button>
        )}
      </div>

      {!tracking && (
        <p className="bplde-ins-scope is-warn">
          {__("Insights is switched off. Nothing new is being counted.", "document-emberdder")}
          <a href={settingsUrl}>{__("Turn it on", "document-emberdder")}</a>
        </p>
      )}

      <div className="bplde-ins-toolbar">
        {doc ? (
          <a className="bplde-ins-back" href={isPro ? addQueryArgs(pageUrl, rangeQuery(range)) : pageUrl}>
            <ArrowLeft size={15} aria-hidden="true" />
            {__("All documents", "document-emberdder")}
          </a>
        ) : (
          <a className="bplde-ins-back" href={leadsUrl}>
            {__("Download Leads", "document-emberdder")}
          </a>
        )}

        {!isPro && (
          <span className="bplde-ins-todayonly">
            <CalendarDays size={15} aria-hidden="true" />
            <strong>{__("Today only", "document-emberdder")}</strong>
            {dayLabel(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        )}

        {data && (
          <span className="bplde-ins-since">
            {!hasHistory
              ? __("Nothing recorded yet", "document-emberdder")
              : isPro
              ? sprintf(
                  /* translators: %s: date tracking started. */
                  __("Tracking since %s", "document-emberdder"),
                  dayLabel(data.firstDay)
                )
              : sprintf(
                  /* translators: %s: date tracking started. */
                  __("Earlier days are recorded since %s and shown in Pro.", "document-emberdder"),
                  dayLabel(data.firstDay)
                )}
          </span>
        )}

        <div className="bplde-ins-toolbar__spacer" />

        <DocumentSearch documents={info.documents} onSelect={openDoc} />
        <DocumentPicker documents={info.documents} value={doc} onSelect={openDoc} />

        {isPro ? <RangePicker range={range} today={today} onChange={setRange} /> : <span className="bplde-ins-chip">{__("Today", "document-emberdder")}</span>}
      </div>

      {error && (
        <p className="bplde-ins-scope is-error" role="alert">
          {error}
        </p>
      )}

      {!data && !error && <Loading />}

      {data && (
        <>
          <Tiles summary={data.summary} leadsHref={leadsFor(doc ? data.doc : null)} leadsLabel={leadsLabel} />

          {!isPro && (
            <>
              {data.documents?.length > 0 && (
                <Card title={__("Today's documents", "document-emberdder")}>
                  <DocumentsTable rows={data.documents} docUrl={docUrl} leadsUrl={leadsFor} caption={__("Today's documents", "document-emberdder")} />
                </Card>
              )}
              <div className="bplde-ins-split">
                <LockedHistory recorded={data.recorded} today={today} pricingUrl={pricingUrl} />
                <Funnel summary={data.summary} period={__("Today", "document-emberdder")} />
              </div>
            </>
          )}

          {isPro && !hasHistory && <Empty trackingEnabled={tracking} settingsUrl={settingsUrl} excludedRoles={info.excludedRoles} />}

          {isPro && hasHistory && (
            <>
              <Card title={__("Views, downloads and leads", "document-emberdder")} aside={<Legend />}>
                <Chart points={data.series} />
              </Card>

              <div className={doc ? "bplde-ins-grid is-single" : "bplde-ins-grid"}>
                {!doc && (
                  <Card title={__("Top documents", "document-emberdder")} className="bplde-ins-grid__wide">
                    {data.documents.length ? (
                      <DocumentsTable rows={data.documents} docUrl={docUrl} leadsUrl={leadsFor} caption={__("Top documents", "document-emberdder")} />
                    ) : (
                      <p className="bplde-ins-none">{__("No document was viewed or downloaded in this range.", "document-emberdder")}</p>
                    )}
                  </Card>
                )}

                <Card title={__("Top host pages", "document-emberdder")}>
                  {data.origins.length ? (
                    <OriginsTable rows={data.origins} />
                  ) : (
                    <p className="bplde-ins-none">{__("No page views in this range.", "document-emberdder")}</p>
                  )}
                </Card>
              </div>
            </>
          )}

          <LeadsNote />
        </>
      )}
    </div>
  );
};

export default App;
