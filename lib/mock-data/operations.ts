export const workspaceKpis = {
  total: 214,
  active: 187,
  graceOrRestricted: 12,
  failedProvisioning24h: 1,
  multiProductAdoptionPct: 61,
  criticalExceptions: 2,
};

export const workspaceFunnel = [
  { label: "Trial", value: 46, color: "var(--chart-1)" },
  { label: "Active", value: 187, color: "var(--chart-2)" },
  { label: "At risk", value: 9, color: "var(--chart-3)" },
  { label: "Churned", value: 4, color: "var(--chart-4)" },
];

export const workspaceRows = [
  { id: "ws-1", name: "Northwind Retail", plan: "Scale", status: "Active", health: "healthy" as const, lastActivity: "2m ago" },
  { id: "ws-2", name: "Acme Traders", plan: "Growth", status: "Suspended", health: "critical" as const, lastActivity: "3h ago" },
  { id: "ws-3", name: "Bluepeak Logistics", plan: "Growth", status: "Grace", health: "warning" as const, lastActivity: "12m ago" },
  { id: "ws-4", name: "Coral Health", plan: "Scale", status: "Active", health: "healthy" as const, lastActivity: "1m ago" },
  { id: "ws-5", name: "Delta Fintech", plan: "Enterprise", status: "Active", health: "healthy" as const, lastActivity: "5m ago" },
];

export const subscriptionKpis = {
  active: 178,
  grace: 8,
  restricted: 4,
  planMix: [
    { plan: "Trial", count: 46 },
    { plan: "Growth", count: 89 },
    { plan: "Scale", count: 62 },
    { plan: "Enterprise", count: 17 },
  ],
};

export const subscriptionStatusDonut = [
  { label: "Trial", value: 46, color: "var(--chart-1)" },
  { label: "Active", value: 178, color: "var(--chart-2)" },
  { label: "Grace", value: 8, color: "var(--chart-3)" },
  { label: "Restricted", value: 4, color: "var(--chart-4)" },
  { label: "Suspended", value: 2, color: "var(--status-critical-fg)" },
  { label: "Cancelled", value: 3, color: "var(--status-neutral-fg)" },
];

export const subscriptionRows = [
  { id: "sub-1", product: "Chat with Sahayogi", workspace: "Northwind Retail", workspaceId: "ws-1", plan: "Scale", status: "Active", renewalDate: "2026-11-04" },
  { id: "sub-2", product: "BoSS", workspace: "Acme Traders", workspaceId: "ws-2", plan: "Growth", status: "Restricted", renewalDate: "2026-10-02" },
  { id: "sub-3", product: "Sahayogi One", workspace: "Bluepeak Logistics", workspaceId: "ws-3", plan: "Growth", status: "Grace", renewalDate: "2026-10-14" },
  { id: "sub-4", product: "Tax Sahayogi", workspace: "Coral Health", workspaceId: "ws-4", plan: "Scale", status: "Active", renewalDate: "2027-01-20" },
  { id: "sub-5", product: "Sahayogi Cloud", workspace: "Delta Fintech", workspaceId: "ws-5", plan: "Enterprise", status: "Active", renewalDate: "2026-12-11" },
  { id: "sub-6", product: "Office Sahayogi", workspace: "Northwind Retail", workspaceId: "ws-1", plan: "Growth", status: "Active", renewalDate: "2026-11-30" },
];

export const doraScorecard = [
  { label: "Deployment frequency", value: "3.2/day", band: "Elite" as const },
  { label: "Lead time for changes", value: "48 min", band: "Elite" as const },
  { label: "Change failure rate", value: "12%", band: "High" as const },
  { label: "MTTR", value: "1h 40m", band: "High" as const },
];

export const releaseErrorRates = [
  { label: "Chat w/ Sahayogi v3.4", before: 0.8, after: 4.6 },
  { label: "BoSS v2.1", before: 0.5, after: 0.6 },
  { label: "Sahayogi Cloud v1.6", before: 1.1, after: 0.9 },
];

export const rolloutTimeline = [
  { id: "rel-1", product: "Chat with Sahayogi v3.4", pctRolledOut: 42, status: "rollback" as const },
  { id: "rel-2", product: "BoSS v2.1", pctRolledOut: 100, status: "complete" as const },
  { id: "rel-3", product: "Tax Sahayogi v1.6", pctRolledOut: 75, status: "in-progress" as const },
];

