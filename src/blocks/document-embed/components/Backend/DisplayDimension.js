import { PanelBody, __experimentalUnitControl as UnitControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { compose } from "@wordpress/compose";
import { withSelect } from "@wordpress/data";
import { Label, Device } from "../../../../../../bpl-tools/Components";

const DisplayDimension = ({ attributes, setAttributes, device }) => {
  const { displayDimensions } = attributes;
  const { width = {}, height = {} } = displayDimensions;

  const getDimensionValue = (dimObj, deviceType, fallback) => {
    if (typeof dimObj === "string") {
      return dimObj;
    }
    return dimObj?.[deviceType] || fallback;
  };

  const updateDimension = (type, deviceType, value) => {
    const currentVal = displayDimensions[type];
    const baseObj = typeof currentVal === "object" && currentVal !== null ? currentVal : { desktop: "", tablet: "", mobile: "" };
    setAttributes({
      displayDimensions: {
        ...displayDimensions,
        [type]: {
          ...baseObj,
          [deviceType]: value,
        },
      },
    });
  };

  return (
    <PanelBody
      className="bPlPanelBody"
      title={
        <div className="bplde-panel-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#3858E9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          <span>{__("Display & Dimensions", "document-emberdder")}</span>
        </div>
      }
      initialOpen={false}
    >
      <UnitControl
        label={<Label className="gap5">{__("Width", "document-emberdder")}  <Device /></Label>}
        labelPosition="top"
        className="mt10"
        onChange={(value) => updateDimension("width", device, value)}
        value={getDimensionValue(width, device, "100%")}
        units={[
          { value: "px", label: "px", default: 1000 },
          { value: "%", label: "%", default: 100 },
          { value: "vw", label: "vw", default: 100 },
        ]}
        isResetValueOnUnitChange={true}
        help={device === 'tablet' ? __("Set the width of the viewer for tablet.", "document-emberdder") : device === 'mobile' ? __("Set the width of the viewer for mobile.", "document-emberdder") : __("Set the width of the viewer for desktop.", "document-emberdder")}
      />

      <UnitControl
        label={<Label className="gap5">{__("Height", "document-emberdder")}  <Device /></Label>}
        labelPosition="top"
        className="mt10"
        onChange={(value) => updateDimension("height", device, value)}
        value={getDimensionValue(height, device, device === 'tablet' ? '700px' : device === 'mobile' ? '400px' : '840px')}
        units={[
          { value: "px", label: "px", default: 840 },
          { value: "%", label: "%", default: 100 },
          { value: "vh", label: "vh", default: 100 },
        ]}
        isResetValueOnUnitChange={true}
        help={device === 'tablet' ? __("Set the height of the viewer for tablet.", "document-emberdder") : device === 'mobile' ? __("Set the height of the viewer for mobile.", "document-emberdder") : __("Set the height of the viewer for desktop.", "document-emberdder")}
      />
    </PanelBody>
  );
};

export default compose(
  withSelect((select) => {
    const { getDeviceType } = select('core/editor');

    return {
      device: getDeviceType()?.toLowerCase() || 'desktop',
    };
  }),
)(DisplayDimension);
