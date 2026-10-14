import { __, _n, sprintf } from "@wordpress/i18n";
import { SERIES, num, percent } from "../api";

/**
 * Views → downloads → leads for the period on screen. Bars share one scale (the largest
 * step), so they compare honestly even when downloads outnumber views, which happens
 * for library files that are downloaded without ever being viewed in an embed.
 */
const Funnel = ({ summary, period }) => {
  const { views = 0, downloads = 0, leads = null } = summary;
  const hasLeads = leads !== null && leads !== undefined;
  const scale = Math.max(1, views, downloads, hasLeads ? leads : 0);
  const share = (n) => (views ? (n / views) * 100 : null);

  const steps = [
    { key: "views", label: __("Views", "document-emberdder"), value: views, pct: views ? 100 : null },
    { key: "downloads", label: __("Downloads", "document-emberdder"), value: downloads, pct: share(downloads) },
    { key: "leads", label: __("Leads (email gate)", "document-emberdder"), value: hasLeads ? leads : null, pct: hasLeads ? share(leads) : null },
  ];

  return (
    <section className="bplde-ins-card bplde-ins-funnel" aria-label={__("View to download to lead", "document-emberdder")}>
      <div className="bplde-ins-card__head">
        <h2 className="bplde-ins-card__title">{__("View → Download → Lead", "document-emberdder")}</h2>
        <span className="bplde-ins-funnel__period">{period}</span>
      </div>

      <ol className="bplde-ins-funnel__steps">
        {steps.map((step) => (
          <li key={step.key} className="bplde-ins-funnel__step">
            <div className="bplde-ins-funnel__row">
              <span className="bplde-ins-funnel__label">{step.label}</span>
              <span className="bplde-ins-funnel__value">{step.value === null ? "—" : num(step.value)}</span>
              <span className="bplde-ins-funnel__pct">{step.pct === null ? "—" : percent(Math.round(step.pct * 10) / 10)}</span>
            </div>
            <div className="bplde-ins-funnel__track" aria-hidden="true">
              <span
                className="bplde-ins-funnel__bar"
                style={{ width: step.value ? `${Math.max(1.5, (step.value / scale) * 100)}%` : 0, background: SERIES[step.key].color }}
              />
            </div>
          </li>
        ))}
      </ol>

      {!hasLeads ? (
        <p className="bplde-ins-funnel__note">{__("Library files have no email gate, so they collect no leads.", "document-emberdder")}</p>
      ) : downloads > 0 ? (
        <div className="bplde-ins-funnel__headline">
          {/* A gate submission is a lead even when its download never completes, so leads can
              outnumber downloads; the share is capped and the remainder stated plainly. */}
          <strong>{percent(Math.min(100, Math.round((leads / downloads) * 1000) / 10))}</strong>
          <span>{__("of downloads came with a name and email", "document-emberdder")}</span>
          {leads > downloads && (
            <span className="bplde-ins-funnel__extra">
              {sprintf(
                /* translators: %s: number of email-gate submissions without a finished download. */
                _n(
                  "%s more submitted the email gate without finishing a download.",
                  "%s more submitted the email gate without finishing a download.",
                  leads - downloads,
                  "document-emberdder"
                ),
                num(leads - downloads)
              )}
            </span>
          )}
        </div>
      ) : (
        <p className="bplde-ins-funnel__note">
          {views
            ? __("No downloads yet in this period.", "document-emberdder")
            : sprintf(
                /* translators: %s: the period, e.g. "Today" or "Last 30 days". */
                __("Nothing recorded for %s yet.", "document-emberdder"),
                period.toLowerCase()
              )}
        </p>
      )}
    </section>
  );
};

export default Funnel;
