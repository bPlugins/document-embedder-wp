import { useState } from "@wordpress/element";
import { useInstanceId } from "@wordpress/compose";
import { __ } from "@wordpress/i18n";
import { GoogleDriveIcon, DropboxIcon, BoxIcon, UploadIcon, LinkIcon, DocumentIcon } from "./sourceIcons";

// Where every "Upgrade" link in the block points; the settings-page fallback is the
// URL the sidebar's Pro panels already use.
const pricingUrl = () =>
  window.ppvBlocks?.pricingUrl ||
  (window.ppvBlocks?.settingsUrl ? window.ppvBlocks.settingsUrl.replace("page=settings", "page=document-emberdder-pricing") : "");

/**
 * Cloud sources are Pro-only here. They still show, as links to pricing, so every way
 * in to the block is visible from the first screen.
 */
const SourceCard = ({ icon, title, text, action, onClick, href, primary, pro }) => {
  const className = `bplde-sp-card${primary ? " is-primary" : ""}${pro ? " is-pro" : ""}`;
  const body = (
    <>
      {pro && <span className="bplde-sp-card__badge bplde-badge bplde-badge--pro">{__("Pro", "document-emberdder")}</span>}
      <span className="bplde-sp-card__icon">{icon}</span>
      <span className="bplde-sp-card__title">{title}</span>
      <span className="bplde-sp-card__text">{text}</span>
      <span className="bplde-sp-card__action">{action}</span>
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  );
};

/**
 * First screen of an empty Document Embed block. It only ever renders while
 * documentSource.doc is empty, and writes the same attributes the old placeholder did,
 * so blocks that already hold a document never see it.
 *
 * @param {Function} onSelect Called with `{ doc, docId }`.
 */
const SourcePicker = ({ onSelect }) => {
  const [url, setUrl] = useState("");
  const inputId = useInstanceId(SourcePicker, "bplde-sp-url");

  const openMediaLibrary = () => {
    const frame = wp.media({
      title: __("Select Document", "document-emberdder"),
      multiple: false,
      button: { text: __("Use this document", "document-emberdder") },
    });
    frame.on("select", () => {
      const file = frame.state().get("selection").first().toJSON();
      if (file?.url) {
        onSelect({ doc: file.url, docId: file.id });
      }
    });
    frame.open();
  };

  const embedUrl = (e) => {
    e.preventDefault();
    const value = url.trim();
    if (value) {
      onSelect({ doc: value, docId: 0 });
    }
  };

  const upgrade = __("Upgrade to Pro →", "document-emberdder");

  return (
    <div className="bplde-source-picker">
      <div className="bplde-sp-head">
        <span className="bplde-sp-head__icon">
          <DocumentIcon size={20} />
        </span>
        <div>
          <span className="bplde-sp-eyebrow">{__("Document Embed", "document-emberdder")}</span>
          <h3 className="bplde-sp-title">{__("Choose a document source", "document-emberdder")}</h3>
          <p className="bplde-sp-sub">
            {__("PDF, Word, Excel and PowerPoint files are supported.", "document-emberdder")}
          </p>
        </div>
      </div>

      <div className="bplde-sp-body">
        <div className="bplde-sp-grid">
          <SourceCard
            primary
            icon={<UploadIcon size={22} />}
            title={__("Upload / Media Library", "document-emberdder")}
            text={__("Upload a new file or pick one you have already uploaded.", "document-emberdder")}
            action={__("Choose file", "document-emberdder")}
            onClick={openMediaLibrary}
          />

          <SourceCard
            pro
            icon={<GoogleDriveIcon size={22} />}
            title={__("Google Drive", "document-emberdder")}
            text={__("Embed a file straight from your Drive with one click.", "document-emberdder")}
            action={upgrade}
            href={pricingUrl()}
          />

          <SourceCard
            pro
            icon={<DropboxIcon size={22} />}
            title={__("Dropbox", "document-emberdder")}
            text={__("Embed a shared file from your Dropbox with one click.", "document-emberdder")}
            action={upgrade}
            href={pricingUrl()}
          />

          <SourceCard
            pro
            icon={<BoxIcon size={22} />}
            title={__("Box", "document-emberdder")}
            text={__("Browse your Box account and embed any file with one click.", "document-emberdder")}
            action={upgrade}
            href={pricingUrl()}
          />
        </div>

        <form className="bplde-sp-url" onSubmit={embedUrl}>
          <label className="bplde-sp-eyebrow" htmlFor={inputId}>
            {__("Or embed from URL", "document-emberdder")}
          </label>
          <div className="bplde-sp-url__row">
            <span className="bplde-sp-url__field">
              <LinkIcon size={16} />
              <input
                id={inputId}
                // text, not url: the old field took any string, including relative paths.
                type="text"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={__("https://example.com/document.pdf", "document-emberdder")}
              />
            </span>
            <button type="submit" className="bplde-sp-url__submit" disabled={!url.trim()}>
              {__("Embed", "document-emberdder")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourcePicker;
