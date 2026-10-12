import SectionTitle from "../../Components/Shared/Shared/SectionTitle";
import SegmentTabs from "../SegmentTabs/SegmentTabs";
import { Settings } from "../../Utils/icons";
import "./Choice.scss";

/**
 * A titled segmented control for picking one of a few options, built from the
 * same SegmentTabs the settings tabs use. Locked like the other fields: when
 * isPremium is false a click opens the Pro modal instead of changing anything.
 */
const Choice = ({ title, help, options = [], value, onChange, isPremium = true, openProModal = () => {}, icon = null }) => (
  <div className="bpldl-choice">
    <SectionTitle title={title} icon={icon || <Settings />} isPremium={isPremium} />
    {/* Control and help in one box, so the editor's "label | control" row keeps two columns. */}
    <div className="bpldl-choice__control" style={{ opacity: isPremium ? 1 : 0.4 }}>
      <SegmentTabs
        className="bpldl-choice__tabs"
        tabs={options.map((o) => ({ id: o.value, label: o.label }))}
        activeTab={value}
        onChange={(next) => (isPremium ? onChange(next) : openProModal())}
      />
      {help && <p className="bpldl-choice__help">{help}</p>}
    </div>
  </div>
);

export default Choice;
