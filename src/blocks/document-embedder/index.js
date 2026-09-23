import { registerBlockType } from "@wordpress/blocks";

import Edit from "./Edit";
import "./editor.scss";

import metadata from "./block.json";

registerBlockType(metadata, {
  edit: Edit,
  save: () => null,
});
