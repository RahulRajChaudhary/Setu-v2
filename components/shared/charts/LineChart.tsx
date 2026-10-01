export type SeriesPoint = { x: number; y: number };

export default function LineChart({
  series,
  width = 320,
  height = 96,
  color = "var(--chart-1)",
  thresholdY,
  thresholdLabel,
  fill = false,
  showEndDot = true,
}: {
  series: SeriesPoint[];
  width?: number;
  height?: number;
  color?: string;
  thresholdY?: number;
  thresholdLabel?: string;
  fill?: boolean;
  showEndDot?: boolean;
}) {
  const xs = series.map((p) => p.x);
  const ys = series.map((p) => p.y);
  const values = thresholdY !== undefined ? [...ys, thresholdY] : ys;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  // Pad by the data's own range (not a % of the value) so flat-ish series still
  // use the full height instead of hugging one edge.
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo || Math.abs(hi) || 1) * 0.15;
  const minY = lo - pad;
  const maxY = hi + pad;

  const scaleX = (x: number) => ((x - minX) / (maxX - minX || 1)) * (width - 8) + 4;
  const scaleY = (y: number) => height - 4 - ((y - minY) / (maxY - minY || 1)) * (height - 8);

  const path = series.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
  const areaPath = `${path} L${scaleX(series[series.length - 1].x)},${height} L${scaleX(series[0].x)},${height} Z`;
  const last = series[series.length - 1];

  return (
    <div className="relative">
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Trend line chart" className="block" style={{ height: `${height / 16}rem` }}>
      {thresholdY !== undefined && (
        <>
          <line
            x1={0}
            x2={width}
            y1={scaleY(thresholdY)}
            y2={scaleY(thresholdY)}
            stroke="var(--status-critical-fg)"
            strokeWidth={1}
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          {thresholdLabel && (
            <text x={width - 4} y={scaleY(thresholdY) - 4} textAnchor="end" fontSize="8" fill="var(--status-critical-fg)">
              {thresholdLabel}
            </text>
          )}
        </>
      )}
      {fill && <path d={areaPath} fill={color} opacity={0.12} stroke="none" />}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      
    </svg>
    {showEndDot && (
      <span
        aria-hidden="true"
        className="absolute h-[0.5rem] w-[0.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--surface)]"
        style={{ left: `${(scaleX(last.x) / width) * 100}%`, top: `${(scaleY(last.y) / height) * 100}%`, backgroundColor: color }}
      />
    )}
    </div>
  );
}
