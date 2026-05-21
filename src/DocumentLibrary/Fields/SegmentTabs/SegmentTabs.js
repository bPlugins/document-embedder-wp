import { useState } from "react";
import "./SegmentTabs.scss";

const SegmentTabs = ({
  tabs = [],
  defaultActive,
  activeTab, 
  onChange,
  className = "",
}) => {
  const isControlled = activeTab !== undefined;
  const [internalActive, setInternalActive] = useState(
    defaultActive || tabs[0]?.id
  );

  const currentActive = isControlled ? activeTab : internalActive;

  const handleClick = (id) => {
    if (!isControlled) {
      setInternalActive(id);
    }
    onChange?.(id);
  };

  return (
    <div className={`segment-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${currentActive === tab.id ? "active" : ""
            }`}
          onClick={() => handleClick(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentTabs;