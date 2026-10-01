"use client";

import type { StatusLevel } from "./StatusBadge";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type Tab = {
  id: string;
  label: string;
  /** Optional attention count shown beside the label (e.g. open incidents). */
  badge?: { count: number; tone: StatusLevel };
};

const BADGE_TONE: Record<StatusLevel, string> = {
  healthy: "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]",
  warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
  critical: "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]",
  info: "bg-[var(--status-info-bg)] text-[var(--status-info-fg)]",
  neutral: "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]",
};

export default function TabBar({
  tabs,
  paramName = "tab",
}: {
  tabs: Tab[];
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get(paramName) ?? tabs[0]?.id;

  function selectTab(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-1 border-b border-[var(--divider)]" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => selectTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "text-[var(--icon-btn-navy)]"
                : "text-[var(--role-text)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
            {tab.badge && tab.badge.count > 0 && (
              <span
                className={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold ${BADGE_TONE[tab.badge.tone]}`}
                aria-label={`${tab.badge.count} need attention`}
              >
                {tab.badge.count}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--icon-btn-navy)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function useActiveTab(tabs: Tab[], paramName = "tab"): string {
  const searchParams = useSearchParams();
  return searchParams.get(paramName) ?? tabs[0]?.id;
}
