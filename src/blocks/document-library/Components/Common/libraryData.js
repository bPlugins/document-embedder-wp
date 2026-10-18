import { useEffect, useState } from "react";

/**
 * Search, type filter and sort, shared by every layout. Lifted out of
 * DocumentLibrary.js unchanged so the Grid layout behaves exactly as before.
 */

export const CATEGORY_MAP = {
  Images: ["png", "jpg", "jpeg", "gif", "webp"],
  Videos: ["mp4", "avi", "mov", "mkv"],
  PDF: ["pdf"],
  Documents: ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pages", "rtf", "csv", "odt", "ods", "odp"],
  Audio: ["mp3", "wav", "ogg"],
  Archives: ["zip", "rar", "7z"],
};

/** File extension from the URL, ignoring any query string or hash. */
export const getExtension = (doc) => {
  const fromUrl = String(doc?.url || "")
    .toLowerCase()
    .split(/[?#]/)[0]
    .split("/")
    .pop();
  if (fromUrl.includes(".")) return fromUrl.split(".").pop();

  // Items added by URL without an extension: fall back to the mime subtype.
  const mime = String(doc?.type || "").toLowerCase();
  if (mime.includes("/") && mime !== "custom/url") return mime.split("/").pop();
  return "";
};

export const getCategory = (doc) => {
  const ext = getExtension(doc);
  for (const [category, exts] of Object.entries(CATEGORY_MAP)) {
    if (exts.includes(ext)) return category;
  }
  return "Others";
};

// Dates are stored as "13/07/2025" by older versions and as a localised long
// date ("July 13, 2025") by newer uploads; read both.
export const parseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  const parts = String(dateStr).split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? new Date(0) : parsed;
};

// Convert "370.92 KB" → bytes
export const parseSize = (sizeStr) => {
  if (!sizeStr) return 0;
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  const [num, unit] = String(sizeStr).split(" ");
  return parseFloat(num) * (units[unit] || 1) || 0;
};

const compare = (a, b) => (a > b ? 1 : a < b ? -1 : 0);

const sortValue = (doc, key) => {
  switch (key) {
    case "name":
      return doc.title || "";
    case "date":
      return parseDate(doc.date).getTime();
    case "size":
      return parseSize(doc.size);
    default:
      return 0;
  }
};

export const sortDocuments = (docs, sortOption) => {
  if (!sortOption || sortOption === "default") return [...docs];
  const [key, dir] = sortOption.split("-");
  const sign = dir === "desc" ? -1 : 1;
  return [...docs].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * sign;
    return compare(va, vb) * sign;
  });
};

export const useLibraryDocuments = (docItems) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  const documents = Array.isArray(docItems) ? docItems : [];

  const existingCategories = Array.from(new Set(documents.map((doc) => getCategory(doc))));

  const filteredDocuments = documents.filter((doc) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      String(doc.title || "").toLowerCase().includes(search) ||
      (doc.url?.toLowerCase() ?? "").includes(search);
    const matchesType = selectedType === "all" || getCategory(doc) === selectedType;
    return matchesSearch && matchesType;
  });

  return {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    sortOption,
    setSortOption,
    existingCategories,
    sortedDocuments: sortDocuments(filteredDocuments, sortOption),
  };
};

/**
 * "Load more" paging for Grid and List. perPage 0 shows everything, which is
 * the default and how libraries behaved before paging existed.
 */
export const useLoadMore = (items, perPage) => {
  const size = Number(perPage) || 0;
  const [limit, setLimit] = useState(size);
  const key = items.map((d) => d.id).join(",");

  useEffect(() => setLimit(size), [size, key]);

  if (!size) return { visible: items, hasMore: false, loadMore: () => {} };
  return {
    visible: items.slice(0, limit),
    hasMore: items.length > limit,
    loadMore: () => setLimit((l) => l + size),
  };
};

// Signed Insights key the server attached to this item, if counting is on.
export const insightsProps = (doc) => {
  const attrs = doc?.insights;
  if (!attrs || !attrs["data-bplde-doc"]) return {};
  return {
    "data-bplde-doc": attrs["data-bplde-doc"],
    "data-bplde-sig": attrs["data-bplde-sig"],
    "data-bplde-origin": attrs["data-bplde-origin"],
  };
};

export const handleDownload = (doc) => {
  const link = document.createElement("a");
  link.href = doc.url;
  link.download = doc.title;
  link.click();
};
