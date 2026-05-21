import React from "react";
import "./Header.scss";
import { PluginIcon } from "../../Utils/icons";

const Header = ({ children, title = "Voice Feedback" }) => {
  return (
    <>
      <div className="vfd-header">
        <div className="vfd-header-name">
          <span>
            <PluginIcon />
          </span>
          <h1>{title}</h1>
        </div>

        {children}
      </div>
    </>
  );
};

export default Header;
