/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/document-embed/components/Common/DocToolbar.js":
/*!*******************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/DocToolbar.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


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
  fullscreenTitle = "Full screen"
}) => {
  if (!showName && !download && !showFullscreen) return null;
  const renderDownloadButton = () => {
    if (limitReached) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
        disabled: true,
        style: {
          background: "transparent",
          padding: "4px 10px",
          borderRadius: "4px",
          border: "1px solid #ff4d4d",
          color: "#ff4d4d",
          cursor: "not-allowed"
        },
        title: "Download limit reached for your IP."
      }, "Limit Reached");
    }
    if (isRestricted) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
        className: "de-access-denied-msg"
      }, downloadAccessMessage);
    }
    const btnLabel = downloadButtonText || "Download";
    const downloadCountHtml = downloadShowCount ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "ppv-download-count",
      style: {
        marginLeft: "8px",
        fontSize: "12px",
        color: "#999",
        fontWeight: "500"
      }
    }, "(", downloadCount, " ", downloadCount === 1 ? "download" : "downloads", ")") : null;
    const dlAttr = downloadFilename ? downloadFilename : true;
    const isNewTab = behavior === "newtab";
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      style: {
        display: "inline-flex",
        alignItems: "center"
      }
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
      className: "s_pdf_download_link",
      style: {
        display: "flex",
        textDecoration: "none"
      },
      href: doc,
      target: isNewTab ? "_blank" : undefined,
      rel: isNewTab ? "noopener noreferrer" : undefined,
      download: isNewTab ? undefined : dlAttr
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
      style: {
        background: "transparent",
        padding: "4px 10px",
        borderRadius: "4px",
        border: "1px solid #cececf",
        color: "#cececf",
        cursor: "pointer",
        fontSize: "12px"
      },
      className: "ppv_download_bttn",
      onClick: handleDownloadClick
    }, btnLabel)), downloadCountHtml);
  };
  const renderFullscreenButton = () => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "ppv_fullscreen_bttn",
    onClick: onFullscreenClick,
    title: fullscreenTitle,
    "aria-label": fullscreenTitle,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #cececf",
      color: "#cececf",
      cursor: "pointer"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polyline", {
    points: "15 3 21 3 21 9"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polyline", {
    points: "9 21 3 21 3 15"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("line", {
    x1: "21",
    y1: "3",
    x2: "14",
    y2: "10"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("line", {
    x1: "3",
    y1: "21",
    x2: "10",
    y2: "14"
  })));
  const justify = !showName ? "flex-end" : "space-between";
  const renderRightGroup = () => (download || showFullscreen) && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "ppv-toolbar-right",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px"
    }
  }, download && renderDownloadButton(), showFullscreen && renderFullscreenButton());
  if (position === "lightbox" || position === "toolbar") {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: `ppv-toolbar ${theme}`,
      style: {
        display: "flex",
        justifyContent: justify
      }
    }, showName && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "ppv-filename"
    }, filename), renderRightGroup());
  }
  if (position === "below") {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: `ppv-toolbar ${theme}`,
      style: {
        display: "flex",
        justifyContent: justify,
        marginTop: 0
      }
    }, showName && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "ppv-filename"
    }, filename), renderRightGroup());
  }
  if (position === "above") {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      style: {
        marginBottom: "10px"
      }
    }, showName && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
      style: {
        paddingLeft: "10px",
        margin: "0 0 10px 0"
      }
    }, filename), download && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      style: {
        marginBottom: "10px"
      }
    }, renderDownloadButton()));
  }
  return null;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DocToolbar);

/***/ }),

