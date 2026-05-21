import { useState } from "react";
import { uploadMedia } from "@wordpress/media-utils";
import "./UploadDocs.scss";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";
import { LinkIcon, MediaIcon, UploadIcon } from "../../Utils/icons";

const UploadDocuments = ({
  formData,
  onFormDataUpdate,
  isPremium,
  openProModal,
}) => {
  const { settings } = formData;
  const { documentLibrary } = settings;
  const { docItems = [] } = documentLibrary;
  const currentUser = window.bpldeSettings?.currentUser;

  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState(currentUser);
  const [description, setDescription] = useState("");
  const [activeUploadOption, setActiveUploadOption] = useState("");
  const [pendingDoc, setPendingDoc] = useState(null);
  const [uploadNotice, setUploadNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || !files.length) return;

    const file = files[0];

    uploadMedia({
      filesList: [file],
      onFileChange: (media) => {
        const m = media[0];
        setPendingDoc({
          id: m.id,
          url: m.url,
          title: m.title || m.filename,
          size: m.filesizeInBytes
            ? `${(m.filesizeInBytes / 1024).toFixed(2)} KB`
            : "Unknown",
          type: m.mime_type,
          author: window.bpldeSettings.athorName,
          description: "",
        });
      },
      onError: (err) => console.error(`Error: ${err}`),
    });
  };

  const hasReachedLimit = (extra = 1) => {
    if (isPremium) return false;
    return docItems.length + extra > 5;
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown Date";
    }
  };

  const saveDoc = () => {
    if (!pendingDoc) return;

    if (hasReachedLimit()) {
      openProModal();
      return;
    }

    const enrichedDoc = {
      id: pendingDoc.id || Date.now(),
      url: pendingDoc.url,
      title: pendingDoc.title || "Untitled",
      size: pendingDoc.size || "Unknown",
      type: pendingDoc.type || "custom/url",
      date: pendingDoc.date
        ? formatDate(pendingDoc.date)
        : formatDate(new Date()),
      author: pendingDoc.author || window.bpldeSettings.athorName,
      description: pendingDoc.description || description,
    };

    const updatedDocs = [...docItems, enrichedDoc];
    onFormDataUpdate("settings.documentLibrary.docItems", updatedDocs);

    setPendingDoc(null);
    setDescription("");

    setUploadNotice("✅ Document has been saved successfully.");
    setTimeout(() => setUploadNotice(""), 4000);
  };

  /** Upload From Device */
  const handleDeviceUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const file = files[0];
    uploadMedia({
      filesList: [file],
      onFileChange: (media) => {
        const m = media[0];
        setPendingDoc({
          id: m.id,
          url: m.url,
          title: m.title || m.filename,
          size: m.filesizeInBytes
            ? `${(m.filesizeInBytes / 1024).toFixed(2)} KB`
            : m.media_details?.filesize
              ? `${(m.media_details?.filesize / 1024).toFixed()} KB`
              : "Unknown",
          type: m.mime_type,
          author: window.bpldeSettings.athorName,
          description: "",
        });
      },
      onError: (err) => console.error(`Error: ${err}`),
    });
  };

  const getFileSizeFromUrl = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");

      if (contentLength) {
        let size = Number(contentLength);
        let i = Math.floor(Math.log(size) / Math.log(1024));
        let units = ["B", "KB", "MB", "GB", "TB"];
        let fileSize = (size / Math.pow(1024, i)).toFixed(2) + " " + units[i];
        return fileSize;
      } else {
        return "Unknown size";
      }
    } catch (err) {
      return "Error";
    }
  };

  const getFileNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split("/").filter(Boolean);
      return segments.length ? segments[segments.length - 1] : url;
    } catch (err) {
      return url;
    }
  };

  /** Upload Via URL */
  const handleUrlUpload = async () => {
    if (!url) return;

    if (hasReachedLimit()) {
      openProModal();
      return;
    }

    const size = await getFileSizeFromUrl(url);
    const title = getFileNameFromUrl(url);

    setPendingDoc({
      id: Date.now(),
      url,
      title,
      size,
      type: "custom/url",
      author: window.bpldeSettings.athorName,
      description: "",
    });

    setUrl("");
  };

  /** Media Library */
  const openLibraryModal = () => {
    const frame = wp.media({
      title: "Select Documents",
      multiple: true,
      button: { text: "Use these documents" },
    });

    frame.on("select", () => {
      const selection = frame.state().get("selection");
      const files = selection.map((file) => file.toJSON());

      if (hasReachedLimit(files.length)) {
        openProModal();
        return;
      }

      const mapped = files.map((f) => ({
        id: f.id,
        url: f.url,
        title: f.title || f.filename,
        size: f.filesizeInBytes
          ? `${(f.filesizeInBytes / 1024).toFixed(2)} KB`
          : "Unknown",
        type: f.filename,
        date: f.date ? formatDate(f.date) : formatDate(new Date()),
        author,
        description: "",
      }));

      const updatedDocs = [...docItems, ...mapped];
      onFormDataUpdate("settings.documentLibrary.docItems", updatedDocs);

      setUploadNotice(
        "✅ Your documents have been uploaded from Media Library."
      );
      setTimeout(() => setUploadNotice(""), 4000);
    });

    frame.open();
  };

  return (
    <>
      <SectionTitle title="Upload Document" icon={<UploadIcon />} />
      <div className="bpl-upload-docs">

        <div className={`upload-box ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}>
          
          <div className="upload-actions">
            <button
              type="button"
              onClick={() => {
                setActiveUploadOption("device");
                document.getElementById("device-upload").click();
              }}
              className="upload-option-button upload-btn"
            >
              <span><UploadIcon/></span>
              Upload From Device
            </button>
            <input
              type="file"
              id="device-upload"
              onChange={handleDeviceUpload}
              hidden
            />

            <button
              type="button"
              onClick={() => setActiveUploadOption("url")}
              className={`upload-btn upload-option-button ${activeUploadOption === "url" ? "active" : ""
                }`}
            >
              <LinkIcon/>
              Insert Using URL
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveUploadOption("media-library");
                openLibraryModal();
              }}
              className="upload-btn upload-option-button"
            >
              <span><MediaIcon/></span>
              Choose From Media Library
            </button>
          </div>
          {/* Upload Via URL */}
          {activeUploadOption === "url" && (
            <>
              <div className="upload-url-box">
                <input
                  type="text"
                  className="upload-url"
                  placeholder="Enter document URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button type="button" onClick={handleUrlUpload}>Add</button>
              </div>
            </>
          )}
          <p>Drag and drop files here to upload</p>
        </div>

        {/* Loading For Doc Details */}
        {pendingDoc && !pendingDoc?.id && (
          <div className="loading-docs">
            <div className="loading-circle"></div>
            <p>Loading Document Details...</p>
          </div>
        )}

        {uploadNotice && <p className="upload-notice">{uploadNotice}</p>}

        {/* Single Doc Meta Section (only for device + url) */}
        {pendingDoc?.id && activeUploadOption !== "media-library" && (
          <div className="docs-meta">
            <SectionTitle title="Document Details" icon={<UploadIcon />} />
            <div className="docs-meta-grid">
              <div className="meta-col">
                <label>Title</label>
                <input
                  type="text"
                  value={pendingDoc.title}
                  onChange={(e) =>
                    setPendingDoc({ ...pendingDoc, title: e.target.value })
                  }
                />
              </div>
              <div className="meta-col">
                <label>Author</label>
                <p>{pendingDoc.author}</p>
              </div>
              <div className="meta-col full">
                <label>Description</label>
                <textarea
                  value={pendingDoc.description}
                  onChange={(e) =>
                    setPendingDoc({ ...pendingDoc, description: e.target.value })
                  }
                />
              </div>
              <div className="meta-col">
                <label>File Size</label>
                <p>{pendingDoc.size}</p>
              </div>
            </div>
            <button type="button" className="save-docs-btn" onClick={saveDoc}>
              Save Document
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadDocuments;
