export default function Gauge({
  value,
  max = 100,
  label,
  status = "healthy",
}: {
  value: number;
  max?: number;
  label?: string;
  status?: "healthy" | "warning" | "critical";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    status === "critical"
      ? "var(--status-critical-fg)"
      : status === "warning"
        ? "var(--status-warning-fg)"
        : "var(--status-healthy-fg)";
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-[var(--role-text)]">{label}</span>}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--search-bg)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[0.6875rem] font-semibold text-[var(--text-secondary)]">
        {value}
        {max === 100 ? "%" : ` / ${max}`}
      </span>
    </div>
  );
}
