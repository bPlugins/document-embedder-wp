import React, { useEffect, useState } from "react";
import "./BoxControl.scss";
import { BoxControlIcon } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const parsePx = (val) => parseInt(val?.toString().replace("px", "") || "0");

const BoxControl = ({
  title = "Box Controls",
  value = {
    top: "5px",
    right: "5px",
    bottom: "5px",
    left: "5px",
  },
  name = "BOX",
  isPremium = true,
  openProModal,
  onChange,
}) => {
  const [padding, setPadding] = useState({
    top: parsePx(value?.top),
    right: parsePx(value?.right),
    bottom: parsePx(value?.bottom),
    left: parsePx(value?.left),
  });

  useEffect(() => {
    // Whenever local state changes, fire onChange with updated values
    onChange?.({
      top: `${padding.top}px`,
      right: `${padding.right}px`,
      bottom: `${padding.bottom}px`,
      left: `${padding.left}px`,
    });
  }, [padding]);

  const handlePaddingChange = (side, val) => {
    if (!isPremium) {
      openProModal?.();
      return;
    }

    const numeric = Number(val);
    if (isNaN(numeric)) return;

    setPadding((prev) => ({
      ...prev,
      [side]: numeric,
    }));
  };

  return (
    <div className="bpl-boxControl__container">
      <SectionTitle
        title={title}
        icon={<BoxControlIcon />}
        isPremium={isPremium}
      />

      <div
        className="bpl-boxControl__cross-layout"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <div className="bpl-boxControl__cross-grid">
          <div></div>
          <div className="bpl-boxControl__input-group">
            <label>Top</label>
            <input
              type="number"
              value={padding.top}
              onChange={(e) => handlePaddingChange("top", e.target.value)}
              className="bpl-boxControl__padding-input"
            />
          </div>
          <div></div>

          <div className="bpl-boxControl__input-group">
            <label>Left</label>
            <input
              type="number"
              value={padding.left}
              onChange={(e) => handlePaddingChange("left", e.target.value)}
              className="bpl-boxControl__padding-input"
            />
          </div>

          <div className="bpl-boxControl__center-icon">
            <div className="bpl-boxControl__padding-icon">
              <span>{name}</span>
            </div>
          </div>

          <div className="bpl-boxControl__input-group">
            <label>Right</label>
            <input
              type="number"
              value={padding.right}
              onChange={(e) => handlePaddingChange("right", e.target.value)}
              className="bpl-boxControl__padding-input"
            />
          </div>

          <div></div>
          <div className="bpl-boxControl__input-group">
            <label>Bottom</label>
            <input
              type="number"
              value={padding.bottom}
              onChange={(e) => handlePaddingChange("bottom", e.target.value)}
              className="bpl-boxControl__padding-input"
            />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default BoxControl;
