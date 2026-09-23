import type { AreaTile, RiskRow, StatusLevel } from "./types";

export type KpiSnapshot = {
  productsHealthy: { healthy: number; active: number; status: StatusLevel };
  waitingForApproval: { count: number; status: StatusLevel };
  openIncidents: { count: number; status: StatusLevel };
  platformCostTrend: { pctChange: number; status: StatusLevel };
};

export function generateKpiSnapshot(): KpiSnapshot {
  return {
    productsHealthy: { healthy: 6, active: 9, status: "warning" },
    waitingForApproval: { count: 3, status: "warning" },
    openIncidents: { count: 1, status: "warning" },
    platformCostTrend: { pctChange: 8, status: "healthy" },
  };
}

export const needsYourDecision = [
  {
    id: "dec-1",
    type: "Risk acceptance",
    title: "Accept residual risk: vendor SSO outage exposure",
    requester: "Priya N. (Compliance Officer)",
    impact: "High — affects SSO for 3 workspaces",
    owner: "Founder",
    deadline: "2026-09-24",
    severity: "high" as const,
  },
  {
    id: "dec-2",
    type: "Rollback approval",
    title: "Approve rollback: Chat with Sahayogi v3.4 release",
    requester: "Arjun M. (Engineering Lead)",
    impact: "Critical — blast radius exceeds threshold",
    owner: "Founder",
    deadline: "2026-09-23",
    severity: "critical" as const,
  },
  {
    id: "dec-3",
    type: "Permanent suspension",
    title: "Suspend workspace: Acme Traders (fraud flag)",
    requester: "Ops escalation",
    impact: "Medium — 1 workspace, 4 active users",
    owner: "Founder",
    deadline: "2026-09-26",
    severity: "medium" as const,
  },
];

export const areasAtGlance: AreaTile[] = [
  { id: "platform", label: "Platform", status: "healthy", cause: "All core services nominal", href: "/founder/operations" },
  { id: "customers", label: "Customers", status: "healthy", cause: "Churn flat vs last month", href: "/founder/operations" },
  { id: "commercial", label: "Commercial Control", status: "warning", cause: "2 subscriptions in grace period", href: "/founder/operations" },
  { id: "operations", label: "Operations", status: "healthy", cause: "No provisioning failures, 24h", href: "/founder/operations" },
  { id: "security", label: "Security", status: "healthy", cause: "No open critical findings", href: "/founder/compliance-risk" },
  { id: "compliance", label: "Compliance", status: "warning", cause: "3 findings overdue remediation", href: "/founder/compliance-risk" },
  { id: "releases", label: "Releases", status: "critical", cause: "Chat with Sahayogi v3.4 rollback pending", href: "/founder/operations" },
  { id: "cost", label: "Cost", status: "healthy", cause: "MTD cost +8% vs last month", href: "/founder/cost-analytics" },
  { id: "dependencies", label: "Dependencies", status: "warning", cause: "1 vendor DPA renewal due in 7d", href: "/founder/compliance-risk" },
];

export const topRisks: RiskRow[] = [
  { id: "r1", label: "Vendor SSO provider single point of failure (Sahayogi One)", owner: "Priya N.", likelihood: 4, impact: 5, treatmentStatus: "Escalated", dueDate: "2026-09-24" },
  { id: "r2", label: "WhatsApp Business API throughput cap during peak broadcast", owner: "Arjun M.", likelihood: 3, impact: 4, treatmentStatus: "In treatment", dueDate: "2026-10-02" },
  { id: "r3", label: "Data residency gap for multi-state GST filings (Tax Sahayogi)", owner: "Priya N.", likelihood: 2, impact: 4, treatmentStatus: "Monitoring", dueDate: "2026-10-15" },
];

export const controlsEffectiveByFramework = [
  { label: "ISO 27001", value: 94, effective: 47, total: 50, color: "var(--chart-2)" },
  { label: "DPDP Act", value: 88, effective: 35, total: 40, color: "var(--chart-1)" },
  { label: "GDPR", value: 91, effective: 41, total: 45, color: "var(--chart-5)" },
];

export const growthLast30Days = [
  { label: "Trial → paid rate", value: "34%" },
  { label: "On 2+ products", value: "61%" },
  { label: "Setup success rate", value: "97%" },
];

// Daily deltas for the last 30 days (index 0 = 29 days ago, last index = today).
const NEW_CUSTOMERS_DAILY = [1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1];
const TRIAL_TO_PAID_DAILY = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1];

export type GrowthTrendPoint = { label: string; newCustomers: number; trialToPaid: number };

export function buildGrowthTrend(referenceDate: Date = new Date()): GrowthTrendPoint[] {
  let cumCustomers = 0;
  let cumTrial = 0;
  const days = NEW_CUSTOMERS_DAILY.length;
  return NEW_CUSTOMERS_DAILY.map((customerDelta, i) => {
    cumCustomers += customerDelta;
    cumTrial += TRIAL_TO_PAID_DAILY[i];
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      newCustomers: cumCustomers,
      trialToPaid: cumTrial,
    };
  });
}

export const growthTrend = buildGrowthTrend();
export const newCustomersTotal = growthTrend[growthTrend.length - 1]?.newCustomers ?? 0;
