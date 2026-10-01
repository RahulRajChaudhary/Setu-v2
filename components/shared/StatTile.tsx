import Link from "next/link";
import type { ReactNode } from "react";
import type { StatusLevel } from "./StatusBadge";

const TONE: Record<StatusLevel, { bg: string; fg: string }> = {
  healthy: { bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
  info: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
  neutral: { bg: "var(--status-neutral-bg)", fg: "var(--status-neutral-fg)" },
};

export default function StatTile({
  label,
  value,
  tone = "neutral",
  icon,
  note,
  href,
}: {
  label: string;
  value: ReactNode;
  tone?: StatusLevel;
  icon?: ReactNode;
  /** One-line context under the number — a bare number is never enough (spec §15). */
  note?: string;
  /** Drill-through to the record set behind the number — no dead-end tiles. */
  href?: string;
}) {
  const t = TONE[tone];
  const className =
    "card-interactive flex flex-col gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-[var(--space-sm)]";
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[length:var(--font-body)] font-medium text-[var(--text-muted)]">{label}</p>
        {icon && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5"
            style={{ background: t.bg, color: t.fg }}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-[length:var(--font-value-md)] font-bold leading-none text-[var(--text-heading)]">{value}</p>
      {note && <p className="truncate text-xs text-[var(--text-muted)]">{note}</p>}
    </>
  );
  return href ? (
    <Link href={href} className={`${className} hover:border-[var(--icon-btn-navy)]`} style={{ boxShadow: "var(--card-shadow)" }}>
      {body}
    </Link>
  ) : (
    <div className={className} style={{ boxShadow: "var(--card-shadow)" }}>
      {body}
    </div>
  );
}
