import { Copy } from '../Utils/icons';

/**
 * Title card and shortcode strip, the pair that sits under the top bar on the
 * document editor.
 *
 * The shortcode only exists once the library has an id, so before the first
 * save the strip says so rather than showing a shortcode that resolves to
 * nothing.
 */
const TitleBar = ({ title, onChange, postId, onCopy, copied }) => (
  <div className="bpldl-titleblock">
    <div className="bpldl-titlecard">
      <input
        type="text"
        className="bpldl-titleinput"
        placeholder="Add title"
        aria-label="Library title"
        value={title || ''}
        onChange={onChange}
      />
    </div>

    <div className="bpldl-shortcode">
      <p className="bpldl-shortcode__note">
        Copy and paste this shortcode into your posts, pages and widgets
      </p>

      {postId > 0 ? (
        <>
          <code className="bpldl-shortcode__code">{`[document_library id="${postId}"]`}</code>
          <button
            type="button"
            className="bpldl-shortcode__copy"
            onClick={() => onCopy(postId)}
            aria-label="Copy shortcode"
          >
            <Copy />
            <span>{copied === postId ? 'Copied' : 'Copy'}</span>
          </button>
        </>
      ) : (
        <span className="bpldl-shortcode__pending">Available once you save</span>
      )}
    </div>
  </div>
);

export default TitleBar;
