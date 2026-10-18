import { LayoutGrid } from 'lucide-react';

/**
 * Title card that sits under the top bar on the document editor. The shortcode
 * lives in the top bar itself (EditorHeader). The layout button beside the
 * title reopens the layout picker.
 */
const TitleBar = ({ title, onChange, layoutName, onChangeLayout, layoutButtonRef }) => (
  <div className="bpldl-titleblock">
    <div className="bpldl-titlecard" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <input
        type="text"
        className="bpldl-titleinput"
        placeholder="Add title"
        aria-label="Library title"
        value={title || ''}
        onChange={onChange}
      />
      {layoutName && (
        <button type="button" className="bpldl-layout-btn" onClick={onChangeLayout} ref={layoutButtonRef}>
          <LayoutGrid aria-hidden="true" />
          Layout: {layoutName}
          <span className="bpldl-layout-btn__change">Change</span>
        </button>
      )}
    </div>
  </div>
);

export default TitleBar;