export const releaseRows = [
  { id: "rel-1", product: "Chat with Sahayogi", version: "v3.4", deployedAt: "2026-09-27", status: "Rollback escalated", blastRadiusPct: 42, approvalRef: "apr-2" },
  { id: "rel-2", product: "BoSS", version: "v2.1", deployedAt: "2026-09-24", status: "Complete", blastRadiusPct: 100, approvalRef: null },
  { id: "rel-3", product: "Tax Sahayogi", version: "v1.6", deployedAt: "2026-09-28", status: "In progress", blastRadiusPct: 75, approvalRef: null },
  { id: "rel-4", product: "Sahayogi One", version: "v4.0", deployedAt: "2026-09-20", status: "Complete", blastRadiusPct: 100, approvalRef: null },
  { id: "rel-5", product: "Office Sahayogi", version: "v1.2", deployedAt: "2026-09-18", status: "Complete", blastRadiusPct: 100, approvalRef: null },
];

export const productHealthGrid = [
  { id: "chat-sahayogi", name: "Chat with Sahayogi", status: "critical" as const, uptime30d: 99.82, errorRatePct: 2.1 },
  { id: "boss", name: "BoSS", status: "warning" as const, uptime30d: 99.9, errorRatePct: 0.6 },
  { id: "sahayogi-one", name: "Sahayogi One", status: "healthy" as const, uptime30d: 99.98, errorRatePct: 0.1 },
  { id: "sahayogi-cloud", name: "Sahayogi Cloud", status: "healthy" as const, uptime30d: 99.95, errorRatePct: 0.3 },
  { id: "tax-sahayogi", name: "Tax Sahayogi", status: "warning" as const, uptime30d: 99.88, errorRatePct: 0.5 },
  { id: "office-sahayogi", name: "Office Sahayogi", status: "healthy" as const, uptime30d: 99.97, errorRatePct: 0.15 },
  { id: "investor-sahayogi", name: "Investor Sahayogi", status: "healthy" as const, uptime30d: 99.99, errorRatePct: 0.05 },
  { id: "my-sahayogi", name: "My Sahayogi", status: "healthy" as const, uptime30d: 99.93, errorRatePct: 0.2 },
  { id: "studio-sahayogi", name: "Studio Sahayogi", status: "healthy" as const, uptime30d: 99.96, errorRatePct: 0.1 },
];

function series24h(base: number, jitter: number) {
  return Array.from({ length: 24 }, (_, hour) => ({
    x: hour,
    y: Math.round((base + Math.sin(hour / 3) * jitter + jitter * ((hour * 7) % 5) * 0.1) * 100) / 100,
  }));
}

// Per-product Golden Signals (latency/traffic/errors/saturation), keyed by
// productHealthGrid.id — spec §7. Only a subset of products carry the full
// signal set for the mock; the rest show status-grid only, same as today.
export const productHealthSignals: Record<
  string,
  {
    p95LatencyMs: { series: { x: number; y: number }[]; sloMs: number };
    requestsPerSec: { series: { x: number; y: number }[] };
    errorRatePct: { series: { x: number; y: number }[]; sloPct: number };
    saturationPct: number;
  }
> = {
  "chat-sahayogi": {
    p95LatencyMs: { series: series24h(420, 60), sloMs: 500 },
    requestsPerSec: { series: series24h(180, 40) },
    errorRatePct: { series: series24h(2.1, 0.8), sloPct: 1.5 },
    saturationPct: 82,
  },
  boss: {
    p95LatencyMs: { series: series24h(210, 30), sloMs: 400 },
    requestsPerSec: { series: series24h(90, 20) },
    errorRatePct: { series: series24h(0.6, 0.2), sloPct: 1.5 },
    saturationPct: 58,
  },
  "sahayogi-one": {
    p95LatencyMs: { series: series24h(140, 15), sloMs: 400 },
    requestsPerSec: { series: series24h(240, 35) },
    errorRatePct: { series: series24h(0.1, 0.05), sloPct: 1.5 },
    saturationPct: 41,
  },
  "sahayogi-cloud": {
    p95LatencyMs: { series: series24h(160, 20), sloMs: 400 },
    requestsPerSec: { series: series24h(120, 25) },
    errorRatePct: { series: series24h(0.3, 0.1), sloPct: 1.5 },
    saturationPct: 47,
  },
  "tax-sahayogi": {
    p95LatencyMs: { series: series24h(260, 35), sloMs: 400 },
    requestsPerSec: { series: series24h(70, 15) },
    errorRatePct: { series: series24h(0.5, 0.15), sloPct: 1.5 },
    saturationPct: 63,
  },
};

