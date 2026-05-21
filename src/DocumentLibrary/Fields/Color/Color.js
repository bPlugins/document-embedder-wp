import { useEffect, useRef, useState } from "react";
import { ColorPicker, Popover } from "@wordpress/components";
import "./Color.scss";
import { ColorIcon } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const Color = ({
  label = null,
  value = "#ffffff",
  onChange = () => {},
  isHeader = false,
  isPremium = true,
  openProModal = () => {},
  title = "Color Settings",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorPickerRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        previewRef.current &&
        !previewRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpen = () => {
    if (!isPremium) {
      openProModal();
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleColorChange = (newColor) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(newColor.hex);
  };

  const handleTextInput = (e) => {
    const val = e.target.value;
    onChange(val);
  };

  return (
    <div className={`bplvf-color-control ${isHeader ? "header" : ""}`}>
      {isHeader ? (
        <SectionTitle title={title} icon={<ColorIcon />} isPremium={isPremium} />
      ) : (
        <label className="field-label">{label}</label>
      )}

      <div
        className="color-input-group"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <div className="color-picker" onClick={handleOpen} ref={previewRef}>
          <div
            className="color-picker-preview"
            style={{ background: value?.hex || value }}
          ></div>
        </div>

        {isOpen && (
          <Popover ref={colorPickerRef}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #efefef",
                padding: 10,
              }}
            >
              <ColorPicker
                color={value}
                onChangeComplete={handleColorChange}
                enableAlpha
              />
            </div>
          </Popover>
        )}

        <input
          type="text"
          value={value?.hex || value}
          onChange={handleTextInput}
          className="color-text-input"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
};

export default Color;
