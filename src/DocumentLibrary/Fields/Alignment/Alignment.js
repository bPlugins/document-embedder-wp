import "./Alignment.scss";
import { AlignmentIcon } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const Alignment = ({
  value = "left",
  onChange,
  isPremium = true,
  openProModal,
  title = "Alignment",
  positions = [],
}) => {
  const handleClick = (posValue, e) => {
    e.stopPropagation();
    if (!isPremium) {
      openProModal?.();
    } else {
      onChange?.(posValue);
    }
  };

  return (
    <div className="positioning-field">
      <SectionTitle
        title={title}
        icon={<AlignmentIcon />}
        isPremium={isPremium}
      />

      <div
        className="positioning-wrapper"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <div className="position-options">
          {positions.map((pos) => (
            <button
              type="button"
              key={pos.value}
              onClick={(e) => handleClick(pos.value, e)}
              className={`position-option ${
                value === pos.value ? "active" : ""
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alignment;
