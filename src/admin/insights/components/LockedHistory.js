import { useMemo } from "react";
import { __, _n, sprintf } from "@wordpress/i18n";
import { Lock } from "lucide-react";
import { W, H, PAD, Legend } from "./Chart";
import { SERIES, dayLabel, num, shiftDay } from "../api";

const RANGE = 30;

/**
 * The Pro chart's own geometry and series styles, drawn with an example shape. A free build
 * is sent no figure for any past day, so the y axis keeps skeleton blocks instead of numbers
 * and only the plotted lines are blurred: the date axis below is real and stays sharp.
 */
const Silhouette = ({ today }) => {
  const model = useMemo(() => {
    const iw = W - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    const x = (i) => PAD.left + (iw * i) / (RANGE - 1);
    const y = (t) => PAD.top + ih - ih * t;

    // A weekday rhythm under a broad mid-period lift, smooth enough to read as an example.
    const wave = (i) => Math.max(0.08, Math.min(0.9, 0.42 + 0.22 * Math.sin((i / (RANGE - 1)) * Math.PI * 1.3) + 0.1 * Math.sin((i / 7) * Math.PI * 2)));
    const shapes = { views: (i) => wave(i), downloads: (i) => wave(i) * 0.26, leads: (i) => wave(i) * 0.05 };
    const lines = Object.keys(shapes).reduce((out, key) => {
      out[key] = Array.from({ length: RANGE }, (_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(shapes[key](i)).toFixed(1)}`).join(" ");
      return out;
    }, {});
    const ticks = [0, 6, 12, 18, 24, RANGE - 1].map((i) => ({ i, label: dayLabel(shiftDay(today, i - (RANGE - 1)), { day: "numeric", month: "short" }) }));

    return { x, y, lines, ticks };
  }, [today]);

  return (
    <svg className="bplde-ins-skeleton" viewBox={`0 0 ${W} ${H}`} role="presentation" aria-hidden="true">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line className={t === 0 ? "bplde-ins-chart__base" : "bplde-ins-chart__grid"} x1={PAD.left} x2={W - PAD.right} y1={model.y(t)} y2={model.y(t)} />
          <rect className="bplde-ins-skeleton__mark" x={PAD.left - 34} y={model.y(t) - 5} width="24" height="9" />
        </g>
      ))}
      <defs>
        <linearGradient id="bplde-ins-locked-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SERIES.views.color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={SERIES.views.color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g className="bplde-ins-skeleton__ink">
        <path d={`${model.lines.views} L${model.x(RANGE - 1).toFixed(1)},${model.y(0)} L${model.x(0).toFixed(1)},${model.y(0)} Z`} fill="url(#bplde-ins-locked-fill)" />
        {["downloads", "leads"].map((key) => (
          <path
            key={key}
            d={model.lines[key]}
            fill="none"
            stroke={SERIES[key].color}
            strokeWidth="1.5"
            strokeDasharray={SERIES[key].dashed ? "6 4" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        <path d={model.lines.views} fill="none" stroke={SERIES.views.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </g>
      {model.ticks.map((t) => (
        <text key={t.i} className="bplde-ins-chart__axis" x={model.x(t.i)} y={H - 10} textAnchor="middle">
          {t.label}
        </text>
      ))}
    </svg>
  );
};

const LockedHistory = ({ recorded = {}, today, pricingUrl }) => {
  const days = Math.max(0, Number(recorded.days || 0));

  const headline =
    days > 0
      ? sprintf(
          /* translators: %s: number of days. */
          _n("Your last %s day is already recorded.", "Your last %s days are already recorded.", days, "document-emberdder"),
          num(days)
        )
      : __("Your history starts building today.", "document-emberdder");

  const body =
    days > 0
      ? sprintf(
          /* translators: %s: date counting started. */
          __("Document Embedder has been counting since %s. Today's figures are shown above; Pro reads back every day before today, straight from your own database.", "document-emberdder"),
          dayLabel(recorded.firstDay)
        )
      : __("Every day from now on is recorded. Today's figures are shown above; Pro reads back every day before today.", "document-emberdder");

  return (
    <section className="bplde-ins-card bplde-ins-locked">
      <div className="bplde-ins-card__head">
        <h2 className="bplde-ins-card__title">{__("History", "document-emberdder")}</h2>
        <Legend>
          <span className="bplde-ins-example">{__("Layout example", "document-emberdder")}</span>
        </Legend>
      </div>

      <div className="bplde-ins-locked__stage">
        <Silhouette today={today} />

        <div className="bplde-ins-locked__glass">
          <div className="bplde-ins-locked__card">
            <p className="bplde-ins-locked__eyebrow">
              <Lock size={13} aria-hidden="true" />
              {days > 0 ? __("Recorded, readable in Pro", "document-emberdder") : __("Recording now", "document-emberdder")}
            </p>
            <h3>{headline}</h3>
            <p className="bplde-ins-locked__body">{body}</p>
            <a className="bplde-ins-btn bplde-ins-btn--primary" href={pricingUrl}>
              {days > 0
                ? sprintf(
                    /* translators: %s: number of days. */
                    _n("Unlock my %s day", "Unlock my %s days", days, "document-emberdder"),
                    num(days)
                  )
                : __("See Pro pricing", "document-emberdder")}
            </a>
            <p className="bplde-ins-locked__micro">{__("No figures for past days are sent to the free version, so nothing behind this panel is real or made up.", "document-emberdder")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LockedHistory;
