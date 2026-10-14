import { useState } from "react";
import { __ } from "@wordpress/i18n";
import { shiftDay } from "../api";

const PRESETS = () => [
  { value: "today", label: __("Today", "document-emberdder") },
  { value: "7", label: __("7 days", "document-emberdder") },
  { value: "30", label: __("30 days", "document-emberdder") },
  { value: "90", label: __("90 days", "document-emberdder") },
  { value: "custom", label: __("Custom", "document-emberdder") },
];

const RangePicker = ({ range, today, onChange }) => {
  const [from, setFrom] = useState(range.from || shiftDay(today, -29));
  const [to, setTo] = useState(range.to || today);

  return (
    <div className="bplde-ins-range">
      <div className="bplde-ins-seg" role="group" aria-label={__("Date range", "document-emberdder")}>
        {PRESETS().map((preset) => (
          <button
            key={preset.value}
            type="button"
            aria-pressed={range.range === preset.value}
            className={range.range === preset.value ? "is-active" : ""}
            onClick={() => onChange(preset.value === "custom" ? { range: "custom", from, to } : { range: preset.value })}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {range.range === "custom" && (
        <form
          className="bplde-ins-custom"
          onSubmit={(event) => {
            event.preventDefault();
            onChange({ range: "custom", from: from <= to ? from : to, to: from <= to ? to : from });
          }}
        >
          <input
            type="date"
            className="bplde-ins-input"
            value={from}
            max={today}
            onChange={(e) => setFrom(e.target.value)}
            aria-label={__("From", "document-emberdder")}
          />
          <span aria-hidden="true">–</span>
          <input type="date" className="bplde-ins-input" value={to} max={today} onChange={(e) => setTo(e.target.value)} aria-label={__("To", "document-emberdder")} />
          <button type="submit" className="bplde-ins-btn">
            {__("Apply", "document-emberdder")}
          </button>
        </form>
      )}
    </div>
  );
};

export default RangePicker;
