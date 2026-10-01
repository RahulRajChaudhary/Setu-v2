import type { RiskRow } from "./types";
import { isInMockMonth } from "./mock-clock";

export const controlsEffectiveByFramework = [
  { label: "ISO 27001", value: 94, color: "var(--chart-2)" },
  { label: "DPDP Act", value: 88, color: "var(--chart-1)" },
  { label: "GDPR", value: 91, color: "var(--chart-5)" },
];

export const findingsOverdueList = [
  { id: "fnd-1", title: "Vendor DPA renewal — Twilio", owner: "Priya N.", daysOverdue: 4 },
  { id: "fnd-2", title: "Access review — BoSS service accounts", owner: "Security Admin", daysOverdue: 9 },
  { id: "fnd-3", title: "Evidence upload — ISO A.12.4 logging", owner: "Priya N.", daysOverdue: 2 },
];

export const controlsTable = [
  { id: "ctrl-1", statement: "Logical access reviewed quarterly", frameworks: "ISO 27001, DPDP Act", owner: "Security Admin", dueDate: "2026-10-01", status: "On track" as const },
  { id: "ctrl-2", statement: "Encryption at rest for customer PII", frameworks: "ISO 27001, GDPR", owner: "Priya N.", dueDate: "2026-09-15", status: "Effective" as const },
  { id: "ctrl-3", statement: "Vendor DPA on file before onboarding", frameworks: "DPDP Act, GDPR", owner: "Priya N.", dueDate: "2026-09-20", status: "Exception" as const },
  { id: "ctrl-4", statement: "Incident response runbook tested", frameworks: "ISO 27001", owner: "Arjun M.", dueDate: "2026-11-01", status: "Effective" as const },
  { id: "ctrl-5", statement: "Backups restored and verified quarterly", frameworks: "ISO 27001", owner: "Arjun M.", dueDate: "2026-10-08", status: "On track" as const },
  { id: "ctrl-6", statement: "Privacy notice reviewed annually", frameworks: "DPDP Act, GDPR", owner: "Priya N.", dueDate: "2026-10-12", status: "On track" as const },
  { id: "ctrl-7", statement: "Privileged access logged and alerted", frameworks: "ISO 27001", owner: "Security Admin", dueDate: "2026-10-15", status: "Exception" as const },
  { id: "ctrl-8", statement: "Data subject request SLA met (30 days)", frameworks: "GDPR, DPDP Act", owner: "Priya N.", dueDate: "2026-10-20", status: "On track" as const },
  { id: "ctrl-9", statement: "Third-party risk assessments completed", frameworks: "ISO 27001, DPDP Act", owner: "Priya N.", dueDate: "2026-10-28", status: "On track" as const },
  { id: "ctrl-10", statement: "Security awareness training completed", frameworks: "ISO 27001", owner: "Rhea S.", dueDate: "2026-12-05", status: "Effective" as const },
];

// Derived from the rows above (spec §10) so the KPI cards can never disagree
// with the controls table they link to.
export const complianceKpis = {
  controlsFailedException: controlsTable.filter((c) => c.status === "Exception").length,
  evidenceDueThisMonth: controlsTable.filter((c) => isInMockMonth(c.dueDate)).length,
  findingsOverdue: findingsOverdueList.length,
};

// Ranked by residual score (likelihood x impact), highest first — spec §11.
export const topRisks: RiskRow[] = [
  { id: "r1", label: "Vendor SSO provider single point of failure (Sahayogi One)", owner: "Priya N.", likelihood: 4, impact: 5, treatmentStatus: "Escalated", dueDate: "2026-09-24", code: "RISK-1042", productId: "sahayogi-one" },
  { id: "r2", label: "WhatsApp Business API throughput cap during peak broadcast", owner: "Arjun M.", likelihood: 3, impact: 4, treatmentStatus: "In treatment", dueDate: "2026-10-02", productId: "chat-sahayogi" },
  { id: "r4", label: "Concentration risk: single cloud region", owner: "Arjun M.", likelihood: 2, impact: 5, treatmentStatus: "Monitoring", dueDate: "2026-11-05" },
  { id: "r5", label: "Key-person dependency, platform on-call", owner: "Founder", likelihood: 3, impact: 3, treatmentStatus: "In treatment", dueDate: "2026-10-20" },
  { id: "r3", label: "Data residency gap for multi-state GST filings (Tax Sahayogi)", owner: "Priya N.", likelihood: 2, impact: 4, treatmentStatus: "Monitoring", dueDate: "2026-10-15", productId: "tax-sahayogi" },
];

export const vendorTable = [
  { id: "v1", vendor: "Twilio", service: "SMS delivery", criticality: "High" as const, renewalDate: "2026-09-30", lastReview: "2026-06-12" },
  { id: "v2", vendor: "Okta", service: "SSO / identity", criticality: "Critical" as const, renewalDate: "2026-12-01", lastReview: "2026-07-01" },
  { id: "v3", vendor: "AWS", service: "Cloud infrastructure", criticality: "Critical" as const, renewalDate: "2027-03-15", lastReview: "2026-08-01" },
  { id: "v4", vendor: "Meta (WhatsApp BSP)", service: "WhatsApp messaging", criticality: "High" as const, renewalDate: "2026-10-10", lastReview: "2026-05-20" },
];
