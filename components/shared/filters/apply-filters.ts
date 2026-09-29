import type { FilterColumnConfig, FilterState, FilterValue } from "./types";

export function isFilterActive(filter: FilterValue | undefined): boolean {
  if (!filter) return false;
  switch (filter.type) {
    case "text":
      return filter.value.trim().length > 0;
    case "select":
      return filter.value.trim().length > 0;
    case "multiSelect":
      return filter.value.length > 0;
    case "dateRange":
      return Boolean(filter.value.from || filter.value.to);
    default:
      return false;
  }
}

function matches(raw: string | number | Date | null | undefined, filter: FilterValue): boolean {
  if (raw === null || raw === undefined) return false;

  switch (filter.type) {
    case "text": {
      const needle = filter.value.trim().toLowerCase();
      if (!needle) return true;
      return String(raw).toLowerCase().includes(needle);
    }
    case "select": {
      if (!filter.value) return true;
      return String(raw) === filter.value;
    }
    case "multiSelect": {
      if (filter.value.length === 0) return true;
      return filter.value.includes(String(raw));
    }
    case "dateRange": {
      const { from, to } = filter.value;
      if (!from && !to) return true;
      const rawDate = raw instanceof Date ? raw : new Date(raw);
      if (Number.isNaN(rawDate.getTime())) return false;
      if (from && rawDate < new Date(from)) return false;
      if (to && rawDate > new Date(to)) return false;
      return true;
    }
    default:
      return true;
  }
}

/** Filters `rows` against every active entry in `state`, matched via each column's accessor. */
export function applyFilters<T>(
  rows: T[],
  configs: Partial<Record<string, FilterColumnConfig<T>>>,
  state: FilterState,
): T[] {
  const activeEntries = Object.entries(state).filter(([, filter]) => isFilterActive(filter));
  if (activeEntries.length === 0) return rows;

  return rows.filter((row) =>
    activeEntries.every(([columnId, filter]) => {
      const config = configs[columnId];
      if (!config || !filter) return true;
      return matches(config.accessor(row), filter);
    }),
  );
}
