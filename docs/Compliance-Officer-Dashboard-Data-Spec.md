# Sahayogi Setu — Compliance Officer Dashboard Data Specification

**Purpose:** Exact data, KPIs, and chart types for every sidebar section the Compliance Officer sees. Built in the same structure as `Founder-Dashboard-Data-Spec.md` and `Engineering-Lead-Dashboard-Data-Spec.md`, so all three read as a matched set.

**Why this file exists:** `Compliance-Officer-Claude-Code-Instructions.md` (written earlier) cited this file plus a `Compliance-Officer-Codebase-Build-Guide.md` as "already researched, use directly." Neither existed anywhere in the repo — confirmed by a full recursive listing of `docs/` and `.claude/` and a content search. This file replaces that gap. Everything below is pulled directly from `Sahayogi_Setu_V2_Detailed_Blueprint.docx` (§7, §17, §26, §31, UC-14, UC-15) and `Setu_V2_Team_Roles_and_Screen_Design_Guide.docx` (screens 14, 15, 16, 17, 18), extracted and read in full — not inferred.

**Frozen rule, unchanged from the Founder/Eng Lead specs:** Sidebar item *names* never change across personas. Only *visibility* and *which widgets render* change per role.

---

## 0. Sidebar — status and one flagged discrepancy

`Sidebar.tsx` already ships a role-parameterized `NAV_ITEMS_BY_PERSONA` map with a `COMPLIANCE_OFFICER_NAV_ITEMS` entry — no sidebar code change needed for this persona.

| Item (label) | Route slug (as shipped) | Route slug (per locked taxonomy memory) |
|---|---|---|
| Compliance | `compliance` | `compliance` |
| Risk & Vendors | `risk-vendors` | `risks-vendors` |
| Privacy Requests | `privacy-requests` | `privacy-requests` |
| Access Reviews | `access-reviews` | `access-reviews` |
| Audit | `audit-explorer` | `audit-explorer` |

**Flagged, not resolved:** the shipped route is `risk-vendors` (singular "risk"); the taxonomy doc says `risks-vendors`. Keeping the shipped slug as-is — renaming a live route is a bigger disruption than a one-word doc mismatch. Noting it here so it isn't silently forgotten.

---

## 1. Risk & Vendors (`risk-vendors`) — build first

**Compliance Officer's question [Blueprint §7, screen 18]:** *"What could hurt us, and what are we doing about it?"*

Existing components confirmed as exact fits — reuse unchanged:
- `RiskHeatMap` (`components/shared/charts/RiskHeatMap.tsx`) — takes `{ id, label, likelihood, impact }[]`, 5×5 grid, already used by Founder's Compliance-Risk tab.
- `lib/mock-data/compliance-risk.ts` already has `topRisks: RiskRow[]` and `vendorTable` — extend in place, don't fork a new file.

### Risk register fields [Blueprint §17.5]

| Field | Notes |
|---|---|
| Description and category | `category` is new — not in current `RiskRow` type |
| Scope | asset / product / vendor / workspace — new field |
| Inherent likelihood/impact | current `RiskRow` has `likelihood`/`impact` — treat as inherent |
| Residual likelihood/impact | new — after existing controls applied |
| Existing controls | new — links/text to controls that reduce this risk |
| Treatment | mitigate / transfer / avoid / accept — current `treatmentStatus` is free text ("Escalated", "In treatment", "Monitoring"); needs to map onto or extend this enum |
| Owner, due date, review cadence | owner/dueDate already exist; review cadence is new |
| Links | to incidents, findings, vendors, remediation — new |

**Risk likelihood/impact methodology** — §17.5 says "approved methodology," doesn't define one. `RiskHeatMap`'s existing 5×5 scale is the reasonable default already in use; treat as provisional, not policy-confirmed.

### Vendor governance fields [Blueprint §17.6, screen 18's Vendors tab]

| Field | Notes |
|---|---|
| Vendor/service + business owner | `vendorTable` has vendor/service, no business owner yet |
| Criticality + dependent products | criticality exists; dependent-products list is new |
| Data categories shared/processed | new |
| Security/privacy review status | `lastReview` date exists; a status (not just a date) is new |
| Contract/DPA/renewal metadata | `renewalDate` exists; DPA reference is new |
| Known risks + compensating controls | new — link back to risk register |
| Incident history | new |
| Offboarding/exit requirements | new |

