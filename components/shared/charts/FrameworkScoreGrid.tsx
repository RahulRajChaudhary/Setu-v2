import { ShieldCheck } from "lucide-react";

export type FrameworkScore = { label: string; value: number; color?: string };

const BAND = [
  { min: 90, word: "Effective", bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  { min: 75, word: "Needs attention", bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  { min: 0, word: "At risk", bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
];

function bandFor(value: number) {
  return BAND.find((b) => value >= b.min)!;
}

export default function FrameworkScoreGrid({
  data,
  columns = 1,
  size = "md",
}: {
  data: FrameworkScore[];
  columns?: 1 | 3;
  size?: "md" | "lg";
}) {
  const big = size === "lg";
  return (
    <div className={`grid grid-cols-1 gap-[var(--space-md)] ${columns === 3 ? "screen-sm:grid-cols-3" : ""}`}>
      {data.map((d) => {
        const band = bandFor(d.value);
        return (
          <div
            key={d.label}
            className={`card-interactive flex flex-col gap-3 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white ${big ? "p-5" : "p-4"}`}
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex shrink-0 items-center justify-center rounded-lg ${big ? "h-10 w-10" : "h-7 w-7"}`}
                  style={{ background: band.bg, color: band.fg }}
                >
                  <ShieldCheck size={big ? 20 : 16} />
                </span>
                <span className={`font-semibold text-[var(--text-heading)] ${big ? "text-base" : "text-sm"}`}>{d.label}</span>
              </div>
              <span
                className={`rounded-full font-semibold ${big ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[0.625rem]"}`}
                style={{ background: band.bg, color: band.fg }}
              >
                {band.word}
              </span>
            </div>
            <p className={`font-bold leading-none text-[var(--text-heading)] ${big ? "text-4xl" : "text-2xl"}`}>{d.value}%</p>
            <div className={`w-full overflow-hidden rounded-full bg-[var(--surface-muted)] ${big ? "h-2.5" : "h-2"}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${d.value}%`, backgroundColor: d.color ?? band.fg }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
