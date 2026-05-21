const { Panel, PanelBody, SelectControl } = wp.components;
const { InspectorControls } = wp.blockEditor;
const { withSelect } = wp.data;
const { compose } = wp.compose;

const Settings = (props) => {
  const {
    props: { attributes, setAttributes },
    docs,
  } = props;
  const { postName } = attributes;
  let selectBox;
  if (docs) {
    selectBox = docs.map((item) => {
      return { label: item?.title?.rendered, value: `[doc id=${item?.id}]` };
    });
    selectBox = [{ label: "Select", value: null }, ...selectBox];
  }

  return (
    <InspectorControls style={{ marginBottom: "40px" }}>
      <Panel>
        <PanelBody>
          <SelectControl
            label="Size"
            value={postName}
            options={selectBox}
            onChange={(postName) => setAttributes({ postName })}
          />
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};

export default compose([
  withSelect((select) => {
    const docs = select("core").getEntityRecords("postType", "ppt_viewer", {
      per_page: 100,
    });
    return {
      docs,
    };
  }),
])(Settings);