### Layout
- `TabBar`: Risks / Vendors (mirrors Founder's existing Compliance-Risk tab pattern)
- Risks tab: `RiskHeatMap` + risk register `DataTable` (filterable by treatment status, per existing `TableToolbar` pattern)
- Vendors tab: vendor `DataTable` (filterable by criticality, existing pattern)

---

## 2. Compliance (`compliance`) — landing page

**Compliance Officer's question [screen 16]:** *"Are our controls working, and is the evidence ready?"*

### Header — 5 KPI tiles

Per screen 16's header spec verbatim: **controls effective, controls failed or with exceptions, evidence due this month, findings overdue, open privacy requests.**

**Correction to the earlier instructions file:** it asserted these 5 tiles should use "the exact §26 names." §26's Compliance row is actually a *different* list — `control effectiveness, evidence completion, findings ageing, remediation overdue, risk treatment` — these are reporting/analytics metric framings (rates and ageing), not the same 5 things as screen 16's header tiles (mostly raw counts). Use screen 16's list for the KPI tiles; §26's list is reserved for a future analytics/reporting view, not this landing page.

| KPI | Source |
|---|---|
| Controls effective | count where control status = Effective |
| Controls failed / with exceptions | count where status = Exception or Failed |
| Evidence due this month | count, evidence source items due |
| Findings overdue | count, remediation past due date |
| Open privacy requests | count, UC-14 cases not yet complete |

### Main body
- **Frameworks with coverage** — `FrameworkScoreGrid` (`columns={3}`) for ISO 27001 / DPDPA / GDPR — `controlsEffectiveByFramework` in mock data already fits this shape exactly.
- **Controls due** — list/table, upcoming by due date
- **Findings ageing** — `findingsOverdueList` already exists, close fit

### Detail tabs
Controls, Evidence, Findings, Data governance. **Privacy requests is deliberately dropped as a tab here** — it's already the sidebar's own top-level item; a tab would duplicate it.

### Layout
4-column grid, same pattern as Engineering Lead's dashboard: `GreetingCard` (`col-span-3`) + `CalendarCard` (`col-span-1 row-span-2`) in the top row, KPI tiles below/beside per the existing responsive basis classes.

### Legal-validation disclaimer
Appears on this screen (and on Control 360, below) — see §5.

---

## 3. Control 360 — drill-down only, not a sidebar item

**Compliance Officer's question [screen 17]:** *"Is this one control designed, operated and evidenced?"*

Reached via `DrillLink` from the Compliance screen's Controls tab (same drill-down pattern as Founder's Audit Explorer). 11 fields, verbatim from §17.3:

Control ID, Statement, Owner, Frequency, Implementation, Evidence Source, Framework Mapping, Test Method, Status (not due / due / in progress / effective / exception / failed), Findings, Remediation (action, owner, due date, verification).

Plus evidence snapshot metadata [§17.4]: population reviewed, result, collector, period, source, collection time, related control run.

Actions: run test, attach evidence, raise finding — each gated by the confirmation/reason dialog (§6).

Legal-validation disclaimer appears here too (§5).

---

## 4. Privacy Requests (`privacy-requests`)

**UC-14 [Blueprint, verbatim]:** Verified eligible privacy request → Setu orchestrates scope, retention/legal checks, product-specific tasks, exceptions and evidence → request tracked end-to-end without Setu directly owning all source data.

**§31 open decision, unresolved — build the narrowest option:** Privacy operations model is one of Case orchestration only / Automated product tasks / Phased by product maturity. Build **case-orchestration-only** — a shell that tracks the case through its stages, not one that executes automated deletion/correction tasks against product systems.

### Fields
- Verified request intake reference
- Identity/scope validation status
- Data-system discovery (which product registries the request touches)
- Retention/legal-hold check result
- Tasks to authoritative products (tracked as a checklist/status list, not executed)
- Exception handling / approvals
- Completion verification + evidence package
- Request type: access / correction / deletion-erasure (separate workflows per §17.7, same shell)

### Layout
`DataTable` of privacy request cases (status, requester, type, days open) + `DrillLink` into a case detail panel with the fields above as a stepper/checklist. `EmptyState` when no open requests.

---

## 5. Access Reviews (`access-reviews`) — view-only for this persona