/***/ "./src/blocks/document-embed/components/Common/EmailGate.js":
/*!******************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/EmailGate.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const EmailGate = ({
  onClose,
  postId,
  downloadBehavior = "download",
  downloadButtonText = "Download",
  onSuccess
}) => {
  const [name, setName] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const [email, setEmail] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const [submitting, setSubmitting] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      name,
      email,
      document_id: postId
    };
    let newTab = null;
    if (downloadBehavior === "newtab") {
      newTab = window.open("about:blank", "_blank");
    }
    const restUrl = window.bplde_obj?.rest_url || "/wp-json/docembedder/v1/";
    fetch(`${restUrl}gate-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(res => res.json()).then(res => {
      if (res.success && res.url) {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        if (downloadBehavior === "newtab" && newTab) {
          newTab.location.href = res.url;
        } else {
          window.location.href = res.url;
        }
      } else {
        alert(res.message || "Error processing request");
        if (newTab) newTab.close();
      }
    }).catch(() => {
      alert("Error connecting to server.");
      if (newTab) newTab.close();
    }).finally(() => {
      setSubmitting(false);
    });
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "ppv-email-gate-modal-wrapper",
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999999
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "ppv-email-gate-modal-content",
    style: {
      background: "#fff",
      padding: "25px",
      borderRadius: "8px",
      width: "90%",
      maxWidth: "400px",
      position: "relative",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "ppv-close-modal",
    onClick: onClose,
    style: {
      position: "absolute",
      top: "10px",
      right: "15px",
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#999"
    }
  }, "\xD7"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", {
    style: {
      marginTop: 0,
      marginBottom: "20px",
      fontSize: "18px",
      fontWeight: "600"
    }
  }, "Download Document"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("form", {
    className: "ppv-email-gate-form",
    onSubmit: handleSubmit
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: {
      marginBottom: "15px"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    style: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "500"
    }
  }, "Name"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    name: "name",
    required: true,
    value: name,
    onChange: e => setName(e.target.value),
    style: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: "4px"
    }
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: {
      marginBottom: "20px"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    style: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "500"
    }
  }, "Email"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "email",
    name: "email",
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    style: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: "4px"
    }
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "submit",
    disabled: submitting,
    style: {
      width: "100%",
      padding: "10px",
      background: "#007cba",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "600"
    }
  }, submitting ? "Processing..." : downloadButtonText), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "ppv-gate-secure-text",
    style: {
      fontSize: "11px",
      color: "#666",
      marginTop: "10px",
      textAlign: "center"
    }
  }, "Your details are saved securely."))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EmailGate);

/***/ }),

/***/ "./src/blocks/document-embed/components/Common/FlipbookViewer.js":
/*!***********************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/FlipbookViewer.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);



/**
 * FlipbookViewer
 *
 * Renders a PDF using the bundled dFlip library as either a page-turning
 * "flipbook" or a swipeable "slider". The dFlip library (jQuery plugin) is
 * enqueued server-side only when one of these viewers is selected
 * (see render.php / class-bplde-blocks.php), so this component waits until
 * `window.jQuery(...).flipBook` is available before initializing.
 *
 * @param {Object} attributes  Block attributes (used for height).
 * @param {string} source      The PDF file URL.
 * @param {string} viewerType  "flipbook" | "slider".
 * @param {Function} onLoad     Called once dFlip has been initialized.
 */
const FlipbookViewer = ({
  attributes = {},
  source = "",
  viewerType = "flipbook",
  onLoad
}) => {
  const containerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const flipbookRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const {
    displayDimensions = {}
  } = attributes;
  const heightObj = displayDimensions?.height || {};
  const height = (typeof heightObj === "object" ? heightObj.desktop : heightObj) || "600px";
  const pdfUrl = source;
  const docSource = attributes?.documentSource || {};
  const initialPage = docSource.initialPage || 1;
  const readerMode = docSource.readerMode || false;
  const toggleThumbnails = docSource.toggleThumbnails || false;
  const sidebarOpen = docSource.sidebarOpen || false;
  const loadLatestVersion = docSource.loadLatestVersion || false;
  const enableFullscreen = docSource.enableFullscreen || false;
  const fullscreenNewTab = docSource.fullscreenNewTab || false;
  const onDemandRendering = docSource.onDemandRendering || false;
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let cancelled = false;
    let pollId = null;

    // dFlip viewerType: "slider" = one page at a time (swipe), "flipbook" = page turn.
    const dflipViewerType = viewerType === "slider" ? "slider" : "flipbook";
    const isLibReady = () => !!(window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.flipBook === "function");
    const initFlipbook = () => {
      const el = containerRef.current;
      if (cancelled || !el || !pdfUrl) return;
      if (el.dataset.dflipInitialized === "true") return;

      // 1. Load Latest Version
      let finalPdfUrl = pdfUrl;
      if (loadLatestVersion && finalPdfUrl) {
        const separator = finalPdfUrl.includes("?") ? "&" : "?";
        finalPdfUrl += `${separator}v=${Date.now()}`;
      }

      // 2. Hide controls based on toggles
      let hideControls = "";
      if (!toggleThumbnails) {
        hideControls += (hideControls ? "," : "") + "thumbnail";
      }
      if (!enableFullscreen) {
        hideControls += (hideControls ? "," : "") + "fullScreen";
      }
      const options = {
        viewerType: dflipViewerType,
        openPage: initialPage,
        backgroundColor: "transparent",
        height: "100%",
        // Reader Mode: hide controls entirely
        controlsPosition: readerMode ? "hidden" : "bottom",
        // Sidebar Open: auto open thumbnail on load
        autoOpenThumbnail: sidebarOpen,
        // On-Demand Page Rendering
        instantTextureProcess: !onDemandRendering
      };
      if (hideControls) {
        options.hideControls = hideControls;
      }

      // 3. Fullscreen in New Tab behavior
      if (fullscreenNewTab) {
        options.onCreateUI = function (app) {
          if (app.ui && app.ui.controls && app.ui.controls.fullScreen) {
            const $btn = app.ui.controls.fullScreen;
            $btn.off("click");
            $btn.on("click", function (e) {
              e.preventDefault();
              e.stopPropagation();
              window.open(finalPdfUrl, "_blank", "noopener");
            });
          }
        };
      }
      el.dataset.dflipInitialized = "true";
      try {
        flipbookRef.current = window.jQuery(el).flipBook(finalPdfUrl, options);
        // dFlip lays out against the current container size; nudge it once mounted.
        window.dispatchEvent(new Event("resize"));
        if (typeof onLoad === "function") onLoad();
      } catch (error) {
        // Roll back the guard so a later retry can still initialize.
        el.dataset.dflipInitialized = "false";
        // eslint-disable-next-line no-console
        console.error("Error initializing dFlip viewer:", error);
      }
    };

    // The dFlip script loads in the footer; poll until it (and jQuery) are ready.
    const tryInit = () => {
      if (cancelled) return;
      if (isLibReady()) {
        initFlipbook();
      } else {
        pollId = setTimeout(tryInit, 150);
      }
    };

    // Only initialize once the container is actually in view (matches pdf-poster).
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tryInit();
        }
      });
    }, {
      threshold: 0.1
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      cancelled = true;
      if (pollId) clearTimeout(pollId);
      observer.disconnect();
      if (flipbookRef.current && typeof flipbookRef.current.dispose === "function") {
        try {
          flipbookRef.current.dispose();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("dFlip dispose error:", err);
        }
      }
      if (containerRef.current) {
        containerRef.current.dataset.dflipInitialized = "false";
        try {
          containerRef.current.innerHTML = "";
        } catch (e) {
          // ignore
        }
      }
    };
  }, [pdfUrl, viewerType, height, initialPage, readerMode, toggleThumbnails, sidebarOpen, loadLatestVersion, enableFullscreen, fullscreenNewTab, onDemandRendering]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bplde-dflip-wrapper",
    style: {
      height: "100%",
      width: "100%"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ref: containerRef,
    className: "dflip-container",
    style: {
      height: "100%",
      width: "100%"
    }
  }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FlipbookViewer);

