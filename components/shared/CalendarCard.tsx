"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, inMonth: false });
  }
  return cells;
}

export default function CalendarCard() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = buildGrid(cursor.getFullYear(), cursor.getMonth());
  const isCurrentMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col gap-[clamp(0.5rem,3cqi,0.875rem)] rounded-[1.25rem] border border-[var(--divider)] bg-[var(--surface)] p-[clamp(0.75rem,4cqi,1.25rem)] screen-xl:max-w-[32rem]"
      style={{ boxShadow: "var(--card-shadow)", containerType: "inline-size" }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight text-[var(--icon-chip-fg)] text-[clamp(0.9375rem,5cqi,1.25rem)]">
            {MONTH_NAMES[cursor.getMonth()]}
          </p>
          <p className="text-[clamp(0.6875rem,3cqi,0.8125rem)] font-medium text-[var(--text-muted)]">{cursor.getFullYear()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="tap-pop mr-1 rounded-full bg-[var(--icon-chip-bg)] px-2.5 py-1 text-[clamp(0.625rem,2.8cqi,0.6875rem)] font-semibold text-[var(--icon-chip-fg)] transition-colors hover:brightness-95"
            >
              Today
            </button>
          )}
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="tap-pop flex items-center justify-center rounded-[0.625rem] text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] hover:text-[var(--icon-chip-fg)] h-[clamp(1.625rem,7cqi,2rem)] w-[clamp(1.625rem,7cqi,2rem)] [&>svg]:h-[45%] [&>svg]:w-[45%]"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="tap-pop flex items-center justify-center rounded-[0.625rem] text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] hover:text-[var(--icon-chip-fg)] h-[clamp(1.625rem,7cqi,2rem)] w-[clamp(1.625rem,7cqi,2rem)] [&>svg]:h-[45%] [&>svg]:w-[45%]"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-7 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[clamp(0.5625rem,2.6cqi,0.6875rem)] font-semibold uppercase tracking-wide text-[var(--text-muted)]/70">
            {w}
          </span>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 text-center">
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.inMonth && cell.day === today.getDate();
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          return (
            <div key={i} className="flex items-center justify-center">
              <span
                className={`tap-pop flex aspect-square items-center justify-center rounded-full text-[clamp(0.6875rem,3.4cqi,0.875rem)] transition-colors w-[clamp(1.5rem,11cqi,2.25rem)] ${
                  isToday
                    ? "bg-[var(--accent-solid)] font-semibold text-white shadow-sm"
                    : cell.inMonth
                      ? `cursor-pointer hover:bg-[var(--search-bg)] ${isWeekend ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`
                      : "text-[var(--divider)]"
                }`}
              >
                {cell.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
