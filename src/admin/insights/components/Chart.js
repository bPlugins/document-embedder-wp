import { useEffect, useId, useMemo, useRef, useState } from "react";
import { __, sprintf } from "@wordpress/i18n";
import { SERIES, dayLabel, num } from "../api";

export const W = 900;
export const H = 260;
export const PAD = { top: 18, right: 58, bottom: 30, left: 48 };

const KEYS = Object.keys(SERIES);
// Views leads the chart with a filled area; the others are quieter supporting lines.
const PRIMARY = "views";
const SECONDARY = KEYS.filter((key) => key !== PRIMARY);

const niceCeiling = (max) => {
  if (max <= 5) return 5;
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const step = max / mag > 5 ? mag * 2 : max / mag > 2 ? mag : mag / 2;
  return Math.ceil(max / step) * step;
};

const LABEL_GAP = 14;

// One label per distinct end value, stacked upwards from the lowest so labels never
// overlap each other or the date axis.
const endLabels = (items) => {
  const unique = items.filter((item, i) => items.findIndex((other) => other.value === item.value) === i).sort((a, b) => b.y - a.y);
  return unique.map((item, i) => {
    if (i > 0 && unique[i - 1].y - item.y < LABEL_GAP) {
      item.y = unique[i - 1].y - LABEL_GAP;
    }
    return item;
  });
};

export const Legend = ({ children }) => (
  <span className="bplde-ins-legend">
    {children}
    {KEYS.map((key) => (
      <span key={key}>
        <i className={SERIES[key].dashed ? "is-dashed" : ""} style={{ "--swatch": SERIES[key].color }} />
        {SERIES[key].label()}
      </span>
    ))}
  </span>
);

const Chart = ({ points = [] }) => {
  const [hover, setHover] = useState(null);
  const fillId = `bplde-ins-fill-${useId().replace(/:/g, "")}`;
  const svgRef = useRef(null);
  const n = points.length;

  const model = useMemo(() => {
    const peak = points.reduce((m, p) => Math.max(m, ...KEYS.map((k) => p[k] || 0)), 0);
    const top = niceCeiling(peak || 5);
    const iw = W - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    const x = (i) => (n <= 1 ? PAD.left + iw / 2 : PAD.left + (iw * i) / (n - 1));
    const y = (v) => PAD.top + ih - (ih * v) / top;
    const line = (key) => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key] || 0).toFixed(1)}`).join(" ");
    const area = (key) => `${line(key)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
    const every = Math.max(1, Math.round(n / 6));
    const xLabels = points.map((p, i) => ({ i, p })).filter(({ i }) => i % every === 0 || i === n - 1);

    return { iw, ih, x, y, line, area, xLabels, ticks: [0, top / 4, top / 2, (top * 3) / 4, top] };
  }, [points, n]);

  // A shorter series after a range change would otherwise keep an out-of-range index.
  useEffect(() => setHover(null), [n]);

  if (!n) return null;

  const { iw, ih, x, y, line, area, xLabels, ticks } = model;
  const active = hover !== null && hover < n ? points[hover] : null;
  const tipLeft = active ? (x(hover) / W) * 100 : 0;

  const pick = (event) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((event.clientX - box.left) / box.width) * W;
    const i = n <= 1 ? 0 : Math.round(((px - PAD.left) / iw) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const last = points[n - 1];

  return (
    <div className="bplde-ins-chart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={sprintf(
          /* translators: 1: first day, 2: last day. */
          __("Daily views, downloads and leads from %1$s to %2$s.", "document-emberdder"),
          dayLabel(points[0].day),
          dayLabel(last.day)
        )}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[PRIMARY].color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={SERIES[PRIMARY].color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line className={t === 0 ? "bplde-ins-chart__base" : "bplde-ins-chart__grid"} x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="bplde-ins-chart__axis" x={PAD.left - 10} y={y(t) + 4} textAnchor="end">
              {num(Math.round(t))}
            </text>
          </g>
        ))}

        {xLabels.map(({ i, p }) => (
          <text key={p.day} className="bplde-ins-chart__axis" x={x(i)} y={H - 10} textAnchor="middle">
            {dayLabel(p.day, { day: "numeric", month: "short" })}
          </text>
        ))}

        <path d={area(PRIMARY)} fill={`url(#${fillId})`} />

        {SECONDARY.map((key) => (
          <path
            key={key}
            d={line(key)}
            fill="none"
            stroke={SERIES[key].color}
            strokeWidth="1.5"
            strokeDasharray={SERIES[key].dashed ? "6 4" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        <path d={line(PRIMARY)} fill="none" stroke={SERIES[PRIMARY].color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Endpoint markers with direct labels, so identity never rests on colour alone. */}
        {SECONDARY.map((key) => (
          <circle key={key} cx={x(n - 1)} cy={y(last[key] || 0)} r="3" fill={SERIES[key].color} stroke="#fff" strokeWidth="1.5" />
        ))}
        <circle cx={x(n - 1)} cy={y(last[PRIMARY] || 0)} r="5" fill={SERIES[PRIMARY].color} stroke="#fff" strokeWidth="2" />
        {endLabels(KEYS.map((key) => ({ key, value: last[key] || 0, y: y(last[key] || 0) }))).map((label) => (
          <text key={label.key} className="bplde-ins-chart__end" x={x(n - 1) + 10} y={label.y + 4}>
            {num(label.value)}
          </text>
        ))}

        {active && (
          <g>
            <line className="bplde-ins-chart__cross" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} />
            {KEYS.map((key) => (
              <circle key={key} cx={x(hover)} cy={y(active[key] || 0)} r="5" fill={SERIES[key].color} stroke="#fff" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>

      {active && (
        <div className={`bplde-ins-tip${tipLeft > 62 ? " is-flipped" : ""}`} style={{ left: `${tipLeft}%` }}>
          <span className="bplde-ins-tip__day">{dayLabel(active.day, { weekday: "short", day: "numeric", month: "short" })}</span>
          {KEYS.map((key) => (
            <span key={key} className="bplde-ins-tip__row">
              <em>
                <i style={{ background: SERIES[key].color }} />
                {SERIES[key].label()}
              </em>
              <b>{num(active[key])}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chart;
