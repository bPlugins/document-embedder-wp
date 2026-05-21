const { Fragment } = wp.element;
const { withSelect } = wp.data;
const { compose } = wp.compose;
import Settings from "./settings";

const Edit = (props) => {
  // return false;
  const { attributes, docs } = props;
  const { postName } = attributes;
  // const [data, setData] = useState();
  // let id = 0;
  // const regax = postName.match(/\[doc id='?(\d+)'?\]/);
  // if (typeof regax[1] == "undefined") {
  //   id = 0;
  // }
  // id = regax[1];
  // useEffect(() => {
  //   if (!selected) {
  //     setAttributes({ selected: parseInt(tringle_text) });
  //   }
  // }, []);

  // if (!data) {
  //   jQuery.get(ppvBlocks?.siteUrl + "/wp-json/doc/v1/single/" + id, function (res) {
  //     setData(res);
  //   });
  // }
  let selectBox;
  let selected = "";
  if (docs) {
    selectBox = docs.map((item) => {
      if (postName === `[doc id=${item?.id}]`) {
        selected = item?.title?.rendered;
      }
      return { label: item?.title?.rendered, value: `[doc id=${item?.id}]` };
    });
    selectBox = [{ label: "Select", value: null }, ...selectBox];
  }

  // const base_url = "//docs.google.com/gview?embedded=true&url=";

  return (
    <Fragment>
      <Settings props={props} />
      {/* <SelectControl label="Size" value={postName} options={selectBox} onChange={(postName) => setAttributes({ postName })} /> */}
      <h3 style={{ background: "#fff", padding: "2px 10px" }}>
        {" "}
        {!selected && "Select a document"} {selected}
      </h3>
      {/* <div style={{ overflow: "hidden" }}>
        {data && (
          <p style={{ paddingLeft: "10px" }}>
            <a className="s_pdf_download_link" href={data?.url} download>
              <button style={{ marginBottom: "10px" }} className="ppv_download_bttn">
                Download File
              </button>
            </a>
          </p>
        )}
        {data && (
          <div>
            <iframe
              id="s_pdf_frame"
              src={base_url + data?.url}
              style={{ float: "left", width: data?.width, height: data?.height, padding: "10px" }}
              frameborder="0"
            ></iframe>
          </div>
        )}
      </div> */}
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
