import { Fragment } from "react";

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

export default function RiskHeatMap({
  risks,
  showList = true,
  rankDots = false,
}: {
  risks: RiskPoint[];
  /** Repeat the risk names + scores under the map (turn off when a ranked list sits beside it). */
  showList?: boolean;
  /** Label each dot with the risk's position in `risks` (1-based) instead of a count, so it ties to a ranked list. */
  rankDots?: boolean;
}) {
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="flex gap-2">
        <div className="flex shrink-0 flex-col items-center justify-center">
          <span
            className="whitespace-nowrap text-[0.6875rem] font-semibold text-[var(--role-text)]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Impact (severity if it happens)
          </span>
        </div>

        <div className="grid w-full max-w-[28rem] grid-cols-[1rem_repeat(5,minmax(0,1fr))] gap-1.5">
          {rows.map((impact) => (
            <Fragment key={impact}>
              <span className="flex items-center justify-center text-[0.625rem] font-medium text-[var(--text-muted)]">
                {impact}
              </span>
              {cols.map((likelihood) => {
                const cellRisks = risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
                const band = bandFor(likelihood * impact);
                return (
                  <div
                    key={`${likelihood}-${impact}`}
                    className="card-interactive relative flex aspect-[4/3] max-h-[3.25rem] w-full items-center justify-center rounded-md transition-transform"
                    style={{ background: band.bg }}
                    title={cellRisks.map((r) => r.label).join(", ") || "No risks logged"}
                  >
                    {cellRisks.length > 0 && (
                      <span
                        className="flex h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-white text-[0.625rem] font-bold shadow-sm"
                        style={{ color: band.fg }}
                      >
                        {rankDots ? cellRisks.map((r) => risks.indexOf(r) + 1).join(",") : cellRisks.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
          <span />
          {cols.map((c) => (
            <span key={c} className="text-center text-[0.625rem] font-medium text-[var(--text-muted)]">{c}</span>
          ))}
          <span />
          <p className="col-span-5 text-center text-[0.6875rem] font-semibold text-[var(--role-text)]">
            Likelihood (chance it happens) &rarr;
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--divider)] pt-2.5">
        <span className="text-[0.6875rem] font-medium text-[var(--text-muted)]">Score = likelihood &times; impact</span>
        {BAND.map((b) => (
          <span key={b.word} className="flex items-center gap-1.5 text-[0.6875rem] text-[var(--text-secondary)]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: b.bg, boxShadow: `inset 0 0 0 1px ${b.fg}33` }} />
            {b.word}
          </span>
        ))}
      </div>

      {showList && (
      <div className="flex flex-col gap-1.5 border-t border-[var(--divider)] pt-2.5">
        {risks.map((r) => {
          const band = bandFor(r.likelihood * r.impact);
          return (
            <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-[var(--text-secondary)]">{r.label}</span>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold" style={{ background: band.bg, color: band.fg }}>
                {band.word} &middot; {r.likelihood * r.impact}
              </span>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
