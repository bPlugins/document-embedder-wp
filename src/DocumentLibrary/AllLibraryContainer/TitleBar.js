/**
 * Title card that sits under the top bar on the document editor. The shortcode
 * lives in the top bar itself (EditorHeader).
 */
const TitleBar = ({ title, onChange }) => (
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
  </div>
);

export default TitleBar;
