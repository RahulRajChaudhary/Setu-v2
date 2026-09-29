"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { FilterCategory, FilterOption } from "./types";

// Two-pane filter menu — categories on the left, that category's checkbox
// options (with search) on the right. Used by <TableFilterMenu>.

interface ListingFiltersProps {
  categories: FilterCategory[];
  defaultValues?: Record<string, string[]>;
  defaultCategoryId?: string;
  /** Fires immediately on every checkbox toggle, so the underlying list
   *  filters live instead of waiting for "Apply" — the button below is just
   *  for closing the menu once you're done. */
  onChange?: (selections: Record<string, string[]>) => void;
  onApply: (selections: Record<string, string[]>) => void;
}

// How many options show before the list is collapsed behind "Show more" —
// only while browsing; an active search always shows every match.
const COLLAPSED_OPTION_COUNT = 3;

export function ListingFilters({ categories, defaultValues = {}, defaultCategoryId, onChange, onApply }: ListingFiltersProps) {
  // No fallback to categories[0] here on purpose: opening the menu should
  // show only the categories pane first — the options pane opens once the
  // user actually clicks a category, not both at once. This holds even for
  // a single-category trigger (the common per-column case): filter icon ->
  // "Filter" pane listing the one category -> click it -> options pane.
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(defaultCategoryId ?? null);
  const [selections, setSelections] = useState<Record<string, string[]>>(defaultValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllOptions, setShowAllOptions] = useState(false);

  function handleCategoryChange(id: string) {
    setActiveCategoryId(id);
    setSearchQuery("");
    setShowAllOptions(false);
  }

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  const isSearching = searchQuery.trim().length > 0;

  const filteredOptions = useMemo(() => {
    if (!activeCategory) return [];
    if (!isSearching) return activeCategory.options;
    const query = searchQuery.toLowerCase();
    return activeCategory.options.filter((option) => option.label.toLowerCase().includes(query));
  }, [activeCategory, isSearching, searchQuery]);

  // An active search always shows every match; otherwise collapse to the
  // first few until "Show more" is clicked.
  const visibleOptions =
    isSearching || showAllOptions || filteredOptions.length <= COLLAPSED_OPTION_COUNT
      ? filteredOptions
      : filteredOptions.slice(0, COLLAPSED_OPTION_COUNT);
  const hiddenCount = filteredOptions.length - visibleOptions.length;

  function handleToggleOption(option: FilterOption) {
    if (!activeCategory) return;
    const categoryId = activeCategory.id;
    const isMultiSelect = activeCategory.isMultiSelect ?? true;
    const current = selections[categoryId] ?? [];

    const nextForCategory = isMultiSelect
      ? current.includes(option.value)
        ? current.filter((value) => value !== option.value)
        : [...current, option.value]
      : current.includes(option.value)
        ? []
        : [option.value];

    const next = { ...selections, [categoryId]: nextForCategory };
    setSelections(next);
    onChange?.(next);
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex max-w-[calc(100vw-1rem)] flex-col items-stretch gap-2 screen-sm:max-w-none screen-sm:flex-row screen-sm:items-start">
      <div
        className="flex max-h-52 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--divider)] bg-[var(--surface)] py-3 screen-sm:max-h-none screen-sm:w-52"
        style={{ boxShadow: "var(--card-shadow-hover)" }}
      >
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Filter
        </p>
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            const count = selections[category.id]?.length ?? 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--search-bg)] font-medium text-[var(--text-heading)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {category.label}
                  {count > 0 && (
                    <span className="rounded-full bg-[var(--status-info-bg)] px-1.5 py-0.5 text-[0.625rem] font-semibold text-[var(--status-info-fg)]">
                      {count}
                    </span>
                  )}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[var(--text-secondary)]">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {activeCategory && (
        <div
          className="relative flex max-h-[20rem] w-full shrink-0 flex-col rounded-2xl border border-[var(--divider)] bg-[var(--surface)] screen-sm:max-h-none screen-sm:min-h-[20rem] screen-sm:w-80"
          style={{ boxShadow: "var(--card-shadow-hover)" }}
        >
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            aria-label="Close options"
            className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-5 pb-3 pt-4">
            <h3 className="pr-8 text-xs font-semibold uppercase tracking-widest text-[var(--role-text)]">
              {activeCategory.label}
            </h3>
          </div>

          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--search-placeholder)]" />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${activeCategory.label}...`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] py-2 pl-8 pr-3 text-sm text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] focus:border-[var(--icon-btn-navy)] focus:bg-[var(--surface)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-1">
            {filteredOptions.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {visibleOptions.map((option) => {
                  const isSelected = (selections[activeCategory.id] ?? []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => handleToggleOption(option)}
                      className="group flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left hover:bg-[var(--search-bg)]"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                          isSelected
                            ? "border-[var(--icon-btn-navy)] bg-[var(--icon-btn-navy)] text-white"
                            : "border-[var(--divider)] bg-[var(--surface)] group-hover:border-[var(--text-muted)]"
                        }`}
                      >
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="select-none text-sm text-[var(--text-secondary)]">{option.label}</span>
                    </button>
                  );
                })}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllOptions(true)}
                    className="px-1.5 py-2 text-left text-sm font-medium text-[var(--icon-btn-navy)] hover:underline"
                  >
                    Show {hiddenCount} more
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
                No options found for &quot;{searchQuery}&quot;.
              </p>
            )}
          </div>

          <div className="mt-auto p-4">
            <button
              type="button"
              onClick={() => onApply(selections)}
              className="tap-pop w-full rounded-lg bg-[var(--accent-solid)] py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
