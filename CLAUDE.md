# SetuDashboards — Project Guide

Frontend-only Next.js + Tailwind build of the **Founder persona** dashboard. No backend yet —
all data comes from a typed mock layer designed to be swapped for real API calls later.

## Source of truth (read before building anything)

- `docs/figma-design-layout.md` — shell chrome measurements, colors/tokens, breakpoints (1366/1440/1920px).
- `docs/founder-persona-final.md` — sidebar items, Control Room KPIs, per-page content, open decisions.
- The two dashboard SVGs shared in chat — visual reference for the shell (icon-rail sidebar, header
  with search/workspace-pill/avatar) and the content area (stat cards, line chart, table rows with
  status dots). They confirm/extend the content-area layout; they do **not** override the docs above
  if there's ever a conflict — flag the conflict instead of silently picking one.

**Known open items to carry forward, don't silently resolve:**
- 1440px breakpoint has smaller pill/avatar sizes than 1366 and 1920 — confirm intentional before building, don't "fix" it unasked.
- Audit Explorer: permanent sidebar slot vs. drill-down-only? (undecided)
- Approvals: first release or fast-follow? (undecided)
- Product 360: build now or next sprint? (undecided)
- Cost & Analytics: one nav item with two tabs, confirmed — not two separate entries.

## Tech stack & conventions

- **Next.js (App Router)** + **Tailwind CSS**. No component library (no shadcn/MUI/Chakra/etc.) —
  every component is hand-built with Tailwind utility classes.
- Design tokens from `figma-design-layout.md` go into `tailwind.config` (`theme.extend.colors`,
  spacing, radii) — don't hardcode hex values or pixel widths inline once a token exists for them.
- Mock data lives in a single typed layer (e.g. `lib/mock-data/`) shaped like the eventual API
  response, so swapping in real fetches later is a data-layer change only, not a component rewrite.
- Responsive behavior follows the measured breakpoints (1366 / 1440 / 1920px), not arbitrary
  Tailwind `sm/md/lg` guesses — use custom breakpoints matching those widths where the shell
  measurements differ.
- Auto-refresh / stale-data behavior (Control Room tiles, 60s refresh, keep-last-value-on-failure)
  is a UI-state concern to build even with mock data — simulate failure occasionally so the
  stale-indicator path is actually exercised.

## Session plan

Work one session at a time. Don't start the next session's page until the current one renders
correctly and is confirmed. Each session should end in a working, viewable state — run the dev
server and check it in the browser before calling a session done.

1. **Scaffold + shell** — `create-next-app` with Tailwind, theme tokens from the design doc,
   app shell layout: sidebar icon rail, header (search / create / archive / bell / workspace
   pill / avatar), footer strip with the floating gradient button. Responsive at all three
   breakpoints.
2. **Shared components** — `KPITile`, `StatusBadge` (healthy/degraded/critical), `DataTable`
   (sortable, paginated, row-expandable), `TabBar` (synced to `?tab=`), `EmptyState`,
   `StaleIndicator`, `DrillLink` (carries filter context via query params). Build each in
   isolation with mock props before wiring into a real page.
3. **Control Room** (home) — tile grid (3-col desktop / 2-col tablet / 1-col mobile): Platform
   Health, Critical Exceptions, Commercial Control, Releases, Security & Compliance,
   Dependencies. Matches the SVG content area (cards + chart + table). Mock 60s refresh with
   occasional simulated failure to exercise `StaleIndicator`.
4. **Approvals** — queue view, `EmptyState` when empty.
5. **Operations** — read-only rollup summary (not the full working queue).
6. **Cost & Analytics** — one nav item, `TabBar` with Cost / Adoption tabs.
7. **Compliance & Risk** — `DataTable` of controls/reviews.
8. **Audit Explorer** — reachable via `DrillLink`; sidebar placement per the open decision above.
9. **Product 360** — `/founder/products` list + `/founder/products/:id` detail. Not yet spec'd
   in detail per the docs — treat as needing its own mini design pass when this session starts.

## Error/edge-case rules (apply to every page, from `figma-design-layout.md` §5)

| Scenario | Behaviour |
|---|---|
| API 401 (once real API exists) | Redirect to SSO login, return to route after |
| API 403 | Inline "you don't have access", not a full-page error |
| Tile fetch fails | Keep last cached value + stale indicator; retry in 60s |
| Full page load fails, no cache | Full-page error state with retry button |
| Zero items in a list/queue | `EmptyState`, never a blank page |
