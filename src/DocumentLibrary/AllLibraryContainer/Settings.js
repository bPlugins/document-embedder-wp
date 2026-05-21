import './Settings.scss';
import { HeaderIcon, Settings, ToolbarIcon, UploadIcon } from "../Utils/icons";
import { Library } from 'lucide-react';
import { useState } from 'react';
import General from './TabContent/General';


const SettingsPanel = ({ formData, isPremium, onFormDataUpdate, openProModal }) => {
  const [activeSettings, setActiveSettings] = useState("uploadItems");
  
  const allSettingsTab = [
    {
      label: "Upload Items",
      value: "uploadItems",
      icon: <UploadIcon />
    },
    {
      label: "Header",
      value: "header",
      icon: <HeaderIcon />
    },
    {
      label: "Toolbar Box",
      value: "toolbarBox",
      icon: <ToolbarIcon />
    },
    {
      label: "Document Box",
      value: "documentBox",
      icon: <Settings />
    },
    {
      label: "Library Container",
      value: "styles-docLibrary",
      icon: <Library />
    }
  ];

  return <div className="settings-panel">
    <div className="panel-header">
      <div className="icon-box">
        <Settings />
      </div>
      <h2>Settings</h2>
    </div>


    <div className="panel-body">
      <nav className="sidebar">
        {allSettingsTab.map((tab) => {
          return (
            <button type='button' key={tab.value} className={`nav-item ${activeSettings === tab.value ? "active" : ""}`} onClick={() => setActiveSettings(tab.value)}>
              <div className="left-bar"></div>
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div className="content-area">
        <General
          formData={formData}
          onFormDataUpdate={onFormDataUpdate}
          isPremium={isPremium}
          openProModal={openProModal}
          activeSettings={activeSettings}
        />
      </div>
    </div>
  </div>
}


export default SettingsPanel;