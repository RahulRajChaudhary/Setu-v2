import type { AreaTile, StatusLevel } from "./types";
import { productHealthGrid, incidentRows } from "./operations";
import { approvalQueue } from "./approvals";

export type KpiSnapshot = {
  productsHealthy: { healthy: number; active: number; status: StatusLevel };
  waitingForApproval: { count: number; status: StatusLevel };
  openIncidents: { count: number; status: StatusLevel };
  platformCostTrend: { pctChange: number; status: StatusLevel };
};

export function generateKpiSnapshot(): KpiSnapshot {
  const healthy = productHealthGrid.filter((p) => p.status === "healthy").length;
  const openIncidents = incidentRows.filter((i) => i.status !== "Resolved").length;
  return {
    productsHealthy: {
      healthy,
      active: productHealthGrid.length,
      status: healthy === productHealthGrid.length ? "healthy" : "warning",
    },
    waitingForApproval: {
      count: approvalQueue.length,
      status: approvalQueue.length > 0 ? "warning" : "healthy",
    },
    openIncidents: {
      count: openIncidents,
      status: openIncidents > 0 ? "warning" : "healthy",
    },
    // No backing per-day cost array exists yet in the mock layer — this one
    // metric stays a literal until a cost time-series is modeled.
    platformCostTrend: { pctChange: 8, status: "healthy" },
  };
}

// The Control Room's "Needs Your Decision" table is the Operations Inbox
// approval queue, not a separate dataset — previously these were two
// hand-duplicated arrays that could silently drift apart.
export { approvalQueue as needsYourDecision } from "./approvals";

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

export { topRisks } from "./compliance-risk";

export const controlsEffectiveByFramework = [
  { label: "ISO 27001", value: 94, effective: 47, total: 50, color: "var(--chart-2)" },
  { label: "DPDP Act", value: 88, effective: 35, total: 40, color: "var(--chart-1)" },
  { label: "GDPR", value: 91, effective: 41, total: 45, color: "var(--chart-5)" },
];

const GROWTH_STATS_BY_RANGE: Record<7 | 30 | 90, { label: string; value: string }[]> = {
  7: [
    { label: "Trial → paid rate", value: "29%" },
    { label: "On 2+ products", value: "54%" },
    { label: "Setup success rate", value: "95%" },
  ],
  30: [
    { label: "Trial → paid rate", value: "34%" },
    { label: "On 2+ products", value: "61%" },
    { label: "Setup success rate", value: "97%" },
  ],
  90: [
    { label: "Trial → paid rate", value: "41%" },
    { label: "On 2+ products", value: "68%" },
    { label: "Setup success rate", value: "98%" },
  ],
};

export function getGrowthStats(rangeDays: 7 | 30 | 90) {
  return GROWTH_STATS_BY_RANGE[rangeDays];
}

// Deterministic pseudo-random daily deltas (seeded — same output on every run,
// so the mock data and its snapshot tests never drift between renders).
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GROWTH_WINDOW_DAYS = 90;

function buildDailySeries(seed: number, dailyChance: number) {
  const random = mulberry32(seed);
  return Array.from({ length: GROWTH_WINDOW_DAYS }, () => (random() < dailyChance ? 1 : 0));
}

const NEW_CUSTOMERS_DAILY = buildDailySeries(42, 0.55);
const TRIAL_TO_PAID_DAILY = buildDailySeries(1337, 0.4);

export type GrowthRangeDays = 7 | 30 | 90;
export type GrowthTrendPoint = { label: string; newCustomers: number; trialToPaid: number };

export function buildGrowthTrend(rangeDays: GrowthRangeDays = 30, referenceDate: Date = new Date()): GrowthTrendPoint[] {
  const customerSlice = NEW_CUSTOMERS_DAILY.slice(GROWTH_WINDOW_DAYS - rangeDays);
  const trialSlice = TRIAL_TO_PAID_DAILY.slice(GROWTH_WINDOW_DAYS - rangeDays);

  let cumCustomers = 0;
  let cumTrial = 0;
  return customerSlice.map((customerDelta, i) => {
    cumCustomers += customerDelta;
    cumTrial += trialSlice[i];
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - (rangeDays - 1 - i));
    return {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      newCustomers: cumCustomers,
      trialToPaid: cumTrial,
    };
  });
}

export const growthTrend = buildGrowthTrend(30);
export const newCustomersTotal = growthTrend[growthTrend.length - 1]?.newCustomers ?? 0;
