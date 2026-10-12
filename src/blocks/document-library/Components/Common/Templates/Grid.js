import { Calendar, Download, Eye, File } from "lucide-react";
import { useLoadMore } from "../libraryData";
import { EmptyState, LoadMore } from "./parts";

/**
 * The original card grid. The markup and class names are exactly what
 * DocumentLibrary.js rendered before layouts existed: site owners target
 * .bplDl-grid / .bplDl-card / .bplDl-btn in their own CSS, and Style.js hides
 * the icon, size, date and buttons through those same selectors.
 */
const Grid = ({ docs, options = {}, viewButton = {}, downloadButton = {}, getFileIcon, onView, onDownload, perPage = 0 }) => {
  const { displayIcon, displaySize, displayDate } = options;
  const { visible, hasMore, loadMore } = useLoadMore(docs, perPage);

  if (docs.length === 0) {
    return <EmptyState icon={<File className="bplDl-empty-icon" />} />;
  }

  return (
    <>
      <div className="bplDl-grid">
        {visible.map((doc) => (
          <div key={`${doc.id}-${doc.title}`} className="bplDl-card">
            {displayIcon && (
              <div className="bplDl-card-top">
                {getFileIcon(doc?.type)}
              </div>
            )}

            <h3 className="bplDl-name">{doc.title}</h3>
            {displaySize && (
              <p className="bplDl-size">Size: {doc.size}</p>
            )}

            {displayDate && (
              <div className="bplDl-meta">
                <Calendar className="bplDl-meta-icon" /> {doc.date}
              </div>
            )}

            <div className="bplDl-actions">
              <button
                type="button"
                className="bplDl-btn bplDl-view-btn"
                onClick={() => onView(doc)}
              >
                <Eye className="bplDl-btn-icon" />
                <span>{viewButton.text}</span>
              </button>

              <button
                type="button"
                className="bplDl-btn bplDl-download-btn"
                onClick={() => onDownload(doc)}
              >
                <Download className="bplDl-btn-icon" />
                <span>{downloadButton.text}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <LoadMore hasMore={hasMore} onClick={loadMore} />
    </>
  );
};

export default Grid;
