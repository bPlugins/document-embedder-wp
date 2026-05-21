import React from "react";
import "./FieldHeader.scss";
import { CrownIcon } from "../../../Utils/icons";

const FieldHeader = ({ title, icon, isPremium = false, isFull = false }) => {
  return (
    <>
      <style>
        {!isFull &&
          `
          .bplvf-container {
            justify-content: unset;
            gap: 20px;
          }
          `}
      </style>
      {!isPremium ? (
        <div className="bplvf-container">
          <div className="bplvf-header">
            <span className="bplvf-header-icon">{icon}</span>
            <h3 className="bplvf-field-title">{title}</h3>
          </div>
          <div className="bplvf-pro-badge">
            <span className="bplvf-pro-icon">
              <CrownIcon />
            </span>
            <span className="bplvf-pro-text">PRO</span>
          </div>
        </div>
      ) : (
        <>
          <div className="bplvf-header">
            <span className="bplvf-header-icon">{icon}</span>
            <h3 className="bplvf-field-title">{title}</h3>
          </div>
        </>
      )}
    </>
  );
};

export default FieldHeader;
