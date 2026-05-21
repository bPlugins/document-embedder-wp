import "./SelectField.scss";
import FieldHeader from "../../Components/Shared/FieldHeader/FieldHeader";
import { Settings } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const SelectField = ({
  title = "Select Settings",
  options = [],
  value = "",
  onChange = () => {},
  isPremium = true,
  openProModal = () => {},
}) => {
  const handleChange = (e) => {
    if (!isPremium) {
      e.preventDefault();
      e.target.value = value; // keep the previous value
      openProModal(); // show pro modal
      return;
    }
    onChange(e.target.value);
  };

  return (
    <div className="bplvf-select-control header">
      <SectionTitle title={title} icon={<Settings />} isPremium={isPremium} />

      <div
        className="select-input-group"
        style={{ opacity: isPremium ? 1 : 0.6 }}
      >
        <select
          value={value}
          onChange={handleChange}
          className="select-dropdown"
          // keep enabled for all users
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectField;
