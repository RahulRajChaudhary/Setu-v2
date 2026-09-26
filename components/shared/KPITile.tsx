import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import StaleIndicator from "./StaleIndicator";
import type { StatusLevel } from "./StatusBadge";

const DOT: Record<StatusLevel, string> = {
  healthy: "bg-[var(--status-healthy-fg)]",
  warning: "bg-[var(--status-warning-fg)]",
  critical: "bg-[var(--status-critical-fg)]",
  info: "bg-[var(--status-info-fg)]",
  neutral: "bg-[var(--status-neutral-fg)]",
};

const VALUE_COLOR: Record<StatusLevel, string> = {
  healthy: "var(--status-healthy-fg)",
  warning: "var(--status-warning-fg)",
  critical: "var(--status-critical-fg)",
  info: "var(--status-info-fg)",
  neutral: "var(--text-heading)",
};

const TREND_COLOR: Record<TrendDirection, string> = {
  up: "var(--trend-up-fg)",
  down: "var(--trend-down-fg)",
};

// Top accent bar color per status — sweeps in on hover so a card silently
// signals its severity even before you read the number.
const ACCENT_COLOR: Record<StatusLevel, string> = {
  healthy: "var(--status-healthy-fg)",
  warning: "var(--status-warning-fg)",
  critical: "var(--status-critical-fg)",
  info: "var(--status-info-fg)",
  neutral: "var(--status-neutral-fg)",
};

export type TrendDirection = "up" | "down";

function IconChip({ icon, bg, fg }: { icon: ReactNode; bg: string; fg: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]"
      style={{ background: bg, color: fg }}
    >
      {icon}
    </span>
  );
}

function TrendChip({ direction, value }: { direction: TrendDirection; value: string }) {
  const isUp = direction === "up";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        isUp ? "bg-[var(--trend-up-bg)] text-[var(--trend-up-fg)]" : "bg-[var(--trend-down-bg)] text-[var(--trend-down-fg)]"
      }`}
    >
      <ArrowUp size={11} className={isUp ? "" : "rotate-180"} />
      {value}
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
  iconBg,
  iconFg,
}: {
  title: string;
  value: ReactNode;
  note?: string;
  status: StatusLevel;
  secondary?: { label: string; value: ReactNode; color: string }[];
  drillHref?: string;
  drillLabel?: string;
  updatedAt: Date;
  stale?: boolean;
  trend?: ReactNode;
  trendDirection?: TrendDirection;
  trendValue?: string;
  icon?: ReactNode;
  iconBg?: string;
  iconFg?: string;
}) {
  const className = `card-interactive tap-pop group relative flex h-full min-w-0 flex-col justify-between gap-2 overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--surface)] p-[calc(var(--card-pad)+0.25rem)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
    drillHref ? "cursor-pointer" : ""
  }`;
  const style = {
    boxShadow: "var(--card-shadow)",
    "--tw-ring-color": ACCENT_COLOR[status],
  } as React.CSSProperties;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: ACCENT_COLOR[status] }}
      />

      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1 flex items-center gap-2.5">
          {icon ? (
            <IconChip icon={icon} bg={iconBg ?? "var(--icon-chip-bg)"} fg={iconFg ?? "var(--icon-chip-fg)"} />
          ) : (
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[status]}`} />
          )}
          <p className="truncate text-[0.9375rem] font-semibold leading-tight text-[var(--text-muted)]">{title}</p>
        </div>
        {stale ? (
          <StaleIndicator lastGoodAt={updatedAt} />
        ) : (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-[var(--search-bg)] px-2 py-0.5 text-[0.6875rem] font-medium leading-none text-[var(--text-muted)]">
            {formatRelative(updatedAt)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-end justify-between gap-2">
          <span
            className="text-[length:var(--font-value-lg)] font-bold leading-none tracking-tight tabular-nums"
            style={{ color: trendDirection ? TREND_COLOR[trendDirection] : VALUE_COLOR[status] }}
          >
            {value}
          </span>
          {trend ?? (trendDirection && trendValue ? <TrendChip direction={trendDirection} value={trendValue} /> : null)}
        </div>
        {note && <p className="truncate text-sm text-[var(--text-muted)]">{note}</p>}
      </div>

      {secondary && secondary.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {secondary.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="font-semibold" style={{ color: s.color }}>{s.value}</span>
              {s.label}
            </span>
          ))}
        </div>
      )}
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
