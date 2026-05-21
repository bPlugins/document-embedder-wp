import { registerBlockType } from "@wordpress/blocks";

import Edit from "./Edit";

import metadata from "./block.json";

registerBlockType(metadata, {
  edit: Edit,
  save: () => null,
});
