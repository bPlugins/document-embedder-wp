import "./NumberControl.scss";
import FieldHeader from "../../Components/Shared/FieldHeader/FieldHeader";
import { Settings } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const NumberControl = (props) => {
  const {
    value,
    onChange,
    isPremium,
    openProModal,
    title,
    placeholder,
    help
  } = props;

  const handleChange = (e) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(e.target.value);
  };

  return (
    <div className="bpl-number-control">
      <SectionTitle title={title} icon={<Settings />} isPremium={isPremium} />

      <div
        className="input-field-wrapper"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <input
          type="number"
          onChange={handleChange}
          className="input-field"
          placeholder={placeholder}
          value={value || ""}
        />
        <p className="help-text">{help}</p>
      </div>
    </div>
  );
};

export default NumberControl;