/***/ }),

/***/ "./src/blocks/document-embed/components/Common/IframePreview.js":
/*!**********************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/IframePreview.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);



/**
 * Shared iframe wrapper for the Google-Docs-Viewer / default-viewer branches.
 *
 * Reuses the same failure-detection pattern proven in PDFJSViewer: a 10s timeout that
 * fires onError only for google.com/gview sources that never load, plus a postMessage
 * listener. It does nothing extra for non-gview sources (e.g. Office Online), so those
 * branches keep their exact current behavior.
 */
const IframePreview = ({
  src,
  className = "",
  title = "",
  onLoad,
  onError,
  children
}) => {
  const [, setLoaded] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const loadedRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  // Keep the latest onError without making it an effect dependency, so a new inline
  // handler identity on each render doesn't restart the timeout.
  const onErrorRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(onError);
  onErrorRef.current = onError;
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    loadedRef.current = false;
    setLoaded(false);
    let timeoutId;
    const isGview = src && src.includes("google.com/gview");

    // Only the Google Docs Viewer gets the downtime timeout — and only after both the
    // timeout elapses AND the iframe never fired onLoad.
    if (isGview) {
      timeoutId = setTimeout(() => {
        if (!loadedRef.current && typeof onErrorRef.current === "function") {
          onErrorRef.current();
        }
      }, 10000);
    }
    const handleMessage = event => {
      if (event.data && event.data.type === "PDFP_ERROR" && typeof onErrorRef.current === "function") {
        onErrorRef.current();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("message", handleMessage);
    };
  }, [src]);
  const handleLoad = () => {
    loadedRef.current = true;
    setLoaded(true);
    if (typeof onLoad === "function") onLoad();
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: {
      width: "100%",
      height: "100%",
      position: "relative"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("iframe", {
    src: src,
    title: title,
    className: className,
    onLoad: handleLoad,
    style: {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block"
    }
  }), children);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (IframePreview);

/***/ }),

/***/ "./src/blocks/document-embed/components/Common/PDFJSViewer.js":
/*!********************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/PDFJSViewer.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../style.scss */ "./src/blocks/document-embed/style.scss");




