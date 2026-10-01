// Fixed "today" for the mock layer so relative dates (overdue, due in N days,
// renewing soon) are stable across reloads. Replace with the real clock when
// the data layer is swapped for an API.
export const MOCK_TODAY = "2026-10-01";

const DAY_MS = 86_400_000;

/** Whole days from MOCK_TODAY to `date` (negative = in the past). */
export function daysFromToday(date: string): number {
  return Math.round((new Date(date).getTime() - new Date(MOCK_TODAY).getTime()) / DAY_MS);
}

export function isInMockMonth(date: string): boolean {
  return date.slice(0, 7) === MOCK_TODAY.slice(0, 7);
}
