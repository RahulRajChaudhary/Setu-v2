import type { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-[var(--space-sm)] rounded-xl border border-dashed border-[var(--card-border)] bg-white px-6 py-16 text-center">
      {icon ?? <DefaultIcon />}
      <div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-[var(--role-text)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="28" height="22" rx="2" stroke="#D1D5DB" strokeWidth="1.6" />
      <path d="M6 16H34" stroke="#D1D5DB" strokeWidth="1.6" />
      <path d="M14 24H26" stroke="#D1D5DB" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
