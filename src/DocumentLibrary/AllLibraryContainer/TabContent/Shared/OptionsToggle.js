import { ToggleIcon } from "../../../Utils/icons";
import "./OptionsToggle.scss";

const OptionToggle = ({ title,
  icon = <ToggleIcon />, description, value, onChange, isPremium = true, openProModal }) => {
  

  const handleToggle = (e) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(e.target.checked);
  };

  return (
    <div className="option-card">
      <div className="option-left">
        <div className="option-icon">
          {icon}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={handleToggle}
        />
        <span className="slider" />
      </label>
    </div>
  );
};

export default OptionToggle;