# Compliance Officer Persona Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the third persona, Compliance Officer, on top of the existing Founder/Engineering Lead shell: 5 routed screens (Risk & Vendors, Compliance landing, Privacy Requests, Access Reviews, Audit — reused), 2 new generic shared components (confirmation dialog, legal-validation disclaimer), extended mock data, and a persona-routing fix the build exposes.

**Architecture:** Same pattern as Engineering Lead — `app/compliance-officer/<slug>/page.tsx` route files reading from a single extended `lib/mock-data/compliance-risk.ts`, composed from existing shared components (`Card`, `KPITile`, `DataTable`, `FrameworkScoreGrid`, `RiskHeatMap`, `TabBar`, `TableToolbar`, `StatusBadge`, `EmptyState`, `GreetingCard`, `CalendarCard`) plus two new ones. No new npm dependency. No backend — mock data only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (CSS variables from `app/globals.css`), lucide-react icons. No test runner exists in this repo (`package.json` has no jest/vitest — only `lint`), so verification is `npx tsc --noEmit` + `npm run lint` + manual check in the dev server, matching how Founder and Engineering Lead were actually built and how `CLAUDE.md`'s session plan defines "done" (run the dev server, check in the browser).

## Global Constraints

- No component library — hand-built Tailwind only (`CLAUDE.md`).
- No hardcoded hex where a token exists in `app/globals.css` — use `var(--...)`.
- Mock data lives in `lib/mock-data/` typed layer; extend `compliance-risk.ts` in place, additive fields only — don't break Founder's/Engineering Lead's existing `ComplianceRiskContent.tsx` and `app/founder/compliance-risk`/`app/engineering-lead/compliance-risk` consumers.
- Sidebar item names/routes are frozen per persona taxonomy; `Sidebar.tsx`'s `COMPLIANCE_OFFICER_NAV_ITEMS` already has the 5 correct slugs — do not touch that array.
- No new npm dependency.
- Every new/changed screen must be checked in the running dev server at `/compliance-officer/...` before the task is considered done.
- Legal-validation disclaimer wording must match §17.1 verbatim: "Exact legal/control mappings should be validated against the applicable framework version and legal advice before being treated as compliance conclusions."

---

### Task 1: Fix persona home-route hardcoding (blocks everything else)

**Problem:** `Sidebar.tsx`'s logo `<Link>` and `Header.tsx`'s dev persona-switcher both hardcode `${routeBase}/dashboard`. Compliance Officer has no `dashboard` route — its landing page is `compliance`. Without this fix, clicking the Setu logo or switching to Compliance Officer 404s.

**Files:**
- Modify: `lib/personas.ts`
- Modify: `components/shell/Sidebar.tsx:169` (logo `href`)
- Modify: `components/shell/Header.tsx:409` (persona switcher `router.push`)

**Interfaces:**
- Produces: `PersonaConfig.homeSlug: string` — every later task's route files are unaffected by this, but Task 1 must land first so navigation into the new persona works at all.

- [ ] **Step 1: Add `homeSlug` to `PersonaConfig`**

In `lib/personas.ts`, add `homeSlug` to the type and to each of the three entries:

```ts
export type PersonaConfig = {
  id: Persona;
  label: string;
  routeBase: string;
  homeSlug: string;
  identity: {
    name: string;
    role: string;
    initials: string;
  };
};

export const PERSONAS: Record<Persona, PersonaConfig> = {
  founder: {
    id: "founder",
    label: "Founder",
    routeBase: "/founder",
    homeSlug: "dashboard",
    identity: { name: "Dhruv Singla", role: "Founder", initials: "DS" },
  },
  "engineering-lead": {
    id: "engineering-lead",
    label: "Engineering Lead",
    routeBase: "/engineering-lead",
    homeSlug: "dashboard",
    identity: { name: "Priyanka Rao", role: "Engineering Lead", initials: "PR" },
  },
  "compliance-officer": {
    id: "compliance-officer",
    label: "Compliance Officer",
    routeBase: "/compliance-officer",
    homeSlug: "compliance",
    identity: { name: "Neha Kapoor", role: "Compliance Officer", initials: "NK" },
  },
};
```

- [ ] **Step 2: Use `homeSlug` in the Sidebar logo link**

In `components/shell/Sidebar.tsx`, change:
```tsx
href={`${persona.routeBase}/dashboard`}
```
to:
```tsx
href={`${persona.routeBase}/${persona.homeSlug}`}
```

- [ ] **Step 3: Use `homeSlug` in the Header dev persona switcher**

In `components/shell/Header.tsx`, change:
```tsx
router.push(`${p.routeBase}/dashboard`);
```
to:
```tsx
router.push(`${p.routeBase}/${p.homeSlug}`);
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (Founder/Engineering Lead still resolve `dashboard`, unchanged behavior).

- [ ] **Step 5: Commit**

```bash
git add lib/personas.ts components/shell/Sidebar.tsx components/shell/Header.tsx
git commit -m "fix: derive persona home route from config instead of hardcoding /dashboard"
```

---

### Task 2: Extend mock data — `lib/mock-data/compliance-risk.ts` and `lib/mock-data/types.ts`

**Files:**
- Modify: `lib/mock-data/types.ts`
- Modify: `lib/mock-data/compliance-risk.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces (used by Tasks 6–9): `RiskRow` (extended, optional new fields), `VendorRow` type + extended `vendorTable`, `ControlRecord` type + `controlRecords`, `EvidenceItem` type + `evidenceItems`, `PrivacyRequest` type + `privacyRequests`, `AccessReviewCampaign` type + `accessReviewCampaigns`, `complianceLandingKpis`.

- [ ] **Step 1: Extend `RiskRow` in `lib/mock-data/types.ts` — additive only**

```ts
export type RiskTreatment = "Mitigate" | "Transfer" | "Avoid" | "Accept";

export type RiskRow = {
  id: string;
  label: string;
  owner: string;
  likelihood: number;
  impact: number;
  treatmentStatus: string;
  dueDate: string;
  // New, optional — Founder's/Eng Lead's existing ComplianceRiskContent.tsx doesn't read these, so it keeps working unchanged.
  category?: string;
  scope?: string;
  residualLikelihood?: number;
  residualImpact?: number;
  existingControls?: string;
  treatment?: RiskTreatment;
  reviewCadence?: string;
  links?: { incidents?: string[]; findings?: string[]; vendors?: string[] };
};
```

