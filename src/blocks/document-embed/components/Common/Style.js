import React from "react";

const Style = ({ attributes = {}, id = "", uniqueId = "" }) => {
  const {
    displayDimensions = {},
    lightbox = {},
    toolbar = {},
  } = attributes;

  const { width = {}, height = {} } = displayDimensions;
  const {
    lightbox_btn_color = "#ffffff",
    lightbox_btn_background = "#333333",
  } = lightbox;
  const {
    theme = "dark",
    toolbar_bg_color = "#343434",
    toolbar_text_color = "#ffffff",
  } = toolbar;

  const parseDim = (prop, defaultVal, type = "desktop") => {
    if (typeof prop === "object" && prop !== null) {
      if (prop[type] !== undefined && prop[type] !== "") {
        const val = prop[type];
        if (typeof val === "string" && /[a-zA-Z%]/.test(val)) {
          return val;
        }
        return val + (prop.unit || "px");
      }
      return defaultVal;
    }
    const val = prop !== undefined && prop !== "" ? prop : defaultVal;
    return isNaN(val) ? val : val + "px";
  };

  // Extract dimensions
  const w_d = parseDim(width, "100%", "desktop");
  const w_t = parseDim(width, w_d, "tablet");
  const w_m = parseDim(width, w_t, "mobile");

  const h_d = parseDim(height, "840px", "desktop");
  const h_t = parseDim(height, h_d, "tablet");
  const h_m = parseDim(height, h_t, "mobile");

  const selectorClass = uniqueId || id;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .ppv_container.${selectorClass}:not([data-lightbox="1"]) {
            width: ${w_d} !important;
            height: ${h_d} !important;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          @media (max-width: 991px) {
            .ppv_container.${selectorClass}:not([data-lightbox="1"]) {
              width: ${w_t} !important;
              height: ${h_t} !important;
            }
          }

          @media (max-width: 767px) {
            .ppv_container.${selectorClass}:not([data-lightbox="1"]) {
              width: ${w_m} !important;
              height: ${h_m} !important;
            }
          }

          #ppv_frame_wrapper${id} .ppv-lightbox-btn {
            color: ${lightbox_btn_color} !important;
            background: ${lightbox_btn_background} !important;
          }

          ${theme === "custom" ? `
            .ppv_container.${selectorClass} .ppv-toolbar.custom {
              background: ${toolbar_bg_color} !important;
              border: 1px solid ${toolbar_bg_color} !important;
            }
            .ppv_container.${selectorClass} .ppv-toolbar.custom .ppv-filename {
              color: ${toolbar_text_color} !important;
            }
            .ppv_container.${selectorClass} .ppv-toolbar.custom .ppv_download_bttn {
              border: 1px solid ${toolbar_text_color} !important;
              color: ${toolbar_text_color} !important;
            }
            .ppv_container.${selectorClass} .ppv-toolbar.custom .ppv_download_bttn:hover {
              opacity: 0.8 !important;
            }
          ` : ""}
        `,
      }}
    />
  );
};

export default Style;
