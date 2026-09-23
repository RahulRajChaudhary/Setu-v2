export default function StaleIndicator({ lastGoodAt }: { lastGoodAt: Date }) {
  const seconds = Math.max(0, Math.round((Date.now() - lastGoodAt.getTime()) / 1000));
  return (
    <span
      title={`Live refresh failed — showing last known value from ${seconds}s ago, retrying`}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--status-warning-fg)]"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M5 2V5.3L7 6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
      </svg>
      Stale &middot; retrying
    </span>
  );
}
