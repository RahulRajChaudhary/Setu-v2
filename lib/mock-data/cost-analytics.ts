// Founder "Usage and cost" data (Team Roles Guide, screen 2; blueprint §15, §26).
// Cost attribution only — revenue, invoices and receivables stay in BoSS Finance
// (blueprint §2 data-boundary rule), so nothing here carries a revenue figure.

export type ProviderId = "cloud" | "ai" | "whatsapp" | "sms" | "apis";

export const providers: { id: ProviderId; label: string; color: string; estimated?: boolean }[] = [
  { id: "cloud", label: "Cloud (AWS)", color: "var(--chart-1)" },
  // AI spend comes from token metering × list price, not a provider bill, so
  // it is labelled "estimated" in the UI (roles guide: "label estimates clearly").
  { id: "ai", label: "AI inference", color: "var(--chart-5)", estimated: true },
  { id: "whatsapp", label: "WhatsApp", color: "var(--chart-2)" },
  { id: "sms", label: "SMS", color: "var(--chart-3)" },
  { id: "apis", label: "Other APIs", color: "var(--status-neutral-fg)" },
];

// Single source of truth: product × provider cost, MTD, in ₹. Every other cost
// figure on the page (totals, by-provider, by-product, shares) is derived from
// this matrix so the numbers cannot disagree with each other.
type CostRow = { productId: string | null; product: string } & Record<ProviderId, number>;

export const costMatrix: CostRow[] = [
  { productId: "chat-sahayogi", product: "Chat with Sahayogi", cloud: 36000, ai: 21000, whatsapp: 40000, sms: 6000, apis: 1500 },
  { productId: "boss", product: "BoSS", cloud: 62000, ai: 18000, whatsapp: 3000, sms: 7000, apis: 3000 },
  { productId: "sahayogi-cloud", product: "Sahayogi Cloud", cloud: 58000, ai: 1000, whatsapp: 0, sms: 0, apis: 500 },
  { productId: "tax-sahayogi", product: "Tax Sahayogi", cloud: 19000, ai: 22000, whatsapp: 2000, sms: 1000, apis: 3500 },
  { productId: "sahayogi-one", product: "Sahayogi One", cloud: 30000, ai: 4000, whatsapp: 0, sms: 5000, apis: 1000 },
  { productId: "office-sahayogi", product: "Office Sahayogi", cloud: 9000, ai: 20000, whatsapp: 1500, sms: 500, apis: 1000 },
  { productId: "investor-sahayogi", product: "Investor Sahayogi", cloud: 6000, ai: 3000, whatsapp: 1000, sms: 500, apis: 500 },
  { productId: "my-sahayogi", product: "My Sahayogi", cloud: 5000, ai: 2000, whatsapp: 500, sms: 500, apis: 0 },
  { productId: "studio-sahayogi", product: "Studio Sahayogi", cloud: 5000, ai: 1000, whatsapp: 0, sms: 500, apis: 500 },
  // Shared infrastructure not attributable to one product ("where technically reliable", blueprint §15.2).
  { productId: null, product: "Shared platform", cloud: 10000, ai: 0, whatsapp: 0, sms: 0, apis: 0 },
];

const rowTotal = (r: CostRow) => providers.reduce((sum, p) => sum + r[p.id], 0);

export const costByProvider = providers.map((p) => ({
  label: p.label,
  value: costMatrix.reduce((sum, r) => sum + r[p.id], 0),
  color: p.color,
  estimated: p.estimated ?? false,
}));

export const costByProduct = costMatrix
  .map((r) => ({
    productId: r.productId,
    product: r.product,
    total: rowTotal(r),
    byProvider: providers.map((p) => ({ id: p.id, label: p.label, color: p.color, value: r[p.id] })),
  }))
  .sort((a, b) => b.total - a.total);

// pctChangeVsLastMonth follows Founder spec §1: (projected month-end cost ÷ last month) − 1.
export const costKpis = {
  mtdTotal: costByProvider.reduce((sum, p) => sum + p.value, 0),
  pctChangeVsLastMonth: 8,
};

// Daily platform cost over the same window as the MTD figure. Deterministic
// (no Math.random) and scaled so the days add up to exactly mtdTotal.
const rawDaily = Array.from({ length: 30 }, (_, d) => 1 + d * 0.006 + Math.sin(d / 2.3) * 0.07 + (d % 7 === 5 ? 0.08 : 0) + (d >= 23 ? 0.1 : 0));
const rawSum = rawDaily.reduce((a, b) => a + b, 0);
const dailyRounded = rawDaily.map((v) => Math.round((v / rawSum) * costKpis.mtdTotal));
dailyRounded[29] += costKpis.mtdTotal - dailyRounded.reduce((a, b) => a + b, 0); // absorb rounding drift
export const dailyCost30d = dailyRounded.map((y, x) => ({ x, y }));

const last7 = dailyRounded.slice(-7).reduce((a, b) => a + b, 0);
const prev7 = dailyRounded.slice(-14, -7).reduce((a, b) => a + b, 0);
export const weekOverWeekCostPct = Math.round(((last7 - prev7) / prev7) * 100);

