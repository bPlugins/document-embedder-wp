import { Download, Eye } from "lucide-react";
import { getCategory, getExtension, insightsProps } from "../libraryData";

const BADGE_TONE = {
  PDF: "pdf",
  Images: "image",
  Videos: "video",
  Audio: "audio",
  Archives: "archive",
  Others: "other",
};

// Word, Excel and PowerPoint share the "Documents" category but are told apart
// at a glance by colour everywhere else, so the badge does the same.
const DOC_TONE = { doc: "word", docx: "word", odt: "word", rtf: "word", pages: "word", xls: "sheet", xlsx: "sheet", csv: "sheet", ods: "sheet", ppt: "slide", pptx: "slide", odp: "slide" };

/** A small coloured file badge with the extension on it, used by List. */
export const FileBadge = ({ doc, small = false }) => {
  const ext = getExtension(doc);
  const category = getCategory(doc);
  const tone = category === "Documents" ? DOC_TONE[ext] || "other" : BADGE_TONE[category] || "other";
  const label = (ext || "File").slice(0, 4).toUpperCase();

  return (
    <span className={`bplDl-badge bplDl-badge--${tone}${small ? " bplDl-badge--sm" : ""}`} aria-hidden="true">
      {label}
    </span>
  );
};

/**
 * View and Download buttons for the List layout. Visibility and text come
 * from the shared Document Box settings, so every layout follows the same
 * switches. Grid keeps its own markup and hides these through CSS, as before.
 */
export const RowActions = ({ doc, viewButton = {}, downloadButton = {}, onView, onDownload }) => {
  const showView = viewButton.isDisplay !== false;
  const showDownload = downloadButton.isDisplay !== false;
  if (!showView && !showDownload) return null;

  const viewText = viewButton.text || "View";
  const downloadText = downloadButton.text || "Download";

  return (
    <div className="bplDl-row-actions">
      {showView && (
        <button
          type="button"
          className="bplDl-btn bplDl-view-btn"
          onClick={() => onView(doc)}
          aria-label={viewButton.isText === false ? `${viewText}: ${doc.title}` : undefined}
        >
          <Eye className="bplDl-btn-icon" aria-hidden="true" />
          {viewButton.isText !== false && <span>{viewText}</span>}
        </button>
      )}
      {showDownload && (
        <button
          type="button"
          className="bplDl-btn bplDl-download-btn"
          onClick={() => onDownload(doc)}
          {...insightsProps(doc)}
          aria-label={downloadButton.isText === false ? `${downloadText}: ${doc.title}` : undefined}
        >
          <Download className="bplDl-btn-icon" aria-hidden="true" />
          {downloadButton.isText !== false && <span>{downloadText}</span>}
        </button>
      )}
    </div>
  );
};

export const LoadMore = ({ hasMore, onClick }) =>
  hasMore ? (
    <div className="bplDl-load-more">
      <button type="button" className="bplDl-load-more-btn" onClick={onClick}>
        Load more
      </button>
    </div>
  ) : null;

export const EmptyState = ({ icon, text }) => (
  <div className="bplDl-empty">
    {icon}
    <p className="bplDl-empty-text">{text || "No documents found"}</p>
  </div>
);
