"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ListFilter } from "lucide-react";
import { ListingFilters } from "./listing-filters";
import { clampToViewport } from "./clamp-to-viewport";
import type { FilterCategory, FilterState, FilterValue } from "./types";

interface TableFilterMenuProps {
  /** One entry per filterable column this trigger covers — each category's
   *  `id` must match the column id used in the table's filter state. A
   *  single-entry array is the common case: one trigger per select/
   *  multiSelect column, matching the reference "hover -> Filter -> Status ->
   *  options" flyout. */
  categories: FilterCategory[];
  filters: FilterState;
  /** Same setter <FilterHeader> uses — called once per category on Apply. */
  onApply: (columnId: string, value: FilterValue | null) => void;
  /** Which side the popover opens from — flip to "right" for right-edge columns. */
  align?: "left" | "right";
  /** Screen-reader label for the trigger button. */
  label?: string;
}

// Combined width of the two panes in ListingFilters (w-52 + gap-2 + w-80).
const MENU_WIDTH = 208 + 8 + 320;

function selectionsFromFilters(categories: FilterCategory[], filters: FilterState): Record<string, string[]> {
  const selections: Record<string, string[]> = {};
  for (const category of categories) {
    const value = filters[category.id];
    selections[category.id] = value?.type === "multiSelect" ? value.value : [];
  }
  return selections;
}

/**
 * A single filter trigger covering one or more select/multiSelect columns —
 * categories on the left, searchable checkbox options on the right (see
 * <ListingFilters>). Used as the hover-revealed icon next to a column
 * header; clicking it opens the two-pane flyout.
 *
 * Rendered through a portal into document.body (like the rest of the
 * page's overlays) and positioned from the trigger's own bounding rect —
 * table headers sit inside an `overflow-x-auto` wrapper, and an
 * in-flow/absolute popup would get clipped by it otherwise.
 */
export function TableFilterMenu({ categories, filters, onApply, align = "left", label = "Filters" }: TableFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const activeCount = categories.reduce((count, category) => {
    const value = filters[category.id];
    return value?.type === "multiSelect" && value.value.length > 0 ? count + 1 : count;
  }, 0);

  function close() {
    setOpen(false);
    window.setTimeout(() => setMounted(false), 150);
  }

  function toggle() {
    if (open) {
      close();
    } else {
      setMounted(true);
      setOpen(true);
    }
  }

  function commitSelections(selections: Record<string, string[]>) {
    for (const category of categories) {
      const values = selections[category.id] ?? [];
      onApply(category.id, values.length > 0 ? { type: "multiSelect", value: values } : null);
    }
  }

  function handleDone(selections: Record<string, string[]>) {
    commitSelections(selections);
    close();
  }

  // Measures the popup's real (viewport-capped, see maxWidth/maxHeight
  // below) size rather than guessing, then clamps so it never sits
  // off-screen or forces the page to scroll horizontally/vertically.
  function reposition() {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current?.getBoundingClientRect();
    setCoords(
      clampToViewport(triggerRect, popupRect?.width ?? MENU_WIDTH, popupRect?.height ?? 320, align),
    );
  }

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reposition reads live refs, not state
  }, [open, align]);

  // The two-pane flyout changes size when a category is opened/closed or its
  // option list is searched — keep it clamped to the viewport as that happens.
  useEffect(() => {
    if (!open || !popupRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => reposition());
    observer.observe(popupRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reposition reads live refs, not state
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, align]);

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-opacity ${
          activeCount > 0
            ? "bg-[var(--status-info-bg)] text-[var(--status-info-fg)] opacity-100"
            : `text-[var(--text-muted)] hover:bg-[var(--search-bg)] hover:text-[var(--text-secondary)] ${
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              }`
        }`}
      >
        <ListFilter className="h-3 w-3" />
      </button>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            onClick={(event) => event.stopPropagation()}
            className={`absolute z-[100] origin-top transition duration-150 ease-out ${
              open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-95 opacity-0"
            }`}
            style={{
              top: coords.top,
              left: coords.left,
              maxWidth: "calc(100vw - 1rem)",
              maxHeight: "calc(100vh - 1rem)",
            }}
          >
            <ListingFilters
              categories={categories}
              defaultValues={selectionsFromFilters(categories, filters)}
              onChange={commitSelections}
              onApply={handleDone}
            />
          </div>,
          document.body,
        )}
    </span>
  );
}
