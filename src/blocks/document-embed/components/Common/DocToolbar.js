import React from "react";

const DocToolbar = ({
  filename,
  showName,
  download,
  position = "toolbar",
  limitReached,
  isRestricted,
  downloadAccessMessage = "Access Denied",
  downloadButtonText = "Download",
  downloadShowCount,
  downloadCount,
  handleDownloadClick,
  doc,
  downloadFilename,
  behavior = "download",
  theme = "dark",
  showFullscreen = false,
  onFullscreenClick,
  fullscreenTitle = "Full screen",
}) => {
  if (!showName && !download && !showFullscreen) return null;

  const renderDownloadButton = () => {
    if (limitReached) {
      return (
        <button
          disabled
          style={{
            background: "transparent",
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid #ff4d4d",
            color: "#ff4d4d",
            cursor: "not-allowed",
          }}
          title="Download limit reached for your IP."
        >
          Limit Reached
        </button>
      );
    }

    if (isRestricted) {
      return (
        <span className="de-access-denied-msg">
          {downloadAccessMessage}
        </span>
      );
    }

    const btnLabel = downloadButtonText || "Download";
    const downloadCountHtml = downloadShowCount ? (
      <span
        className="ppv-download-count"
        style={{
          marginLeft: "8px",
          fontSize: "12px",
          color: "#999",
          fontWeight: "500",
        }}
      >
        ({downloadCount} {downloadCount === 1 ? "download" : "downloads"})
      </span>
    ) : null;

    const dlAttr = downloadFilename ? downloadFilename : true;
    const isNewTab = behavior === "newtab";

    return (
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <a
          className="s_pdf_download_link"
          style={{ display: "flex", textDecoration: "none" }}
          href={doc}
          target={isNewTab ? "_blank" : undefined}
          rel={isNewTab ? "noopener noreferrer" : undefined}
          download={isNewTab ? undefined : dlAttr}
        >
          <button
            style={{
              background: "transparent",
              padding: "4px 10px",
              borderRadius: "4px",
              border: "1px solid #cececf",
              color: "#cececf",
              cursor: "pointer",
              fontSize: "12px",
            }}
            className="ppv_download_bttn"
            onClick={handleDownloadClick}
          >
            {btnLabel}
          </button>
        </a>
        {downloadCountHtml}
      </div>
    );
  };

  const renderFullscreenButton = () => (
    <button
      type="button"
      className="ppv_fullscreen_bttn"
      onClick={onFullscreenClick}
      title={fullscreenTitle}
      aria-label={fullscreenTitle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        padding: "4px 8px",
        borderRadius: "4px",
        border: "1px solid #cececf",
        color: "#cececf",
        cursor: "pointer",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>
    </button>
  );

  const justify = !showName ? "flex-end" : "space-between";

  const renderRightGroup = () =>
    (download || showFullscreen) && (
      <div className="ppv-toolbar-right" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        {download && renderDownloadButton()}
        {showFullscreen && renderFullscreenButton()}
      </div>
    );

  if (position === "lightbox" || position === "toolbar") {
    return (
      <div className={`ppv-toolbar ${theme}`} style={{ display: "flex", justifyContent: justify }}>
        {showName && <span className="ppv-filename">{filename}</span>}
        {renderRightGroup()}
      </div>
    );
  }

  if (position === "below") {
    return (
      <div className={`ppv-toolbar ${theme}`} style={{ display: "flex", justifyContent: justify, marginTop: 0 }}>
        {showName && <span className="ppv-filename">{filename}</span>}
        {renderRightGroup()}
      </div>
    );
  }

  if (position === "above") {
    return (
      <div style={{ marginBottom: "10px" }}>
        {showName && <p style={{ paddingLeft: "10px", margin: "0 0 10px 0" }}>{filename}</p>}
        {download && (
          <div style={{ marginBottom: "10px" }}>
            {renderDownloadButton()}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DocToolbar;
