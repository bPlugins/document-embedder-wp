/**
 * Returns "" for a URL that would run script when followed, otherwise the URL unchanged.
 *
 * Mirrors Functions::is_unsafe_url() in PHP. The server already strips these, but the block
 * editor renders attributes straight from post content, so the viewer checks again before a
 * URL reaches an anchor, a new tab or an iframe. Browsers ignore whitespace and control
 * characters inside a scheme, so those are removed before comparing.
 *
 * @param {*} url Stored value.
 * @return {string}
 */
const safeUrl = (url) => {
  if (typeof url !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const normalized = url.replace(/[\x00-\x20]+/g, "").toLowerCase();
  return /^(javascript|vbscript|livescript):/.test(normalized) ? "" : url;
};

export default safeUrl;
