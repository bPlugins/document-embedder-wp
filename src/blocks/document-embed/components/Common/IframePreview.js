import { useEffect, useRef, useState } from "react";

/**
 * Shared iframe wrapper for the Google-Docs-Viewer / default-viewer branches.
 *
 * Reuses the same failure-detection pattern proven in PDFJSViewer: a 10s timeout that
 * fires onError only for google.com/gview sources that never load, plus a postMessage
 * listener. It does nothing extra for non-gview sources (e.g. Office Online), so those
 * branches keep their exact current behavior.
 */
const IframePreview = ({ src, className = "", title = "", onLoad, onError, children }) => {
  const [, setLoaded] = useState(false);
  const loadedRef = useRef(false);
  // Keep the latest onError without making it an effect dependency, so a new inline
  // handler identity on each render doesn't restart the timeout.
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
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

    const handleMessage = (event) => {
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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <iframe
        src={src}
        title={title}
        className={className}
        onLoad={handleLoad}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
      {children}
    </div>
  );
};

export default IframePreview;
