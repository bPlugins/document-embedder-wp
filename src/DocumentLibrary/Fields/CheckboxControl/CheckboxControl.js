import React from "react";
import "./CheckboxControl.scss";
import FieldHeader from "../../Components/Shared/FieldHeader/FieldHeader";
import { Settings } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const CheckboxControl = ({
  title = "Select Option",
  options = [],
  value = [],
  onChange,
  isMultiple = false,
  isPremium = true,
  openProModal,
  helpText = "",
  fieldIcon = <Settings />,
}) => {
  const handleSelect = (optionValue) => {
    if (!isPremium) {
      openProModal();
      return;
    }

    if (isMultiple) {
      // multiple selections
      let updated = [...value];

      if (updated.includes(optionValue)) {
        updated = updated.filter((v) => v !== optionValue);
      } else {
        updated.push(optionValue);
      }

      onChange(updated);
    } else {
      // only one selection
      onChange(optionValue);
    }
  };

  return (
    <div className="checkbox-group-field">
      <SectionTitle
        title={title}
        icon={fieldIcon}
        isPremium={isPremium}
        isFull={false}
      />
      {helpText && <p className="checkbox-help-text">{helpText}</p>}

      <div className="checkbox-group" style={{ opacity: isPremium ? 1 : 0.4 }}>
        {options.map((opt) => {
          const isChecked = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`checkbox-item ${isChecked ? "checked" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="checkmark"></span>
              <span className="label-text">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxControl;