// Simple node list: product -> dependent services, per spec §7.
export const dependencyMap = [
  { id: "dep-1", product: "Chat with Sahayogi", service: "WhatsApp Cloud API", status: "critical" as const },
  { id: "dep-2", product: "Chat with Sahayogi", service: "BoSS Billing Webhook", status: "healthy" as const },
  { id: "dep-3", product: "BoSS", service: "Payment Gateway", status: "warning" as const },
  { id: "dep-4", product: "BoSS", service: "Invoice PDF Renderer", status: "healthy" as const },
  { id: "dep-5", product: "Tax Sahayogi", service: "GST Filing API", status: "warning" as const },
  { id: "dep-6", product: "Sahayogi One", service: "Auth Service", status: "healthy" as const },
];

// Pass/fail synthetic checks, per spec §7.
export const syntheticChecks = [
  { id: "syn-1", check: "Login", product: "Chat with Sahayogi", status: "pass" as const, lastRun: "2m ago" },
  { id: "syn-2", check: "Signup", product: "Chat with Sahayogi", status: "pass" as const, lastRun: "2m ago" },
  { id: "syn-3", check: "Message send", product: "Chat with Sahayogi", status: "fail" as const, lastRun: "1m ago" },
  { id: "syn-4", check: "Login", product: "BoSS", status: "pass" as const, lastRun: "3m ago" },
  { id: "syn-5", check: "Invoice create", product: "BoSS", status: "pass" as const, lastRun: "3m ago" },
  { id: "syn-6", check: "Login", product: "Tax Sahayogi", status: "pass" as const, lastRun: "4m ago" },
];

export const incidentsBySeverity = [
  { label: "Critical", value: 0, color: "var(--status-critical-fg)" },
  { label: "High", value: 1, color: "var(--chart-3)" },
  { label: "Medium", value: 2, color: "var(--chart-1)" },
  { label: "Low", value: 3, color: "var(--status-neutral-fg)" },
];

export const incidentRows = [
  {
    id: "inc-1",
    title: "Chat with Sahayogi — WhatsApp delivery latency spike",
    severity: "high" as const,
    commander: "Arjun M.",
    workspaces: 3,
    affectedWorkspaces: ["Northwind Retail", "Coral Health", "Delta Fintech"],
    affectedWorkspaceIds: ["ws-1", "ws-4", "ws-5"],
    status: "Mitigating",
    timeOpen: "2h 10m",
    linkedRelease: "Chat with Sahayogi v3.4",
  },
  {
    id: "inc-2",
    title: "BoSS invoice webhook retry backlog",
    severity: "medium" as const,
    commander: "Rhea S.",
    workspaces: 1,
    affectedWorkspaces: ["Acme Traders"],
    affectedWorkspaceIds: ["ws-2"],
    status: "Monitoring",
    timeOpen: "45m",
    linkedRelease: null,
  },
  {
    id: "inc-3",
    title: "Sahayogi One dashboard stale cache",
    severity: "low" as const,
    commander: "Dev K.",
    workspaces: 6,
    affectedWorkspaces: ["Northwind Retail", "Bluepeak Logistics", "Coral Health", "Delta Fintech", "Acme Traders", "Studio workspace"],
    // "Studio workspace" has no corresponding row in workspaceRows — a pre-existing
    // mock-data gap. Left unmapped rather than inventing a fictitious workspace row.
    affectedWorkspaceIds: ["ws-1", "ws-3", "ws-4", "ws-5", "ws-2"],
    status: "Resolved",
    timeOpen: "3h 5m",
    linkedRelease: null,
  },
];

// 30-day trend, per spec §8.
export const mttaTrend30d = Array.from({ length: 30 }, (_, day) => ({
  x: day,
  y: Math.round((14 - day * 0.15 + Math.sin(day / 4) * 2) * 10) / 10,
}));
export const mttrTrend30d = Array.from({ length: 30 }, (_, day) => ({
  x: day,
  y: Math.round((95 - day * 0.6 + Math.sin(day / 5) * 6) * 10) / 10,
}));

export const incidentsLinkedToReleasesPct = Math.round(
  (incidentRows.filter((i) => i.linkedRelease !== null).length / incidentRows.length) * 100,
);
