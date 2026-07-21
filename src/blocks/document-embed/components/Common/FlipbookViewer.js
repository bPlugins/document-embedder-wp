import { useRef, useEffect } from "react";

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
const FlipbookViewer = ({ attributes = {}, source = "", viewerType = "flipbook", onLoad }) => {
  const containerRef = useRef(null);
  const flipbookRef = useRef(null);

  const { displayDimensions = {} } = attributes;
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

  useEffect(() => {
    let cancelled = false;
    let pollId = null;

    // dFlip viewerType: "slider" = one page at a time (swipe), "flipbook" = page turn.
    const dflipViewerType = viewerType === "slider" ? "slider" : "flipbook";

    const isLibReady = () =>
      !!(window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.flipBook === "function");

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
        instantTextureProcess: !onDemandRendering,
      };

      if (hideControls) {
        options.hideControls = hideControls;
      }

      // 3. Fullscreen in New Tab behavior
      if (fullscreenNewTab) {
        options.onCreateUI = function(app) {
          if (app.ui && app.ui.controls && app.ui.controls.fullScreen) {
            const $btn = app.ui.controls.fullScreen;
            $btn.off("click");
            $btn.on("click", function(e) {
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryInit();
          }
        });
      },
      { threshold: 0.1 }
    );

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
  }, [
    pdfUrl,
    viewerType,
    height,
    initialPage,
    readerMode,
    toggleThumbnails,
    sidebarOpen,
    loadLatestVersion,
    enableFullscreen,
    fullscreenNewTab,
    onDemandRendering,
  ]);

  return (
    <div className="bplde-dflip-wrapper" style={{ height: "100%", width: "100%" }}>
      <div ref={containerRef} className="dflip-container" style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default FlipbookViewer;
