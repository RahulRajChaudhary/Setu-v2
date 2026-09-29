// Founder table filters — type contracts.
//
// A "filterable" listing provides a FilterColumnConfig per filterable column
// (how to read a comparable value off a row) and renders <FilterHeader> or
// <TableFilterMenu> in place of its plain header label. Everything else —
// hover behavior, the popover, per-type controls, state, and row matching —
// is handled here.

export type FilterType = "text" | "select" | "multiSelect" | "dateRange";

export interface FilterOption {
  label: string;
  value: string;
}

interface BaseColumnConfig<T> {
  /** Reads the comparable value for this column off a row. */
  accessor: (row: T) => string | number | Date | null | undefined;
}

export interface TextFilterColumnConfig<T> extends BaseColumnConfig<T> {
  type: "text";
}

export interface SelectFilterColumnConfig<T> extends BaseColumnConfig<T> {
  type: "select";
  options: FilterOption[];
}

export interface MultiSelectFilterColumnConfig<T> extends BaseColumnConfig<T> {
  type: "multiSelect";
  options: FilterOption[];
}

export interface DateRangeFilterColumnConfig<T> extends BaseColumnConfig<T> {
  type: "dateRange";
}

export type FilterColumnConfig<T> =
  | TextFilterColumnConfig<T>
  | SelectFilterColumnConfig<T>
  | MultiSelectFilterColumnConfig<T>
  | DateRangeFilterColumnConfig<T>;

export interface DateRange {
  from?: string;
  to?: string;
}

export type FilterValue =
  | { type: "text"; value: string }
  | { type: "select"; value: string }
  | { type: "multiSelect"; value: string[] }
  | { type: "dateRange"; value: DateRange };

export type FilterState = Record<string, FilterValue>;

/**
 * One column's worth of checkbox options for <TableFilterMenu> — the
 * two-pane flyout (categories on the left, searchable checkbox options on
 * the right) used as the hover-revealed trigger for a table's select/
 * multiSelect columns.
 */
export interface FilterCategory {
  /** Must match the column id used in the table's filter config/state. */
  id: string;
  label: string;
  options: FilterOption[];
  /** Defaults to true — set false for a single-choice category. */
  isMultiSelect?: boolean;
}
