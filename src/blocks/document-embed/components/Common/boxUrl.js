// Box shared links: app.box.com/s/<hash>, <company>.app.box.com/s/<hash> or <company>.box.com/s/<hash>.
// The link itself opens Box's web app, which refuses to be framed; visitors only see the file
// through Box's embed page at the same host. The host group must end in a dot right before
// "box.com", so dropbox.com never matches.
const BOX_SHARED_LINK = /^https?:\/\/((?:[a-z0-9-]+\.)*box\.com)\/(?:embed\/|embed_widget\/)?s\/([a-z0-9]+)/i;

export const isBoxUrl = (url) => BOX_SHARED_LINK.test(url || "");

export const getBoxEmbedUrl = (url) => {
  const match = (url || "").match(BOX_SHARED_LINK);
  if (!match) return "";
  return `https://${match[1]}/embed/s/${match[2]}?showParentPath=false&showItemFeedActions=false`;
};
