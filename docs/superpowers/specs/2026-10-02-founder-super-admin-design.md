# Founder as Super Admin — Design Spec

**Date:** 2026-10-02
**Status:** Approved (brainstorming), ready for implementation planning
**Supersedes (for the Founder persona only):** the "Executive Viewer / read-only" permission framing
and the "hidden from Founder" sidebar lists in `Founder-Dashboard-Data-Spec.md` §14,
`Setu_Founder_EngLead_ComplianceOfficer_Roles_Screens_Workflows.md` §4.1, and
`Setu_Founder_Competitive_Research_Future_Screens.md` §7. Those documents remain the source of truth
for *content* (fields, KPIs, charts) and competitive research. Only the **permission model** (Can do /
Can't do) and the **sidebar visibility** rules are overridden here.

**Field-level authority:** `Setu_Founder_Executive_Data_Inventory` (27-section Founder data inventory,
every field tagged Must / Conditional / Recommended) is the authoritative per-section field list for
everything below. This spec defines role scope, IA, and build order; it does not re-list every field —
it points to that inventory.

---

## 1. Why this spec exists

Setu is Sahayogi's internal ecosystem control plane — it governs 25+ (today: 9) Sahayogi products
end-to-end: deployment, cloud hosting, cost, user/workspace access, insights, releases, compliance.
The nine real products are **BoSS, Chat with Sahayogi, Sahayogi One, Sahayogi Cloud, Tax Sahayogi,
Office Sahayogi, Investor Sahayogi, My Sahayogi, Studio Sahayogi**.

The earlier Founder spec modelled the role as an **Executive Viewer**: broad read-only summaries, a
narrow set of escalation-only approvals, and six canonical sidebar items hidden from the DOM. That is
not the role the product owner wants. **Founder = Super Admin = the owner of Sahayogi**, with full
visibility and full control across everything Setu governs, plus the authority to grant, scope, and
revoke every other persona's access. "Founder" is simply the name of the super-admin persona.

**The permission model is a ceiling, not a lens.** Every other persona (Platform Engineer, Auditor,
Engineering Lead, Compliance Officer, Platform Administrator, …) is a *subset* of Founder access,
scoped to their responsibility. Founder holds all of those permissions at once. A Platform Engineer can
never reach Founder's surface; Founder can always reach a Platform Engineer's.

This spec builds (a) Founder's own end-to-end surface, and (b) the role/access-management surface
Founder uses to assign and scope the other personas. It does **not** build the other personas' own
dashboards.

### 1.1 Deliberate deviation from the blueprint's role model (recorded, not hidden)

Blueprint §23.1 deliberately separates two role bundles: *"Executive Viewer: broad read-only
summaries; explicit approval rights separately granted"* and *"Super Admin: extremely limited
population; not a substitute for granular roles."* The blueprint keeps Founder/Executive read-only and
treats Super Admin as a rarely-used break-glass identity.

**This spec intentionally merges them for Sahayogi's context, on the product owner's explicit
direction:** the company founder *is* the super admin and needs genuine end-to-end control, not just
read access. This is a conscious product decision that overrides §23.1 for this persona. It does **not**
override the blueprint's other guardrails, which still hold in full:

- **Data-boundary rule (§2):** revenue, invoices, receivables/payables stay in BoSS Finance; Setu
  reads approved commercial state, never originates ₹ accounting. Identity stays in Sahayogi One; CRM/
  support/HR stay in BoSS. (Founder Data Inventory §27 restates this per-domain.)
- **Every privileged action needs permission + reason + audit + verification (§1.1).** Founder having
  full access does not exempt Founder actions from the reason dialog and audit trail — it means Founder
  is never *blocked*, not that Founder is *unlogged*.
- **Maker-checker / segregation of duties (§16.1, §16.3):** even a super admin cannot approve their own
  high-risk request; break-glass carries stricter logging and post-use review.

---

## 2. Permission model — applies to every screen below

| Old Founder rule (superseded) | New Founder rule |
|---|---|
| Can't edit product metadata/ownership/dependencies | **Can** create/edit/archive products, ownership, dependency graph |
| Can't change a plan / apply override (routed to Ops Inbox) | **Can** create subscriptions, change plans, apply overrides directly |
| Can't edit workspace fields / trigger provisioning | **Can** create/suspend/edit workspaces, trigger/retry provisioning, run repairs |
| Can't run a control test / attach evidence / resolve a finding | **Can** do all compliance write actions |
| Can't acknowledge/mitigate/action incidents or health | **Can** declare/acknowledge/mitigate/close incidents, hand-declare health |
| Can't pause rollout / edit flag / approve non-escalated rollback | **Can** pause rollouts, edit flags, kill-switch, approve any rollback |
| `security-access`, `access-reviews`, `privacy-requests`, `catalogue-rules`, `integrations`, `partners` hidden | **All visible**, full read/write |
| Approvals scoped to escalation-only | Still *lands* on the escalation-focused queue by default; not *blocked* from any action |

Every Founder write action still opens the shared reason dialog and writes to the audit log (the
existing `lib/store/decisions-store.ts` pattern — see §7's note on extending it to controls/vendors).

---

## 3. Sidebar information architecture

### 3.1 Principle

There is no fixed sidebar item count. Give an item its own slot when it is used often enough or is
cross-cutting enough that burying it costs clarity; otherwise fold it into a parent's tabs. The target
is a clean, legible nav for an internal tool managing 25+ products — a first-time viewer should
understand each item at a glance, and nothing should be duplicated. We collapse the locked 21-item
canonical taxonomy into **8 top-level sidebar items**, each exposing its members through tabs,
breadcrumbs, and query-param filters.

This matches the blueprint's own recommended **Hybrid** IA (§22 Option C; redline A3 confirms the
taxonomy is locked and §22's three-option framing is superseded).

### 3.2 The 8 Founder sidebar items

Every canonical taxonomy id is covered exactly once. `code font` = locked taxonomy ids from
`[[sidebar-ia-taxonomy]]` — never renamed or reordered, only grouped.

| # | Sidebar item | Covers (canonical ids) | Internal structure |
|---|---|---|---|
| 1 | **Control Room** (Home) | `control-room`, `operations-inbox` | Overview (default) + Operations Inbox tab |
| 2 | **Customers** | `workspaces`, `subscriptions`, `provisioning-drift`, `approvals`, `partners` | Tabs: Workspaces / Subscriptions / Provisioning / Approvals / Partners |
| 3 | **Products** | `products`, `releases`, `feature-flags` | Tabs: Catalog / Releases / Feature Flags; Catalog row → **Product 360** |
| 4 | **Reliability** | `health`, `incidents`, `integrations` | Tabs: Health / Incidents / Integrations |
| 5 | **Security & Compliance** | `security-access`, `access-reviews`, `compliance`, `risks-vendors`, `privacy-requests` | Tabs: Access / Access Reviews / Compliance / Risks & Vendors / Privacy |
| 6 | **Cost & Analytics** | `usage-cost` | Tabs: Cost / Adoption *(already shipped)* |
| 7 | **Audit Explorer** | `audit-explorer` | Own top-level slot — cross-domain forensic search |
| 8 | **Settings** | `catalogue-rules` | Catalogue & rules authoring |

**Audit Explorer gets its own slot** because it searches across *every* domain; Founder uses it
constantly to verify any other persona's action anywhere. `CLAUDE.md` flagged this as open — now
decided: top-level slot.

### 3.3 Top-bar global capabilities (not sidebar items)

Two blueprint-mandated capabilities belong in the top bar / global chrome, available on every screen,
not as sidebar entries:

- **Global Search / Command (Ctrl-K)** — blueprint §12.1, Data Inventory §21. Search by workspace,
  org, user, subscription, integration/WABA/provider ref, event/incident/operation id, support case
  ref. Results respect field-level permissions and masking; contextual actions appear only when
  authorized. For a super admin this is the primary cross-object investigation entry point.
- **Notifications & Escalations feed** — blueprint §24, Data Inventory §22. Severity-tiered
  (Info/Warning/High/Critical), each item deep-links to the exact object; ack/escalation state.

### 3.4 Within-item navigation conventions

- **Tabs** synced to `?tab=` (existing `TabBar`, already used by Cost & Analytics).
- **Breadcrumbs** on any drill-down deeper than a tab (Products → Catalog → Product 360 → a release).
- **Filters** carry context via query params using `DrillLink` (e.g. `?product=` already scopes
  Platform Ops lists). A Control Room tile drilling into Reliability lands on the right tab with the
  product pre-filtered.
- **No-duplication rule:** a figure shown as a KPI tile is not repeated as a chart on the same screen;
  the drill target owns the detail, the parent owns the summary (continues the recent Platform Ops
  de-dup work).

### 3.5 The nine Mandatory 360 Views (drill targets, not sidebar items)

Blueprint §7 mandates nine 360 views; Founder Data Inventory §5–18 specifies each one's fields at
Founder scope. These are **drill-down destinations** reached from the tabs above, each with the
standard object-header + tab-bar + overview-grid shape:

| 360 View | Reached from | Founder scope |
|---|---|---|
| **Product 360** | Products → Catalog | full detail + edit (§5.2) |
| **Workspace 360** | Customers → Workspaces | full detail + actions (§5.3) |
| **Subscription 360** | Customers → Subscriptions | full detail + plan/override actions (§5.4) |
| **Integration 360** | Reliability → Integrations | full detail + reconnect/resync |
| **Incident 360** | Reliability → Incidents | full detail + declare/mitigate/close |
| **Release 360** | Products → Releases | full detail + pause/rollback |
| **Vendor 360** | Security & Compliance → Risks & Vendors | full detail + review actions |
| **Control 360** | Security & Compliance → Compliance | full detail + test/evidence/finding |
| **Risk 360** | Security & Compliance → Risks & Vendors | full detail + treatment actions |

All nine share the **Standard Drill-Down Data Model** (Data Inventory §25: identity, state, time,
ownership, impact, context, evidence, decision, action, outcome) and the **Cross-Cutting Metadata**
(§24: source-of-truth, read path, write authority, audit requirement, approval rule, classification,
retention, freshness, data-quality state). These two models should shape the mock-data types so every
object carries source/freshness/owner/evidence from the start.

---

## 4. Role & Access Management (the super-admin core)

The capability that most distinguishes Founder from the old spec. Lives under **Security &
Compliance**, reusing canonical `security-access` + `access-reviews` (no new taxonomy ids). This is one
of the two highest-leverage zero-code gaps named in `Setu_Feature_Decision_Pitch.md` Part 1.

### 4.1 Security & Compliance → **Access** tab (`security-access`)

**Purpose:** Who has access to what, and the Founder's controls to grant/scope/revoke it.

**Can do (Founder / super admin):**
- Define/edit **role types** — the persona bundles Setu supports (the blueprint §23.1 starter set:
  Executive Viewer, Customer Operations, Technical Support, Platform Operations, SRE/DevOps, Security
  Admin, Compliance Manager, Auditor, Super Admin). Each carries a permission bundle across the seven
  permission dimensions (blueprint §23: scope, action [view/diagnose/execute/approve/configure/export],
  sensitivity, time, context, data-field mask, segregation).
- **Assign** a user to one or more role types.
- **Scope** each assignment to products and/or workspaces (all, or a named subset).
- **Temporary elevation** with automatic expiry; **break-glass** with stricter logging + post-use
  review (blueprint §16.1).
- **Revoke** instantly, with mandatory reason, written to audit.
- Request-against-catalogue model for elevated/temporary grants (ConductorOne pattern) — a grant is a
  logged, approvable event, not an ungoverned one-off. Satisfies the `Approval Request` object gap
  (redline A2).

**Screen content** (Data Inventory §16 + roles-guide screen 13):
- KPI tiles: staff with access, privileged users, active elevations, break-glass sessions to review,
  staff without MFA.
- Role-type matrix: role × module (sidebar item) × capability (View/Act/Admin) — Site24x7 RBAC shape.
- Users table: user, assigned roles, scope summary, last active, MFA, grant status → grant editor
  (assign role, set scope, set expiry, revoke).
- **Non-human identity** row type reserved in the data model now (AI agents calling a product API need
  the same grant model — two Sahayogi products are AI-powered); agent-specific UI is a later phase.

**No-one approves their own request** (segregation of duties holds even for Founder).

### 4.2 Security & Compliance → **Access Reviews** tab (`access-reviews`)

**Purpose:** Periodic recertification — is every grant still justified? (blueprint UC-15)

**Screen content** (Data Inventory §16 "access reviews", roles-guide screen 14):
- KPI tiles: grants due for review, overdue, auto-flagged stale, reviews completed this cycle.
- Review queue: user, role, scope, last used, due date, risk flag → decision **retain / modify /
  revoke** (Zluri 3-way), mandatory comment on modify/revoke only.
- AI pre-labelling of low-risk grants (Opal) — reviewer clears in one click — as a later enhancement.
- Completing a campaign **auto-updates the linked Compliance control row** (Vanta pattern) — wires to
  §7 Compliance.
- Offboarding runs from BoSS HR exit events: roles revoked, sessions ended, owned automations
  reassigned (UC-09).

---

## 5. Product & workspace lifecycle (super-admin CRUD)

### 5.1 Products → **Catalog** tab (`products`) — full CRUD

**Supersedes:** "registry authorship is Platform Administrator's screen, not Founder's."

**Can do:** create a product; edit metadata, ownership, lifecycle tier; declare/edit dependency graph;
archive/sunset.

**Object-model upgrade** (from `Setu_Ecosystem_Registry_Feature_Research.md`, Data Inventory §4):
replace flat `dependencyCount:number` with a typed directional dependency graph (`dependsOn[]`;
`dependencyOf` computed, never authored); add `owner`, `lifecycle`, `tier`, `tags`; replace the
hand-set `health` enum with a facts→checks→scorecard pipeline (health becomes *derived*). Two grouping
tiers only (Product + Dependency) at current scale.

**Screen content:** existing KPIs (products live, avg adoption %, workspaces near limits); adoption bar
+ per-product sparkline; table with **computed Readiness Scorecard badge** (ownership/integration/
dependency completeness) replacing raw dependency count → Product 360; **Create product** + per-row
edit/archive actions.

### 5.2 Product 360 — the "manage a product end-to-end" view

Reached from Catalog; satisfies "know everything about a product — deployment, cost, hosting, who's
accessing from where." Fields per Data Inventory §5; consolidates data today scattered across Health/
Incidents/Cost/Workspaces, filtered to one product (no figure re-sourced).

**Sections:** header (product, brand, lifecycle, owner, technical owner, computed multi-signal health
badge [Datadog fan-in], Readiness Scorecard) · deployment & hosting (region map, environments,
synthetic checks per region) · access & usage (which workspaces/users, from where — answers "कौन सा
यूजर कहाँ से एक्सेस कर रहा है"; active workspace count, usage vs allowance) · cost (by provider/region,
and by **model** for AI products — CloudZero granularity) · dependencies (typed graph, tier-mismatch
alert on edges) · releases & flags · incidents · controls & risks · timeline.

### 5.3 Customers → **Workspaces** tab (`workspaces`) — actionable

**Supersedes:** "no action buttons render for this role at all."

**Can do:** create/suspend/restore/edit a workspace, trigger/retry provisioning, **View as customer**
(impersonation — see §8 gate). **Tenant Zero** workspace cannot be deleted or disabled (blueprint §3).
**Content:** Data Inventory §6; KPIs, Trial→Active→At-Risk→Churned funnel, table → Workspace 360 with
actions; email/phone/PAN/GSTIN masked by default, unmask audited.

### 5.4 Customers → **Subscriptions** tab (`subscriptions`) — actionable

**Supersedes:** "change a plan / apply override routed through Operations Inbox only."

**Can do:** create a subscription, upgrade/downgrade plan, apply override (reason + expiry; large/
permanent → maker-checker per §16.3). **Content:** Data Inventory §7; KPIs (active/grace/restricted/
plan-mix — no ₹), status donut, table → Subscription 360. Entitlement visibility shown in ≥2 places
(dedicated view + inline at point of use — redline B3). Per-agent/per-workspace budget cap (Stigg)
reserved in the model for AI metering.

### 5.5 Customers → Provisioning / Approvals / Partners

- **Provisioning** (`provisioning-drift`, Data Inventory §10): 11-state run model (§9.1), drift
  (benign/actionable/critical), safe repairs with dry-run diff — Founder can act.
- **Approvals** (`approvals`): first-class approval list (redline A2's `Approval Request` object),
  distinct from the Founder-scoped Operations Inbox on the home page. Data Inventory §23.
- **Partners** (`partners`): now visible. Model as three entities — `Partner` / `WorkspaceAssignment`
  (mandatory expiry) / `AssignmentEvent` (immutable log); group and tier as separate fields; conflict
  state on overlapping claims (redline A1 adds the missing `Partner` object; Round-2 §2 research).

---

## 6. Control Room — signal mapping (structure unchanged)

Home keeps its shipped shape — **KPI row + Needs Your Decision + Nine Areas at a Glance** — we do not
restructure it. The complete field set is Data Inventory §3.1 (executive summary metrics) and §3.2
(decision queue). The 5 founder-level triggers the owner named each trace to a specific tile/section:

| Founder trigger | Where it surfaces | Data source |
|---|---|---|
| Emergency / accident | Needs Your Decision + Operations & Security tiles | critical incidents |
| Extra cost / cost-cutting | Cost tile + "platform cost vs last month" KPI | cost anomalies |
| Product bug | Releases / Platform tiles | release error-rate spikes, incidents linked to release |
| Unhappy customer | Customers tile | **customer-health signal — new, §6.1** |
| (general health) | Platform / Dependencies tiles | health rollup |

Retained enhancements: exception-first ranking + one-line auto-explanation on the Nine Areas tiles
(Tableau Pulse); Domo-style Collections linking each tile to its drill-down; the **Platform tile uses
dilution logic** (worst-status × proportion-affected, Statuspage) not worst-of-N, so "1 of 14 degraded"
doesn't paint the whole tile red.

### 6.1 Gap: customer-health data does not exist yet

There is **no** CSAT/complaint/escalation field anywhere in the workspace or customer data model. The
"unhappy customer" trigger must be designed, not wired. Proposal: a lightweight **customer-health
signal per workspace** — escalation/complaint count + satisfaction indicator (healthy/watch/at-risk) —
on the Customers tile and Workspace 360. Net-new mock data and field, flagged so it's built
deliberately. (Note: BoSS Customer Service remains system of record for actual cases — Setu shows
correlation/deep-link only, not a duplicate case store, per Data Inventory §27.)

---

## 7. Reliability, Compliance, Cost, Audit, Settings — permission upgrades + depth

Content already spec'd/partly built; permission ceiling removed, depth added per research.

- **Reliability → Health** (`health`, Data Inventory §5 health / blueprint §13.1, Four Golden Signals
  + RED): per-product KPIs, health grid, dependency map, synthetic checks. **Add** dilution rollup +
  computed multi-signal badge (Datadog), reused on Product 360; manual `mark_as_down/degraded_for`
  override (Better Stack). Founder **can** act.
- **Reliability → Incidents** (`incidents`, Data Inventory §9): KPIs + table → Incident 360.
  catalog-backed `affectedScope[]` (incident.io); split `urgency` vs `severity/impact` (PagerDuty);
  AI-drafted PIR, fixed schema, human-gated (Rootly). Founder **can** declare/mitigate/close.
- **Reliability → Integrations** (`integrations`, Data Inventory §11): now visible — a top zero-code
  gap (Feature Decision Pitch Part 1). Categorized connector catalog, per-integration health (last
  success/failure, latency, rate-limit), reconnect/resync → Integration 360. Prefer scoped/revocable
  credentials, never a shared device key (redline B2); secrets shown as masked references only.
- **Security & Compliance → Compliance** (`compliance`, Data Inventory §17 / blueprint §17.1
  Framework→Control→Evidence→Test→Finding→Remediation): controls table + frameworks bar → Control 360.
  **Add** explicit `testsTotal`/`testsPassing` per control (Vanta); link each control to evidence
  (`evidenceCount`/`evidenceCurrent`). Founder **can** run tests / attach evidence / resolve findings.
- **Security & Compliance → Risks & Vendors** (`risks-vendors`, Data Inventory §18): heat map + vendor
  table → Risk 360 / Vendor 360. **Add** inherent/residual risk score (OneTrust, `criticality`
  derived), "next review due" + ongoing-monitoring flag (Osano/Vanta). Founder **can** create/edit and
  accept any risk.
- **Security & Compliance → Privacy** (`privacy-requests`, Data Inventory implied / Round-2 §6): now
  visible. DSAR queue with fixed-enum lifecycle + irreversibility flag (Transcend), discrete
  legal-hold/redaction phases (OneTrust), dual regulatory/internal deadline (Osano), branch-by-type at
  intake. Full read/write.
- **Cost & Analytics** (`usage-cost`, Data Inventory §12–13): unchanged shipped structure (Cost /
  Adoption tabs). **Add** model-level dimension on cost anomalies (CloudZero). Revenue/receivables/
  payables excluded (BoSS Finance).
- **Audit Explorer** (`audit-explorer`, Data Inventory §19 / blueprint §25): unchanged — forensic
  search across every domain, read + signed export, no edit. Structured filter chips as primary UX,
  NLQ as accelerant only (not a raw SQL console); Saved Views (Datadog). Top-level slot (§3.2).
- **Settings → Catalogue & Rules** (`catalogue-rules`, Data Inventory §15 / blueprint §11.1): now
  visible. Catalogue (brands/products/modules/plans/add-ons) + rule authoring. `NotificationTarget`
  as a named reusable object referenced by id (redline B1; Opsgenie two-layer split); every automated
  rule action approval-gated + audit-logged (BetterCloud); hard-block delete of a referenced object
  (PagerDuty).
- **Shared audit log:** extend the existing `lib/store/decisions-store.ts` pattern to Control and
  Vendor state changes so they appear in Audit Explorer the way approvals already do (highest-leverage
  wiring per the vendor-monitoring research).

---

## 8. Architecture & frontend data-layer contract (built for a future backend at scale)

Setu is frontend-only today on a typed mock layer, but it is an internal tool for 1,000+ employees
growing toward 10,000. The frontend must be structured so that (a) a real backend drops in as a
**data-layer change only**, and (b) at scale it **never floods the backend with redundant or fanned-out
calls**. This section makes the blueprint's NFRs concrete at the frontend boundary — §27 ("common
360 queries should be fast through projections/read models rather than expensive cross-product live
joins") and §28 ("operational read models / projections for 360 views"). Per §32.1, contracts are
locked before screens — here we lock them at the data-layer even while the UI is mock.

### 8.1 The data-layer boundary (single seam)

- **All** data access goes through one typed module boundary (today `lib/mock-data/`, tomorrow
  `lib/data/` backed by HTTP). Components never fetch directly and never know whether data is mock or a
  real API. Each function returns the **exact eventual API response shape** — this deepens CLAUDE.md's
  existing rule into a hard contract.
- **One hook per resource/query** (`useControlRoom()`, `useWorkspaces(params)`, `useProduct360(id)`).
  Components consume hooks, not fetchers. Swapping mock→HTTP touches only what's behind the hook.

### 8.2 One aggregated read per view — no client-side fan-out (the anti-N+1 rule)

- Every dashboard screen and every 360 view maps to **exactly one backend read** (a projection/read
  model), not a waterfall of per-widget or per-row calls. Product 360 = one `getProduct360(id)`
  returning the whole composed object (health, cost, dependencies, incidents, releases, controls…),
  **not** eight separate calls the client stitches together. This is blueprint §28's read-model
  requirement made a frontend hard rule.
- A **list row carries enough summary in the list payload** to render itself and its status — never a
  per-row detail call to populate a table. Detail is fetched only on drill-in (one call = the 360
  read).
- The mock layer is authored in this same shape **now**, so the contract is real and the backend team
  inherits exact endpoint shapes rather than reverse-engineering them from components later.

### 8.3 Server-side pagination / filter / sort — never fetch-all-then-filter

- Every `DataTable` (Audit Explorer above all — 10k users → millions of events) uses **server-side
  pagination** (cursor-based for large append-only sets like audit), **server-side filtering and
  sorting**. The client sends params; the server returns one page. Changing a filter changes query
  params, **not** the number of calls.
- **No "load everything then `.filter()` in JS" anywhere.** The mock layer simulates
  paginated/filtered/sorted responses so components are written against the real contract from day one.
- `DrillLink`/breadcrumb filter context → query params → a **single parameterized read**, not a
  cascade of calls.

### 8.4 Caching, dedup, controlled refresh (don't stampede the backend)

- Adopt a **query-cache layer (TanStack/React Query or equivalent) behind the data-layer boundary**:
  automatic request **deduplication** (one in-flight request per key), caching with staleness windows,
  background refetch, stale-while-revalidate. This is the single biggest defense against an API storm
  at 10k users and is the recommended architectural call (see §9 for the decision note).
- The Control Room 60s auto-refresh (existing requirement) runs **through** this cache with
  keep-last-value-on-failure + `StaleIndicator`; the cache makes it dedup-safe across tiles that share
  the same underlying data.
- Query keys encode `resource + params`, so navigating back to a screen serves cache instead of
  refetching; a mutation invalidates **only** the affected keys.

### 8.5 Authorization & masking are server-enforced (never trust the client)

- The permission ceiling (§2) and field masking (email/phone/PAN/GSTIN) are enforced by the **backend**.
  The frontend hides actions a role can't take as UX, but a hidden button is **not** a security
  control. Masked fields arrive **already masked** from the API; unmask is a separate, audited call —
  never fetch-unmasked-then-mask-in-JS.
- Role/scope filtering (§4) is sent as params the server authorizes; the client does **not** pull a full
  dataset and narrow it to a role's scope locally.

### 8.6 Real-time surfaces: poll now, upgrade later

- Notifications feed, Operations Inbox counts, live incident/health status: v1 **polls through the
  query cache** at a sane interval with backoff; the data-layer seam is designed so a later
  SSE/WebSocket push swaps in **without touching components**. One shared poll/subscription per key
  feeds all consumers — never poll per-widget.

### 8.7 Frontend runtime scale

- **Route-level code splitting** (App Router does this per segment); lazy-load heavy 360 tabs.
- **Virtualized rendering** for large tables (audit, 10k-row user lists) — render visible rows only.
- **Memoization/selector discipline** so a 60s tile refresh doesn't re-render the whole tree; **derive
  KPIs from already-fetched rows** (the existing pattern in recent commits) instead of separate calls.

### 8.8 Mutation discipline

- Every write (the new super-admin CRUD, §5) is **one explicit mutation** through the data-layer that
  invalidates **precisely** the affected query keys — not a blanket screen refetch. Optimistic updates
  optional. The reason/audit payload (§2) is part of the mutation contract, not a side effect.

### 8.9 What this buys the backend team

- The endpoint list **falls out of the hooks**: one read per view + paginated list reads + scoped
  mutations. No endpoint serves an unbounded "everything" response; read models are pre-shaped; auth is
  a server concern. This is Phase-0 "architecture lock" (§32.1) achieved at the data-layer while the UI
  is still mock — the backend is built *to a contract the frontend already proved*, not bolted on after.

---

## 9. Conflicts & build-vs-buy tensions to decide (do not silently resolve)

These are genuine contradictions *within the source docs* or owner-direction-vs-blueprint tensions.
Flagged for a decision rather than papered over.

1. **Design-system / chrome conflict.** `figma-design-layout.md` (which the current build follows)
   specifies an 82–114px icon-rail sidebar + 84–118px header with a gradient logo. The roles guide
   (`Setu_V2_Team_Roles_and_Screen_Design_Guide`) specifies a **248px navy (#1B2250) sidebar + 64px
   top bar** with a different token set (Figtree/IBM Plex Mono, #141A33 ink). These are two different
   chrome designs. **This spec assumes the shipped Figma chrome stays** (least disruptive, already
   built) — but the roles guide's richer component library (status pill, stat tile, detail panel,
   reason dialog, before/after diff, timeline) should be adopted for the *content area*. Confirm.

2. **GRC engine — build vs buy.** Blueprint §17 and roles-guide screens 16–18 spec a full
   Framework→Control→Evidence→Test→Finding→Remediation engine. `Setu_Feature_Decision_Pitch.md` Part 3
   and redline C2 recommend **evaluating buy/integrate before building natively**. For this
   frontend-mock build the resolution is: **model the data shape now (so the UI is real), defer the
   actual engine** — consistent with the mock-data layer. No native GRC backend is implied by this
   spec.

5. **Query-cache library adoption (§8.4).** Recommendation: adopt TanStack/React Query behind the
   data-layer seam for dedup/caching/stale-while-revalidate — the standard answer for the
   API-storm-at-scale concern. The alternative (hand-rolled cache or plain fetches) is cheaper to start
   but re-implements the same machinery badly and risks exactly the redundant-call problem this
   architecture exists to prevent. **Recommend adopting it; flag because it's a dependency/architecture
   choice the owner should confirm, not an IA micro-decision.**

3. **Impersonation / "View as customer".** A real super-admin capability (blueprint §16.2, roles-guide
   screen 3) — but Feature Decision Pitch Part 3 and redline C5 flag it high-risk and say "don't build
   until a genuine support need is evidenced." Resolution: **model it as a gated, reason-required,
   time-boxed, banner-visible action in the UI, but treat live implementation as deferred** — the
   button exists and is audit-wired, the real session-hijack mechanism is out of scope for the mock.

4. **Metering pipeline.** Blueprint §15 describes a full metering backend; CLAUDE.md scopes Cost &
   Analytics as one nav item, two tabs. Resolution (already the status quo): **UI surface stays
   minimal; the pipeline is Phase-5 backend scope, not inferred by this build** (redline C3).

---

## 10. What this spec does NOT include (scope guard)

- The other personas' own dashboards (Platform Engineer, Auditor, etc.) — only Founder's surface and
  the role-assignment surface that governs them.
- A financial ledger / credits engine (Stigg) — blueprint §2 forbids; BoSS owns accounting.
- A public Trust Center or AI-drafted questionnaires (Vanta/Drata) — Setu is internal.
- AI-agent SDLC orchestration (Port).
- SSO / external IdP configuration itself.
- A native GRC engine, a live metering backend, or a live impersonation session mechanism (see §9 —
  data shapes modelled, engines deferred).
- The real backend itself — but every data shape, endpoint contract, and call-discipline rule in §8 is
  designed so that backend is a drop-in behind the data-layer seam, not a rewrite.

---

## 11. Build order (first pass — refined in the implementation plan)

Ordered to keep each step in a working, viewable state (CLAUDE.md session rule), mock data staying in
the single typed `lib/mock-data/` layer.

0. **Data-layer contract + query-cache seam** (§8) — establish the hook-per-resource boundary, the
   one-read-per-view / paginated-list shapes, and the query-cache layer **first**, then migrate shipped
   screens onto it. Everything after this step is built against the contract, so no screen has to be
   re-plumbed when the backend lands.
1. **Sidebar refactor** → the 8 top-level items with tabs, folding shipped pages (Cost & Analytics,
   Control Room, etc.) under their new parents. Non-destructive; existing routes redirect/fold in.
2. **Permission-model flip** → remove read-only ceilings, surface the action buttons existing screens
   were hiding; wire every action to the reason-dialog + audit pattern.
3. **Role & Access Management** (§4) — the net-new super-admin core (highest-leverage zero-code gap).
4. **Product/workspace/subscription CRUD** (§5) — create/edit/archive/plan-change actions.
5. **The nine 360 views** (§3.5) — with the Standard Drill-Down + Cross-Cutting Metadata models baked
   into the mock-data types; Product 360 consolidation first (§5.2).
6. **Customer-health signal** (§6.1) — net-new data + Control Room/Workspace wiring.
7. **Unhide + build Integrations, Privacy, Partners, Catalogue & Rules** (§7) at research depth.
8. **Global Search / Command + Notifications feed** (§3.3) in the top bar.

Field-level detail for each step: `Setu_Founder_Executive_Data_Inventory`. Permission/visibility rules:
this document.
