import { useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { ExternalLink } from "lucide-react";
import { docSubtitle, duration, num, percent } from "../api";

const DOC_COLUMNS = () => [
  { key: "title", label: __("Document", "document-emberdder"), text: true },
  { key: "views", label: __("Views", "document-emberdder") },
  { key: "uniqueDaily", label: __("Daily unique", "document-emberdder") },
  { key: "downloads", label: __("Downloads", "document-emberdder") },
  { key: "leads", label: __("Leads", "document-emberdder") },
  { key: "conversion", label: __("Conversion", "document-emberdder") },
  { key: "fullscreens", label: __("Full-screens", "document-emberdder") },
  { key: "avgDwellMs", label: __("Avg time on screen", "document-emberdder") },
];

const CELL = {
  uniqueDaily: (v) => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }),
  leads: (v) => (v === null ? "—" : num(v)),
  conversion: percent,
  avgDwellMs: duration,
};

// Missing values (leads on url embeds) always sort last, whichever the direction.
const compare = (key, dir) => (a, b) => {
  const x = a[key];
  const y = b[key];
  if (x === null || x === undefined) return 1;
  if (y === null || y === undefined) return -1;
  const order = typeof x === "string" ? x.localeCompare(y) : x - y;
  return dir === "asc" ? order : -order;
};

export const DocumentsTable = ({ rows, docUrl, leadsUrl, caption }) => {
  const [sort, setSort] = useState({ key: "views", dir: "desc" });
  const columns = DOC_COLUMNS();
  const sorted = useMemo(() => [...rows].sort(compare(sort.key, sort.dir)), [rows, sort]);

  const toggle = (key) =>
    setSort((current) => ({ key, dir: current.key === key && current.dir === "desc" ? "asc" : key === "title" && current.key !== key ? "asc" : "desc" }));

  return (
    <div className="bplde-ins-scroll">
      <table className="bplde-ins-table">
        <caption className="screen-reader-text">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={col.text ? "" : "is-num"}
                aria-sort={sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button type="button" className="bplde-ins-sort" onClick={() => toggle(col.key)}>
                  {col.label}
                  <span aria-hidden="true">{sort.key === col.key ? (sort.dir === "asc" ? "↑" : "↓") : ""}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.key}>
              <td>
                {docUrl ? (
                  <a className="bplde-ins-doclink" href={docUrl(row.key)}>
                    {row.title}
                  </a>
                ) : (
                  <span className="bplde-ins-doclink">{row.title}</span>
                )}
                <span className="bplde-ins-docmeta">{docSubtitle(row)}</span>
              </td>
              {columns.slice(1).map((col) => (
                <td key={col.key} className="is-num">
                  {col.key === "leads" && row.leads > 0 && leadsUrl && leadsUrl(row) ? (
                    <a className="bplde-ins-leadslink" href={leadsUrl(row)} title={__("View these leads", "document-emberdder")}>
                      {num(row.leads)}
                    </a>
                  ) : (
                    (CELL[col.key] || num)(row[col.key])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const OriginsTable = ({ rows }) => (
  <div className="bplde-ins-scroll">
    <table className="bplde-ins-table">
      <caption className="screen-reader-text">{__("Top host pages", "document-emberdder")}</caption>
      <thead>
        <tr>
          <th scope="col">{__("Page", "document-emberdder")}</th>
          <th scope="col" className="is-num">
            {__("Views", "document-emberdder")}
          </th>
          <th scope="col" className="is-num">
            {__("Documents", "document-emberdder")}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>
              <span className="bplde-ins-doclink">{row.title}</span>
              {row.url && (
                <a className="bplde-ins-docmeta bplde-ins-external" href={row.url} target="_blank" rel="noopener noreferrer">
                  {__("View page", "document-emberdder")}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              )}
            </td>
            <td className="is-num">{num(row.views)}</td>
            <td className="is-num">{num(row.docs)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
