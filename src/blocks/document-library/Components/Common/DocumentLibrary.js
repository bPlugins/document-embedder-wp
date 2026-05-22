import { useState, useEffect } from "react";
import {
  Search,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Eye,
  Calendar,
} from "lucide-react";
import "../../style.scss";
import DocumentModal from "./DocumentModal";
import Style from "./Style";
import { defaultValues, normalizeKeys } from "../../../../DocumentLibrary/Utils/options";

function DocumentLibrary(props) {
  const { settingsData: rawSettingsData, id = null } = props;
  const settingsData = normalizeKeys(rawSettingsData, defaultValues.settings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [sortOption, setSortOption] = useState("default");

  const { header, documentLibrary } = settingsData;
  const { documentBox, docItems = [] } = documentLibrary;
  const { downloadButton, viewButton, options } = documentBox;
  const { displaySize, displayDate, displayIcon } = options;

  const [documents, setDocuments] = useState([...docItems]);

  useEffect(() => {
    setDocuments([...docItems]);
  }, [docItems]);

  const getFileIcon = (type) => {
    if (type.includes("pdf") || type.includes("doc"))
      return <FileText className="bplDl-icon" />;
    if (type.includes("png") || type.includes("jpg") || type.includes("jpeg"))
      return <Image className="bplDl-icon" />;
    if (type.includes("mp4") || type.includes("avi") || type.includes("mov"))
      return <Video className="bplDl-icon" />;
    if (type.includes("mp3") || type.includes("wav"))
      return <Music className="bplDl-icon" />;
    if (type.includes("zip") || type.includes("rar"))
      return <Archive className="bplDl-icon" />;
    return <File className="bplDl-icon" />;
  };

  const handleDownload = (doc) => {
    const url = doc.url;
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.title;
    link.click();
    URL.revokeObjectURL(url);
  };

  const CATEGORY_MAP = {
    Images: ["png", "jpg", "jpeg", "gif", "webp"],
    Videos: ["mp4", "avi", "mov", "mkv"],
    PDF: ["pdf"],
    Documents: ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pages"],
    Audio: ["mp3", "wav", "ogg"],
    Archives: ["zip", "rar", "7z"],
  };

  const getCategory = (doc) => {
    const url = doc.url || "";
    const lower = url.toLowerCase();
    const ext = lower.split(".").pop().split("?")[0].split("#")[0];

    for (const [category, exts] of Object.entries(CATEGORY_MAP)) {
      if (exts.includes(ext)) return category;
    }

    return "Others";
  };

  const existingCategories = Array.from(
    new Set(documents.map((doc) => getCategory(doc)))
  );

  const filteredDocuments = documents.filter((doc) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(search) ||
      (doc.url?.toLowerCase() ?? "").includes(search);

    const category = getCategory(doc);
    const matchesType = selectedType === "all" || category === selectedType;

    return matchesSearch && matchesType;
  });

  // Convert "13/07/2025" → Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Convert "370.92 KB" → bytes
  const parseSize = (sizeStr) => {
    if (!sizeStr) return 0;
    const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
    const [num, unit] = sizeStr.split(" ");
    return parseFloat(num) * (units[unit] || 1);
  };

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);

      case "date-asc":
        return parseDate(a.date) - parseDate(b.date);
      case "date-desc":
        return parseDate(b.date) - parseDate(a.date);

      case "size-asc":
        return parseSize(a.size) - parseSize(b.size);
      case "size-desc":
        return parseSize(b.size) - parseSize(a.size);

      default:
        return 0;
    }
  });

  return (
    <>
      <Style settingsData={settingsData} id={id} />
      <div className="bplDl-container">
        <div className="bplDl-header">
          <h1 className="bplDl-title">{header.title}</h1>
          <p className="bplDl-subtitle">{header.description}</p>
        </div>

        <div className="bplDl-content">
          <div className="bplDl-toolbar">
            <div className="bplDl-search">
              <Search className="bplDl-search-icon" />
              <input
                type="text"
                placeholder="Search documents, authors, or tags..."
                className="bplDl-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="bplDl-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {existingCategories.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className="bplDl-select-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort By</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="date-desc">Date (Newest)</option>
              <option value="size-asc">Size (Smallest)</option>
              <option value="size-desc">Size (Largest)</option>
            </select>
          </div>

          {sortedDocuments.length !== 0 ? (
            <div className="bplDl-grid">
              {sortedDocuments.map((doc) => (
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
                      onClick={() => {
                        setPreviewDoc(doc);
                      }}
                    >
                      <Eye className="bplDl-btn-icon" />
                      <span>{viewButton.text}</span>
                    </button>

                    <button
                      type="button"
                      className="bplDl-btn bplDl-download-btn"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="bplDl-btn-icon" />
                      <span>{downloadButton.text}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bplDl-empty">
              <File className="bplDl-empty-icon" />
              <p className="bplDl-empty-text">No documents found</p>
            </div>
          )}
        </div>
      </div>

      <DocumentModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </>
  );
}

export default DocumentLibrary;
