"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ListFilter } from "lucide-react";
import { isFilterActive } from "./apply-filters";
import { clampToViewport } from "./clamp-to-viewport";
import type { FilterColumnConfig, FilterValue } from "./types";

interface FilterHeaderProps<T> {
  /** Visible column label — also used as the popover title. */
  label: string;
  config: FilterColumnConfig<T>;
  /** Currently applied value for this column, if any (from useTableFilters). */
  value: FilterValue | undefined;
  /** Commits (or, passed null, clears) the filter for this column. */
  onApply: (value: FilterValue | null) => void;
  /** Which side the popover opens from — flip to "right" for right-edge columns so it doesn't overflow. */
  align?: "left" | "right";
}

const POPUP_WIDTH = 240; // w-60

function emptyDraft(type: FilterColumnConfig<unknown>["type"]): FilterValue {
  switch (type) {
    case "text":
      return { type: "text", value: "" };
    case "select":
      return { type: "select", value: "" };
    case "multiSelect":
      return { type: "multiSelect", value: [] };
    case "dateRange":
      return { type: "dateRange", value: {} };
  }
}

/** Direct single-column filter trigger — used for text/dateRange columns. */
export function FilterHeader<T>({ label, config, value, onApply, align = "left" }: FilterHeaderProps<T>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<FilterValue>(value ?? emptyDraft(config.type));
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const active = isFilterActive(value);

  function close() {
    setOpen(false);
    window.setTimeout(() => setMounted(false), 150);
  }

  function toggle() {
    if (open) {
      close();
    } else {
      setDraft(value ?? emptyDraft(config.type));
      setMounted(true);
      setOpen(true);
    }
  }

  // Every change is committed immediately — filtering happens live as you
  // type/check options, not gated behind an explicit Apply.
  function handleChange(next: FilterValue) {
    setDraft(next);
    onApply(next);
  }

  function handleClear() {
    const empty = emptyDraft(config.type);
    setDraft(empty);
    onApply(null);
    close();
  }

  // Runs after the portal has committed to the DOM, so it measures the
  // popup's real (possibly viewport-capped, see maxWidth/maxHeight below)
  // size rather than guessing — then clamps so it never sits off-screen or
  // forces the page to scroll horizontally/vertically.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current?.getBoundingClientRect();
    setCoords(
      clampToViewport(triggerRect, popupRect?.width ?? POPUP_WIDTH, popupRect?.height ?? 260, align),
    );
  }, [open, align]);

  // The popup's height can change (e.g. multiSelect option list growing) —
  // keep it clamped to the viewport as that happens.
  useEffect(() => {
    if (!open || !popupRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (!triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current?.getBoundingClientRect();
      setCoords(
        clampToViewport(triggerRect, popupRect?.width ?? POPUP_WIDTH, popupRect?.height ?? 260, align),
      );
    });
    observer.observe(popupRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads live refs, not state
  }, [open, align]);

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
      if (event.key === "Enter" && (event.target as HTMLElement)?.tagName !== "TEXTAREA") {
        close();
      }
    }

    function handleReposition() {
      if (!triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current?.getBoundingClientRect();
      setCoords(
        clampToViewport(triggerRect, popupRect?.width ?? POPUP_WIDTH, popupRect?.height ?? 260, align),
      );
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, align]);

  return (
    <span className="group relative inline-flex items-center gap-1.5">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={`Filter ${label}`}
        aria-expanded={open}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-opacity ${
          active
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
            role="dialog"
            aria-label={`Filter by ${label}`}
            onClick={(event) => event.stopPropagation()}
            className={`absolute z-[100] w-60 origin-top overflow-y-auto rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-3 text-left font-normal normal-case tracking-normal text-[var(--text-secondary)] transition duration-150 ease-out ${
              open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-95 opacity-0"
            }`}
            style={{
              top: coords.top,
              left: coords.left,
              maxWidth: "calc(100vw - 1rem)",
              maxHeight: "calc(100vh - 1rem)",
              boxShadow: "var(--card-shadow-hover)",
            }}
          >
            <p className="px-0.5 pb-2 text-xs font-semibold text-[var(--role-text)]">Filter &middot; {label}</p>

            <FilterControl config={config} draft={draft} onChange={handleChange} />

            <div className="mt-3 flex items-center justify-between border-t border-[var(--divider)] pt-2.5">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-[var(--role-text)] hover:text-[var(--text-secondary)]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={close}
                className="tap-pop rounded-lg bg-[var(--accent-solid)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}

interface FilterControlProps<T> {
  config: FilterColumnConfig<T>;
  draft: FilterValue;
  onChange: (value: FilterValue) => void;
}

function FilterControl<T>({ config, draft, onChange }: FilterControlProps<T>) {
  if (config.type === "text" && draft.type === "text") {
    return (
      <input
        autoFocus
        type="text"
        value={draft.value}
        onChange={(event) => onChange({ type: "text", value: event.target.value })}
        placeholder="Contains..."
        className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-3 py-2 text-sm text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] focus:border-[var(--icon-btn-navy)] focus:bg-[var(--surface)] focus:outline-none"
      />
    );
  }

  if (config.type === "select" && draft.type === "select") {
    return (
      <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
        {config.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange({ type: "select", value: draft.value === option.value ? "" : option.value })
            }
            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
              draft.value === option.value
                ? "bg-[var(--status-info-bg)] text-[var(--status-info-fg)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (config.type === "multiSelect" && draft.type === "multiSelect") {
    return (
      <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
        {config.options.map((option) => {
          const checked = draft.value.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onChange({
                    type: "multiSelect",
                    value: checked
                      ? draft.value.filter((item) => item !== option.value)
                      : [...draft.value, option.value],
                  })
                }
                className="h-3.5 w-3.5 rounded border-[var(--divider)] text-[var(--icon-btn-navy)] focus:ring-[var(--icon-btn-navy)]"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    );
  }

  if (config.type === "dateRange" && draft.type === "dateRange") {
    return (
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-medium text-[var(--role-text)]">From</span>
          <input
            type="date"
            value={draft.value.from ?? ""}
            onChange={(event) =>
              onChange({ type: "dateRange", value: { ...draft.value, from: event.target.value || undefined } })
            }
            className="rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-heading)] focus:border-[var(--icon-btn-navy)] focus:bg-[var(--surface)] focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-medium text-[var(--role-text)]">To</span>
          <input
            type="date"
            value={draft.value.to ?? ""}
            onChange={(event) =>
              onChange({ type: "dateRange", value: { ...draft.value, to: event.target.value || undefined } })
            }
            className="rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-heading)] focus:border-[var(--icon-btn-navy)] focus:bg-[var(--surface)] focus:outline-none"
          />
        </label>
      </div>
    );
  }

  return null;
}
