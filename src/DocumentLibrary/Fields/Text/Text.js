import "./text.scss";
import { TextIcon } from "../../Utils/icons";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const Text = ({
  value = "",
  onChange = () => {},
  isPremium = true,
  openProModal = () => {},
  title = "Text Control",
  placeholder = "Enter Title",
  help = "",
}) => {
  const handleChange = (e) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(e.target.value);
  };

  return (
    <div className="bpl-text-field">
      <SectionTitle title={title} icon={<TextIcon />} isPremium={isPremium} />

      <div
        className="input-field-wrapper"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <input
          type="text"
          onChange={handleChange}
          className="input-field"
          placeholder={placeholder}
          value={value || ""}
        />
        {help && <p className="help-text">{help}</p>}
      </div>
    </div>
  );
};

export default Text;
