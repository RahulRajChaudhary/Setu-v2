import type { RolloutStatus } from "@/lib/mock-data/engineering-releases";

export type RolloutDatum = {
  label: string;
  percent: number;
  status: RolloutStatus;
  markerPercent?: number;
};

const STATUS_STYLE: Record<RolloutStatus, { fg: string; bg: string; word: string }> = {
  active: { fg: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)", word: "Active" },
  paused: { fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)", word: "Paused" },
  "rolled-back": { fg: "var(--status-critical-fg)", bg: "var(--status-critical-bg)", word: "Rolled back" },
  complete: { fg: "var(--status-info-fg)", bg: "var(--status-info-bg)", word: "Complete" },
};

export default function RolloutProgressBar({ data }: { data: RolloutDatum[] }) {
  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      {data.map((d) => {
        const style = STATUS_STYLE[d.status];
        return (
          <div key={d.label} className="flex items-center gap-[var(--space-sm)]">
            <span className="w-40 shrink-0 truncate text-xs text-[var(--text-muted)]" title={d.label}>
              {d.label}
            </span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, d.percent)}%`, backgroundColor: style.fg }}
              />
              {d.markerPercent !== undefined && (
                <div
                  className="absolute top-0 h-full w-px bg-[var(--text-muted)]/60"
                  style={{ left: `${d.markerPercent}%` }}
                  title={`Pause/rollback point: ${d.markerPercent}%`}
                />
              )}
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-semibold text-[var(--text-heading)]">{d.percent}%</span>
            <span
              className="w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-[0.625rem] font-semibold"
              style={{ background: style.bg, color: style.fg }}
            >
              {style.word}
            </span>
          </div>
        );
      })}
    </div>
  );
}
