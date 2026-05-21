import { useState, useEffect } from "react";
import "./DynamicTab.scss";

const DynamicTab = ({
  tabs,
  defaultActive = 0,
  value = null,
  onChange = () => {},
}) => {
  const isControlled = value !== null;
  const [activeLabel, setActiveLabel] = useState(
    tabs[defaultActive]?.label.toLowerCase() || ""
  );

  // Sync internal state with external value
  useEffect(() => {
    if (isControlled && value !== activeLabel) {
      setActiveLabel(value);
    }
  }, [value, isControlled]);

  const handleTabClick = (label) => {
    if (isControlled) {
      onChange(label); // controlled mode
    } else {
      setActiveLabel(label); // uncontrolled mode
    }
  };

  // Find active tab index
  const activeIndex = tabs.findIndex(
    (tab) => tab.label.toLowerCase() === activeLabel
  );

  return (
    <div className="bpl-dynamic-tab">
      {/* Tab Buttons */}
      <div className="bpl-tab-header">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.label.toLowerCase()}
            className={`bpl-tab-btn ${
              tab.label.toLowerCase() === activeLabel ? "active" : ""
            }`}
            onClick={() => handleTabClick(tab.label.toLowerCase())}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bpl-tab-content">
        {tabs[activeIndex] && tabs[activeIndex].content}
      </div>
    </div>
  );
};

export default DynamicTab;
