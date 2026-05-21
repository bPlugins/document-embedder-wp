import "./RangeControl.scss";
import { Settings } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const RangeControl = ({
  isPremium = true,
  openProModal = () => {},
  value = 30,
  min = 1,
  max = 100,
  onChange = () => {},
  title = "Border Radius",
  help = "Your subtitle goes here",
  fieldIcon = null,
  step = 1,
}) => {
  const handleChange = (e) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="range-control">
      <SectionTitle
        title={title}
        icon={fieldIcon || <Settings />}
        isPremium={isPremium}
      />

      <div className="range-wrapper" style={{ opacity: isPremium ? 1 : 0.4 }}>
        <div className="range-input">
          <div className="range-container">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleChange}
              className="range-slider"
              style={{
                background: `linear-gradient(
                to right,
                #146ef5 0%,
                #146ef5 ${((value - min) / (max - min)) * 100}%,
                #e5e7eb ${((value - min) / (max - min)) * 100}%,
                #e5e7eb 100%
              )`,
              }}
            />
          </div>
          <div className="value-display">
            <span className="range-value">{value}</span>
          </div>
        </div>
        <label className="help-text">{help}</label>
      </div>
    </div>
  );
};

export default RangeControl;
