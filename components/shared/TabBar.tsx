"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type Tab = { id: string; label: string };

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
