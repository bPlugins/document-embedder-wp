import { useEffect, useState } from "react";
import "./Typography.scss";
import { Desktop, Mobile, Tablet, TypographyIcon } from "../../Utils/icons";
import fontList from "./fontLists";
import {
  fontVariantsOption,
  fontStyles,
  textTransforms,
  textDecorations,
} from "./options";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const Typography = ({
  isPremium = true,
  openProModal = () => { },
  value = {},
  onChange,
  title = "Typography",
}) => {

  const getInitialTypography = () => {
    const defaultFont = fontList[0]?.family || "Default";
    const defaultVariant = fontList[0]?.variants[0] || "400";

    return {
      fontFamily: value.fontFamily || defaultFont,
      fontWeight: value.fontWeight || defaultVariant,
      fontSize: {
        desktop: value.fontSize?.desktop || 20,
        tablet: value.fontSize?.tablet || 16,
        mobile: value.fontSize?.mobile || 16,
      },
      fontUnit: value.fontUnit || "px",
      lineHeight: value.lineHeight || "1.5",
      letterSpace: value.letterSpace || "0px",
      textTransform: value.textTransform || "none",
      textDecoration: value.textDecoration || "none",
      fontStyle: value.fontStyle || "normal",
    };
  };

  const [typography, setTypography] = useState(getInitialTypography);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [activeDevice, setActiveDevice] = useState("desktop");


  useEffect(() => {
    setTypography(getInitialTypography());
  }, [value]);

  useEffect(() => {
    const currentFont = fontList.find(
      (f) => f.family === typography.fontFamily
    );
    if (currentFont) {
      setAvailableVariants(currentFont.variants);
      if (!currentFont.variants.includes(typography.fontWeight)) {
        updateTypography("fontWeight", currentFont.variants[0]);
      }
    }
  }, [typography.fontFamily]);

  const updateTypography = (key, val) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    const updated = { ...typography };

    if (key === "fontSize") {
      updated.fontSize[activeDevice] = val;
    } else {
      updated[key] = val;
    }

    setTypography(updated);
    onChange?.(updated);
  };

  const variantOptions = availableVariants.map((variant) => {
    const match = fontVariantsOption.find((opt) => opt.value === variant);
    return match || { label: `${variant}`, value: variant };
  });

  return (
    <div className="typography-field">
      <SectionTitle
        title={title}
        icon={<TypographyIcon />}
        isPremium={isPremium}
      />

      <div
        className="typography-controls"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <div className="typography-row">
          <div className="typography-group">
            <label className="field-label">Font Family</label>
            <select
              value={typography.fontFamily}
              onChange={(e) => updateTypography("fontFamily", e.target.value)}
              className="select-field"
            >
              {fontList.map((font) => (
                <option key={font.family} value={font.family}>
                  {font.family}
                </option>
              ))}
            </select>
          </div>

          <div className="typography-group">
            <label className="field-label">Font Weight</label>
            <select
              value={typography.fontWeight}
              onChange={(e) => updateTypography("fontWeight", e.target.value)}
              className="select-field"
            >
              {variantOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* ==== FONT SIZE WITH DEVICE SELECTOR ==== */}
          <div className="typography-group font-size-with-devices">
            <div className="font-size-label-row">
              <label className="font-size-input-label">Font Size</label>
              <div className="device-selector">
                {["desktop", "tablet", "mobile"].map((device) => (
                  <button
                    key={device}
                    className={`device-btn ${activeDevice === device ? "active" : ""
                      }`}
                    onClick={() => setActiveDevice(device)}
                    type="button"
                    title={device.toUpperCase()}
                  >
                    {device === "desktop" ? (
                      <Desktop />
                    ) : device === "tablet" ? (
                      <Tablet />
                    ) : (
                      <Mobile />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="font-size-input-wrapper">
              <input
                type="number"
                className="font-size-input"
                value={typography.fontSize[activeDevice]}
                onChange={(e) =>
                  updateTypography("fontSize", parseInt(e.target.value))
                }
                min="1"
              />
              <select
                value={typography.fontUnit}
                onChange={(e) => updateTypography("fontUnit", e.target.value)}
                className="font-size-unit"
              >
                <option value="px">px</option>
                <option value="rem">rem</option>
                <option value="em">em</option>
                <option value="vw">vw</option>
                <option value="%">%</option>
              </select>
            </div>

          </div>
        </div>

        <div className="typography-row">
          <div className="typography-group">
            <label className="field-label">Line Height</label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={typography.lineHeight}
              onChange={(e) => updateTypography("lineHeight", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="typography-group">
            <label className="field-label">Text Transform</label>
            <select
              value={typography.textTransform}
              onChange={(e) =>
                updateTypography("textTransform", e.target.value)
              }
              className="select-field"
            >
              {textTransforms.map((transform) => (
                <option key={transform.value} value={transform.value}>
                  {transform.label}
                </option>
              ))}
            </select>
          </div>

          <div className="typography-group">
            <label className="field-label">Text Decoration</label>
            <select
              value={typography.textDecoration}
              onChange={(e) =>
                updateTypography("textDecoration", e.target.value)
              }
              className="select-field"
            >
              {textDecorations.map((deco) => (
                <option key={deco.value} value={deco.value}>
                  {deco.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="typography-row">
          <div className="typography-group">
            <label className="field-label">Font Style</label>
            <select
              value={typography.fontStyle}
              onChange={(e) => updateTypography("fontStyle", e.target.value)}
              className="select-field"
            >
              {fontStyles.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          <div className="letter-spacing-group">
            <label className="field-label">Letter Spacing</label>
            <div className="letter-spacing-input-wrapper">
              <input
                type="range"
                min="-2"
                max="30"
                step="0.1"
                value={parseFloat(typography.letterSpace)}
                onChange={(e) =>
                  updateTypography(
                    "letterSpace",
                    parseFloat(e.target.value).toFixed(1) + "px"
                  )
                }
                className="range-slider"
                style={{
                  background: `linear-gradient(
                    to right,
                    #146ef5 0%,
                    #146ef5 ${((parseFloat(typography.letterSpace) - -2) / 32) * 100
                    }%,
                    #e5e7eb ${((parseFloat(typography.letterSpace) - -2) / 32) * 100
                    }%,
                    #e5e7eb 100%
                  )`,
                }}
              />
              <span className="range-value">{typography.letterSpace}</span>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Typography;
