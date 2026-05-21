import React from "react";
import { ContainerIcon } from "../../../Utils/icons";

const ContentHeader = ({ title = "Settings Header" }) => {
  return (
    <div className="settings-heading">
      <span>
        <ContainerIcon />
      </span>
      <h2>{title}</h2>
    </div>
  );
};

export default ContentHeader;
