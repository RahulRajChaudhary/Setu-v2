"use client";

import { useMemo, useRef, useState } from "react";

export type TrendSeries = { key: string; label: string; color: string; data: number[] };

const W = 640;
const H = 220;
const PAD_LEFT = 30;
const PAD_BOTTOM = 22;
const PAD_TOP = 10;
const PAD_RIGHT = 10;

// Picks a whole-number tick step (never a fraction — these are integer counts)
// so evenly spaced ticks never round to the same displayed value.
function niceIntegerStep(roughStep: number) {
  const s = Math.max(1, roughStep);
  const magnitude = Math.pow(10, Math.floor(Math.log10(s)));
  const candidates = [1, 2, 5, 10].map((m) => m * magnitude);
  const step = candidates.find((c) => c >= s) ?? candidates[candidates.length - 1] * 10;
  return Math.max(1, Math.round(step));
}

export default function AreaTrendChart({
  series,
  xLabels,
}: {
  series: TrendSeries[];
  xLabels: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const n = xLabels.length;
  const tickCount = 4;
  const yStep = useMemo(
    () => niceIntegerStep(Math.max(...series.flatMap((s) => s.data), 1) / tickCount),
    [series],
  );
  const maxY = yStep * tickCount;
  const yTicks = useMemo(
    () => Array.from({ length: tickCount + 1 }, (_, i) => yStep * i),
    [yStep],
  );

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;

  const scaleX = (i: number) => PAD_LEFT + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const scaleY = (v: number) => PAD_TOP + plotH - (v / (maxY || 1)) * plotH;

  const paths = series.map((s) => {
    const line = s.data.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
    const area = `${line} L${scaleX(n - 1)},${PAD_TOP + plotH} L${scaleX(0)},${PAD_TOP + plotH} Z`;
    return { ...s, line, area };
  });

  // Show roughly 6 x-axis labels: first, last, and evenly spaced in between.
  const xTickIndexes = useMemo(() => {
    const count = Math.min(6, n);
    if (count <= 1) return [0];
    return Array.from({ length: count }, (_, i) => Math.round((i / (count - 1)) * (n - 1)));
  }, [n]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = (e.clientX - rect.left) / rect.width;
    const clamped = Math.min(1, Math.max(0, fraction));
    const idx = Math.round(clamped * (n - 1));
    setHoverIndex(idx);
  }

  const hoverLeftPct = hoverIndex !== null ? (scaleX(hoverIndex) / W) * 100 : null;
  const tooltipAlignRight = hoverLeftPct !== null && hoverLeftPct > 50;

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <div
        ref={containerRef}
        className="relative"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Trend chart">
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT}
                y1={scaleY(t)}
                y2={scaleY(t)}
                stroke="var(--divider)"
                strokeWidth={1}
              />
              <text x={PAD_LEFT - 6} y={scaleY(t) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">
                {t}
              </text>
            </g>
          ))}

          {xTickIndexes.map((i) => (
            <text
              key={i}
              x={scaleX(i)}
              y={H - 4}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              fontSize="9"
              fill="var(--text-muted)"
            >
              {xLabels[i]}
            </text>
          ))}

          {paths.map((p) => (
            <path key={`${p.key}-area`} d={p.area} fill={p.color} opacity={0.1} stroke="none" />
          ))}
          {paths.map((p) => (
            <path key={`${p.key}-line`} d={p.line} fill="none" stroke={p.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {paths.map((p) => {
            const lastVal = p.data[p.data.length - 1];
            return (
              <g key={`${p.key}-end`}>
                <circle cx={scaleX(n - 1)} cy={scaleY(lastVal)} r={4} fill={p.color} stroke="white" strokeWidth={2} />
                <text x={scaleX(n - 1) - 8} y={scaleY(lastVal) - 8} textAnchor="end" fontSize="10" fontWeight={600} fill="var(--text-secondary)">
                  {lastVal}
                </text>
              </g>
            );
          })}

          {hoverIndex !== null && (
            <>
              <line
                x1={scaleX(hoverIndex)}
                x2={scaleX(hoverIndex)}
                y1={PAD_TOP}
                y2={PAD_TOP + plotH}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeOpacity={0.4}
              />
              {paths.map((p) => (
                <circle
                  key={`${p.key}-hover`}
                  cx={scaleX(hoverIndex)}
                  cy={scaleY(p.data[hoverIndex])}
                  r={4}
                  fill={p.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </>
          )}
        </svg>

        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 flex min-w-[128px] flex-col gap-1 rounded-lg border border-[var(--divider)] bg-white p-2 text-xs shadow-lg"
            style={{
              left: tooltipAlignRight ? undefined : `${hoverLeftPct}%`,
              right: tooltipAlignRight ? `${100 - (hoverLeftPct ?? 0)}%` : undefined,
              transform: tooltipAlignRight ? "translateX(-8px)" : "translateX(8px)",
            }}
          >
            <span className="font-semibold text-[var(--text-heading)]">{xLabels[hoverIndex]}</span>
            {series.map((s) => (
              <span key={s.key} className="flex items-center justify-between gap-3 text-[var(--role-text)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-[2px] w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold text-[var(--text-secondary)]">{s.data[hoverIndex]}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-[var(--role-text)]">
            <span className="h-[2px] w-3 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
