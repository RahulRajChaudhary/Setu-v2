"use client";

import { useState } from "react";

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
      className="flex h-full w-full max-w-[383px] flex-col gap-2 rounded-[20px] border border-[var(--divider)] bg-white p-4"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <div className="flex shrink-0 items-center justify-between">
        <p className="text-base font-bold text-[var(--icon-chip-fg)]">
          {MONTH_NAMES[cursor.getMonth()]} <span className="font-normal text-[var(--text-muted)]">{cursor.getFullYear()}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="tap-pop flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#F9F7FC] text-[var(--icon-chip-fg)] transition-transform hover:scale-105"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="tap-pop flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#F9F7FC] text-[var(--icon-chip-fg)] transition-transform hover:scale-105"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="h-px shrink-0 bg-[var(--divider)]" />

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[11px] font-medium text-[var(--text-muted)]">
            {w}
          </span>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-y-1 text-center">
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.inMonth && cell.day === today.getDate();
          return (
            <div key={i} className="flex items-center justify-center">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-[var(--icon-btn-navy)] font-semibold text-white"
                    : cell.inMonth
                      ? "text-[var(--text-secondary)]"
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

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={direction === "left" ? "" : "rotate-180"}>
      <path d="M8.5 3.5L5 7L8.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
