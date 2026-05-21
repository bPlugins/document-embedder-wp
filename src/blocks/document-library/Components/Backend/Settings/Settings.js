import React from "react";
import { InspectorControls } from "@wordpress/block-editor";

const Settings = () => {
  return (
    <>
      <InspectorControls>
        <div className="bBlocksInspectorInfo">
          Need more block like this? Checkout the bundle ➡{" "}
          <a
            href="https://wordpress.org/plugins/b-blocks"
            target="_blank"
            rel="noopener noreferrer"
          >
            B Blocks
          </a>
        </div>
      </InspectorControls>
    </>
  );
};
export default Settings;
