import React from "react";
import "./Footer.scss";
import { FacebookIcon, LinkedInIcon, YoutubeIcon } from "../../Utils/icons";

const Footer = () => {
  return (
    <div className="vfd-footer">
      <div>
        ©
        <strong>
          <a href="https://bplugins.com/" target="_blank" rel="noreferrer" > bPlugins</a>
        </strong>
        . All rights reserved.
      </div>

      <div className="vfd-social-icons">
        <a
          rel="noreferrer"
          href="https://www.facebook.com/bPluginsLLC/"
          target="_blank"
          title="Facebook"
        >
          <FacebookIcon />
        </a>
        <a
          rel="noreferrer"
          href="https://www.linkedin.com/company/bplugins/"
          target="_blank"
          title="LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <a
          rel="noreferrer"
          href="https://www.youtube.com/@bplugins"
          target="_blank"
          title="Twitter"
        >
          <YoutubeIcon />
        </a>
      </div>
    </div>
  );
};

export default Footer;
