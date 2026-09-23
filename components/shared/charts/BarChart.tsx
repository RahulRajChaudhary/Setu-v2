export type BarDatum = { label: string; value: number; color?: string };

export function HorizontalBarChart({
  data,
  max = 100,
  suffix = "%",
}: {
  data: BarDatum[];
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-32 shrink-0 truncate text-xs text-[var(--role-text)]">{d.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--search-bg)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (d.value / max) * 100)}%`,
                backgroundColor: d.color ?? "var(--chart-1)",
              }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-xs font-semibold text-[var(--text-secondary)]">
            {d.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export function VerticalBarChart({
  data,
  max,
  suffix = "%",
}: {
  data: BarDatum[];
  max?: number;
  suffix?: string;
}) {
  const computedMax = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-[var(--space-sm)]">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
            {d.value}
            {suffix}
          </span>
          <div className="flex h-28 w-full items-end overflow-hidden rounded-t-md bg-[var(--search-bg)]">
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${Math.min(100, (d.value / computedMax) * 100)}%`,
                backgroundColor: d.color ?? "var(--chart-1)",
              }}
            />
          </div>
          <span className="max-w-[56px] truncate text-[10px] text-[var(--role-text)]" title={d.label}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PairedBarChart({
  data,
}: {
  data: { label: string; before: number; after: number }[];
}) {
  const max = Math.max(...data.flatMap((d) => [d.before, d.after]), 1);
  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 truncate text-xs text-[var(--role-text)]">{d.label}</span>
          <div className="flex flex-1 flex-col gap-1">
            <Bar value={d.before} max={max} color="var(--chart-4)" label="Before" />
            <Bar value={d.after} max={max} color="var(--chart-2)" label="After" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[10px] text-[var(--role-text)]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--search-bg)]">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 shrink-0 text-right text-[10px] font-semibold text-[var(--text-secondary)]">
        {value}%
      </span>
    </div>
  );
}
