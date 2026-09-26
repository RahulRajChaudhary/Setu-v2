export type UsageDatum = { label: string; value: number };

const BAND = [
  { min: 90, word: "At limit", fg: "var(--status-critical-fg)", bg: "var(--status-critical-bg)" },
  { min: 70, word: "Near limit", fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)" },
  { min: 0, word: "Healthy", fg: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)" },
];

function bandFor(value: number) {
  return BAND.find((b) => value >= b.min)!;
}

export default function UsageAllowanceBar({ data, warnAt = 80 }: { data: UsageDatum[]; warnAt?: number }) {
  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="flex items-center gap-[var(--space-md)] text-[0.6875rem] text-[var(--text-muted)]">
        <Legend color="var(--status-healthy-fg)" label="Healthy (<70%)" />
        <Legend color="var(--status-warning-fg)" label="Near limit (70–89%)" />
        <Legend color="var(--status-critical-fg)" label="At limit (90%+)" />
      </div>
      <div className="flex flex-col gap-[var(--space-sm)]">
        {data.map((d) => {
          const band = bandFor(d.value);
          return (
            <div key={d.label} className="flex items-center gap-[var(--space-sm)]">
              <span className="w-32 shrink-0 truncate text-xs text-[var(--text-muted)]" title={d.label}>
                {d.label}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, d.value)}%`, backgroundColor: band.fg }}
                />
                <div
                  className="absolute top-0 h-full w-px bg-[var(--text-muted)]/40"
                  style={{ left: `${warnAt}%` }}
                  title={`Plan warning threshold: ${warnAt}%`}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold text-[var(--text-heading)]">{d.value}%</span>
              <span
                className="w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[0.625rem] font-semibold"
                style={{ background: band.bg, color: band.fg }}
              >
                {band.word}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
