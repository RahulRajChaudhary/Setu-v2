export type DataFreshness = "delayed" | "partial" | "unknown";

const FRESHNESS_COPY: Record<DataFreshness, { label: string; title: string }> = {
  delayed: { label: "Delayed", title: "Live refresh failed — showing last known value, retrying" },
  partial: { label: "Partial", title: "Only part of this value's population could be refreshed" },
  unknown: { label: "Unknown", title: "Freshness of this value could not be determined" },
};

export default function StaleIndicator({ lastGoodAt, state = "delayed" }: { lastGoodAt: Date; state?: DataFreshness }) {
  const seconds = Math.max(0, Math.round((Date.now() - lastGoodAt.getTime()) / 1000));
  const copy = FRESHNESS_COPY[state];
  return (
    <span
      title={`${copy.title} — last known value from ${seconds}s ago`}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[0.625rem] font-medium text-[var(--status-warning-fg)]"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M5 2V5.3L7 6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
      </svg>
      {copy.label} &middot; retrying
    </span>
  );
}
