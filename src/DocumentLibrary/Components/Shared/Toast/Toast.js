import React, { useEffect } from "react";
import "./Toast.scss";

const Toast = ({ show, onClose, text = "Successfully Updated!" }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`upgrade-toast ${show ? "show" : ""}`}>
      <div className="upgrade-toast__icon-wrapper">
        <div className="upgrade-toast__icon">✓</div>
        <span className="upgrade-toast__spark upgrade-toast__spark--one"></span>
        <span className="upgrade-toast__spark upgrade-toast__spark--two"></span>
      </div>

      <div className="upgrade-toast__text">{text}</div>
    </div>
  );
};

export default Toast;
