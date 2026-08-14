import React from "react";
import { X } from "lucide-react";

// Strip the query string / hash before reading the extension so "file.pdf?ver=2" is still
// detected as a PDF instead of falling through to the generic branch.
const fileType = (url) =>
  String(url || "")
    .split(/[?#]/)[0]
    .split(".")
    .pop()
    .toLowerCase();

// The bundled pdf.js viewer lives inside the plugin folder. Its base URL is localized under a
// different global on each screen this component renders on (block front end, block editor, and
// the two Document Library admin screens), so check them all. When none is available — e.g. an
// install whose PHP has not been updated yet — we return "" and the Google Docs Viewer path is
// kept, so nothing breaks.
const getPluginUrl = () => {
  if (typeof window === "undefined") return "";
  const url =
    window.bpldlData?.pluginUrl ||
    window.ppvBlocks?.pluginUrl ||
    window.bpldeSettings?.pluginUrl ||
    "";
  return typeof url === "string" ? url : "";
};

const isSameOrigin = (url) => {
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
};

const gviewSrc = (url) =>
  `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

// "raw=1" is the viewer's reader mode: it hides the pdf.js toolbar and bottom bar so the modal
// shows nothing but the pages. The card's own Download button covers the toolbar's only action
// the modal would otherwise lose.
const pdfjsSrc = (pluginUrl, url) =>
  `${pluginUrl}assets/pdfjs-new/web/viewer.html?file=${encodeURIComponent(
    url
  )}&raw=1`;

/**
 * PDF preview.
 *
 * Google Docs Viewer renders server side: Google has to download the file itself, so it returns
 * "No preview available" for any URL it cannot reach from the public internet (local/staging
 * sites, intranets, sites behind basic auth, protected uploads).
 *
 * Files served from this site are therefore rendered with the pdf.js viewer already bundled with
 * the plugin — it draws the PDF in the visitor's own browser, so reachability never matters, and
 * it can read login-protected files because the request carries the visitor's own cookies.
 *
 * Files on another host keep the Google Docs Viewer path: pdf.js refuses a cross-origin `file`
 * param ("file origin does not match viewer's"), so it is not an option there, while Google needs
 * no CORS headers from the remote host.
 */
const PdfPreview = ({ doc }) => {
  const pluginUrl = getPluginUrl();
  const src =
    pluginUrl && isSameOrigin(doc.url)
      ? pdfjsSrc(pluginUrl, doc.url)
      : gviewSrc(doc.url);

  return (
    <iframe
      src={src}
      title={doc.title}
      className="bplDl-preview-iframe"
      allowFullScreen
      allow="fullscreen"
    />
  );
};

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
    return <PdfPreview doc={doc} />;
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