- [ ] **Step 2: Typecheck after the type change**

Run: `npx tsc --noEmit`
Expected: no errors (all new fields optional, existing `topRisks` literals still satisfy the type).

- [ ] **Step 3: Add new types and exports to `lib/mock-data/compliance-risk.ts`**

Append below the existing `vendorTable` export (keep `vendorTable`'s existing 4 entries and fields untouched — extend each object with new optional fields):

```ts
export type ControlRecord = {
  id: string;
  controlId: string;
  statement: string;
  owner: string;
  frequency: "Continuous" | "Monthly" | "Quarterly" | "Annual" | "Event-driven";
  implementation: string;
  evidenceSource: string;
  frameworkMapping: string;
  testMethod: string;
  status: "Not due" | "Due" | "In progress" | "Effective" | "Exception" | "Failed";
  findings: string;
  remediation: { action: string; owner: string; dueDate: string; verification: string } | null;
};

export const controlRecords: ControlRecord[] = [
  {
    id: "ctrl-1",
    controlId: "SEC-IAM-004",
    statement: "Logical access reviewed quarterly",
    owner: "Priya N.",
    frequency: "Quarterly",
    implementation: "Automated export of privileged-access population from Sahayogi One, reviewed by service owners",
    evidenceSource: "System-generated (Sahayogi One access export)",
    frameworkMapping: "ISO 27001 A.9.2.5, DPDP Act security safeguards",
    testMethod: "Sample 10% of reviewed population, confirm decision recorded and executed",
    status: "Due",
    findings: "None open",
    remediation: null,
  },
  {
    id: "ctrl-2",
    controlId: "SEC-ENC-002",
    statement: "Encryption at rest for customer PII",
    owner: "Arjun M.",
    frequency: "Continuous",
    implementation: "AWS KMS-managed encryption on all PII-classified data stores",
    evidenceSource: "System-generated (KMS key policy export)",
    frameworkMapping: "ISO 27001 A.10.1.1, GDPR Art. 32",
    testMethod: "Automated config scan confirms encryption enabled on all classified stores",
    status: "Effective",
    findings: "None",
    remediation: null,
  },
  {
    id: "ctrl-3",
    controlId: "VEN-DPA-001",
    statement: "Vendor DPA on file before onboarding",
    owner: "Priya N.",
    frequency: "Event-driven",
    implementation: "Legal checklist gate in vendor onboarding workflow",
    evidenceSource: "Manual — signed DPA upload",
    frameworkMapping: "DPDP Act, GDPR Art. 28",
    testMethod: "Sample new vendors this quarter, confirm DPA on file before first data flow",
    status: "Exception",
    findings: "Twilio DPA renewal lapsed 4 days — see Findings tab",
    remediation: { action: "Renew Twilio DPA", owner: "Priya N.", dueDate: "2026-09-30", verification: "Legal sign-off + upload" },
  },
  {
    id: "ctrl-4",
    controlId: "SEC-IR-003",
    statement: "Incident response runbook tested",
    owner: "Arjun M.",
    frequency: "Annual",
    implementation: "Tabletop exercise against the current runbook",
    evidenceSource: "Manual — exercise report attestation",
    frameworkMapping: "ISO 27001 A.16.1",
    testMethod: "Exercise report reviewed for completeness against runbook steps",
    status: "Effective",
    findings: "None",
    remediation: null,
  },
];

export type EvidenceItem = {
  id: string;
  controlId: string;
  source: "System-generated" | "Manual";
  collectedAt: string;
  collector: string;
  period: string;
  populationReviewed: string;
  result: string;
};

export const evidenceItems: EvidenceItem[] = [
  { id: "ev-1", controlId: "SEC-IAM-004", source: "System-generated", collectedAt: "2026-09-20", collector: "system:access-export", period: "Q3 2026", populationReviewed: "118 privileged accounts", result: "41 pending review" },
  { id: "ev-2", controlId: "SEC-ENC-002", source: "System-generated", collectedAt: "2026-09-18", collector: "system:kms-scan", period: "September 2026", populationReviewed: "All PII-classified stores (14)", result: "14/14 encrypted" },
  { id: "ev-3", controlId: "VEN-DPA-001", source: "Manual", collectedAt: "2026-09-10", collector: "priya.n@sahayogi.in", period: "Q3 2026 onboarding", populationReviewed: "3 new vendors", result: "2/3 DPA on file, 1 exception (Twilio renewal)" },
];

export type PrivacyRequestType = "Access" | "Correction" | "Deletion";
export type PrivacyRequestStatus = "Intake" | "Scope validation" | "Legal hold check" | "Tasks in progress" | "Exception" | "Complete";

export type PrivacyRequest = {
  id: string;
  requester: string;
  type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  openedDate: string;
  daysOpen: number;
  scopeValidated: boolean;
  legalHoldClear: boolean | null;
  tasksToProducts: { product: string; status: "Pending" | "Done" }[];
  exceptions: string | null;
  completionEvidence: string | null;
};

export const privacyRequests: PrivacyRequest[] = [
  {
    id: "pr-1",
    requester: "Anjali Verma (Mehta Pharma)",
    type: "Deletion",
    status: "Tasks in progress",
    openedDate: "2026-09-18",
    daysOpen: 6,
    scopeValidated: true,
    legalHoldClear: true,
    tasksToProducts: [
      { product: "Sahayogi One", status: "Done" },
      { product: "Chat with Sahayogi", status: "Pending" },
      { product: "Tax Sahayogi", status: "Pending" },
    ],
    exceptions: null,
    completionEvidence: null,
  },
  {
    id: "pr-2",
    requester: "Rohit Sharma (Verma Logistics)",
    type: "Access",
    status: "Complete",
    openedDate: "2026-09-05",
    daysOpen: 3,
    scopeValidated: true,
    legalHoldClear: true,
    tasksToProducts: [{ product: "Sahayogi One", status: "Done" }],
    exceptions: null,
    completionEvidence: "Export package sent 2026-09-08, receipt confirmed",
  },
  {
    id: "pr-3",
    requester: "Neeraj Gupta (Acme Traders)",
    type: "Correction",
    status: "Legal hold check",
    openedDate: "2026-09-22",
    daysOpen: 2,
    scopeValidated: true,
    legalHoldClear: null,
    tasksToProducts: [],
    exceptions: null,
    completionEvidence: null,
  },
];

export type AccessReviewCampaign = {
  id: string;
  name: string;
  period: string;
  dueDate: string;
  populationCount: number;
  reviewedCount: number;
  status: "Open" | "Closed";
};

export const accessReviewCampaigns: AccessReviewCampaign[] = [
  { id: "arc-1", name: "Q3 2026 privileged access review", period: "Q3 2026", dueDate: "2026-09-27", populationCount: 118, reviewedCount: 77, status: "Open" },
  { id: "arc-2", name: "Q2 2026 privileged access review", period: "Q2 2026", dueDate: "2026-06-28", populationCount: 104, reviewedCount: 104, status: "Closed" },
];

export const complianceLandingKpis = {
  controlsEffective: controlRecords.filter((c) => c.status === "Effective").length,
  controlsFailedOrException: controlRecords.filter((c) => c.status === "Exception" || c.status === "Failed").length,
  evidenceDueThisMonth: complianceKpis.evidenceDueThisMonth,
  findingsOverdue: complianceKpis.findingsOverdue,
  openPrivacyRequests: privacyRequests.filter((p) => p.status !== "Complete").length,
};
```

Extend the existing `vendorTable` entries in place with new optional fields (add a `VendorRow` type above it first):

```ts
export type VendorRow = {
  id: string;
  vendor: string;
  service: string;
  criticality: "High" | "Critical";
  renewalDate: string;
  lastReview: string;
  businessOwner?: string;
  dependentProducts?: string[];
  dataCategories?: string[];
  reviewStatus?: "Up to date" | "Due" | "Overdue";
  dpaReference?: string;
  knownRisks?: string;
  incidentHistory?: string;
  exitRequirements?: string;
};

export const vendorTable: VendorRow[] = [
  { id: "v1", vendor: "Twilio", service: "SMS delivery", criticality: "High", renewalDate: "2026-09-30", lastReview: "2026-06-12", businessOwner: "Priya N.", dependentProducts: ["Chat with Sahayogi"], dataCategories: ["Phone numbers"], reviewStatus: "Overdue", dpaReference: "DPA-TW-2024, renewal lapsed", knownRisks: "DPA renewal lapsed — linked to VEN-DPA-001 exception", incidentHistory: "None", exitRequirements: "30-day data purge on termination" },
  { id: "v2", vendor: "Okta", service: "SSO / identity", criticality: "Critical", renewalDate: "2026-12-01", lastReview: "2026-07-01", businessOwner: "Arjun M.", dependentProducts: ["Sahayogi One", "All products"], dataCategories: ["Identity, session metadata"], reviewStatus: "Up to date", dpaReference: "DPA-OK-2025", knownRisks: "Single point of failure for SSO — linked to r1", incidentHistory: "None this year", exitRequirements: "Export identity mappings, 60-day transition window" },
  { id: "v3", vendor: "AWS", service: "Cloud infrastructure", criticality: "Critical", renewalDate: "2027-03-15", lastReview: "2026-08-01", businessOwner: "Arjun M.", dependentProducts: ["All products"], dataCategories: ["All classified data"], reviewStatus: "Up to date", dpaReference: "AWS DPA (standard)", knownRisks: "Single cloud region — linked to r4", incidentHistory: "None this year", exitRequirements: "Standard AWS data export tooling" },
  { id: "v4", vendor: "Meta (WhatsApp BSP)", service: "WhatsApp messaging", criticality: "High", renewalDate: "2026-10-10", lastReview: "2026-05-20", businessOwner: "Priya N.", dependentProducts: ["Chat with Sahayogi"], dataCategories: ["Phone numbers, message metadata"], reviewStatus: "Due", dpaReference: "DPA-META-2024", knownRisks: "Throughput cap during peak — linked to r2", incidentHistory: "One rate-limit incident, 2026-08-14", exitRequirements: "90-day migration window to alternate BSP" },
];
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/mock-data/types.ts lib/mock-data/compliance-risk.ts
git commit -m "feat: extend compliance-risk mock data with controls, evidence, privacy requests, access reviews"
```

---

### Task 3: Build `ConfirmActionDialog` (generic, first persona to need it)

**Files:**
- Create: `components/shared/ConfirmActionDialog.tsx`

**Interfaces:**
- Produces: `ConfirmActionDialog` component with props `{ open, actionLabel, description?, onConfirm(reason), onCancel }`. Used by Tasks 7 and 9.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ConfirmActionDialog({
  open,
  actionLabel,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  actionLabel: string;
  description?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-[var(--card-radius)] border border-[var(--card-border)] bg-white p-[var(--card-pad)]"
        style={{ boxShadow: "var(--card-shadow-hover)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-[var(--space-sm)] flex items-start justify-between gap-2">
          <h2 className="text-[length:var(--font-card-title)] font-semibold text-[var(--text-heading)]">{actionLabel}</h2>
          <button type="button" onClick={onCancel} className="tap-pop rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--search-bg)]">
            <X size={16} />
          </button>
        </div>
        {description && <p className="mb-[var(--space-sm)] text-sm text-[var(--role-text)]">{description}</p>}
        <label className="mb-1 block text-xs font-medium text-[var(--role-text)]">Reason (required)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mb-[var(--space-md)] w-full rounded-lg border border-[var(--divider)] bg-white p-2 text-sm text-[var(--text-heading)] outline-none focus:border-[var(--icon-btn-navy)]"
          placeholder="Why is this action being taken?"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="tap-pop rounded-lg border border-[var(--divider)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--search-bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={reason.trim().length === 0}
            onClick={() => onConfirm(reason.trim())}
            className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/ConfirmActionDialog.tsx
git commit -m "feat: add generic ConfirmActionDialog shared component"
```

---

### Task 4: Build `ComplianceDisclaimerBanner`

**Files:**
- Create: `components/shared/ComplianceDisclaimerBanner.tsx`

**Interfaces:**
- Produces: `ComplianceDisclaimerBanner` component, no props needed (fixed §17.1 wording). Used by Tasks 7 (Control 360 panel) and 8 (Compliance landing).

- [ ] **Step 1: Write the component**

```tsx
import { AlertTriangle } from "lucide-react";

export default function ComplianceDisclaimerBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--card-radius)] border border-[var(--status-warning-bg)] bg-[var(--status-warning-bg)] p-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" color="var(--status-warning-fg)" />
      <p className="text-xs text-[var(--status-warning-fg)]">
        Exact legal/control mappings should be validated against the applicable framework version and legal advice before being treated as compliance conclusions.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/ComplianceDisclaimerBanner.tsx
git commit -m "feat: add ComplianceDisclaimerBanner shared component"
```

---

### Task 5: Extract `AuditExplorerContent` so Compliance Officer can reuse Founder's Audit Explorer unchanged

**Problem:** The instructions file assumed Engineering Lead already reuses Founder's Audit Explorer — checked, it's actually still a `ComingSoon` stub there. Founder's `audit-explorer/page.tsx` has all its logic inline, so there's nothing to literally import yet. Extract it once so both Founder and Compliance Officer (and Engineering Lead later) render the same component.

**Files:**
- Create: `components/shared/AuditExplorerContent.tsx`
- Modify: `app/founder/audit-explorer/page.tsx`

**Interfaces:**
- Produces: `AuditExplorerContent` component, no props (reads `lib/mock-data/audit-explorer` directly, same as today). Used by Task 6.

- [ ] **Step 1: Create `components/shared/AuditExplorerContent.tsx`**

Move the entire current body of `app/founder/audit-explorer/page.tsx` (all of it — imports, `RESULT_FILTERS`, the component function including its two-level `Stat` helper) into this new file unchanged, renaming the default export function from `AuditExplorerPage` to `AuditExplorerContent`. Add `"use client";` at the top (already present in the source).

- [ ] **Step 2: Replace `app/founder/audit-explorer/page.tsx` with a thin wrapper**

```tsx
import AuditExplorerContent from "@/components/shared/AuditExplorerContent";

export default function Page() {
  return <AuditExplorerContent />;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/founder/audit-explorer`
Expected: renders identically to before the extraction (same KPI tiles, table, export button).

- [ ] **Step 5: Commit**

```bash
git add components/shared/AuditExplorerContent.tsx app/founder/audit-explorer/page.tsx
git commit -m "refactor: extract AuditExplorerContent so other personas can reuse it"
```

---

### Task 6: `app/compliance-officer/audit-explorer/page.tsx`

**Files:**
- Create: `app/compliance-officer/audit-explorer/page.tsx`

**Interfaces:**
- Consumes: `AuditExplorerContent` from Task 5.

- [ ] **Step 1: Write the page**

```tsx
import AuditExplorerContent from "@/components/shared/AuditExplorerContent";

export default function Page() {
  return <AuditExplorerContent />;
}
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/compliance-officer/audit-explorer`
Expected: same event log/KPI tiles as Founder's Audit Explorer; sidebar "Audit" item highlighted.

- [ ] **Step 3: Commit**

```bash
git add app/compliance-officer/audit-explorer/page.tsx
git commit -m "feat: add Compliance Officer Audit screen (reused)"
```

---

### Task 7: `app/compliance-officer/risk-vendors/page.tsx`

**Files:**
- Create: `app/compliance-officer/risk-vendors/page.tsx`

**Interfaces:**
- Consumes: `topRisks`, `vendorTable` (extended, Task 2), `RiskHeatMap`, `TabBar`/`useActiveTab`, `DataTable`, `TableToolbar`, `StatusBadge`, `ConfirmActionDialog` (Task 3).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useMemo, useState } from "react";
import Card from "@/components/shared/Card";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import RiskHeatMap from "@/components/shared/charts/RiskHeatMap";
import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import { topRisks, vendorTable, type RiskRow, type VendorRow } from "@/lib/mock-data/compliance-risk";

const TABS = [
  { id: "risks", label: "Risks" },
  { id: "vendors", label: "Vendors" },
];

const TREATMENT_FILTERS = [
  { value: "all", label: "All" },
  { value: "Escalated", label: "Escalated" },
  { value: "In treatment", label: "In treatment" },
  { value: "Monitoring", label: "Monitoring" },
];

const CRITICALITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High" },
];

export default function RiskVendorsPage() {
  const active = useActiveTab(TABS);
  const [treatmentFilter, setTreatmentFilter] = useState("all");
  const [criticalityFilter, setCriticalityFilter] = useState("all");
  const [pendingRisk, setPendingRisk] = useState<RiskRow | null>(null);
  const [riskList, setRiskList] = useState<RiskRow[]>(topRisks);

  const filteredRisks = useMemo(
    () => riskList.filter((r) => treatmentFilter === "all" || r.treatmentStatus === treatmentFilter),
    [riskList, treatmentFilter]
  );
  const filteredVendors = useMemo(
    () => vendorTable.filter((v) => criticalityFilter === "all" || v.criticality === criticalityFilter),
    [criticalityFilter]
  );

  function changeTreatment(reason: string) {
    if (!pendingRisk) return;
    setRiskList((current) =>
      current.map((r) => (r.id === pendingRisk.id ? { ...r, treatmentStatus: "In treatment", existingControls: `${r.existingControls ?? ""} — reviewed: ${reason}`.trim() } : r))
    );
    setPendingRisk(null);
  }

  const riskColumns: Column<RiskRow>[] = [
    { key: "label", header: "Risk", render: (r) => <span className="font-medium">{r.label}</span>, sortValue: (r) => r.label },
    { key: "category", header: "Category", render: (r) => r.category ?? "—" },
    { key: "owner", header: "Owner", render: (r) => r.owner, sortValue: (r) => r.owner },
    { key: "treatment", header: "Treatment", render: (r) => <StatusBadge status={r.treatmentStatus === "Escalated" ? "critical" : r.treatmentStatus === "In treatment" ? "warning" : "info"} label={r.treatmentStatus} /> },
    { key: "dueDate", header: "Due", render: (r) => r.dueDate, sortValue: (r) => r.dueDate },
    {
      key: "action",
      header: "",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPendingRisk(r);
          }}
          className="tap-pop rounded-lg border border-[var(--divider)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--search-bg)]"
        >
          Change treatment
        </button>
      ),
    },
  ];

  const vendorColumns: Column<VendorRow>[] = [
    { key: "vendor", header: "Vendor", render: (r) => <span className="font-medium">{r.vendor}</span>, sortValue: (r) => r.vendor },
    { key: "service", header: "Service", render: (r) => r.service },
    { key: "criticality", header: "Criticality", render: (r) => <StatusBadge status={r.criticality === "Critical" ? "critical" : "warning"} label={r.criticality} /> },
    { key: "reviewStatus", header: "Review status", render: (r) => r.reviewStatus ?? "—" },
    { key: "renewalDate", header: "Renewal", render: (r) => r.renewalDate, sortValue: (r) => r.renewalDate },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <TabBar tabs={TABS} />

      {active === "risks" ? (
        <div className="flex flex-col gap-[var(--space-md)]">
          <Card title="Risk heat map">
            <RiskHeatMap risks={riskList} />
          </Card>
          <Card title="Risk register">
            <TableToolbar filterOptions={TREATMENT_FILTERS} activeFilter={treatmentFilter} onFilterChange={setTreatmentFilter} />
            <DataTable
              columns={riskColumns}
              rows={filteredRisks}
              getRowKey={(r) => r.id}
              pageSize={6}
              emptyTitle="No risks match"
              emptyDescription="Try a different treatment filter."
              renderExpanded={(r) => (
                <dl className="grid grid-cols-1 gap-x-[var(--space-md)] gap-y-2 p-3 text-xs screen-sm:grid-cols-2">
                  <Field label="Scope" value={r.scope ?? "—"} />
                  <Field label="Existing controls" value={r.existingControls ?? "—"} />
                  <Field label="Inherent" value={`L${r.likelihood} x I${r.impact} = ${r.likelihood * r.impact}`} />
                  <Field label="Residual" value={r.residualLikelihood && r.residualImpact ? `L${r.residualLikelihood} x I${r.residualImpact} = ${r.residualLikelihood * r.residualImpact}` : "—"} />
                  <Field label="Review cadence" value={r.reviewCadence ?? "—"} />
                </dl>
              )}
            />
          </Card>
        </div>
      ) : (
        <Card title="Vendor governance">
          <TableToolbar filterOptions={CRITICALITY_FILTERS} activeFilter={criticalityFilter} onFilterChange={setCriticalityFilter} />
          <DataTable
            columns={vendorColumns}
            rows={filteredVendors}
            getRowKey={(r) => r.id}
            pageSize={6}
            emptyTitle="No vendors match"
            emptyDescription="Try a different criticality filter."
            renderExpanded={(r) => (
              <dl className="grid grid-cols-1 gap-x-[var(--space-md)] gap-y-2 p-3 text-xs screen-sm:grid-cols-2">
                <Field label="Business owner" value={r.businessOwner ?? "—"} />
                <Field label="Dependent products" value={r.dependentProducts?.join(", ") ?? "—"} />
                <Field label="Data categories" value={r.dataCategories?.join(", ") ?? "—"} />
                <Field label="DPA reference" value={r.dpaReference ?? "—"} />
                <Field label="Known risks" value={r.knownRisks ?? "—"} />
                <Field label="Incident history" value={r.incidentHistory ?? "—"} />
                <Field label="Exit requirements" value={r.exitRequirements ?? "—"} />
              </dl>
            )}
          />
        </Card>
      )}

      <ConfirmActionDialog
        open={pendingRisk !== null}
        actionLabel={pendingRisk ? `Change treatment — ${pendingRisk.label}` : ""}
        description="Record why this risk's treatment is changing. This is logged to the audit trail."
        onConfirm={changeTreatment}
        onCancel={() => setPendingRisk(null)}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--role-text)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text-secondary)]">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/compliance-officer/risk-vendors`
Expected: Risks tab shows heat map + register table; row expand shows scope/residual/cadence; "Change treatment" opens the dialog, requires a reason, updates the badge on confirm. Vendors tab shows the extended fields on row expand.

- [ ] **Step 4: Commit**

```bash
git add app/compliance-officer/risk-vendors/page.tsx
git commit -m "feat: add Compliance Officer Risk & Vendors screen"
```

---

### Task 8: `app/compliance-officer/compliance/page.tsx` (landing page)

**Files:**
- Create: `app/compliance-officer/compliance/page.tsx`

**Interfaces:**
- Consumes: `complianceLandingKpis`, `controlsEffectiveByFramework`, `findingsOverdueList`, `controlRecords`, `evidenceItems` (Task 2), `FrameworkScoreGrid`, `KPITile`, `GreetingCard`, `CalendarCard`, `ComplianceDisclaimerBanner` (Task 4), `ConfirmActionDialog` (Task 3).

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, FileClock, AlertOctagon, FileLock2 } from "lucide-react";
import Card from "@/components/shared/Card";
import CalendarCard from "@/components/shared/CalendarCard";
import GreetingCard from "@/components/shared/GreetingCard";
import KPITile from "@/components/shared/KPITile";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import FrameworkScoreGrid from "@/components/shared/charts/FrameworkScoreGrid";
import ComplianceDisclaimerBanner from "@/components/shared/ComplianceDisclaimerBanner";
import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import {
  complianceLandingKpis,
  controlsEffectiveByFramework,
  findingsOverdueList,
  controlRecords,
  evidenceItems,
  type ControlRecord,
} from "@/lib/mock-data/compliance-risk";

const REFRESH_MS = 60_000;
const FAILURE_RATE = 0.2;

function useKpiRefresh() {
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < FAILURE_RATE) {
        setStale(true);
        return;
      }
      setUpdatedAt(new Date());
      setStale(false);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);
  return { updatedAt, stale };
}

const TABS = [
  { id: "controls", label: "Controls" },
  { id: "evidence", label: "Evidence" },
  { id: "findings", label: "Findings" },
  { id: "data-governance", label: "Data governance" },
];

const CONTROL_STATUS_TONE: Record<ControlRecord["status"], "healthy" | "warning" | "critical" | "info" | "neutral"> = {
  Effective: "healthy",
  "Not due": "neutral",
  Due: "info",
  "In progress": "info",
  Exception: "critical",
  Failed: "critical",
};

export default function ComplianceLandingPage() {
  const { updatedAt, stale } = useKpiRefresh();
  const active = useActiveTab(TABS);
  const [pendingFinding, setPendingFinding] = useState<ControlRecord | null>(null);
  const [controls, setControls] = useState<ControlRecord[]>(controlRecords);

  const raiseFinding = (reason: string) => {
    if (!pendingFinding) return;
    setControls((current) =>
      current.map((c) => (c.id === pendingFinding.id ? { ...c, findings: reason, status: "Exception" } : c))
    );
    setPendingFinding(null);
  };

  const controlColumns: Column<ControlRecord>[] = [
    { key: "controlId", header: "Control ID", render: (r) => <span className="font-mono-id text-xs">{r.controlId}</span> },
    { key: "statement", header: "Statement", render: (r) => r.statement },
    { key: "owner", header: "Owner", render: (r) => r.owner, sortValue: (r) => r.owner },
    { key: "frequency", header: "Frequency", render: (r) => r.frequency },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={CONTROL_STATUS_TONE[r.status]} label={r.status} />, sortValue: (r) => r.status },
    {
      key: "action",
      header: "",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPendingFinding(r);
          }}
          className="tap-pop rounded-lg border border-[var(--divider)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--search-bg)]"
        >
          Raise finding
        </button>
      ),
    },
  ];

  const evidenceColumns: Column<(typeof evidenceItems)[number]>[] = [
    { key: "controlId", header: "Control", render: (r) => <span className="font-mono-id text-xs">{r.controlId}</span> },
    { key: "source", header: "Source", render: (r) => r.source },
    { key: "period", header: "Period", render: (r) => r.period },
    { key: "populationReviewed", header: "Population reviewed", render: (r) => r.populationReviewed },
    { key: "result", header: "Result", render: (r) => r.result },
  ];

  const findingsColumns: Column<ControlRecord>[] = useMemo(
    () => controlColumns.filter((c) => c.key !== "action"),
    []
  );
  const controlsWithFindings = controls.filter((c) => c.findings && c.findings !== "None" && c.findings !== "None open");

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-xl:grid-cols-[1fr_25rem]">
        <div className="flex flex-wrap gap-[var(--space-md)]">
          <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
            <GreetingCard name="Neha Kapoor" />
          </div>
          <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
            <KPITile title="Controls effective" value={complianceLandingKpis.controlsEffective} note="of tracked controls" status="healthy" updatedAt={updatedAt} stale={stale} icon={<ShieldCheck size={22} />} iconBg="var(--status-healthy-bg)" iconFg="var(--status-healthy-fg)" />
          </div>
          <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
            <KPITile title="Controls failed / exception" value={complianceLandingKpis.controlsFailedOrException} note="need attention" status={complianceLandingKpis.controlsFailedOrException > 0 ? "critical" : "healthy"} updatedAt={updatedAt} stale={stale} icon={<ShieldAlert size={22} />} iconBg="var(--status-critical-bg)" iconFg="var(--status-critical-fg)" />
          </div>
          <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
            <KPITile title="Evidence due this month" value={complianceLandingKpis.evidenceDueThisMonth} note="upload or attest" status="warning" updatedAt={updatedAt} stale={stale} icon={<FileClock size={22} />} iconBg="var(--status-warning-bg)" iconFg="var(--status-warning-fg)" />
          </div>
          <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
            <KPITile title="Findings overdue" value={complianceLandingKpis.findingsOverdue} note="past remediation due date" status={complianceLandingKpis.findingsOverdue > 0 ? "critical" : "healthy"} updatedAt={updatedAt} stale={stale} icon={<AlertOctagon size={22} />} iconBg="var(--status-critical-bg)" iconFg="var(--status-critical-fg)" />
          </div>
          <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
            <KPITile title="Open privacy requests" value={complianceLandingKpis.openPrivacyRequests} note="UC-14 cases in progress" status="info" updatedAt={updatedAt} stale={stale} icon={<FileLock2 size={22} />} iconBg="var(--status-info-bg)" iconFg="var(--status-info-fg)" drillHref="/compliance-officer/privacy-requests" />
          </div>
        </div>
        <CalendarCard />
      </div>

      <ComplianceDisclaimerBanner />

      <Card title="Frameworks with coverage">
        <FrameworkScoreGrid data={controlsEffectiveByFramework} columns={3} />
      </Card>

      <Card title="Findings overdue">
        <ul className="flex flex-col gap-2">
          {findingsOverdueList.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">{f.title}</p>
                <p className="text-xs text-[var(--role-text)]">Owner: {f.owner}</p>
              </div>
              <StatusBadge status="critical" label={`${f.daysOverdue}d overdue`} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Control detail">
        <TabBar tabs={TABS} />
        <div className="mt-[var(--space-md)]">
          {active === "controls" && (
            <DataTable
              columns={controlColumns}
              rows={controls}
              getRowKey={(r) => r.id}
              pageSize={6}
              emptyTitle="No controls tracked"
              renderExpanded={(r) => (
                <dl className="grid grid-cols-1 gap-x-[var(--space-md)] gap-y-2 p-3 text-xs screen-sm:grid-cols-2">
                  <Field label="Implementation" value={r.implementation} />
                  <Field label="Evidence source" value={r.evidenceSource} />
                  <Field label="Framework mapping" value={r.frameworkMapping} />
                  <Field label="Test method" value={r.testMethod} />
                  <Field label="Findings" value={r.findings} />
                  <Field label="Remediation" value={r.remediation ? `${r.remediation.action} — ${r.remediation.owner}, due ${r.remediation.dueDate}` : "—"} />
                </dl>
              )}
            />
          )}
          {active === "evidence" && (
            <DataTable columns={evidenceColumns} rows={evidenceItems} getRowKey={(r) => r.id} pageSize={6} emptyTitle="No evidence recorded" />
          )}
          {active === "findings" &&
            (controlsWithFindings.length === 0 ? (
              <p className="p-6 text-center text-sm text-[var(--role-text)]">No open findings.</p>
            ) : (
              <DataTable columns={findingsColumns} rows={controlsWithFindings} getRowKey={(r) => r.id} pageSize={6} emptyTitle="No open findings" />
            ))}
          {active === "data-governance" && (
            <p className="p-6 text-center text-sm text-[var(--role-text)]">
              Data classification, inventory and retention (Blueprint §18) — not yet specced in field-level detail; placeholder for a future session.
            </p>
          )}
        </div>
      </Card>

      <ComplianceDisclaimerBanner />

      <ConfirmActionDialog
        open={pendingFinding !== null}
        actionLabel={pendingFinding ? `Raise finding — ${pendingFinding.controlId}` : ""}
        description="Describe the observed deficiency. This moves the control to Exception."
        onConfirm={raiseFinding}
        onCancel={() => setPendingFinding(null)}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--role-text)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text-secondary)]">{value}</dd>
    </div>
  );
}
```

Note on the "Data governance" tab: §18 (Data Classification/Inventory/Retention/Legal Hold) exists in the blueprint only as a capability/requirement table, not field-level detail like §17. Rather than inventing fields, this renders an honest placeholder — consistent with `ComingSoon`'s pattern elsewhere in the codebase, and avoids fabricating data-model detail the blueprint doesn't actually specify.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/compliance-officer/compliance`
Expected: 4-col grid with GreetingCard + 5 KPI tiles + CalendarCard, disclaimer banner visible twice, FrameworkScoreGrid with 3 columns, findings list, tabbed Control detail card with working Controls/Evidence/Findings/Data governance tabs, "Raise finding" opens dialog and updates control status to Exception on confirm.

