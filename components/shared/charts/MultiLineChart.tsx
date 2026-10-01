"use client";

import { useState } from "react";

export type Line = { label: string; color: string; series: { x: number; y: number }[]; dashed?: boolean };

const PAD = { l: 36, r: 22, t: 8, b: 20 };

// Multi-series line chart with a shared crosshair + tooltip. One y-axis only.
export default function MultiLineChart({
  lines,
  thresholdY,
  thresholdLabel,
  unit = "",
  xLabel = (x: number) => `${x}:00`,
  width: W = 960,
  height: H = 170,
  zeroBased = true,
}: {
  lines: Line[];
  thresholdY?: number;
  thresholdLabel?: string;
  unit?: string;
  xLabel?: (x: number) => string;
  width?: number;
  height?: number;
  /** false = scale the y-axis to the data range (for trends that never approach 0). */
  zeroBased?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const xs = lines[0].series.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const all = lines.flatMap((l) => l.series.map((p) => p.y)).concat(thresholdY !== undefined ? [thresholdY] : []);
  const dataMax = Math.max(...all);
  const dataMin = Math.min(...all);
  const span = dataMax - dataMin || dataMax || 1;
  const minY = zeroBased ? 0 : dataMin - span * 0.2;
  const maxY = zeroBased ? dataMax * 1.1 || 1 : dataMax + span * 0.2;
  const sx = (x: number) => PAD.l + ((x - minX) / (maxX - minX || 1)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => PAD.t + (1 - (y - minY) / (maxY - minY)) * (H - PAD.t - PAD.b);
  const ticks = [minY, (minY + maxY) / 2, maxY].map((t) => Math.round(t));
  const hx = hover !== null ? xs[hover] : null;

  return (
    <div>
      {lines.length > 1 && (
      <ul className="mb-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
        {lines.map((l) => (
          <li key={l.label} className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: l.color }} />
            {l.label}
          </li>
        ))}
      </ul>
      )}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label="Latency over the last 24 hours"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * W;
            const i = Math.round(((x - PAD.l) / (W - PAD.l - PAD.r)) * (xs.length - 1));
            setHover(Math.max(0, Math.min(xs.length - 1, i)));
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="var(--divider)" strokeWidth={1} />
              <text x={PAD.l - 4} y={sy(t) + 3} textAnchor="end" fontSize={W < 600 ? 14 : 11} fill="var(--text-muted)">
                {t}
              </text>
            </g>
          ))}
          {[minX, Math.round((minX + maxX) / 2), maxX].map((x) => (
            <text key={x} x={x === maxX ? sx(x) + 10 : x === minX ? sx(x) - 8 : sx(x)} y={H - 4} textAnchor={x === maxX ? "end" : x === minX ? "start" : "middle"} fontSize={W < 600 ? 14 : 11} fill="var(--text-muted)">
              {xLabel(x)}
            </text>
          ))}
          {thresholdY !== undefined && (
            <>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(thresholdY)} y2={sy(thresholdY)} stroke="var(--status-critical-fg)" strokeDasharray="4 3" />
              <text x={W - PAD.r} y={sy(thresholdY) - 3} textAnchor="end" fontSize={W < 600 ? 14 : 11} fill="var(--status-critical-fg)">
                {thresholdLabel}
              </text>
            </>
          )}
          {lines.map((l) => (
            <path
              key={l.label}
              d={l.series.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ")}
              fill="none"
              stroke={l.color}
              strokeWidth={2}
              strokeDasharray={l.dashed ? "5 3" : undefined}
              strokeLinejoin="round"
            />
          ))}
          {hx !== null && (
            <>
              <line x1={sx(hx)} x2={sx(hx)} y1={PAD.t} y2={H - PAD.b} stroke="var(--text-muted)" strokeWidth={1} />
              {lines.map((l) => (
                <circle key={l.label} cx={sx(hx)} cy={sy(l.series[hover!].y)} r={3.5} fill={l.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </>
          )}
        </svg>
        {hx !== null && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: `${(sx(hx) / W) * 100}%`, transform: hx > (minX + maxX) / 2 ? "translateX(-105%)" : "translateX(8px)" }}
          >
            <p className="mb-1 font-semibold text-[var(--text-heading)]">{xLabel(hx)}</p>
            {lines.map((l) => (
              <p key={l.label} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}: <span className="font-semibold text-[var(--text-heading)]">{l.series[hover!].y}{unit}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
