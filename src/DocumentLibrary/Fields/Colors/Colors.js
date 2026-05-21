import "./Colors.scss";
import { ColorIcon } from "../../Utils/icons";
import Color from "../Color/Color";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";

const Colors = ({
  isPremium = true,
  openProModal = () => {},
  value = {},
  onChange = () => {},
  title = "Colors",
}) => {
  const handleChange = (key, val) => {
    if (!isPremium) {
      openProModal();
      return;
    }
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="bplvf-colors-field">
      <SectionTitle title={title} icon={<ColorIcon />} isPremium={isPremium} />

      <div
        className="bplvf-colors-group"
        style={{ opacity: isPremium ? 1 : 0.4 }}
      >
        <div className="bplvf-bg-color">
          <Color
            label="Normal"
            value={value.normal ? value.normal : "#ffffff"}
            onChange={(val) => handleChange("normal", val)}
            isPremium={isPremium}
            openProModal={openProModal}
          />
        </div>
        <div className="bplvf-text-color">
          <Color
            label="Hover"
            value={value.hover ? value.hover : "#000000"}
            onChange={(val) => handleChange("hover", val)}
            isPremium={isPremium}
            openProModal={openProModal}
          />
        </div>
      </div>
    </div>
  );
};

export default Colors;
