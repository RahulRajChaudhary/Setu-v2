export type DonutSlice = { label: string; value: number; color: string };

type DonutChartProps = {
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  legend?: boolean;
  variant?: "gradient" | "ring";
};

export default function DonutChart({
  data,
  size = 148,
  centerLabel = "total",
  legend = true,
  variant = "gradient",
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const twoCol = data.length > 4;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-[var(--space-lg)] py-1">
      {variant === "ring" ? (
        <DonutRing data={data} size={size} centerLabel={centerLabel} total={total} />
      ) : (
        <DonutGradient data={data} size={size} centerLabel={centerLabel} total={total} />
      )}
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

function CenterLabel({ total, centerLabel }: { total: number; centerLabel: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="text-lg font-bold leading-none text-[var(--text-heading)]">{total}</span>
      <span className="mt-0.5 text-[0.625rem] text-[var(--text-muted)]">{centerLabel}</span>
    </div>
  );
}

function DonutGradient({ data, size, centerLabel, total }: { data: DonutSlice[]; size: number; centerLabel: string; total: number }) {
  const stops = data.reduce<{ cumulative: number; parts: string[] }>(
    (acc, d) => {
      const start = (acc.cumulative / total) * 360;
      const cumulative = acc.cumulative + d.value;
      const end = (cumulative / total) * 360;
      return { cumulative, parts: [...acc.parts, `${d.color} ${start}deg ${end}deg`] };
    },
    { cumulative: 0, parts: [] },
  ).parts;

  return (
    <div
      className="relative aspect-square shrink-0 rounded-full"
      style={{
        width: `${size / 16}rem`,
        height: `${size / 16}rem`,
        background: `conic-gradient(${stops.join(", ")})`,
      }}
    >
      <div className="absolute flex flex-col items-center justify-center rounded-full bg-white text-center" style={{ inset: "19%" }}>
        <span className="text-lg font-bold leading-none text-[var(--text-heading)]">{total}</span>
        <span className="mt-0.5 text-[0.625rem] text-[var(--text-muted)]">{centerLabel}</span>
      </div>
    </div>
  );
}

function DonutRing({ data, size, centerLabel, total }: { data: DonutSlice[]; size: number; centerLabel: string; total: number }) {
  const strokeWidth = size * 0.16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapPx = 6;

  const segments = data.reduce<{ cumulative: number; rows: (DonutSlice & { dash: number; offset: number })[] }>(
    (acc, d) => {
      const fraction = d.value / total;
      const dash = Math.max(fraction * circumference - gapPx, 0);
      const offset = -((acc.cumulative / total) * circumference);
      return { cumulative: acc.cumulative + d.value, rows: [...acc.rows, { ...d, dash, offset }] };
    },
    { cumulative: 0, rows: [] },
  ).rows;

  return (
    <div className="relative shrink-0" style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={s.offset}
          />
        ))}
      </svg>
      <CenterLabel total={total} centerLabel={centerLabel} />
    </div>
  );
}
