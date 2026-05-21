import { Panel, PanelBody, SelectControl } from "@wordpress/components";
import { InspectorControls } from "@wordpress/block-editor";
import { withSelect } from "@wordpress/data";
import { compose } from "@wordpress/compose";
import { __ } from "@wordpress/i18n";

const Settings = (props) => {
  const {
    props: { attributes, setAttributes },
    docs,
  } = props;
  const { selected, data: dataa } = attributes;
  const id = selected ?? dataa?.tringle_text;

  let selectBox;
  if (docs) {
    selectBox = docs.map((item) => {
      return { label: item?.title?.rendered, value: item?.id };
    });
    selectBox = [{ label: "Select", value: 0 }, ...selectBox];
  }

  return (
    <InspectorControls style={{ marginBottom: "40px" }}>
      <Panel>
        <PanelBody>
          <SelectControl
            label={__("Size", "ppv")}
            value={id}
            options={selectBox}
            onChange={(selected) =>
              setAttributes({ selected: parseInt(selected) })
            }
          />
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};

export default compose([
  withSelect((select) => {
    const docs = select("core").getEntityRecords("postType", "ppt_viewer", {
      per_page: 10,
    });
    return {
      docs,
    };
  }),
])(Settings);
