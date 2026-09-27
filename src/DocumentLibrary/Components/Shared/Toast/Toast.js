import React, { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import "./Toast.scss";

/*
 * Save confirmation, drawn in the editor's Deep Teal & Lime: a square card with
 * a lime check, a teal edge, and a bar that drains over the time it stays up.
 * Hovering holds it open, so it is never gone before it can be read.
 *
 * The live region is always mounted and only its content changes, which is what
 * makes screen readers announce it.
 */
const DURATION = 3000;

const Toast = ({
  show,
  onClose,
  title = "Library saved",
  text = "Your changes to this library have been saved.",
}) => {
  const [paused, setPaused] = useState(false);

  // The parent passes a fresh arrow on every render; reading it through a ref
  // keeps the timer from restarting each time the editor re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!show || paused) return;
    const timer = setTimeout(() => onCloseRef.current(), DURATION);
    return () => clearTimeout(timer);
  }, [show, paused]);

  useEffect(() => {
    if (!show) setPaused(false);
  }, [show]);

  return (
    <div
      className={`bplde-toast${show ? " is-visible" : ""}${paused ? " is-paused" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ "--bplde-toast-duration": `${DURATION}ms` }}
    >
      {show && (
        <>
          <span className="bplde-toast__icon" aria-hidden="true">
            <Check size={16} strokeWidth={3} />
          </span>

          <div className="bplde-toast__body">
            <p className="bplde-toast__title">{title}</p>
            {text && <p className="bplde-toast__text">{text}</p>}
          </div>

          <button
            type="button"
            className="bplde-toast__close"
            onClick={() => onCloseRef.current()}
            aria-label="Dismiss"
          >
            <X size={15} strokeWidth={2.2} />
          </button>

          <span className="bplde-toast__timer" aria-hidden="true" />
        </>
      )}
    </div>
  );
};

export default Toast;
