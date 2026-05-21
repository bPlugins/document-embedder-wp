const { Fragment, useState, useEffect } = wp.element;
const { withSelect } = wp.data;
const { compose } = wp.compose;
// const { __ } = wp.i18n;
import { __ } from "@wordpress/i18n";
import Settings from "./settings";

const Edit = (props) => {
  // return false;
  const { attributes, setAttributes } = props;
  const { selected, data: dataa } = attributes;
  const [data, setData] = useState();
  const id = selected ?? dataa?.tringle_text;
  
  useEffect(() => {
    if (!selected) {
      setAttributes({ selected: parseInt(id) });
    }
  }, []);

  // let selectBox;
  // let selectedShortcode = "";
  // if (docs) {
  //   selectBox = docs.map((item, index) => {
  //     if (id === item?.id) {
  //       selectedShortcode = item?.title?.rendered;
  //     }
  //     return { label: item?.title?.rendered, value: `[doc id=${item?.id}]` };
  //   });
  //   selectBox = [{ label: "Select", value: null }, ...selectBox];
  // }

  useEffect(() => {
    if (id !== 0) {
      jQuery.ajax({
        // type: "get",
        dataType: "json",
        url: window.ppvBlocks?.ajaxUrl,
        data: {
          action: "pdfp_get_doc_meta",
          id,
          ppv_nonce: window.ppvBlocks?.ppv_nonce,
        },
        success: (res) => {
          setData(res);
        },
      });
    } else {
      setData(false);
    }
  }, [attributes]);

  const base_url = "//docs.google.com/gview?embedded=true&url=";
  return (
    <Fragment>
      <Settings props={props} />
      {/* <h3 style={{ background: "#fff", padding: "2px 10px" }}>
        {!selectedShortcode && "Select a document"} {selectedShortcode}
      </h3> */}
      <div style={{ overflow: "hidden" }}>
        {data && (
          <p style={{ paddingLeft: "10px" }}>
            <a className="s_pdf_download_link" href={data?.url} download>
              <button
                style={{ marginBottom: "10px" }}
                className="ppv_download_bttn"
              >
                {__("Download File", "ppv")}
              </button>
            </a>
          </p>
        )}
        {data && (
          <div>
            <iframe
              id="s_pdf_frame"
              src={base_url + data?.url}
              style={{
                float: "left",
                width: data?.width,
                height: data?.height,
                padding: "10px",
              }}
              frameBorder="0"
            ></iframe>
          </div>
        )}
        {id === 0 && <h3>{__("Select a document", "ppv")}</h3>}
        {/* <SelectControl */}
      </div>
    </Fragment>
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
])(Edit);
