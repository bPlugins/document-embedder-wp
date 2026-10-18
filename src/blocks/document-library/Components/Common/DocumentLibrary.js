import { useState } from "react";
import {
  Search,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
} from "lucide-react";
import "../../style.scss";
import "./Templates/templates.scss";
import DocumentModal from "./DocumentModal";
import Style from "./Style";
import { defaultValues, getTemplate, normalizeKeys } from "../../../../DocumentLibrary/Utils/options";
import { handleDownload, useLibraryDocuments } from "./libraryData";
import { safeDocUrl } from "../../../../utils/safeUrl";
import Grid from "./Templates/Grid";
import List from "./Templates/List";

function DocumentLibrary(props) {
  const { settingsData: rawSettingsData, id = null } = props;
  const settingsData = normalizeKeys(rawSettingsData, defaultValues.settings);
  const [previewDoc, setPreviewDoc] = useState(null);

  // A shortcode can ask for a different layout than the one saved: [document_library id="5" template="list"].
  const template = getTemplate({ template: props.template || settingsData.template });
  const layouts = settingsData?.templates || {};

  const { header, documentLibrary } = settingsData;
  const { documentBox, docItems: rawDocItems = [] } = documentLibrary;
  // Item URLs become links, previews and a programmatic download click; drop any that would run script.
  const docItems = Array.isArray(rawDocItems)
    ? rawDocItems.map((item) => (item && typeof item === "object" ? { ...item, url: safeDocUrl(item.url) } : item))
    : rawDocItems;
  const { downloadButton, viewButton, options } = documentBox;

  const {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    sortOption,
    setSortOption,
    existingCategories,
    sortedDocuments,
  } = useLibraryDocuments(docItems);

  const getFileIcon = (type = "") => {
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

  const actions = {
    viewButton,
    downloadButton,
    onView: (doc) => setPreviewDoc(doc),
    onDownload: handleDownload,
  };

  return (
    <>
      <Style settingsData={settingsData} id={id} template={template} />
      <div className={`bplDl-container bplDl-layout-${template}`}>
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

          {template === "list" ? (
            <List
              docs={sortedDocuments}
              options={options}
              list={layouts.list || {}}
              perPage={layouts.list?.perPage}
              {...actions}
            />
          ) : (
            <Grid
              docs={sortedDocuments}
              options={options}
              getFileIcon={getFileIcon}
              perPage={layouts.grid?.perPage}
              {...actions}
            />
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
