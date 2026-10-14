import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { __, sprintf } from "@wordpress/i18n";

const BASE = "/docembedder/v1/insights";

export const SERIES = {
  views: { color: "#0d9488", label: () => __("Views", "document-emberdder") },
  downloads: { color: "#b45309", label: () => __("Downloads", "document-emberdder") },
  leads: { color: "#6d28d9", label: () => __("Leads", "document-emberdder"), dashed: true },
};

export const rangeQuery = ({ range, from, to }) => (range === "custom" ? { range, from, to } : { range });

export const get = (route, query = {}) => apiFetch({ path: addQueryArgs(`${BASE}${route}`, query) });

export const loadToday = (doc) => get("/today", doc ? { doc } : {});

export const loadOverview = (range) =>
  Promise.all([get("/summary", rangeQuery(range)), get("/series", rangeQuery(range)), get("/documents", rangeQuery(range)), get("/origins", rangeQuery(range))]).then(
    ([summary, series, documents, origins]) => ({
      ...summary,
      series: series.points,
      documents: documents.rows,
      origins: origins.rows,
    })
  );

export const loadDocument = (doc, range) => get(`/document/${doc}`, rangeQuery(range));

export const downloadCsv = async (range, doc) => {
  const response = await apiFetch({ path: addQueryArgs(`${BASE}/export`, { ...rangeQuery(range), ...(doc ? { doc } : {}) }), parse: false });
  const blob = await response.blob();
  const match = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") || "");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = match ? match[1] : "document-insights.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

/* Formatting --------------------------------------------------------------------------- */

const SOURCES = {
  library: () => __("Document Library", "document-emberdder"),
  url: () => __("Document Embed block", "document-emberdder"),
};

/** "Page | Document Library" for files; saved documents name themselves. */
export const docSubtitle = (doc) => {
  if (doc.kind === "saved") return __("Saved document", "document-emberdder");
  const host = doc.hostTitle || doc.host || "";
  const source = SOURCES[doc.source] ? SOURCES[doc.source]() : "";
  return [host, source].filter(Boolean).join(" | ") || __("Pasted URL or library file", "document-emberdder");
};

export const num = (value) => Number(value || 0).toLocaleString();

export const percent = (value) => (value === null || value === undefined ? "—" : `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`);

export const duration = (ms) => {
  const seconds = Math.round((ms || 0) / 1000);
  if (seconds < 60) {
    /* translators: %d: seconds. */
    return sprintf(__("%ds", "document-emberdder"), seconds);
  }
  /* translators: 1: minutes, 2: seconds. */
  return sprintf(__("%1$dm %2$02ds", "document-emberdder"), Math.floor(seconds / 60), seconds % 60);
};

export const dayLabel = (day, options = { day: "numeric", month: "short", year: "numeric" }) => {
  const date = new Date(`${day}T00:00:00`);
  return isNaN(date) ? day : date.toLocaleDateString(undefined, options);
};

export const shiftDay = (day, days) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
