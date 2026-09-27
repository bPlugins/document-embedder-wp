const { Fragment } = wp.element;
const { withSelect } = wp.data;
const { compose } = wp.compose;
import Settings from "./settings";

const Edit = (props) => {
  const { attributes, docs } = props;
  const { postName } = attributes;
  let selected = "";
  if (docs) {
    docs.forEach((item) => {
      if (postName === `[doc id=${item?.id}]`) {
        selected = item?.title?.rendered;
      }
    });
  }

  return (
    <Fragment>
      <Settings props={props} />
      <h3 style={{ background: "#fff", padding: "2px 10px" }}>
        {" "}
        {!selected && "Select a document"} {selected}
      </h3>
    </Fragment>
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
])(Edit);
