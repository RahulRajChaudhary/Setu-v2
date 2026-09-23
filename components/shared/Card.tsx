import type { ReactNode } from "react";

export default function Card({
  title,
  description,
  action,
  children,
  className,
  interactive,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <section
      className={`rounded-[var(--card-radius)] border border-[var(--card-border)] bg-white p-[var(--card-pad)] ${
        interactive ? "card-interactive" : ""
      } ${className ?? ""}`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {(title || action) && (
        <div className="mb-[var(--space-sm)] flex items-start justify-between gap-2">
          <div>
            {title && <h2 className="text-[length:var(--font-card-title)] font-semibold text-[var(--text-heading)]">{title}</h2>}
            {description && <p className="mt-1 text-[length:var(--font-body)] text-[var(--text-muted)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
