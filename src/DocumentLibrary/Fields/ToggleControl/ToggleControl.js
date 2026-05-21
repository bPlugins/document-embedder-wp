import "./ToggleControl.scss";
import { ToggleIcon } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const ToggleControl = ({
  title = "Show Header",
  isPremium = true,
  description,
  value,
  onChange,
  openProModal,
}) => {
  const handleToggle = (e) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(e.target.checked);
  };

  return (
    <>
      <div
        className="toggle-control-field"
        style={{ display: description ? "block" : "flex" }}
      >
        <SectionTitle
          title={title}
          icon={<ToggleIcon />}
          isPremium={isPremium}
          isFull={false}
        />
        <div className="field-wrapper">
          {description && (
            <div className="toggle-description">
              <p>{description}</p>
            </div>
          )}

          <label
            className="toggle-field"
            style={{
              opacity: isPremium ? 1 : 0.4,
              marginTop: !description ? "0px" : "-7px",
            }}
          >
            <input
              type="checkbox"
              id="toggle-control"
              checked={value}
              onChange={handleToggle}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </>
  );
};

export default ToggleControl;
