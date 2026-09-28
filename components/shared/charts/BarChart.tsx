"use client";

import { Bar, BarChart as RBarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type BarDatum = { label: string; value: number; color?: string };

function HorizontalBarTooltip({
  active,
  payload,
  suffix,
}: {
  active?: boolean;
  payload?: { payload: BarDatum }[];
  suffix: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-heading)]">{d.label}</p>
      <p className="text-[var(--text-muted)]">
        {d.value}
        {suffix}
      </p>
    </div>
  );
}

export function HorizontalBarChart({
  data,
  max = 100,
  suffix = "%",
}: {
  data: BarDatum[];
  max?: number;
  suffix?: string;
}) {
  const rowHeight = 32;
  return (
    <div style={{ height: data.length * rowHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide domain={[0, max]} />
          <YAxis
            type="category"
            dataKey="label"
            width={104}
            tick={{ fontSize: 11, fill: "var(--role-text)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<HorizontalBarTooltip suffix={suffix} />} cursor={{ fill: "var(--search-bg)" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.color ?? "var(--chart-1)"} />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
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
          <span className="text-[0.6875rem] font-semibold text-[var(--text-secondary)]">
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
          <span className="max-w-[3.5rem] truncate text-[0.625rem] text-[var(--role-text)]" title={d.label}>
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
            <Bar2 value={d.before} max={max} color="var(--chart-4)" label="Before" />
            <Bar2 value={d.after} max={max} color="var(--chart-2)" label="After" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar2({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[0.625rem] text-[var(--role-text)]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--search-bg)]">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 shrink-0 text-right text-[0.625rem] font-semibold text-[var(--text-secondary)]">
        {value}%
      </span>
    </div>
  );
}
