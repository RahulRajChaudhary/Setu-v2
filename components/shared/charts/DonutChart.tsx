export type DonutSlice = { label: string; value: number; color: string };

export default function DonutChart({
  data,
  size = 148,
  centerLabel = "total",
  legend = true,
}: {
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  legend?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const stops = data.reduce<{ cumulative: number; parts: string[] }>(
    (acc, d) => {
      const start = (acc.cumulative / total) * 360;
      const cumulative = acc.cumulative + d.value;
      const end = (cumulative / total) * 360;
      return { cumulative, parts: [...acc.parts, `${d.color} ${start}deg ${end}deg`] };
    },
    { cumulative: 0, parts: [] },
  ).parts;
  const twoCol = data.length > 4;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-[var(--space-lg)] py-1">
      <div
        className="relative aspect-square shrink-0 rounded-full"
        style={{
          width: `${size / 16}rem`,
          height: `${size / 16}rem`,
          background: `conic-gradient(${stops.join(", ")})`,
        }}
      >
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-white text-center"
          style={{ inset: "19%" }}
        >
          <span className="text-lg font-bold leading-none text-[var(--text-heading)]">{total}</span>
          <span className="mt-0.5 text-[0.625rem] text-[var(--text-muted)]">{centerLabel}</span>
        </div>
      </div>
      {legend && (
        <ul className={`grid gap-x-4 gap-y-1.5 ${twoCol ? "grid-cols-2" : "grid-cols-1"}`}>
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-2 text-xs text-[var(--role-text)]">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.label}</span>
              <span className="font-semibold text-[var(--text-secondary)]">{d.value}</span>
              <span className="text-[0.625rem] text-[var(--text-muted)]">({Math.round((d.value / total) * 100)}%)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
