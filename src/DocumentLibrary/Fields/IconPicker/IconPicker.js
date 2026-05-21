import React from "react";
import "./IconPicker.scss";
import FieldHeader from "../../Components/Shared/FieldHeader/FieldHeader";
import { ContainerIcon } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const IconPicker = ({
  icons = [],
  value = null,
  onChange = () => {},
  isPremium = true,
  openProModal = () => {},
  title = "Icon Picker",
}) => {
  const handleSelect = (icon) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(icon);
  };

  return (
    <div className="icon-picker-field">
      <SectionTitle
        title={title}
        icon={<ContainerIcon />}
        isPremium={isPremium}
      />

      <div className="icon-grid" style={{ opacity: isPremium ? 1 : 0.4 }}>
        {icons.map((icon, index) => {
          return (
            <button
              key={index}
              className={`icon-btn ${value === icon ? "selected" : ""}`}
              onClick={() => handleSelect(icon)}
              type="button"
              dangerouslySetInnerHTML={{ __html: icon }}
            ></button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;
