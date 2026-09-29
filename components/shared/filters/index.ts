// Founder table filters — public API.
//
// Usage inside a DataTable column:
//   { key: "status", header: "Status", render: ..., filterConfig: { type: "multiSelect", options: [...], accessor: (row) => row.status } }

export { FilterHeader } from "./filter-header";
export { ListingFilters } from "./listing-filters";
export { TableFilterMenu } from "./table-filter-menu";
export { useTableFilters } from "./use-table-filters";
export { applyFilters, isFilterActive } from "./apply-filters";
export type {
  DateRange,
  DateRangeFilterColumnConfig,
  FilterCategory,
  FilterColumnConfig,
  FilterOption,
  FilterState,
  FilterType,
  FilterValue,
  MultiSelectFilterColumnConfig,
  SelectFilterColumnConfig,
  TextFilterColumnConfig,
} from "./types";
