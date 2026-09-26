"use client";

import { useState } from "react";
import { BarChart3, PieChart } from "lucide-react";
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
          <BarChart3 size={14} />
        </ToggleButton>
        <ToggleButton active={type === "pie"} onClick={() => setType("pie")} label="Show as pie chart">
          <PieChart size={14} />
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
          ? "bg-[var(--accent-solid)] text-white"
          : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
      }`}
    >
      {children}
    </button>
  );
}
