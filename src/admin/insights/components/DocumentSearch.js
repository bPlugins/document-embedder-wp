import { useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { Search } from "lucide-react";
import { docSubtitle } from "../api";

const LIMIT = 8;

// Title starts with the query, then title contains it, then the page it is embedded on.
// The type label ("Document Embed block") is never matched: it is the same for every block.
const hostOf = (doc) => doc.host || doc.hostTitle || "";
const rank = (doc, q) => {
  const title = doc.title.toLowerCase();
  if (title.startsWith(q)) return 0;
  if (title.includes(q)) return 1;
  return hostOf(doc).toLowerCase().includes(q) ? 2 : -1;
};

const Highlight = ({ text, query }) => {
  const at = text.toLowerCase().indexOf(query);
  if (!query || at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
};

const DocumentSearch = ({ documents = [], onSelect }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return [];
    return documents
      .map((doc) => ({ doc, score: rank(doc, q) }))
      .filter((m) => m.score >= 0)
      .sort((a, b) => a.score - b.score || a.doc.title.localeCompare(b.doc.title))
      .slice(0, LIMIT)
      .map((m) => m.doc);
  }, [documents, q]);

  const showList = open && q !== "";

  const choose = (doc) => {
    setOpen(false);
    onSelect(doc.key);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!matches.length) return;
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + matches.length) % matches.length);
    } else if (event.key === "Enter" && showList && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="bplde-ins-search">
      <Search size={15} className="bplde-ins-search__icon" aria-hidden="true" />
      <input
        type="search"
        className="bplde-ins-input bplde-ins-search__input"
        placeholder={__("Search documents", "document-emberdder")}
        aria-label={__("Search documents", "document-emberdder")}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls="bplde-ins-search-list"
        aria-activedescendant={showList && matches[active] ? `bplde-ins-search-${active}` : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Delayed so a click on a suggestion lands before the list closes.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />

      {showList && (
        <ul className="bplde-ins-search__list" id="bplde-ins-search-list" role="listbox">
          {matches.length ? (
            matches.map((doc, i) => (
              <li
                key={doc.key}
                id={`bplde-ins-search-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "is-active" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(doc)}
              >
                <span className="bplde-ins-search__title">
                  <Highlight text={doc.title} query={q} />
                </span>
                <span className="bplde-ins-search__meta">
                  {hostOf(doc) ? <Highlight text={hostOf(doc)} query={q} /> : docSubtitle(doc)}
                  {hostOf(doc) && docSubtitle(doc).slice(hostOf(doc).length)}
                </span>
              </li>
            ))
          ) : (
            <li className="bplde-ins-search__none" role="option" aria-selected="false" aria-disabled="true">
              {__("No matching document", "document-emberdder")}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default DocumentSearch;
