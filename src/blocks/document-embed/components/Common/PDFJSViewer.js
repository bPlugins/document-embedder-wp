import React, { Fragment, useEffect, useState } from "react";
import { __ as wpTranslate } from "@wordpress/i18n";
import "../../style.scss";

const exampleFile = "http://localhost/freemius/wp-content/uploads/2022/02/temp.pdf";

function PDFJSViewer({ __ = wpTranslate, attributes = {}, source = window.pdfp?.placeholder || exampleFile, className = "", isBackend = false, onGViewError, onLoad }) {
  const { hrScroll = false, title = "", socialShare = {} } = attributes;
  const { position = "" } = socialShare;
  const [isLoaded, setIsLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    // Reset error when source changes
    setPdfError(null);
    setIsLoaded(false);

    if (!source) return;

    // HTTP HEAD check to pre-validate the URL
    const validatePdfUrl = async (url) => {
      // Don't check GView URLs as they are already a proxy
      if (url.includes("google.com/gview")) return;

      let fileToValidate = url;
      // If it's a viewer URL, extract the actual file path to check it
      if (url.includes("viewer.html")) {
        try {
          const urlObj = new URL(url, window.location.origin);
          fileToValidate = urlObj.searchParams.get("file") || url;
        } catch (e) {
          // Fallback to original url if parsing fails
        }
      }

      try {
        const response = await fetch(fileToValidate, { method: "HEAD", cache: "no-cache" });
        if (!response.ok) {
          setPdfError(__("The PDF file could not be found or the server returned an error.", "document-emberdder"));
          return;
        }
        const contentLength = response.headers.get("Content-Length");
        if (contentLength && parseInt(contentLength, 10) === 0) {
          setPdfError(__("The PDF file is empty or corrupted (0 bytes).", 'document-emberdder'));
        }
      } catch (error) {
        // If fetch fails due to CORS, we just let PDF.js try anyway
        console.warn("PDF pre-check failed (likely CORS). Continuing load attempt.", error);
      }
    };

    validatePdfUrl(source);

    let timeoutId;
    if (source.includes("google.com/gview") && !isLoaded) {
      // Set a 10 second timeout for GView
      timeoutId = setTimeout(() => {
        if (!isLoaded && typeof onGViewError === "function") {
          console.warn("Google Docs Viewer took too long to load. Falling back to PDF.js.");
          onGViewError();
        }
      }, 10000);
    }

    // Listen for messages from custom.js inside the iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === "PDFP_ERROR") {
        setPdfError(event.data.message || __("An error occurred while loading the PDF.", "document-emberdder"));
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("message", handleMessage);
    };
  }, [source, isLoaded, onGViewError, __]);

  const exitFullScreen = () => {
    try {
      document.exitFullscreen();
    } catch (e) {
      // ignore
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (typeof onLoad === "function") {
      onLoad();
    }
  };

  const renderError = (message) => (
    <div className="pdfp_error_container">
      <div className="pdfp_error_box">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{message}</p>
        <button onClick={() => window.location.reload()} className="pdfp_retry_btn">
          {__("Retry", "document-emberdder")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {source.includes("dropbox.com") ? (
        <div className="dropbox-embed-sdfsdfsdf" style={{ border: "2px solid #ddd" }}>
          <p>{__("Preview is not available for dropbox", "document-emberdder")}</p>
        </div>
      ) : (
        <Fragment>
          <div className={`iframe_wrapper ${className} ${hrScroll ? "pdfp_horizontal_scroll" : ""}`} style={{ width: "100%", height: "100%", position: "relative" }}>
            {isBackend && <div className="pdfp-embed-overlay"></div>}
            <div className="pdfp_frame_overlay"></div>
            {pdfError ? (
              renderError(pdfError)
            ) : (
              <iframe className="pdfp_iframe" src={source} title={title} onLoad={handleLoad} allowFullScreen allow="fullscreen" style={{ width: "100%", height: "100%", border: "none", display: "block" }}></iframe>
            )}
            <span className="close" onClick={exitFullScreen} style={{ display: "none" }}>
              &times;
            </span>
          </div>
        </Fragment>
      )}
    </>
  );
}

export default PDFJSViewer;
