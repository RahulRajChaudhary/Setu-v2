import type { ReactNode } from "react";
import Link from "next/link";
import StaleIndicator from "./StaleIndicator";
import type { StatusLevel } from "./StatusBadge";

const DOT: Record<StatusLevel, string> = {
  healthy: "bg-[var(--status-healthy-fg)]",
  warning: "bg-[var(--status-warning-fg)]",
  critical: "bg-[var(--status-critical-fg)]",
  info: "bg-[var(--status-info-fg)]",
  neutral: "bg-[var(--status-neutral-fg)]",
};

export type TrendDirection = "up" | "down";

function TrendChip({ direction, value }: { direction: TrendDirection; value: string }) {
  const isUp = direction === "up";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
        isUp ? "bg-[var(--trend-up-bg)] text-[var(--trend-up-fg)]" : "bg-[var(--trend-down-bg)] text-[var(--trend-down-fg)]"
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={isUp ? "" : "rotate-180"}>
        <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {value}
    </span>
  );
}

function IconChip({ icon }: { icon: ReactNode }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]"
      style={{ background: "var(--icon-chip-bg)", color: "var(--icon-chip-fg)" }}
    >
      {icon}
    </span>
  );
}

export default function KPITile({
  title,
  value,
  note,
  status,
  secondary,
  drillHref,
  drillLabel,
  updatedAt,
  stale,
  trend,
  trendDirection,
  trendValue,
  icon,
}: {
  title: string;
  value: ReactNode;
  note?: string;
  status: StatusLevel;
  secondary?: { label: string; value: ReactNode }[];
  drillHref?: string;
  drillLabel?: string;
  updatedAt: Date;
  stale?: boolean;
  trend?: ReactNode;
  trendDirection?: TrendDirection;
  trendValue?: string;
  icon?: ReactNode;
}) {
  const className = `card-interactive tap-pop group relative flex flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-white p-[var(--card-pad)] ${
    drillHref ? "cursor-pointer" : ""
  }`;
  const style = { boxShadow: "var(--card-shadow)" } as const;

  const content = (
    <>
      <div className="flex items-center gap-2.5">
        {icon ? <IconChip icon={icon} /> : <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[status]}`} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[length:var(--font-body)] leading-tight text-[var(--text-muted)]">{title}</p>
        </div>
        {stale && <StaleIndicator lastGoodAt={updatedAt} />}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="text-[length:var(--font-value-lg)] font-bold leading-none tracking-tight text-[var(--text-heading)]">{value}</span>
        {trend ?? (trendDirection && trendValue ? <TrendChip direction={trendDirection} value={trendValue} /> : null)}
      </div>
      {note && <p className="truncate text-[11px] text-[var(--text-muted)]">{note}</p>}

      {secondary && secondary.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[var(--divider)] pt-1.5">
          {secondary.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-1">
              <dt className="truncate text-[10px] text-[var(--text-muted)]">{s.label}</dt>
              <dd className="text-[11px] font-semibold text-[var(--text-heading)]">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-[var(--text-muted)]">Updated {formatRelative(updatedAt)}</span>
        {drillHref && (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </>
  );

  if (drillHref) {
    return (
      <Link href={drillHref} aria-label={drillLabel ?? `${title} — view detail`} className={className} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

function formatRelative(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}
