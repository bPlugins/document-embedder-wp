import { __ } from "@wordpress/i18n";
import { duration, num, percent } from "../api";

const Tile = ({ value, label, note, link }) => (
  <div className="bplde-ins-tile">
    <span className="bplde-ins-tile__value">{value}</span>
    <span className="bplde-ins-tile__label">{label}</span>
    {note && <span className="bplde-ins-tile__note">{note}</span>}
    {link && (
      <a className="bplde-ins-tile__link" href={link.href} title={link.title}>
        {link.text}
      </a>
    )}
  </div>
);

const Tiles = ({ summary, leadsHref, leadsLabel }) => {
  const leadsKnown = summary.leads !== null && summary.leads !== undefined;
  const leadsNote = leadsKnown ? null : __("No email gate on library files", "document-emberdder");

  return (
    <div className="bplde-ins-tiles">
      <Tile value={num(summary.views)} label={__("Views", "document-emberdder")} />
      <Tile
        value={Number(summary.uniqueDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
        label={__("Daily unique views", "document-emberdder")}
        note={summary.days > 1 ? __("Average per day", "document-emberdder") : null}
      />
      <Tile value={num(summary.downloads)} label={__("Downloads", "document-emberdder")} />
      <Tile
        value={leadsKnown ? num(summary.leads) : "—"}
        label={__("Leads", "document-emberdder")}
        note={leadsNote}
        link={
          leadsKnown && leadsHref
            ? {
                href: leadsHref,
                text: leadsLabel,
                title: __("Opens the Download Leads page", "document-emberdder"),
              }
            : null
        }
      />
      <Tile
        value={percent(summary.conversion)}
        label={__("Conversion rate", "document-emberdder")}
        note={leadsKnown ? __("Leads ÷ views", "document-emberdder") : leadsNote}
      />
      <Tile value={duration(summary.avgDwellMs)} label={__("Avg time on screen", "document-emberdder")} note={__("Per view", "document-emberdder")} />
    </div>
  );
};

export default Tiles;
