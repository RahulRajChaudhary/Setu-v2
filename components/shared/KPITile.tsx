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
  healthy: "var(--kpi-good)",
  warning: "var(--kpi-warn)",
  critical: "var(--kpi-bad)",
  info: "var(--text-heading)",
  neutral: "var(--text-heading)",
};

// The hover accent bar uses the same color as the value/status, so the sweep that
// animates in on hover matches the data inside the card.
const ACCENT_COLOR = VALUE_COLOR;

export type TrendDirection = "up" | "down";

function IconChip({ icon, bg, fg }: { icon: ReactNode; bg: string; fg: string }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg [&>svg]:h-[55%] [&>svg]:w-[55%]"
      style={{
        background: bg,
        color: fg,
        width: "clamp(2rem, 11cqi, 2.5rem)",
        height: "clamp(2rem, 11cqi, 2.5rem)",
      }}
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
  const className = `card-interactive tap-pop group relative flex h-full min-w-0 flex-col gap-[clamp(0.375rem,2.2cqi,0.625rem)] overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--surface)] p-[clamp(0.75rem,4cqi,1.125rem)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
    drillHref ? "cursor-pointer" : ""
  }`;
  const style = {
    boxShadow: "var(--card-shadow)",
    containerType: "inline-size",
    "--tw-ring-color": ACCENT_COLOR[status],
  } as React.CSSProperties;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: ACCENT_COLOR[status] }}
      />

      {/* Row 1 — title first (fills the row, wraps to max 2 lines), icon aligned right */}
      <div className="flex items-start justify-between gap-[clamp(0.5rem,3cqi,0.75rem)]">
        <p
          title={title}
          className="min-w-0 flex-1 font-semibold leading-tight text-[var(--text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden"
          style={{ fontSize: "clamp(0.875rem, 5cqi, 1.0625rem)" }}
        >
          {title}
        </p>
        {icon ? (
          <IconChip icon={icon} bg={iconBg ?? "var(--icon-chip-bg)"} fg={iconFg ?? "var(--icon-chip-fg)"} />
        ) : (
          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${DOT[status]}`} />
        )}
      </div>

      {/* Row 2 — value (semantic color) with the trend chip tucked right beside it.
          flex-1 + items-center vertically centers the value in the space between
          the title and the bottom row (top-to-bottom), while staying left-aligned. */}
      <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className="font-bold leading-none tracking-tight tabular-nums"
          style={{ color: VALUE_COLOR[status], fontSize: "clamp(1.625rem, 12cqi, 2.5rem)" }}
        >
          {value}
        </span>
        {trend ?? (trendDirection && trendValue ? <TrendChip direction={trendDirection} value={trendValue} /> : null)}
      </div>

      {/* Row 3 — supporting note/secondary on the left, timestamp on the SAME line
          aligned to it (items-end). Pinned to the card bottom (mt-auto) so this row
          lines up across every card; cards are compact so the gap above stays small. */}
      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0 flex-1">
          {note && (
            <p className="text-[clamp(0.75rem,4cqi,0.875rem)] leading-snug text-[var(--text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
              {note}
            </p>
          )}
          {secondary && secondary.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {secondary.map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 text-[clamp(0.75rem,4cqi,0.875rem)] text-[var(--text-muted)]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold" style={{ color: s.color }}>{s.value}</span>
                  {s.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {stale ? (
          <StaleIndicator lastGoodAt={updatedAt} />
        ) : (
          <span className="shrink-0 whitespace-nowrap text-[clamp(0.625rem,3.2cqi,0.6875rem)] font-medium leading-none text-[var(--text-muted)]">
            {formatRelative(updatedAt)}
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
