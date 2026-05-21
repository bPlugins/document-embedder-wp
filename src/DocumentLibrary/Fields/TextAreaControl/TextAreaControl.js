import "./TextAreaControl.scss";
import { TextIcon } from "../../Utils/icons";
import FieldHeader from "../../Components/Shared/FieldHeader/FieldHeader";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const TextAreaControl = ({
  value = "",
  onChange = () => {},
  isPremium = true,
  openProModal = () => {},
  title = "Textarea Control",
  placeholder = "Enter text...",
  help = "Enter your content",
  rows = 4,
}) => {
  const handleChange = (e) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange(e.target.value);
  };

  return (
    <div className="text-field">
      <SectionTitle title={title} icon={<TextIcon />} isPremium={isPremium} />

      <div
        className="input-field-wrapper"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <textarea
          className="input-field textarea-field"
          placeholder={placeholder}
          value={value || ""}
          rows={rows}
          onChange={handleChange}
        ></textarea>

        <p className="field-help">{help}</p>
      </div>
    </div>
  );
};

export default TextAreaControl;
