import { __ } from "@wordpress/i18n";
import { docSubtitle } from "../api";

const DocumentPicker = ({ documents = [], value = "", onSelect }) => {
  const saved = documents.filter((d) => d.kind === "saved");
  const files = documents.filter((d) => d.kind !== "saved");
  // A document opened by link may be missing from the list (trashed, or beyond the cap).
  const known = !value || documents.some((d) => d.key === value);

  return (
    <>
      <label className="screen-reader-text" htmlFor="bplde-ins-doc">
        {__("Show insights for", "document-emberdder")}
      </label>
      <select id="bplde-ins-doc" className="bplde-ins-input bplde-ins-input--doc" value={value} onChange={(e) => onSelect(e.target.value)}>
        <option value="">{__("All documents", "document-emberdder")}</option>
        {!known && <option value={value}>{__("This document", "document-emberdder")}</option>}
        {saved.length > 0 && (
          <optgroup label={__("Saved documents", "document-emberdder")}>
            {saved.map((d) => (
              <option key={d.key} value={d.key}>
                {d.title}
              </option>
            ))}
          </optgroup>
        )}
        {files.length > 0 && (
          <optgroup label={__("Document Embed blocks", "document-emberdder")}>
            {files.map((d) => (
              <option key={d.key} value={d.key}>
                {`${d.title} (${docSubtitle(d)})`}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </>
  );
};

export default DocumentPicker;
