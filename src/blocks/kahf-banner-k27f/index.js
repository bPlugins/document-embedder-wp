import attributes from "./attributes";
import Edit from "./Edit";
import Save from "./Save";

const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;
// import Edit from "./Edit";
registerBlockType("kahf-kit/kahf-banner-k27f", {
  title: __("Documenter Embedder", "ppv"),
  icon: "media-document",
  category: "common",
  keywords: [__("Documenter Embedder", "ppv"), __("Document", "ppv")],
  //   supports: {
  //     align: ["wide", "full"],
  //   },
  attributes,
  parent: ["lsdkf/lsdkfjlsd"], // invalid parent due to disable for new users but it will work for old users;
  getEditWrapperProps: () => { },
  edit: Edit,
  save: Save,
  example: {
    attributes: true,
  },
});