const exampleFile = "http://localhost/freemius/wp-content/uploads/2022/02/temp.pdf";
function PDFJSViewer({
  __ = _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__,
  attributes = {},
  source = window.pdfp?.placeholder || exampleFile,
  className = "",
  isBackend = false,
  onGViewError,
  onLoad
}) {
  const {
    hrScroll = false,
    title = "",
    socialShare = {}
  } = attributes;
  const {
    position = ""
  } = socialShare;
  const [isLoaded, setIsLoaded] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [pdfError, setPdfError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    // Reset error when source changes
    setPdfError(null);
    setIsLoaded(false);
    if (!source) return;

    // HTTP HEAD check to pre-validate the URL
    const validatePdfUrl = async url => {
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
        const response = await fetch(fileToValidate, {
          method: "HEAD",
          cache: "no-cache"
        });
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
    const handleMessage = event => {
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
  const renderError = message => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pdfp_error_container"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pdfp_error_box"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "48",
    height: "48",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("line", {
    x1: "12",
    y1: "8",
    x2: "12",
    y2: "12"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("line", {
    x1: "12",
    y1: "16",
    x2: "12.01",
    y2: "16"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    onClick: () => window.location.reload(),
    className: "pdfp_retry_btn"
  }, __("Retry", "document-emberdder"))));
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, source.includes("dropbox.com") ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "dropbox-embed-sdfsdfsdf",
    style: {
      border: "2px solid #ddd"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, __("Preview is not available for dropbox", "document-emberdder"))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: `iframe_wrapper ${className} ${hrScroll ? "pdfp_horizontal_scroll" : ""}`,
    style: {
      width: "100%",
      height: "100%",
      position: "relative"
    }
  }, isBackend && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pdfp-embed-overlay"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pdfp_frame_overlay"
  }), pdfError ? renderError(pdfError) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("iframe", {
    className: "pdfp_iframe",
    src: source,
    title: title,
    onLoad: handleLoad,
    allowFullScreen: true,
    allow: "fullscreen",
    style: {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block"
    }
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "close",
    onClick: exitFullScreen,
    style: {
      display: "none"
    }
  }, "\xD7"))));
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PDFJSViewer);

/***/ }),

/***/ "./src/blocks/document-embed/components/Common/Style.js":
/*!**************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/Style.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const Style = ({
  attributes = {},
  id = "",
  uniqueId = ""
}) => {
  const {
    displayDimensions = {},
    lightbox = {},
    toolbar = {}
  } = attributes;
  const {
    width = {},
    height = {}
  } = displayDimensions;
  const {
    lightbox_btn_color = "#ffffff",
    lightbox_btn_background = "#333333"
  } = lightbox;
  const {
    theme = "dark",
    toolbar_bg_color = "#343434",
    toolbar_text_color = "#ffffff"
  } = toolbar;
  const parseDim = (prop, defaultVal, type = "desktop") => {
    if (typeof prop === "object" && prop !== null) {
      if (prop[type] !== undefined && prop[type] !== "") {
        const val = prop[type];
        if (typeof val === "string" && /[a-zA-Z%]/.test(val)) {
          return val;
        }
        return val + (prop.unit || "px");
      }
      return defaultVal;
    }
    const val = prop !== undefined && prop !== "" ? prop : defaultVal;
    return isNaN(val) ? val : val + "px";
  };

  // Extract dimensions
  const w_d = parseDim(width, "100%", "desktop");
  const w_t = parseDim(width, w_d, "tablet");
  const w_m = parseDim(width, w_t, "mobile");
  const h_d = parseDim(height, "840px", "desktop");
  const h_t = parseDim(height, h_d, "tablet");
  const h_m = parseDim(height, h_t, "mobile");
  const selectorClass = uniqueId || id;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("style", {
    dangerouslySetInnerHTML: {
      __html: `
          .ppv_container.${selectorClass}:not([data-lightbox="1"]) {
            width: ${w_d} !important;
            height: ${h_d} !important;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          @media (max-width: 991px) {
            .ppv_container.${selectorClass}:not([data-lightbox="1"]) {
              width: ${w_t} !important;
              height: ${h_t} !important;
            }
          }

          @media (max-width: 767px) {
            .ppv_container.${selectorClass}:not([data-lightbox="1"]) {
              width: ${w_m} !important;
              height: ${h_m} !important;
            }
          }

          #ppv_frame_wrapper${id} .ppv-lightbox-btn {
            color: ${lightbox_btn_color} !important;
            background: ${lightbox_btn_background} !important;
          }

          ${theme === "custom" ? `
            .ppv_container.${selectorClass} .ppv-toolbar.custom {
              background: ${toolbar_bg_color} !important;
              border: 1px solid ${toolbar_bg_color} !important;
            }
            .ppv_container.${selectorClass} .ppv-toolbar.custom .ppv-filename {
              color: ${toolbar_text_color} !important;
            }
            .ppv_container.${selectorClass} .ppv-toolbar.custom .ppv_download_bttn {
              border: 1px solid ${toolbar_text_color} !important;
              color: ${toolbar_text_color} !important;
            }
            .ppv_container.${selectorClass} .ppv-toolbar.custom .ppv_download_bttn:hover {
              opacity: 0.8 !important;
            }
          ` : ""}
        `
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Style);

/***/ }),

