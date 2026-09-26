"use client";

import { Search } from "lucide-react";

export type FilterOption = { value: string; label: string };

export default function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterOptions,
  activeFilter,
  onFilterChange,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
}) {
  if (!onSearchChange && !filterOptions) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <div className="relative min-w-[11.25rem] max-w-xs flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[var(--divider)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm text-[var(--text-heading)] outline-none transition-colors focus:border-[var(--icon-btn-navy)] placeholder:text-[var(--search-placeholder)]"
          />
        </div>
      )}
      {filterOptions && filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange?.(opt.value)}
                aria-pressed={isActive}
                className={`tap-pop rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent-solid)] text-white"
                    : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
