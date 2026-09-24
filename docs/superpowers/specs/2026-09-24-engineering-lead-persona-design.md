# Engineering Lead persona — session 1 design

**Date:** 2026-09-24
**Scope:** Introduce a second persona (Engineering Lead) alongside Founder. Build the shared
persona mechanics (routing, sidebar/header awareness, dev-only persona switcher) so future
personas plug in the same way, and fully build the Engineering Lead's landing dashboard page.
Other five sidebar sections get placeholder pages only — not built out this session.

**Sources:** `docs/Engineering-Lead-Dashboard-Data-Spec.md` (§1 Releases), `docs/Founder-Dashboard-Data-Spec.md`
(shared chart-type rule, sidebar taxonomy), memory `sidebar-ia-taxonomy` (canonical 21-item list —
not adopted this session, see Open Items below), existing Founder shell/pages as the pattern to mirror.

---

## 1. Persona architecture

- New `lib/personas.ts`: a `Persona` type (`"founder" | "engineering-lead"`) and a small config
  keyed by persona id — display name, route base (`/founder`, `/engineering-lead`), mock identity
  (name + avatar initials) for the Header.
- No React context/provider. The active persona is derived from the URL's first path segment via
  `usePathname()`, the same mechanism `Sidebar` already uses for active-item highlighting. This
  keeps persona state as a routing concern, not app state — consistent with how the app has no
  backend/auth yet.

## 2. Routes for Engineering Lead

Mirrors the Founder route tree under `/engineering-lead/`:

| Route | Status |
|---|---|
| `/engineering-lead/dashboard` | Built this session — Releases-per-spec content |
| `/engineering-lead/approvals` | Placeholder |
| `/engineering-lead/operations` | Placeholder |
| `/engineering-lead/cost-analytics` | Placeholder |
| `/engineering-lead/compliance-risk` | Placeholder |
| `/engineering-lead/audit-explorer` | Placeholder |
| `/engineering-lead/products` | Placeholder |

Placeholders use a shared `ComingSoon` component (icon + "This section isn't built yet for
Engineering Lead") so the sidebar/header/shell chrome always renders around real content, never a
404 or blank page.

## 3. Sidebar & Header changes

- `Sidebar.tsx`: `NAV_ITEMS` hrefs become persona-relative (`${personaBase}/approvals` etc.),
  computed from the current pathname's persona segment. Icons and labels are **not** relabeled
  per persona this session (same 6 icons for both) — per user decision, since 5 of 6 are
  placeholders anyway for Engineering Lead. Logo link target becomes `/{persona}/dashboard`.
  Labels stay single-word (matches current set: Approvals, Operations, Analytics, Compliance,
  Audit, Products — no change needed, just confirming the convention holds going forward).
- The shell chrome — sidebar rail, footer strip, logo, and the bottom-right floating
  `AssistantButton`/`AssistantPanel` — is one shared container set, structurally identical across
  personas. Nothing about their layout, sizing, or positioning changes per persona; only page
  *content* (the `children` AppShell renders) and the small pieces of Header text/identity
  called out below vary.
- `Header.tsx`: mock identity (name, role label, avatar initials) swaps based on active persona,
  read from `lib/personas.ts`. Founder keeps "Dhruv Singla" / "Founder" / "DS"; Engineering Lead
  gets a new mock identity (name TBD at implementation — pick something distinct, e.g. "Priyanka
  Rao" / "Engineering Lead" / "PR").

## 4. Dev-only persona switcher

Small dropdown next to the profile avatar in `Header`, rendered only when
`process.env.NODE_ENV !== "production"`. Lists both personas; selecting one navigates to that
persona's `/dashboard` route via `useRouter().push`. Not rendered at all in production builds —
no runtime/query-param toggle.

## 5. Data layer — `lib/mock-data/engineering-releases.ts`

New typed mock module, following the existing per-page convention (e.g. `cost-analytics.ts`).
Per `Engineering-Lead-Dashboard-Data-Spec.md` §1:

- `releaseKpis`: `{ activeRollouts, changeFailureRate: { pct, trend, status }, deploymentFailures: { count, status }, recurringExceptions: { count, status } }` — each status is a `StatusLevel` per the spec's colour logic (green/amber/red rules).
- `releases[]`: one entry per release/build with all §19.2 fields — build/commit ref, deployment
  initiator + pipeline ref, target environment + services, DB migration/config changes, rollout
  strategy + cohort, pre/post-deployment health metrics, pause/rollback decision + evidence, linked
  incident/error spike. Plus `rolloutPercent: number`, `status: "active" | "paused" | "rolled-back" | "complete"`,
  and `rollbackEscalated: boolean` (gates the Approve rollback button).
- `errorRateBeforeAfter[]`: `{ label, before, after }[]` per release — feeds `PairedBarChart` as-is.
- `deploymentFrequencyTrend[]`: `{ label, value }[]`, deployments per week — feeds `LineChart` as-is.

## 6. Page — `app/engineering-lead/dashboard/page.tsx`

Reuses existing shared components; only one new chart component needed.

- `GreetingCard` (persona-aware name) + four `KPITile`s: active rollouts, change failure rate
  (with trend arrow), deployment-related failures, recurring exceptions.
- `Card` "Error rate before/after release" → existing `PairedBarChart` (no changes needed).
- `Card` "Deployment frequency" → existing `LineChart`, deployments/week.
- `Card` "Rollout progress" → **new** `components/shared/charts/RolloutProgressBar.tsx`, modeled
  on `UsageAllowanceBar`'s horizontal-bar-with-marker pattern, but the marker denotes a
  pause/rollback point on that release's rollout instead of a warning threshold; one row per
  non-terminal release, showing `rolloutPercent`.
- `DataTable` "Releases" — row-expandable (existing `DataTable` capability) revealing the full
  §19.2 field set per release; status badge per row; conditional "Approve rollback" button
  rendered only when `rollbackEscalated` is true, wired to a no-op stub handler (no backend yet,
  matches Founder's existing approval-button pattern).

## 7. Error/edge cases

Same rules as every other page (`CLAUDE.md` error table): KPI tiles use the same
`useKpiSnapshot`-style hook with simulated occasional failure → keep last value + `StaleIndicator`
+ 60s retry. Empty release list → `EmptyState`, never a blank table.

## Open items (not resolved this session, don't silently decide)

- **Canonical 21-item sidebar taxonomy** (memory `sidebar-ia-taxonomy`) is not adopted this
  session — Sidebar keeps its current 7-flat-item shape, just made persona-relative. The
  taxonomy refactor (grouped nav, `releases`/`feature-flags`/`health`/`incidents`/`operations-inbox`
  as distinct ids) is deferred to when Engineering Lead's other screens are actually built,
  per the user's explicit "left blank for now" instruction.
- **Rollout safety & deployment control** open decisions from the spec (§31: observe-only vs
  auto-pause/rollback; visibility vs approval/governance vs direct control) — build this session
  under Option A (observe-only, visibility-only) for both, per the spec's own guidance. UI
  structured so escalating later is a permissions/automation change, not a redesign.
- Engineering Lead's mock identity name is a placeholder pick, not specified by any doc — fine to
  choose at implementation time, flag if the user wants something specific.