/***/ "./src/blocks/document-embed/components/Common/Viewer.js":
/*!***************************************************************!*\
  !*** ./src/blocks/document-embed/components/Common/Viewer.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PDFJSViewer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PDFJSViewer */ "./src/blocks/document-embed/components/Common/PDFJSViewer.js");
/* harmony import */ var _IframePreview__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./IframePreview */ "./src/blocks/document-embed/components/Common/IframePreview.js");
/* harmony import */ var _FlipbookViewer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./FlipbookViewer */ "./src/blocks/document-embed/components/Common/FlipbookViewer.js");
/* harmony import */ var _Style__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Style */ "./src/blocks/document-embed/components/Common/Style.js");
/* harmony import */ var _EmailGate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./EmailGate */ "./src/blocks/document-embed/components/Common/EmailGate.js");
/* harmony import */ var _DocToolbar__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./DocToolbar */ "./src/blocks/document-embed/components/Common/DocToolbar.js");









const Viewer = ({
  attributes,
  userData = {},
  pluginUrl = "",
  postId = 0,
  id = "",
  isEditor = false
}) => {
  const {
    documentSource = {},
    toolbar = {},
    securityRestrictions = {},
    downloadManagement = {},
    lightbox = {},
    performance = {},
    // Set by render.php only for the document metabox's live preview request. Never set on
    // the front end.
    _de_preview_editing = false
  } = attributes;

  // The document metabox's live preview iframe, as flagged by render.php.
  const isMetaboxPreview = _de_preview_editing === true || _de_preview_editing === "1";

  // Authoring context: the block editor's own preview, or the metabox live preview iframe.
  const isAuthoring = isEditor || isMetaboxPreview;
  const {
    doc = "",
    viewer = "default",
    googleDrive = false,
    enableFullscreen = false,
    onDemandRendering = false,
    fullscreenNewTab = false,
    readerMode = false,
    toggleThumbnails = false,
    sidebarOpen = false,
    loadLatestVersion = false,
    hrScrollbar = false,
    initialPage = 1,
    defaultZoom = ""
  } = documentSource;
  const {
    showName = false,
    download = false,
    _de_download_position = "toolbar",
    theme = "dark",
    toolbar_bg_color = "#343434",
    toolbar_text_color = "#ffffff"
  } = toolbar;
  const {
    disablePopout = false,
    loading_icon = false
  } = securityRestrictions;
  // Reliability: auto-fallback if the Google Docs Viewer times out. Defaults on; only acts on failure.
  const {
    gviewFallback = true
  } = performance;
  const {
    downloadButtonText = "Download",
    _de_download_behavior = "download",
    _de_download_filename = "",
    _de_download_show_count = false,
    _de_download_limit = 0,
    _de_download_access = "everyone",
    _de_download_access_roles = [],
    _de_download_access_message = "Access Denied",
    _de_email_gate = false
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
    lightbox_trigger_image_fit = "cover"
  } = lightbox;
  const [downloadCount, setDownloadCount] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const [limitReached, setLimitReached] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [isLightboxOpen, setIsLightboxOpen] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

  // Google Docs Viewer downtime fallback state.
  const [gviewFailed, setGviewFailed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const handleGViewError = () => {
    if (gviewFallback) {
      setGviewFailed(true);
    }
  };

  // Email Gate state
  const [showEmailGate, setShowEmailGate] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

  // Ref to the element wrapping the PDF preview, used for native full-screen from the plugin toolbar.
  const previewRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const toggleFullscreen = () => {
    const el = previewRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen)?.call(document);
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
    }
  };
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isLightboxEnabled || lightbox_trigger_type !== "selector" || !lightbox_trigger_selector) {
      return undefined;
    }
    const handler = e => {
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
  const getFileExtension = url => {
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
      const hasAccess = allowedRoles.some(role => userRoles.includes(role));
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
      body: formData
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setDownloadCount(res.data.count);
        if (res.data.limit_reached || res.data.count >= parseInt(_de_download_limit) && parseInt(_de_download_limit) > 0) {
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
    }).catch(() => {
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
  const handleDownloadClick = e => {
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
  const fullscreenTitle = fullscreenNewTab ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Open in new tab", "document-emberdder") : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Full screen", "document-emberdder");
  const openLightbox = () => setIsLightboxOpen(true);

  // Lightbox trigger: default button (unchanged), a clickable uploaded image, or an external
  // custom element (handled by the delegated listener above — renders no visible trigger here).
  const renderLightboxTrigger = () => {
    if (lightbox_trigger_type === "selector" && lightbox_trigger_selector) {
      return null;
    }
    if (lightbox_trigger_type === "image" && lightbox_trigger_image) {
      const alignStyle = lightbox_trigger_image_align === "center" ? {
        marginLeft: "auto",
        marginRight: "auto"
      } : lightbox_trigger_image_align === "right" ? {
        marginLeft: "auto",
        marginRight: "0"
      } : {
        marginLeft: "0",
        marginRight: "auto"
      };
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
        src: lightbox_trigger_image,
        alt: lightbox_btn_text || filename,
        className: "ppv-lightbox-trigger-img",
        onClick: openLightbox,
        style: {
          width: lightbox_trigger_image_width || "300px",
          height: lightbox_trigger_image_height || "auto",
          maxWidth: "100%",
          borderRadius: lightbox_trigger_image_radius || "0",
          objectFit: lightbox_trigger_image_fit || "cover",
          ...alignStyle
        }
      });
    }

    // Default button — also the automatic fallback when "image" is chosen but none uploaded.
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
      className: `ppv-lightbox-btn ${lightbox_btn_size}`,
      onClick: openLightbox
    }, lightbox_btn_text);
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
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_PDFJSViewer__WEBPACK_IMPORTED_MODULE_2__["default"], {
          attributes: attributes,
          source: customUrl,
          className: "",
          isBackend: false,
          onLoad: () => setIsLoading(false),
          onGViewError: () => {}
        });
      }
      // Non-PDF: no alternate renderer, so show a graceful message + direct download.
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "ppv-preview-unavailable",
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "20px",
          textAlign: "center",
          boxSizing: "border-box"
        }
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
        style: {
          margin: 0
        }
      }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Preview temporarily unavailable.", "document-emberdder")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
        className: "ppv_download_bttn",
        href: doc,
        download: _de_download_filename || true,
        style: {
          display: "inline-block",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "1px solid #cececf",
          color: "inherit",
          textDecoration: "none",
          cursor: "pointer"
        }
      }, downloadButtonText || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Download", "document-emberdder")));
    }
    if (doc.includes("dropbox.com")) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
        href: doc,
        className: "dropbox-embed",
        "data-height": "100%",
        "data-width": "100%",
        style: {
          display: "block",
          width: "100%",
          height: "100%"
        }
      });
    }
    if (isGoogleUrl || googleDrive) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_IframePreview__WEBPACK_IMPORTED_MODULE_3__["default"], {
        src: frameUrl,
        title: filename,
        onLoad: () => setIsLoading(false),
        onError: gviewFallback ? handleGViewError : undefined
      }, disablePopout && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        style: {
          width: "80px",
          height: "80px",
          position: "absolute",
          opacity: 0,
          right: "0px",
          top: "0px",
          zIndex: 9999
        }
      }));
    }

    // Standard Library file types
    if (isImage) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
        src: doc,
        alt: filename,
        onLoad: () => setIsLoading(false),
        className: "bplDl-preview-image",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block"
        }
      });
    }
    if (isVideo) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("video", {
        src: doc,
        controls: true,
        onLoadedData: () => setIsLoading(false),
        className: "bplDl-preview-video",
        style: {
          width: "100%",
          height: "100%",
          display: "block"
        }
      });
    }
    if (ext === "pdf") {
      if (viewer === "flipbook" || viewer === "slider") {
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_FlipbookViewer__WEBPACK_IMPORTED_MODULE_4__["default"], {
          attributes: attributes,
          source: doc,
          viewerType: viewer,
          onLoad: () => setIsLoading(false)
        });
      }
      if (viewer === "custom") {
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_PDFJSViewer__WEBPACK_IMPORTED_MODULE_2__["default"], {
          attributes: attributes,
          source: frameUrl,
          className: "",
          isBackend: false,
          onLoad: () => setIsLoading(false),
          onGViewError: () => {
            // no-op
          }
        });
      } else {
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_IframePreview__WEBPACK_IMPORTED_MODULE_3__["default"], {
          src: frameUrl,
          title: filename,
          className: "bplDl-preview-iframe",
          onLoad: () => setIsLoading(false),
          onError: gviewFallback ? handleGViewError : undefined
        }, disablePopout && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
          style: {
            width: "70px",
            height: "70px",
            position: "absolute",
            opacity: 0,
            right: "5px",
            top: "0px",
            zIndex: 99999
          }
        }));
      }
    }
    if (["ppt", "pptx", "xls", "xlsx", "doc", "docx", "txt", "pages", "xps", "ai", "psd", "eps", "dxf", "ttf", "zip", "rar"].includes(ext)) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_IframePreview__WEBPACK_IMPORTED_MODULE_3__["default"], {
        src: frameUrl,
        title: filename,
        className: "bplDl-preview-iframe",
        onLoad: () => setIsLoading(false),
        onError: gviewFallback ? handleGViewError : undefined
      }, disablePopout && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        style: {
          width: "70px",
          height: "70px",
          position: "absolute",
          opacity: 0,
          right: "5px",
          top: "0px",
          zIndex: 99999
        }
      }));
    }
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      style: {
        width: "100%",
        height: "100%",
        position: "relative"
      }
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
      style: {
        paddingLeft: "10px"
      }
    }, "Preview not available for this file type."), disablePopout && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      style: {
        width: "70px",
        height: "70px",
        position: "absolute",
        opacity: 0,
        right: "5px",
        top: "0px",
        zIndex: 99999
      }
    }));
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Style__WEBPACK_IMPORTED_MODULE_5__["default"], {
    attributes: attributes,
    id: id,
    uniqueId: id
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    id: `ppv_frame_wrapper${id}`,
    "data-lightbox": isLightboxEnabled ? "1" : undefined,
    className: `ppv_container ${id}`
  }, doc === "" ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bplde-empty-state",
    role: "status"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "bplde-empty-state-icon",
    "aria-hidden": "true"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M13.5 3v4a1.5 1.5 0 0 0 1.5 1.5h4",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M12 11.5v5M9.5 14h5",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", {
    className: "bplde-empty-state-title"
  }, isAuthoring ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("No document added yet", "document-emberdder") : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Document unavailable", "document-emberdder")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "bplde-empty-state-text"
  }, isAuthoring ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Upload a file from your Media Library or paste a document link in the settings, and it will appear here.", "document-emberdder") : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("No document has been added to this embed yet.", "document-emberdder")), isMetaboxPreview && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "bplde-empty-state-path"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Document Configuration → General → Document File", "document-emberdder"))) : isLightboxEnabled ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, renderLightboxTrigger(), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: `ppv-lightbox-overlay ${isLightboxOpen ? "open" : ""}`,
    style: {
      display: isLightboxOpen ? "flex" : "none"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bplde-lightbox"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "bplde-lightbox-close",
    onClick: () => setIsLightboxOpen(false)
  }, "\xD7"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bplde-lightbox-body"
  }, loading_icon && isLoading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "ppv-lightbox-loading"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_DocToolbar__WEBPACK_IMPORTED_MODULE_7__["default"], {
    filename: filename,
    showName: showName,
    download: download,
    position: "lightbox",
    limitReached: limitReached,
    isRestricted: isRestricted,
    downloadAccessMessage: _de_download_access_message,
    downloadButtonText: downloadButtonText,
    downloadShowCount: _de_download_show_count,
    downloadCount: downloadCount,
    handleDownloadClick: handleDownloadClick,
    doc: doc,
    downloadFilename: _de_download_filename,
    behavior: _de_download_behavior,
    theme: theme,
    showFullscreen: showFullscreenInToolbar,
    onFullscreenClick: handleToolbarFullscreen,
    fullscreenTitle: fullscreenTitle
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ref: previewRef,
    className: "document-preview",
    style: {
      flex: 1,
      position: "relative",
      height: "100%",
      width: "100%"
    }
  }, renderPreviewContent()))))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, loading_icon && isLoading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "ppv-lightbox-loading"
  }), toolbarPosition === "toolbar" && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_DocToolbar__WEBPACK_IMPORTED_MODULE_7__["default"], {
    filename: filename,
    showName: showName,
    download: download,
    position: "toolbar",
    limitReached: limitReached,
    isRestricted: isRestricted,
    downloadAccessMessage: _de_download_access_message,
    downloadButtonText: downloadButtonText,
    downloadShowCount: _de_download_show_count,
    downloadCount: downloadCount,
    handleDownloadClick: handleDownloadClick,
    doc: doc,
    downloadFilename: _de_download_filename,
    behavior: _de_download_behavior,
    theme: theme,
    showFullscreen: showFullscreenInToolbar,
    onFullscreenClick: handleToolbarFullscreen,
    fullscreenTitle: fullscreenTitle
  }), doc.includes("dropbox.com") ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "dropbox-preview",
    style: {
      width: "100%",
      flex: 1,
      minHeight: 0,
      position: "relative"
    }
  }, renderPreviewContent()) : isGoogleUrl ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "drive-preview",
    style: {
      width: "100%",
      flex: 1,
      minHeight: 0,
      position: "relative"
    }
  }, renderPreviewContent()) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ref: previewRef,
    className: "document-preview",
    style: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      position: "relative"
    }
  }, renderPreviewContent()), toolbarPosition === "below" && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_DocToolbar__WEBPACK_IMPORTED_MODULE_7__["default"], {
    filename: filename,
    showName: showName,
    download: download,
    position: "below",
    limitReached: limitReached,
    isRestricted: isRestricted,
    downloadAccessMessage: _de_download_access_message,
    downloadButtonText: downloadButtonText,
    downloadShowCount: _de_download_show_count,
    downloadCount: downloadCount,
    handleDownloadClick: handleDownloadClick,
    doc: doc,
    downloadFilename: _de_download_filename,
    behavior: _de_download_behavior,
    theme: theme,
    showFullscreen: showFullscreenInToolbar,
    onFullscreenClick: handleToolbarFullscreen,
    fullscreenTitle: fullscreenTitle
  })), showEmailGate && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_EmailGate__WEBPACK_IMPORTED_MODULE_6__["default"], {
    onClose: () => setShowEmailGate(false),
    postId: postId,
    downloadBehavior: _de_download_behavior,
    downloadButtonText: downloadButtonText,
    onSuccess: () => setDownloadCount(prev => prev + 1)
  })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Viewer);

