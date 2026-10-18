// Protocols a document URL may use. Anything else -- javascript:, vbscript:, data: -- can run
// script once it lands in an href, an iframe src or a programmatic link click. blob: is what the
// block editor shows while a picked file is still uploading.
const SAFE_PROTOCOLS = ["http:", "https:", "ftp:", "ftps:", "blob:"];

// The document URL, or "" when it would run script. Parsed with the browser's own URL parser so
// tricks like leading spaces or tabs inside "java\tscript:" are read exactly as navigation would
// read them. Relative URLs resolve against the page and pass.
export const safeDocUrl = (url) => {
  if (typeof url !== "string" || url === "") return "";
  try {
    const { protocol } = new URL(url, window.location.href);
    return SAFE_PROTOCOLS.includes(protocol) ? url : "";
  } catch (e) {
    return "";
  }
};
