import { HeaderIcon, Settings, ToolbarIcon, UploadIcon } from '../Utils/icons';
import { Library } from 'lucide-react';

/**
 * The five settings groups, as a strip under the editor header.
 *
 * It spans the whole editor rather than sitting inside the settings column, so
 * the column keeps its full width for the colour and typography controls.
 */
export const LIBRARY_TABS = [
  { label: 'Upload Items', value: 'uploadItems', icon: <UploadIcon /> },
  { label: 'Header', value: 'header', icon: <HeaderIcon /> },
  { label: 'Toolbar Box', value: 'toolbarBox', icon: <ToolbarIcon /> },
  { label: 'Document Box', value: 'documentBox', icon: <Settings /> },
  { label: 'Library Container', value: 'styles-docLibrary', icon: <Library /> },
];

const TabStrip = ({ active, onChange, counts = {} }) => (
  <nav className="bpldl-tabs" aria-label="Library settings">
    {LIBRARY_TABS.map((tab) => (
      <button
        type="button"
        key={tab.value}
        className={`bpldl-tab${active === tab.value ? ' is-active' : ''}`}
        aria-current={active === tab.value ? 'true' : undefined}
        onClick={() => onChange(tab.value)}
      >
        <span className="bpldl-tab__icon">{tab.icon}</span>
        {tab.label}
        {counts[tab.value] ? <span className="bpldl-tab__count">{counts[tab.value]}</span> : null}
      </button>
    ))}
  </nav>
);

export default TabStrip;
