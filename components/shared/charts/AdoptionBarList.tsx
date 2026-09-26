export type AdoptionDatum = { label: string; value: number; health?: "healthy" | "warning" | "critical" };

const TIER = [
  { min: 70, fg: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)" },
  { min: 40, fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)" },
  { min: 0, fg: "var(--status-critical-fg)", bg: "var(--status-critical-bg)" },
];

function tierFor(value: number) {
  return TIER.find((t) => value >= t.min)!;
}

const HEALTH_DOT: Record<string, string> = {
  healthy: "var(--status-healthy-fg)",
  warning: "var(--status-warning-fg)",
  critical: "var(--status-critical-fg)",
};

export default function AdoptionBarList({ data, average }: { data: AdoptionDatum[]; average?: number }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      {average !== undefined && (
        <p className="flex items-center gap-1.5 text-[0.6875rem] text-[var(--text-muted)]">
          <span className="inline-block h-2 w-2 rounded-full border border-dashed border-[var(--text-muted)]" />
          Fleet average is {average}% — deltas below are vs. this line
        </p>
      )}
      <div className="flex flex-wrap gap-[var(--space-sm)]">
        {sorted.map((d) => {
          const tier = tierFor(d.value);
          const delta = average !== undefined ? Math.round(d.value - average) : undefined;
          return (
            <div
              key={d.label}
              className="card-interactive flex min-w-0 grow basis-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--divider)] bg-[var(--surface)] p-3 screen-sm:basis-[calc((100%-var(--space-sm))/2)] screen-xl:basis-[calc((100%-(var(--space-sm)*2))/3)]"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5" title={d.label}>
                  {d.health && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: HEALTH_DOT[d.health] }} />}
                  <span className="truncate text-xs font-medium text-[var(--text-secondary)]">{d.label}</span>
                </span>
                {delta !== undefined && (
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold"
                    style={{
                      background: delta >= 0 ? "var(--trend-up-bg)" : "var(--trend-down-bg)",
                      color: delta >= 0 ? "var(--trend-up-fg)" : "var(--trend-down-fg)",
                    }}
                  >
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}pt
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="text-xl font-bold leading-none" style={{ color: tier.fg }}>
                  {d.value}%
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, d.value)}%`, backgroundColor: tier.fg }}
                />
                {average !== undefined && (
                  <div
                    className="absolute top-0 h-full w-px border-l border-dashed border-[var(--text-muted)]"
                    style={{ left: `${average}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
