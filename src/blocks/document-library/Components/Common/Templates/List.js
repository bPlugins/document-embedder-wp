import { Calendar, File } from "lucide-react";
import { getExtension, useLoadMore } from "../libraryData";
import { EmptyState, FileBadge, LoadMore, RowActions } from "./parts";

const ListRow = ({ doc, options, list, ...actions }) => {
  const compact = list.density === "compact";
  const ext = getExtension(doc);

  const meta = [];
  if (list.showType && ext) meta.push(<span key="type" className="bplDl-list-type">{ext.toUpperCase()}</span>);
  if (options.displaySize && doc.size) meta.push(<span key="size" className="bplDl-list-size">{doc.size}</span>);
  if (options.displayDate && doc.date) {
    meta.push(
      <span key="date" className="bplDl-list-date">
        <Calendar className="bplDl-meta-icon" aria-hidden="true" /> {doc.date}
      </span>
    );
  }
  if (list.showAuthor && doc.author) meta.push(<span key="author" className="bplDl-list-author">{doc.author}</span>);

  return (
    <li className="bplDl-list-row">
      {options.displayIcon && <FileBadge doc={doc} small={compact} />}

      <div className="bplDl-list-body">
        <h3 className="bplDl-list-title">{doc.title}</h3>
        {list.showDescription && !compact && doc.description && (
          <p className="bplDl-list-desc">{doc.description}</p>
        )}
        {meta.length > 0 && <div className="bplDl-list-meta">{meta}</div>}
      </div>

      <RowActions doc={doc} {...actions} />
    </li>
  );
};

/**
 * One document per row. Visibility of icon, size and date follows the shared
 * Document Box switches; the rest is List's own (templates.list).
 */
const List = ({
  docs,
  options = {},
  list = {},
  perPage = 0,
  viewButton,
  downloadButton,
  onView,
  onDownload,
}) => {
  const { visible, hasMore, loadMore } = useLoadMore(docs, perPage);

  if (docs.length === 0) {
    return <EmptyState icon={<File className="bplDl-empty-icon" />} />;
  }

  const actions = { viewButton, downloadButton, onView, onDownload };
  const className = `bplDl-list bplDl-list--${list.density === "compact" ? "compact" : "comfortable"}`;

  return (
    <>
      <div className={className}>
        <ul className="bplDl-list-items">
          {visible.map((doc) => (
            <ListRow key={`${doc.id}-${doc.title}`} doc={doc} options={options} list={list} {...actions} />
          ))}
        </ul>
      </div>
      <LoadMore hasMore={hasMore} onClick={loadMore} />
    </>
  );
};

export default List;