/***/ }),

/***/ "./src/blocks/document-embed/style.scss":
/*!**********************************************!*\
  !*** ./src/blocks/document-embed/style.scss ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************************!*\
  !*** ./src/blocks/document-embed/view.js ***!
  \*******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_Common_Viewer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/Common/Viewer */ "./src/blocks/document-embed/components/Common/Viewer.js");
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./style.scss */ "./src/blocks/document-embed/style.scss");

// eslint-disable-next-line no-unused-vars




// Actually mount a single embed container. Extracted so both the immediate and the
// lazy (IntersectionObserver) paths run the exact same code.
const mountEmbed = block => {
  // Defensive: never double-mount (immediate + IO paths, or repeated init() calls).
  if (block.hasAttribute('data-bplde-initialized')) {
    return;
  }
  let attributesData = block.dataset.attributes;
  if (!attributesData) {
    const attrEl = block.querySelector("[data-attributes]");
    if (attrEl) attributesData = attrEl.dataset.attributes;
  }
  if (!attributesData) {
    return;
  }
  block.setAttribute('data-bplde-initialized', 'true');
  try {
    const attributes = JSON.parse(attributesData);
    let userData = {};
    if (block.dataset.user) {
      userData = JSON.parse(block.dataset.user);
    }
    const pluginUrl = block.dataset.pluginUrl || "";
    const postId = parseInt(block.dataset.postId || 0, 10);
    const root = (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.createRoot)(block);
    root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Common_Viewer__WEBPACK_IMPORTED_MODULE_2__["default"], {
      attributes: attributes,
      userData: userData,
      pluginUrl: pluginUrl,
      postId: postId,
      id: block.id
    }));
  } catch (e) {
    console.error("Failed to initialize Document Embed block:", e);
  }
};
const init = (container = document) => {
  const blocks = container.querySelectorAll(".bplde-document-embed-frontend");
  blocks.forEach(block => {
    if (block.hasAttribute('data-bplde-initialized')) {
      return;
    }

    // Peek at attributes just to decide immediate vs. lazy mount. mountEmbed re-parses;
    // if this fails, fall back to immediate mount so nothing silently disappears.
    let lazyLoad = false;
    try {
      const raw = block.dataset.attributes || block.querySelector("[data-attributes]")?.dataset.attributes;
      if (raw) {
        const attrs = JSON.parse(raw);
        lazyLoad = attrs?.performance?.lazyLoad === true;
      }
    } catch (e) {
      lazyLoad = false;
    }
    if (!lazyLoad || typeof IntersectionObserver === "undefined") {
      mountEmbed(block); // existing behavior, unchanged
      return;
    }

    // Lazy: mount only once it scrolls near the viewport. One-shot, per-instance observer.
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          mountEmbed(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "200px"
    });
    observer.observe(block);
  });
};

// Start initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
}
document.addEventListener("DOMContentLoaded", () => {
  init();
});

// Elementor Support
const runElementor = () => {
  if (window.elementorFrontend && window.elementorFrontend.hooks) {
    window.elementorFrontend.hooks.addAction('frontend/element_ready/global', $scope => {
      init($scope[0]);
    });
    return true;
  }
  return false;
};

// Robust Elementor hook registration
let elementorRetryCount = 0;
const setupElementor = () => {
  if (runElementor()) return;
  if (elementorRetryCount < 20) {
    // Retry for 10 seconds
    elementorRetryCount++;
    setTimeout(setupElementor, 500);
  }
};
setupElementor();
if (typeof jQuery !== 'undefined') {
  jQuery(window).on('elementor/frontend/init', runElementor);
}
})();

/******/ })()
;
//# sourceMappingURL=view.js.map