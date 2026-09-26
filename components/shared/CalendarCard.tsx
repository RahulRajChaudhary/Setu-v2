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
      className="flex h-full w-full min-w-0 flex-col gap-3 rounded-[1.25rem] border border-[var(--divider)] bg-white p-4 screen-xl:max-w-[28rem]"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <p className="text-base font-bold leading-tight text-[var(--icon-chip-fg)]">
            {MONTH_NAMES[cursor.getMonth()]}
          </p>
          <p className="text-xs font-medium text-[var(--text-muted)]">{cursor.getFullYear()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="tap-pop mr-1 rounded-full bg-[var(--icon-chip-bg)] px-2.5 py-1 text-[0.6875rem] font-semibold text-[var(--icon-chip-fg)] transition-colors hover:brightness-95"
            >
              Today
            </button>
          )}
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="tap-pop flex h-7 w-7 items-center justify-center rounded-[0.625rem] text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] hover:text-[var(--icon-chip-fg)]"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="tap-pop flex h-7 w-7 items-center justify-center rounded-[0.625rem] text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] hover:text-[var(--icon-chip-fg)]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]/70">
            {w}
          </span>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-y-1.5 text-center">
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.inMonth && cell.day === today.getDate();
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          return (
            <div key={i} className="flex items-center justify-center">
              <span
                className={`tap-pop flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                  isToday
                    ? "bg-[var(--icon-btn-navy)] font-semibold text-white shadow-sm"
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
