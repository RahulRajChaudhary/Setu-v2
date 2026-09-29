"use client";

import { useMemo, useState } from "react";
import { applyFilters, isFilterActive } from "./apply-filters";
import type { FilterColumnConfig, FilterState, FilterValue } from "./types";

/**
 * Drives filtering for one listing/table. Pages (or DataTable itself) supply
 * row data and a config per filterable column; this returns the filtered
 * rows plus the setters that <FilterHeader>/<TableFilterMenu> need.
 */
export function useTableFilters<T>(
  rows: T[],
  configs: Partial<Record<string, FilterColumnConfig<T>>>,
) {
  const [filters, setFilters] = useState<FilterState>({});

  function setFilter(columnId: string, value: FilterValue | null) {
    setFilters((prev) => {
      if (value === null || !isFilterActive(value)) {
        if (!(columnId in prev)) return prev;
        const next = { ...prev };
        delete next[columnId];
        return next;
      }
      return { ...prev, [columnId]: value };
    });
  }

  function clearFilter(columnId: string) {
    setFilter(columnId, null);
  }

  function clearAllFilters() {
    setFilters({});
  }

  const filteredRows = useMemo(
    () => applyFilters(rows, configs, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `configs` is a fresh object literal per render; keying off `rows`/`filters` alone is intentional.
    [rows, filters],
  );

  const activeFilterCount = Object.keys(filters).length;

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filteredRows,
    activeFilterCount,
  };
}