export type CostAnomaly = {
  id: string;
  scope: string;
  metric: string;
  pctSpike: number;
  extraCostInr: number;
  cause: string;
  detectedAt: string;
  estimated?: boolean;
  /** Trace chain (roles guide: "a cost spike can be traced to a product and workspace in three clicks"). */
  productId: string | null;
  productName: string | null;
  workspaces: { id: string; name: string }[];
};

export const costAnomalies: CostAnomaly[] = [
  {
    id: "an-3",
    scope: "Platform: AI inference",
    metric: "AI inference cost, week over week",
    pctSpike: 38,
    extraCostInr: 25000,
    cause: "80% of the increase comes from 3 workspaces; usage is climbing faster than plan allowance.",
    detectedAt: "2026-09-29",
    estimated: true,
    productId: null,
    productName: null,
    workspaces: [
      { id: "ws-5", name: "Delta Fintech" },
      { id: "ws-2", name: "Acme Traders" },
      { id: "ws-1", name: "Northwind Retail" },
    ],
  },
  {
    id: "an-1",
    scope: "Workspace: Delta Fintech",
    metric: "AI inference cost",
    pctSpike: 64,
    extraCostInr: 22700,
    cause: "Office Sahayogi diagnostic model rollout, higher call volume per SME assessment",
    detectedAt: "2026-09-28",
    estimated: true,
    productId: "office-sahayogi",
    productName: "Office Sahayogi",
    workspaces: [{ id: "ws-5", name: "Delta Fintech" }],
  },
  {
    id: "an-2",
    scope: "Product: Chat with Sahayogi",
    metric: "WhatsApp cost",
    pctSpike: 31,
    extraCostInr: 11400,
    cause: "Festive-season broadcast campaign, one-off spend",
    detectedAt: "2026-09-26",
    productId: "chat-sahayogi",
    productName: "Chat with Sahayogi",
    workspaces: [{ id: "ws-1", name: "Northwind Retail" }],
  },
];

// Top workspaces by cost, MTD. workspaceId links back to Workspace 360.
const topWorkspaceCosts = [
  { workspaceId: "ws-5", workspace: "Delta Fintech", costMtd: 58200 },
  { workspaceId: "ws-2", workspace: "Acme Traders", costMtd: 41300 },
  { workspaceId: "ws-1", workspace: "Northwind Retail", costMtd: 36700 },
  { workspaceId: "ws-4", workspace: "Coral Health", costMtd: 28900 },
  { workspaceId: "ws-3", workspace: "Bluepeak Logistics", costMtd: 19600 },
];

export const topWorkspacesByCost = topWorkspaceCosts.map((w) => ({
  ...w,
  pctOfTotal: Math.round((w.costMtd / costKpis.mtdTotal) * 100),
}));

// ---------------------------------------------------------------------------
// Adoption / allowance (blueprint §15.2: "track plan allowance versus actual
// consumption"; Founder spec §13: workspaces near/over limit).
// ---------------------------------------------------------------------------

export const ALLOWANCE_WARN_PCT = 80;

// "Allowance versus actual per plan" — avg share of plan allowance consumed,
// and how many workspaces on that plan are already over the warning line.
export const allowanceByPlan = [
  { plan: "Growth", workspaces: 98, avgUsedPct: 61, overWarn: 14 },
  { plan: "Scale", workspaces: 80, avgUsedPct: 58, overWarn: 9 },
  { plan: "Enterprise", workspaces: 18, avgUsedPct: 49, overWarn: 3 },
];

export const allowanceSummary = {
  paidWorkspaces: allowanceByPlan.reduce((sum, p) => sum + p.workspaces, 0),
  overWarn: allowanceByPlan.reduce((sum, p) => sum + p.overWarn, 0),
};

// Share of each product's workspaces that are near or over their allowance.
export const workspacesNearLimitByProduct = [
  { label: "Chat with Sahayogi", value: 18, color: "var(--chart-3)" },
  { label: "BoSS", value: 12, color: "var(--chart-3)" },
  { label: "Sahayogi Cloud", value: 9, color: "var(--chart-3)" },
  { label: "Sahayogi One", value: 7, color: "var(--chart-3)" },
  { label: "Tax Sahayogi", value: 5, color: "var(--chart-3)" },
];

// Workspaces closest to their allowance, with the meter that is driving it.
export const workspacePressure = [
  { workspaceId: "ws-2", workspace: "Acme Traders", plan: "Growth", meters: { "AI tokens": 72, WhatsApp: 93, Storage: 60 } },
  { workspaceId: "ws-5", workspace: "Delta Fintech", plan: "Enterprise", meters: { "AI tokens": 88, WhatsApp: 61, Storage: 45 } },
  { workspaceId: "ws-1", workspace: "Northwind Retail", plan: "Scale", meters: { "AI tokens": 55, WhatsApp: 84, Storage: 70 } },
  { workspaceId: "ws-4", workspace: "Coral Health", plan: "Scale", meters: { "AI tokens": 40, WhatsApp: 52, Storage: 81 } },
  { workspaceId: "ws-3", workspace: "Bluepeak Logistics", plan: "Growth", meters: { "AI tokens": 30, WhatsApp: 35, Storage: 48 } },
];
