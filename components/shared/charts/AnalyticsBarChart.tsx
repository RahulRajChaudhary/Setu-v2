"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type BarSeries = { key: string; label: string; color: string };
export type BarGroupDatum = { label: string; values: Record<string, number>; colorOverrides?: Record<string, string> };

const PAD_LEFT = 32;
const PAD_BOTTOM = 24;
const PAD_TOP = 16;
const PAD_RIGHT = 12;
const TICK_COUNT = 4;

function niceStep(roughStep: number) {
  const s = Math.max(roughStep, 0.0001);
  const magnitude = Math.pow(10, Math.floor(Math.log10(s)));
  const candidates = [1, 2, 5, 10].map((m) => m * magnitude);
  return candidates.find((c) => c >= s) ?? candidates[candidates.length - 1] * 10;
}

export default function AnalyticsBarChart({
  data,
  series,
  valueSuffix = "%",
}: {
  data: BarGroupDatum[];
  series: BarSeries[];
  valueSuffix?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [size, setSize] = useState({ w: 480, h: 220 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = size.w;
  const H = size.h;
  const n = data.length;

  const rawMax = Math.max(...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)), 1);
  const step = useMemo(() => niceStep(rawMax / TICK_COUNT), [rawMax]);
  const maxY = step * TICK_COUNT;
  const yTicks = useMemo(() => Array.from({ length: TICK_COUNT + 1 }, (_, i) => step * i), [step]);

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const groupWidth = n > 0 ? plotW / n : plotW;
  const barWidth = Math.min(36, (groupWidth * 0.62) / series.length);
  const barGap = 6;

  const scaleY = (v: number) => PAD_TOP + plotH - (v / (maxY || 1)) * plotH;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = (e.clientX - rect.left - PAD_LEFT) / plotW;
    const idx = Math.min(n - 1, Math.max(0, Math.floor(fraction * n)));
    setHoverIndex(idx);
  }

  const hoverLeftPct = hoverIndex !== null ? ((PAD_LEFT + (hoverIndex + 0.5) * groupWidth) / W) * 100 : null;
  const tooltipAlignRight = hoverLeftPct !== null && hoverLeftPct > 55;

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      {series.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-[var(--role-text)]">
              <span className="h-[2px] w-3 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative h-[clamp(11rem,28vh,18rem)] w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart" className="block">
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={scaleY(t)} y2={scaleY(t)} stroke="var(--divider)" strokeWidth={1} />
              <text x={PAD_LEFT - 6} y={scaleY(t) + 3} textAnchor="end" style={{ fontSize: "0.625rem" }} fill="var(--text-muted)">
                {t}
                {valueSuffix}
              </text>
            </g>
          ))}

          {hoverIndex !== null && (
            <rect
              x={PAD_LEFT + hoverIndex * groupWidth}
              y={PAD_TOP}
              width={groupWidth}
              height={plotH}
              fill="var(--search-bg)"
            />
          )}

          {data.map((d, i) => {
            const clusterWidth = series.length * barWidth + (series.length - 1) * barGap;
            const groupX = PAD_LEFT + i * groupWidth + (groupWidth - clusterWidth) / 2;
            return (
              <g key={d.label}>
                {series.map((s, si) => {
                  const v = d.values[s.key] ?? 0;
                  const x = groupX + si * (barWidth + barGap);
                  const y = scaleY(v);
                  return (
                    <rect
                      key={s.key}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={PAD_TOP + plotH - y}
                      rx={4}
                      fill={d.colorOverrides?.[s.key] ?? s.color}
                      opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
                      className="transition-opacity duration-150"
                    />
                  );
                })}
                <text
                  x={groupX + clusterWidth / 2}
                  y={H - 6}
                  textAnchor="middle"
                  style={{ fontSize: "0.625rem" }}
                  fill="var(--text-muted)"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="pointer-events-none absolute top-1 z-10 flex min-w-[9rem] flex-col gap-1 rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2 text-xs shadow-lg"
            style={{
              left: tooltipAlignRight ? undefined : `${hoverLeftPct}%`,
              right: tooltipAlignRight ? `${100 - (hoverLeftPct ?? 0)}%` : undefined,
              transform: tooltipAlignRight ? "translateX(-8px)" : "translateX(8px)",
            }}
          >
            <span className="font-semibold text-[var(--text-heading)]">{data[hoverIndex].label}</span>
            {series.map((s) => (
              <span key={s.key} className="flex items-center justify-between gap-3 text-[var(--role-text)]">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: data[hoverIndex].colorOverrides?.[s.key] ?? s.color }}
                  />
                  {s.label}
                </span>
                <span className="font-semibold text-[var(--text-secondary)]">
                  {data[hoverIndex].values[s.key] ?? 0}
                  {valueSuffix}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
