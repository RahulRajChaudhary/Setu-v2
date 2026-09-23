"use client";

import { useState } from "react";
import { HorizontalBarChart } from "./BarChart";
import DonutChart from "./DonutChart";

export type ToggleChartDatum = { label: string; value: number; color?: string };

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export default function ToggleChart({
  data,
  suffix = "",
  max,
  defaultType = "bar",
}: {
  data: ToggleChartDatum[];
  suffix?: string;
  max?: number;
  defaultType?: "bar" | "pie";
}) {
  const [type, setType] = useState<"bar" | "pie">(defaultType);

  const coloredData = data.map((d, i) => ({ ...d, color: d.color ?? PALETTE[i % PALETTE.length] }));

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <div className="flex items-center justify-end gap-1">
        <ToggleButton active={type === "bar"} onClick={() => setType("bar")} label="Show as bar chart">
          <BarIcon />
        </ToggleButton>
        <ToggleButton active={type === "pie"} onClick={() => setType("pie")} label="Show as pie chart">
          <PieIcon />
        </ToggleButton>
      </div>
      {type === "bar" ? (
        <HorizontalBarChart data={coloredData} max={max} suffix={suffix} />
      ) : (
        <DonutChart data={coloredData} />
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`tap-pop flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-[var(--icon-btn-navy)] text-white"
          : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
      }`}
    >
      {children}
    </button>
  );
}

function BarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="9" width="3" height="5" rx="0.5" fill="currentColor" />
      <rect x="6.5" y="5" width="3" height="9" rx="0.5" fill="currentColor" />
      <rect x="11" y="2" width="3" height="12" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function PieIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5v6.5h6.5A6.5 6.5 0 0 0 8 1.5Z" fill="currentColor" />
      <path d="M8 2v6H2A6 6 0 0 1 8 2Z" fill="currentColor" opacity="0.5" />
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
