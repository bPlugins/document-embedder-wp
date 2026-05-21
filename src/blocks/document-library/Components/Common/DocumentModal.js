import React from "react";
import { X } from "lucide-react";

const fileType = (url) => url.split(".").pop().toLowerCase();

const renderPreview = (doc) => {
  const type = fileType(doc.url);
  const url = doc.url;

  // ✅ Image
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(type)) {
    return <img src={url} alt={doc.title} className="bplDl-preview-image" />;
  }

  // ✅ Video
  if (["mp4", "webm", "ogg"].includes(type)) {
    return <video controls src={url} className="bplDl-preview-video" />;
  }

  // ✅ Audio
  if (["mp3", "wav", "ogg"].includes(type)) {
    return (
      <div className="bplDl-audio-wrapper">
        <audio controls className="bplDl-audio-player">
          <source src={url} type={`audio/${type}`} />
          Your browser does not support the audio element.
        </audio>
        <p className="bplDl-audio-title">{doc.title}</p>
      </div>
    );
  }

  // ✅ PDF
  if (type === "pdf") {
    return (
      <iframe
        src={`//docs.google.com/gview?embedded=true&url=${url}`}
        title={doc.title}
        className="bplDl-preview-iframe"
      />
      // <iframe src={url} title={doc.title} className="bplDl-preview-iframe" />
    );
  }

  // ✅ PowerPoint
  if (["ppt", "pptx"].includes(type)) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          url
        )}`}
        className="bplDl-preview-iframe"
        title={doc.title}
      />
    );
  }

  // ✅ Excel
  if (["xls", "xlsx"].includes(type)) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          url
        )}`}
        className="bplDl-preview-iframe"
        title={doc.title}
      />
    );
  }

  // ✅ Word
  if (["doc", "docx"].includes(type)) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          url
        )}`}
        className="bplDl-preview-iframe"
        title={doc.title}
      />
    );
  }

  // ✅ Default: Try browser inline first, then download
  return (
    <div className="bplDl-preview-unknown">
      <iframe src={url} title={doc.title} className="bplDl-preview-iframe" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="bplDl-download-link"
      >
        Download File
      </a>
    </div>
  );
};

const DocumentModal = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="bplDl-modal-overlay">
      <div className="bplDl-modal">
        <button type="button" className="bplDl-modal-close" onClick={onClose}>
          <X />
        </button>
        <div className="bplDl-modal-body">{renderPreview(document)}</div>
      </div>
    </div>
  );
};

export default DocumentModal;
