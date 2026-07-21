import { useState, useEffect, useRef } from "react";
import { __ } from "@wordpress/i18n";
import PDFJSViewer from "./PDFJSViewer";
import IframePreview from "./IframePreview";
import FlipbookViewer from "./FlipbookViewer";
import Style from "./Style";
import EmailGate from "./EmailGate";
import DocToolbar from "./DocToolbar";

const Viewer = ({ attributes, userData = {}, pluginUrl = "", postId = 0, id = "" }) => {
  const {
    documentSource = {},
    toolbar = {},
    securityRestrictions = {},
    downloadManagement = {},
    lightbox = {},
    performance = {},
  } = attributes;

  const { doc = "", viewer = "default", googleDrive = false, enableFullscreen = false, onDemandRendering = false, fullscreenNewTab = false, readerMode = false, toggleThumbnails = false, sidebarOpen = false, loadLatestVersion = false, hrScrollbar = false, initialPage = 1, defaultZoom = "" } = documentSource;
  const { showName = false, download = false, _de_download_position = "toolbar", theme = "dark", toolbar_bg_color = "#343434", toolbar_text_color = "#ffffff" } = toolbar;
  const { disablePopout = false, loading_icon = false } = securityRestrictions;
  // Reliability: auto-fallback if the Google Docs Viewer times out. Defaults on; only acts on failure.
  const { gviewFallback = true } = performance;
  const {
    downloadButtonText = "Download",
    _de_download_behavior = "download",
    _de_download_filename = "",
    _de_download_show_count = false,
    _de_download_limit = 0,
    _de_download_access = "everyone",
    _de_download_access_roles = [],
    _de_download_access_message = "Access Denied",
    _de_email_gate = false,
  } = downloadManagement;

  const {
    lightbox: isLightboxEnabled = false,
    lightbox_btn_text = "View Document",
    lightbox_btn_size = "medium",
    lightbox_trigger_type = "button",
    lightbox_trigger_selector = "",
    lightbox_trigger_image = "",
    lightbox_trigger_image_width = "300px",
    lightbox_trigger_image_height = "auto",
    lightbox_trigger_image_radius = "8px",
    lightbox_trigger_image_align = "left",
    lightbox_trigger_image_fit = "cover",
  } = lightbox;

  const [downloadCount, setDownloadCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Google Docs Viewer downtime fallback state.
  const [gviewFailed, setGviewFailed] = useState(false);

  const handleGViewError = () => {
    if (gviewFallback) {
      setGviewFailed(true);
    }
  };

  // Email Gate state
  const [showEmailGate, setShowEmailGate] = useState(false);

  // Ref to the element wrapping the PDF preview, used for native full-screen from the plugin toolbar.
  const previewRef = useRef(null);

  const toggleFullscreen = () => {
    const el = previewRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen)?.call(document);
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
    }
  };

  useEffect(() => {
    if (userData.limitReached) {
      setLimitReached(true);
    }
    if (userData.downloadCount) {
      setDownloadCount(userData.downloadCount);
    }
  }, [userData]);

  // Lightbox "custom element" trigger: open this embed's modal when a matching element
  // anywhere on the page is clicked. Scoped to this component instance, so multiple embeds
  // with different selectors coexist without conflict.
  useEffect(() => {
    if (!isLightboxEnabled || lightbox_trigger_type !== "selector" || !lightbox_trigger_selector) {
      return undefined;
    }
    const handler = (e) => {
      const target = e.target.closest(lightbox_trigger_selector);
      if (target) {
        e.preventDefault();
        setIsLightboxOpen(true);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isLightboxEnabled, lightbox_trigger_type, lightbox_trigger_selector]);

  const filename = doc ? doc.substring(doc.lastIndexOf("/") + 1) : "";

  const getFileExtension = (url) => {
    if (!url) return "";
    try {
      const cleanUrl = url.split(/[?#]/)[0];
      return cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1).toLowerCase();
    } catch (e) {
      return "";
    }
  };

  const ext = getFileExtension(doc);
  let frameUrl = "";

  const isGoogleUrl = doc.includes("drive.google.com") || doc.includes("docs.google.com");

  if (doc.includes("dropbox.com")) {
    frameUrl = doc.replace("www.dropbox.com", "dl.dropboxusercontent.com");
  } else if (isGoogleUrl) {
    frameUrl = doc.replace("/view", "/preview");
  } else if (googleDrive) {
    frameUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc)}`;
  } else if (ext === "pdf") {
    if (viewer === "custom") {
      let docUrl = doc;
      if (loadLatestVersion) {
        const separator = docUrl.includes("?") ? "&" : "?";
        docUrl += `${separator}v=${Date.now()}`;
      }
      frameUrl = `${pluginUrl}assets/pdfjs-new/web/viewer.html?file=${encodeURIComponent(docUrl)}&toolbar_theme=${theme}&toolbar_bg_color=${encodeURIComponent(toolbar_bg_color)}&toolbar_text_color=${encodeURIComponent(toolbar_text_color)}`;
      // Custom-PDF-viewer-only features. Appended only on this branch, so the Default/Google Drive path is untouched.
      // Full-screen & open-in-new-tab: when the plugin toolbar is present we render one button there
      // (its action depends on fullscreenNewTab), so only fall back to pdf.js's own buttons when there
      // is no plugin toolbar (showName/download both off).
      const hasPluginToolbar = showName || download;
      if (enableFullscreen && !hasPluginToolbar) {
        frameUrl += "&fullscreenBtn=1";
      }
      if (onDemandRendering) {
        frameUrl += "&onDemandRender=1";
      }
      if (fullscreenNewTab && !hasPluginToolbar) {
        frameUrl += "&newTabBtn=1";
      }
      if (readerMode) frameUrl += "&raw=1";
      if (toggleThumbnails) frameUrl += "&side=true";
      if (sidebarOpen) frameUrl += "&open=true";
      if (hrScrollbar) frameUrl += "&hrscroll=vera";
      if (defaultZoom) frameUrl += `&z=${encodeURIComponent(defaultZoom)}`;
      if (initialPage > 1) frameUrl += `#page=${initialPage}`;

    } else {
      frameUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc)}`;
    }
  } else if (["ppt", "pptx", "xls", "xlsx", "doc", "docx"].includes(ext)) {
    frameUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc)}`;
  } else {
    frameUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc)}`;
  }

  const isDownloadRestricted = () => {
    if (_de_download_access === "loggedin" && !userData.isLoggedIn) {
      return true;
    }
    if (_de_download_access === "roles") {
      if (!userData.isLoggedIn) return true;
      const allowedRoles = Array.isArray(_de_download_access_roles) ? _de_download_access_roles : [];
      const userRoles = Array.isArray(userData.userRoles) ? userData.userRoles : [];
      const hasAccess = allowedRoles.some((role) => userRoles.includes(role));
      return !hasAccess;
    }
    return false;
  };

  const trackDownload = (behavior, newTab) => {
    if (typeof window.bplde_obj === "undefined") {
      if (behavior === "newtab" && newTab) {
        newTab.location.href = doc;
      } else {
        const link = document.createElement("a");
        link.href = doc;
        link.download = _de_download_filename || true;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return;
    }

    const formData = new FormData();
    formData.append("action", "de_track_download");
    formData.append("nonce", window.bplde_obj.track_nonce);
    formData.append("document_id", postId);

    fetch(window.bplde_obj.ajax_url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDownloadCount(res.data.count);
          if (res.data.limit_reached || (res.data.count >= parseInt(_de_download_limit) && parseInt(_de_download_limit) > 0)) {
            setLimitReached(true);
          }
          const downloadUrl = `${window.bplde_obj.rest_url}download/${postId}?de_nonce=${res.data.nonce}&behavior=${encodeURIComponent(behavior)}&filename=${encodeURIComponent(_de_download_filename)}`;
          if (behavior === "newtab" && newTab) {
            newTab.location.href = downloadUrl;
          } else {
            window.location.href = downloadUrl;
          }
        } else {
          if (behavior === "newtab" && newTab) {
            newTab.location.href = doc;
          } else {
            const link = document.createElement("a");
            link.href = doc;
            link.download = _de_download_filename || true;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      })
      .catch(() => {
        if (behavior === "newtab" && newTab) {
          newTab.location.href = doc;
        } else {
          const link = document.createElement("a");
          link.href = doc;
          link.download = _de_download_filename || true;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (_de_email_gate) {
      setShowEmailGate(true);
    } else {
      let newTab = null;
      if (_de_download_behavior === "newtab") {
        newTab = window.open("about:blank", "_blank");
      }
      trackDownload(_de_download_behavior, newTab);
    }
  };


  const isRestricted = isDownloadRestricted();
  const toolbarPosition = _de_download_position || "toolbar";

  // Show the full-screen control on the plugin toolbar only for a Custom-PDF viewer with either feature on
  // AND when the toolbar actually renders (DocToolbar returns null unless showName or download is set).
  const isCustomPdf = viewer === "custom" && ext === "pdf";
  const showFullscreenInToolbar = isCustomPdf && (enableFullscreen || fullscreenNewTab) && (showName || download);

  // One toolbar button, two behaviors: open the viewer in a new tab when that option is on,
  // otherwise go full-screen in place.
  const handleToolbarFullscreen = () => {
    if (fullscreenNewTab) {
      window.open(frameUrl, "_blank", "noopener");
    } else {
      toggleFullscreen();
    }
  };
  const fullscreenTitle = fullscreenNewTab
    ? __("Open in new tab", "document-emberdder")
    : __("Full screen", "document-emberdder");



  const openLightbox = () => setIsLightboxOpen(true);

  // Lightbox trigger: default button (unchanged), a clickable uploaded image, or an external
  // custom element (handled by the delegated listener above — renders no visible trigger here).
  const renderLightboxTrigger = () => {
    if (lightbox_trigger_type === "selector" && lightbox_trigger_selector) {
      return null;
    }

    if (lightbox_trigger_type === "image" && lightbox_trigger_image) {
      const alignStyle =
        lightbox_trigger_image_align === "center"
          ? { marginLeft: "auto", marginRight: "auto" }
          : lightbox_trigger_image_align === "right"
          ? { marginLeft: "auto", marginRight: "0" }
          : { marginLeft: "0", marginRight: "auto" };
      return (
        <img
          src={lightbox_trigger_image}
          alt={lightbox_btn_text || filename}
          className="ppv-lightbox-trigger-img"
          onClick={openLightbox}
          style={{
            width: lightbox_trigger_image_width || "300px",
            height: lightbox_trigger_image_height || "auto",
            maxWidth: "100%",
            borderRadius: lightbox_trigger_image_radius || "0",
            objectFit: lightbox_trigger_image_fit || "cover",
            ...alignStyle,
          }}
        />
      );
    }

    // Default button — also the automatic fallback when "image" is chosen but none uploaded.
    return (
      <button className={`ppv-lightbox-btn ${lightbox_btn_size}`} onClick={openLightbox}>
        {lightbox_btn_text}
      </button>
    );
  };

  const renderPreviewContent = () => {
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
    const isVideo = ["mp4", "webm", "ogg"].includes(ext);

    // Google Docs Viewer downtime fallback: the gview iframe timed out / errored.
    if (gviewFailed && gviewFallback) {
      if (ext === "pdf") {
        // Best UX for PDFs: retry the same file with the bundled pdf.js renderer.
        let docUrl = doc;
        if (loadLatestVersion) {
          const separator = docUrl.includes("?") ? "&" : "?";
          docUrl += `${separator}v=${Date.now()}`;
        }
        let customUrl = `${pluginUrl}assets/pdfjs-new/web/viewer.html?file=${encodeURIComponent(docUrl)}&toolbar_theme=${theme}&toolbar_bg_color=${encodeURIComponent(toolbar_bg_color)}&toolbar_text_color=${encodeURIComponent(toolbar_text_color)}`;
        
        const hasPluginToolbar = showName || download;
        if (enableFullscreen && !hasPluginToolbar) customUrl += "&fullscreenBtn=1";
        if (onDemandRendering) customUrl += "&onDemandRender=1";
        if (fullscreenNewTab && !hasPluginToolbar) customUrl += "&newTabBtn=1";
        if (readerMode) customUrl += "&raw=1";
        if (toggleThumbnails) customUrl += "&side=true";
        if (sidebarOpen) customUrl += "&open=true";
        if (hrScrollbar) customUrl += "&hrscroll=vera";
        if (defaultZoom) customUrl += `&z=${encodeURIComponent(defaultZoom)}`;
        if (initialPage > 1) customUrl += `#page=${initialPage}`;

        return (
          <PDFJSViewer
            attributes={attributes}
            source={customUrl}
            className=""
            isBackend={false}
            onLoad={() => setIsLoading(false)}
            onGViewError={() => {}}
          />
        );
      }
      // Non-PDF: no alternate renderer, so show a graceful message + direct download.
      return (
        <div className="ppv-preview-unavailable" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px", textAlign: "center", boxSizing: "border-box" }}>
          <p style={{ margin: 0 }}>{__("Preview temporarily unavailable.", "document-emberdder")}</p>
          <a
            className="ppv_download_bttn"
            href={doc}
            download={_de_download_filename || true}
            style={{ display: "inline-block", padding: "8px 16px", borderRadius: "4px", border: "1px solid #cececf", color: "inherit", textDecoration: "none", cursor: "pointer" }}
          >
            {downloadButtonText || __("Download", "document-emberdder")}
          </a>
        </div>
      );
    }

    if (doc.includes("dropbox.com")) {
      return (
        <a
          href={doc}
          className="dropbox-embed"
          data-height="100%"
          data-width="100%"
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      );
    }

    if (isGoogleUrl || googleDrive) {
      return (
        <IframePreview
          src={frameUrl}
          title={filename}
          onLoad={() => setIsLoading(false)}
          onError={gviewFallback ? handleGViewError : undefined}
        >
          {disablePopout && (
            <div style={{ width: "80px", height: "80px", position: "absolute", opacity: 0, right: "0px", top: "0px", zIndex: 9999 }} />
          )}
        </IframePreview>
      );
    }

    // Standard Library file types
    if (isImage) {
      return (
        <img
          src={doc}
          alt={filename}
          onLoad={() => setIsLoading(false)}
          className="bplDl-preview-image"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={doc}
          controls
          onLoadedData={() => setIsLoading(false)}
          className="bplDl-preview-video"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      );
    }

    if (ext === "pdf") {
      if (viewer === "flipbook" || viewer === "slider") {
        return (
          <FlipbookViewer
            attributes={attributes}
            source={doc}
            viewerType={viewer}
            onLoad={() => setIsLoading(false)}
          />
        );
      }
      if (viewer === "custom") {
        return (
          <PDFJSViewer
            attributes={attributes}
            source={frameUrl}
            className=""
            isBackend={false}
            onLoad={() => setIsLoading(false)}
            onGViewError={() => {
              // no-op
            }}
          />
        );
      } else {
        return (
          <IframePreview
            src={frameUrl}
            title={filename}
            className="bplDl-preview-iframe"
            onLoad={() => setIsLoading(false)}
            onError={gviewFallback ? handleGViewError : undefined}
          >
            {disablePopout && (
              <div style={{ width: "70px", height: "70px", position: "absolute", opacity: 0, right: "5px", top: "0px", zIndex: 99999 }} />
            )}
          </IframePreview>
        );
      }
    }

    if (["ppt", "pptx", "xls", "xlsx", "doc", "docx", "txt", "pages", "xps", "ai", "psd", "eps", "dxf", "ttf", "zip", "rar"].includes(ext)) {
      return (
        <IframePreview
          src={frameUrl}
          title={filename}
          className="bplDl-preview-iframe"
          onLoad={() => setIsLoading(false)}
          onError={gviewFallback ? handleGViewError : undefined}
        >
          {disablePopout && (
            <div style={{ width: "70px", height: "70px", position: "absolute", opacity: 0, right: "5px", top: "0px", zIndex: 99999 }} />
          )}
        </IframePreview>
      );
    }

    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <p style={{ paddingLeft: "10px" }}>Preview not available for this file type.</p>
        {disablePopout && (
          <div style={{ width: "70px", height: "70px", position: "absolute", opacity: 0, right: "5px", top: "0px", zIndex: 99999 }} />
        )}
      </div>
    );
  };

  return (
    <>
      <Style attributes={attributes} id={id} uniqueId={id} />

      <div
        id={`ppv_frame_wrapper${id}`}
        data-lightbox={isLightboxEnabled ? "1" : undefined}
        className={`ppv_container ${id}`}
      >
        {doc === "" ? (
          <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #ccc", borderRadius: "4px" }}>
            <h2>
              Ooops... You forgot to Select a document. Please select a file or paste a external document link to show
              here.{" "}
            </h2>
          </div>
        ) : isLightboxEnabled ? (
          <>
            {renderLightboxTrigger()}

            <div
              className={`ppv-lightbox-overlay ${isLightboxOpen ? "open" : ""}`}
              style={{ display: isLightboxOpen ? "flex" : "none" }}
            >
              <div className="bplde-lightbox">
                <span className="bplde-lightbox-close" onClick={() => setIsLightboxOpen(false)}>
                  &times;
                </span>

                <div className="bplde-lightbox-body">
                  {loading_icon && isLoading && <div className="ppv-lightbox-loading"></div>}

                  <DocToolbar
                    filename={filename}
                    showName={showName}
                    download={download}
                    position="lightbox"
                    limitReached={limitReached}
                    isRestricted={isRestricted}
                    downloadAccessMessage={_de_download_access_message}
                    downloadButtonText={downloadButtonText}
                    downloadShowCount={_de_download_show_count}
                    downloadCount={downloadCount}
                    handleDownloadClick={handleDownloadClick}
                    doc={doc}
                    downloadFilename={_de_download_filename}
                    behavior={_de_download_behavior}
                    theme={theme}
                    showFullscreen={showFullscreenInToolbar}
                    onFullscreenClick={handleToolbarFullscreen}
                    fullscreenTitle={fullscreenTitle}
                  />

                  <div ref={previewRef} className="document-preview" style={{ flex: 1, position: "relative", height: "100%", width: "100%" }}>
                    {renderPreviewContent()}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {loading_icon && isLoading && <div className="ppv-lightbox-loading"></div>}

            {toolbarPosition === "toolbar" && (
              <DocToolbar
                filename={filename}
                showName={showName}
                download={download}
                position="toolbar"
                limitReached={limitReached}
                isRestricted={isRestricted}
                downloadAccessMessage={_de_download_access_message}
                downloadButtonText={downloadButtonText}
                downloadShowCount={_de_download_show_count}
                downloadCount={downloadCount}
                handleDownloadClick={handleDownloadClick}
                doc={doc}
                downloadFilename={_de_download_filename}
                behavior={_de_download_behavior}
                theme={theme}
                showFullscreen={showFullscreenInToolbar}
                onFullscreenClick={handleToolbarFullscreen}
                fullscreenTitle={fullscreenTitle}
              />
            )}

            {doc.includes("dropbox.com") ? (
              <div className="dropbox-preview" style={{ width: "100%", flex: 1, minHeight: 0, position: "relative" }}>
                {renderPreviewContent()}
              </div>
            ) : isGoogleUrl ? (
              <div className="drive-preview" style={{ width: "100%", flex: 1, minHeight: 0, position: "relative" }}>
                {renderPreviewContent()}
              </div>
            ) : (
              <div ref={previewRef} className="document-preview" style={{ flex: 1, minHeight: 0, width: "100%", position: "relative" }}>
                {renderPreviewContent()}
              </div>
            )}

            {toolbarPosition === "below" && (
              <DocToolbar
                filename={filename}
                showName={showName}
                download={download}
                position="below"
                limitReached={limitReached}
                isRestricted={isRestricted}
                downloadAccessMessage={_de_download_access_message}
                downloadButtonText={downloadButtonText}
                downloadShowCount={_de_download_show_count}
                downloadCount={downloadCount}
                handleDownloadClick={handleDownloadClick}
                doc={doc}
                downloadFilename={_de_download_filename}
                behavior={_de_download_behavior}
                theme={theme}
                showFullscreen={showFullscreenInToolbar}
                onFullscreenClick={handleToolbarFullscreen}
                fullscreenTitle={fullscreenTitle}
              />
            )}
          </>
        )}

        {showEmailGate && (
          <EmailGate
            onClose={() => setShowEmailGate(false)}
            postId={postId}
            downloadBehavior={_de_download_behavior}
            downloadButtonText={downloadButtonText}
            onSuccess={() => setDownloadCount((prev) => prev + 1)}
          />
        )}
      </div>
    </>
  );
};

export default Viewer;