- [ ] **Step 4: Commit**

```bash
git add app/compliance-officer/compliance/page.tsx
git commit -m "feat: add Compliance Officer landing (Compliance) screen"
```

---

### Task 9: `app/compliance-officer/privacy-requests/page.tsx`

**Files:**
- Create: `app/compliance-officer/privacy-requests/page.tsx`

**Interfaces:**
- Consumes: `privacyRequests` (Task 2), `DataTable`, `StatusBadge`, `EmptyState`, `ConfirmActionDialog` (Task 3).

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import { privacyRequests as initialRequests, type PrivacyRequest } from "@/lib/mock-data/compliance-risk";

const STATUS_TONE: Record<PrivacyRequest["status"], "healthy" | "warning" | "critical" | "info" | "neutral"> = {
  Intake: "neutral",
  "Scope validation": "info",
  "Legal hold check": "info",
  "Tasks in progress": "warning",
  Exception: "critical",
  Complete: "healthy",
};

export default function PrivacyRequestsPage() {
  const [requests, setRequests] = useState<PrivacyRequest[]>(initialRequests);
  const [pending, setPending] = useState<PrivacyRequest | null>(null);

  function completeRequest(reason: string) {
    if (!pending) return;
    setRequests((current) =>
      current.map((r) =>
        r.id === pending.id
          ? { ...r, status: "Complete", completionEvidence: reason, tasksToProducts: r.tasksToProducts.map((t) => ({ ...t, status: "Done" })) }
          : r
      )
    );
    setPending(null);
  }

  const columns: Column<PrivacyRequest>[] = [
    { key: "requester", header: "Requester", render: (r) => <span className="font-medium">{r.requester}</span>, sortValue: (r) => r.requester },
    { key: "type", header: "Type", render: (r) => r.type },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={STATUS_TONE[r.status]} label={r.status} />, sortValue: (r) => r.status },
    { key: "daysOpen", header: "Days open", render: (r) => r.daysOpen, sortValue: (r) => r.daysOpen },
    {
      key: "action",
      header: "",
      render: (r) =>
        r.status !== "Complete" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPending(r);
            }}
            className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Complete request
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Card title="Privacy requests (UC-14)" description="Case-orchestration shell — tracks scope, legal-hold and product tasks; does not execute deletion/correction directly.">
        <DataTable
          columns={columns}
          rows={requests}
          getRowKey={(r) => r.id}
          pageSize={8}
          emptyTitle="No open privacy requests"
          emptyDescription="Verified access, correction and deletion requests will show up here."
          renderExpanded={(r) => (
            <div className="flex flex-col gap-[var(--space-sm)] p-3 text-xs">
              <dl className="grid grid-cols-1 gap-x-[var(--space-md)] gap-y-2 screen-sm:grid-cols-3">
                <Field label="Scope validated" value={r.scopeValidated ? "Yes" : "No"} />
                <Field label="Legal hold clear" value={r.legalHoldClear === null ? "Pending" : r.legalHoldClear ? "Yes" : "No — held"} />
                <Field label="Exceptions" value={r.exceptions ?? "None"} />
              </dl>
              <div>
                <p className="mb-1 font-semibold text-[var(--role-text)]">Tasks to products</p>
                <ul className="flex flex-col gap-1">
                  {r.tasksToProducts.length === 0 ? (
                    <li className="text-[var(--role-text)]">No product tasks yet — scope not finalized</li>
                  ) : (
                    r.tasksToProducts.map((t) => (
                      <li key={t.product} className="flex items-center justify-between rounded-md border border-[var(--divider)] px-2 py-1">
                        {t.product}
                        <StatusBadge status={t.status === "Done" ? "healthy" : "neutral"} label={t.status} />
                      </li>
                    ))
                  )}
                </ul>
              </div>
              {r.completionEvidence && <Field label="Completion evidence" value={r.completionEvidence} />}
            </div>
          )}
        />
      </Card>

      <ConfirmActionDialog
        open={pending !== null}
        actionLabel={pending ? `Complete request — ${pending.requester}` : ""}
        description="Record the completion evidence package reference. This marks the case Complete."
        onConfirm={completeRequest}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--role-text)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text-secondary)]">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/compliance-officer/privacy-requests`
