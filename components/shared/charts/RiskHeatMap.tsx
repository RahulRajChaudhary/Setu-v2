export type RiskPoint = { id: string; label: string; likelihood: number; impact: number };

const BAND = [
  { min: 16, word: "Critical", bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
  { min: 9, word: "High", bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  { min: 4, word: "Medium", bg: "#FEF9E7", fg: "#92650A" },
  { min: 0, word: "Low", bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
];

function bandFor(score: number) {
  return BAND.find((b) => score >= b.min)!;
}

export default function RiskHeatMap({ risks }: { risks: RiskPoint[] }) {
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="flex gap-2">
        <div className="flex shrink-0 flex-col items-center justify-between py-1">
          <span
            className="whitespace-nowrap text-[11px] font-semibold text-[var(--role-text)]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Impact (severity if it happens)
          </span>
        </div>

        <div className="flex w-full max-w-md flex-col gap-1">
          <div className="flex gap-1.5">
            <div className="flex flex-col justify-between gap-1.5 pb-5">
              {rows.map((impact) => (
                <span key={impact} className="flex h-12 w-4 items-center justify-center text-[10px] font-medium text-[var(--text-muted)]">
                  {impact}
                </span>
              ))}
            </div>
            <div className="grid flex-1 grid-cols-5 gap-1.5">
              {rows.map((impact) =>
                cols.map((likelihood) => {
                  const cellRisks = risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
                  const band = bandFor(likelihood * impact);
                  return (
                    <div
                      key={`${likelihood}-${impact}`}
                      className="card-interactive relative flex h-12 w-12 items-center justify-center rounded-md transition-transform"
                      style={{ background: band.bg }}
                      title={cellRisks.map((r) => r.label).join(", ") || "No risks logged"}
                    >
                      {cellRisks.length > 0 && (
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm"
                          style={{ color: band.fg }}
                        >
                          {cellRisks.length}
                        </span>
                      )}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
          <div className="flex justify-between pl-[calc(1rem+0.375rem)] text-[10px] font-medium text-[var(--text-muted)]">
            {cols.map((c) => (
              <span key={c} className="flex-1 text-center">{c}</span>
            ))}
          </div>
          <p className="pl-[calc(1rem+0.375rem)] text-center text-[11px] font-semibold text-[var(--role-text)]">
            Likelihood (chance it happens) &rarr;
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--divider)] pt-2.5">
        <span className="text-[11px] font-medium text-[var(--text-muted)]">Score = likelihood &times; impact</span>
        {BAND.map((b) => (
          <span key={b.word} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: b.bg, boxShadow: `inset 0 0 0 1px ${b.fg}33` }} />
            {b.word}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[var(--divider)] pt-2.5">
        {risks.map((r) => {
          const band = bandFor(r.likelihood * r.impact);
          return (
            <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-[var(--text-secondary)]">{r.label}</span>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: band.bg, color: band.fg }}>
                {band.word} &middot; {r.likelihood * r.impact}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