Screen 14 in the guide is written for the **Security Administrator** (who starts campaigns, records decisions, executes revocations). No `access-reviews` route exists anywhere in the codebase yet for any persona — this is a new build.

Per the earlier instructions file, Compliance Officer's version is explicitly **read-only** — oversight, not execution:

| Element | Source | Compliance Officer sees it? |
|---|---|---|
| Campaign name, period, progress, due date | screen 14 header | Yes |
| Population snapshot, reviewer, decision (retain/modify/revoke), execution status | screen 14 body | Yes, read-only |
| Start campaign / record decision / execute revocations | screen 14 actions | **No** — Security Administrator only |
| Export evidence | screen 14 actions | Yes — matches the persona's own "export evidence in minutes" done-when test |

### Layout
Simple `DataTable`: one row per campaign, expandable to the population snapshot. No action buttons except export.

---

## 6. Audit (`audit-explorer`) — reused unchanged

Reuse Founder's/Engineering Lead's existing built screen (`app/founder/audit-explorer/page.tsx` pattern), scoped read + export only — same as how Engineering Lead already reuses it. No new component work.

---

## 7. Two new shared components (confirmed: neither exists anywhere in the repo)

### 7.1 Confirmation/reason dialog
Generic — not Compliance-specific. Checked Engineering Lead's rollback-approval action (`app/engineering-lead/dashboard/page.tsx`): it's a bare button calling `approveRollback()` directly, no dialog. So this is the **first** persona that actually needs one, contrary to the earlier instructions file's assumption that Engineering Lead already built it.

Build as `components/shared/ConfirmActionDialog.tsx`: takes an action label, a required reason/notes field, confirm/cancel. Used by:
- Control 360's run test / attach evidence / raise finding
- Risk & Vendors' change-treatment / schedule-review
- Privacy Requests' complete-request / exception-approval

### 7.2 Legal-validation disclaimer banner
Generic reusable callout, `components/shared/ComplianceDisclaimerBanner.tsx` (or similar). Exact wording source, §17.1:

> "Exact legal/control mappings should be validated against the applicable framework version and legal advice before being treated as compliance conclusions."

Appears on: Compliance (screen), Control 360. Built generic enough that any future screen showing a framework/compliance status as a conclusion can reuse it.

---

## 8. Mock data — extend in place

`lib/mock-data/compliance-risk.ts` already exists and is used by Founder's/Engineering Lead's simplified Compliance-Risk tab. Extend its types and exports in place (add the new fields listed in §1–§5 above) rather than forking a second file — keeps one typed source of truth per the project's data-layer convention. Founder's/Eng Lead's existing `ComplianceRiskContent.tsx` reads from the same exports, so extending fields must not break their existing usage (additive fields only, don't rename/remove what's already consumed there).

New exports needed: `controlRecords` (11-field shape), `evidenceItems`, `privacyRequests`, `accessReviewCampaigns`.

---

## 9. Verification checklist (from the earlier instructions file, still valid)

- [ ] Sidebar shows exactly 5 Compliance Officer items, correct routes, reused icons
- [ ] Compliance landing grid matches spec: `GreetingCard col-span-3`, `CalendarCard col-span-1 row-span-2`
- [ ] The 5 KPI tiles match screen 16's header list exactly (not §26's list — see §2's correction above)
- [ ] `RiskHeatMap` and `FrameworkScoreGrid` reused as-is — if either needed modification, note why
- [ ] Legal-validation disclaimer appears on both Compliance and Control 360
- [ ] Confirmation/reason dialog gates every run-test/attach-evidence/raise-finding/change-treatment/complete-request action
- [ ] Access Reviews has no start-campaign/record-decision/execute-revocation actions for this persona — export only
- [ ] No hardcoded hex where a token exists; no new npm dependency added
- [ ] Exporting evidence for an access review takes a few clicks from the Compliance screen (the persona's own done-when test)

---

## 10. What's still unresolved — don't build as if settled

| Item | Status |
|---|---|
| Privacy operations model | Unresolved [§31] — building case-orchestration shell only, per above |
| Risk likelihood/impact methodology | §17.5 requires "approved methodology," undefined — using `RiskHeatMap`'s existing 5×5 scale as a provisional default |
| `risk-vendors` vs `risks-vendors` route naming | Shipped code and taxonomy doc disagree — keeping shipped slug, flagged in §0 |