Expected: table of 3 cases, row expand shows scope/legal-hold/tasks, "Complete request" opens dialog and flips status to Complete with all tasks marked Done on confirm.

- [ ] **Step 4: Commit**

```bash
git add app/compliance-officer/privacy-requests/page.tsx
git commit -m "feat: add Compliance Officer Privacy Requests screen (case-orchestration shell)"
```

---

### Task 10: `app/compliance-officer/access-reviews/page.tsx` (view-only)

**Files:**
- Create: `app/compliance-officer/access-reviews/page.tsx`

**Interfaces:**
- Consumes: `accessReviewCampaigns` (Task 2), `DataTable`, `StatusBadge`.

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { accessReviewCampaigns, type AccessReviewCampaign } from "@/lib/mock-data/compliance-risk";

export default function AccessReviewsPage() {
  const [exported, setExported] = useState<string | null>(null);

  const columns: Column<AccessReviewCampaign>[] = [
    { key: "name", header: "Campaign", render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "period", header: "Period", render: (r) => r.period },
    { key: "progress", header: "Progress", render: (r) => `${r.reviewedCount} / ${r.populationCount} reviewed`, sortValue: (r) => r.reviewedCount / r.populationCount },
    { key: "dueDate", header: "Due", render: (r) => r.dueDate, sortValue: (r) => r.dueDate },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status === "Open" ? "warning" : "healthy"} label={r.status} /> },
    {
      key: "export",
      header: "",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExported(r.id);
          }}
          className="tap-pop rounded-lg border border-[var(--divider)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--search-bg)]"
        >
          Export evidence
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Card
        title="Access review campaigns"
        description="Read-only for Compliance Officer — Security Administrator starts campaigns, records decisions and executes revocations."
      >
        {exported && (
          <p className="mb-3 rounded-lg bg-[var(--status-healthy-bg)] px-3 py-2 text-xs font-medium text-[var(--status-healthy-fg)]">
            Evidence export generated for {accessReviewCampaigns.find((c) => c.id === exported)?.name} — download link would appear here once wired to a real API.
          </p>
        )}
        <DataTable
          columns={columns}
          rows={accessReviewCampaigns}
          getRowKey={(r) => r.id}
          pageSize={8}
          emptyTitle="No access review campaigns"
          emptyDescription="Campaigns started by the Security Administrator will show up here."
        />
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/compliance-officer/access-reviews`
Expected: 2 campaigns listed, no start/record/execute buttons anywhere, "Export evidence" shows the confirmation text — this satisfies the persona's done-when test (evidence exportable in a few clicks).

- [ ] **Step 4: Commit**

```bash
git add app/compliance-officer/access-reviews/page.tsx
git commit -m "feat: add Compliance Officer Access Reviews screen (view-only)"
```

---

### Task 11: Full persona walkthrough and lint pass

**Files:** none (verification only)

- [ ] **Step 1: Run lint across the whole repo**

Run: `npm run lint`
Expected: no new errors introduced by any file touched in Tasks 1–10 (pre-existing warnings elsewhere are out of scope).

- [ ] **Step 2: Run the typecheck one more time for the whole project**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Manual walkthrough in the dev server**

Run: `npm run dev`, then in the browser:
1. Visit `http://localhost:3000/compliance-officer/compliance` directly — confirm it loads (not a 404), confirming Task 1's `homeSlug` fix works for this persona.
2. Click the Setu logo in the sidebar while on any Compliance Officer page — confirm it returns to `/compliance-officer/compliance`, not `/compliance-officer/dashboard`.
3. Open the profile menu, use "Switch persona (dev only)" to go to Compliance Officer from Founder, and back — confirm both hops land on the correct home route for each persona.
4. Click through all 5 sidebar items (Compliance, Risk & Vendors, Privacy Requests, Access Reviews, Audit) — confirm each renders without console errors and the active-tab indicator tracks correctly.
5. On Risk & Vendors, click "Change treatment" on a risk — confirm the dialog blocks Confirm until a reason is typed, and the badge updates after confirming.
6. On the Compliance screen, click "Raise finding" on a control — confirm it moves that control to "Exception" status in the table.
7. On Privacy Requests, complete an open case — confirm it becomes "Complete" with all tasks flipped to "Done".
8. On Access Reviews, confirm there is no way to start a campaign or record a review decision — export only.
9. Resize the browser (or use devtools device toolbar) to roughly 1366px, 1440px, and 1920px widths — confirm the Compliance landing page's 4-column grid and KPI tile wrapping behave the same way Engineering Lead's dashboard does at those breakpoints (no new breakpoint logic was added, so this should already hold — it's a regression check, not new work).

- [ ] **Step 4: No commit for this task** — it's verification only. If any check above fails, go back to the relevant task, fix, and re-commit there instead of accumulating a fix-up commit here.

---

## Self-review notes (from writing this plan)

- **Spec coverage:** all 5 screens (§1–§5 of the data spec), both new components (§7.1–§7.2), the mock-data extension (§8), and the sidebar's `risk-vendors` vs `risks-vendors` naming flag (§0, carried forward as a comment only, no code change) are covered. Control 360 (§3 of the spec) is implemented as an in-place `DataTable` row-expand on the Compliance screen's Controls tab rather than a separate route/drill-down — simpler, and matches the existing convention already used by Engineering Lead's Releases table and Founder's Audit Explorer, so no new routing pattern was introduced.
- **Data governance tab:** the spec's §2 mentions a Data governance tab; the blueprint's §18 only has capability-level requirements, not field-level detail like §17's control/risk/vendor sections. Task 8 renders an honest placeholder rather than inventing fields not in the source material — flagged inline in that task, not silently fabricated.
- **Type consistency check:** `ControlRecord.status` (Task 2) matches the literal union used in `CONTROL_STATUS_TONE` (Task 8) and `RiskRow.treatmentStatus`/`treatment` naming matches Task 7's filters and `ConfirmActionDialog` usage. `PrivacyRequest.status` values match `STATUS_TONE` in Task 9.
