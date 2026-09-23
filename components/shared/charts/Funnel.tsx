export type FunnelStage = { label: string; value: number; color: string };

export default function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="flex flex-col gap-2">
      {stages.map((stage) => {
        const pct = Math.max(12, (stage.value / max) * 100);
        return (
          <div key={stage.label} className="flex items-center gap-[var(--space-sm)]">
            <span className="w-24 shrink-0 truncate text-xs text-[var(--role-text)]">{stage.label}</span>
            <div className="flex h-7 flex-1 items-center rounded-md bg-[var(--search-bg)]">
              <div
                className="flex h-full items-center rounded-md px-2 text-xs font-semibold text-white"
                style={{ width: `${pct}%`, backgroundColor: stage.color }}
              >
                {stage.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
