export const workspaceKpis = {
  total: 214,
  active: 187,
  graceOrRestricted: 12,
  failedProvisioning24h: 1,
  multiProductAdoptionPct: 61,
  criticalExceptions: 2,
};

// Reconciliation (mock): total 214 = Trial 14 + Active 187 + At risk 9 + Churned 4.
// Paid plan mix 98+80+18 = 196 = Active 187 + At risk 9 (trial 14 on top = 210 non-churned).
export const workspaceFunnel = [
  { label: "Trial", value: 14, color: "var(--chart-1)" },
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
    { plan: "Trial", count: 14 },
    { plan: "Growth", count: 98 },
    { plan: "Scale", count: 80 },
    { plan: "Enterprise", count: 18 },
  ],
};

export const subscriptionStatusDonut = [
  { label: "Trial", value: 14, color: "var(--chart-1)" },
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
  { label: "Change failure rate", value: "12%", band: "Elite" as const },
  { label: "MTTR", value: "1h 40m", band: "High" as const },
];

export const releaseRows = [
  {
    id: "rel-1",
    preErrorPct: 0.3,
    postErrorPct: 4.6,
    product: "Chat with Sahayogi",
    version: "v3.4",
    deployedAt: "2026-09-27",
    status: "Rollback escalated",
    blastRadiusPct: 42,
    approvalRef: "apr-2",
    code: "REL-889",
    buildRef: "chat-sahayogi@3.4.0 (commit c91ffe0)",
    initiator: "Priyanka Rao via GitHub Actions",
    targetEnv: "Production",
    migrationChanges: "None",
    rolloutStrategy: "Percentage rollout, cohort-gated",
    preDeployHealth: "Error rate 0.3%, p95 latency 180ms",
    postDeployHealth: "Error rate 4.6%, p95 latency 410ms",
    pauseRollbackDecision: "Escalated to Founder — blast radius exceeded threshold at 42%",
    rollbackEvidence: "WhatsApp delivery-latency regression above SLO on 3 of 5 canary shards",
    linkedIncidentId: "inc-1",
  },
  {
    id: "rel-2",
    preErrorPct: 0.4,
    postErrorPct: 0.5,
    product: "BoSS",
    version: "v2.1",
    deployedAt: "2026-09-24",
    status: "Complete",
    blastRadiusPct: 100,
    approvalRef: null,
    code: null,
    buildRef: "boss-api@2.1.0 (commit 8f2c1a4)",
    initiator: "Arjun M. via GitHub Actions",
    targetEnv: "Production",
    migrationChanges: "Adds nullable `risk_score` column to `assessments` table",
    rolloutStrategy: "Canary, 10% → 50% → 100%",
    preDeployHealth: "Error rate 0.4%, p95 latency 220ms",
    postDeployHealth: "Error rate 0.5%, p95 latency 235ms",
    pauseRollbackDecision: "None — rollout completed clean",
    rollbackEvidence: "—",
    linkedIncidentId: null,
  },
  {
    id: "rel-3",
    preErrorPct: 1.1,
    postErrorPct: 1.3,
    product: "Tax Sahayogi",
    version: "v1.6",
    deployedAt: "2026-09-28",
    status: "In progress",
    blastRadiusPct: 75,
    approvalRef: null,
    code: null,
    buildRef: "tax-sahayogi@1.6.0 (commit 7b3e9d2)",
    initiator: "Meera S. via GitHub Actions",
    targetEnv: "Production",
    migrationChanges: "None",
    rolloutStrategy: "Canary, 10% → 50% → 75%",
    preDeployHealth: "Error rate 1.1%, p95 latency 260ms",
    postDeployHealth: "Error rate 1.3%, p95 latency 275ms",
    pauseRollbackDecision: "None yet — within SLO, proceeding to 100%",
    rollbackEvidence: "—",
    linkedIncidentId: null,
  },
  {
    id: "rel-4",
    preErrorPct: 0.2,
    postErrorPct: 0.2,
    product: "Sahayogi One",
    version: "v4.0",
    deployedAt: "2026-09-20",
    status: "Complete",
    blastRadiusPct: 100,
    approvalRef: null,
    code: null,
    buildRef: "sahayogi-one@4.0.0 (commit 2ad77b1)",
    initiator: "Rahul K. via GitHub Actions",
    targetEnv: "Production",
    migrationChanges: "Backfills `plan_tier` default for legacy accounts",
    rolloutStrategy: "Canary, 10% → 50% → 100%",
    preDeployHealth: "Error rate 0.2%, p95 latency 150ms",
    postDeployHealth: "Error rate 0.2%, p95 latency 155ms",
    pauseRollbackDecision: "None — rollout completed clean",
    rollbackEvidence: "—",
    linkedIncidentId: null,
  },
  {
    id: "rel-5",
    preErrorPct: 0.15,
    postErrorPct: 0.15,
    product: "Office Sahayogi",
    version: "v1.2",
    deployedAt: "2026-09-18",
    status: "Complete",
    blastRadiusPct: 100,
    approvalRef: null,
    code: null,
    buildRef: "office-sahayogi@1.2.0 (commit 4e819aa)",
    initiator: "Dev K. via GitHub Actions",
    targetEnv: "Production",
    migrationChanges: "None",
    rolloutStrategy: "Full rollout",
    preDeployHealth: "Error rate 0.15%, p95 latency 140ms",
    postDeployHealth: "Error rate 0.15%, p95 latency 142ms",
    pauseRollbackDecision: "None — rollout completed clean",
    rollbackEvidence: "—",
    linkedIncidentId: null,
  },
];

// Derived from releaseRows so the chart/timeline can never drift from the
// table they sit next to (they used to be hand-typed and disagreed).
export const releaseErrorRates = releaseRows.map((r) => ({
  label: `${r.product} ${r.version}`,
  before: r.preErrorPct,
  after: r.postErrorPct,
}));

export const rolloutTimeline = releaseRows.map((r) => ({
  id: r.id,
  product: `${r.product} ${r.version}`,
  pctRolledOut: r.blastRadiusPct,
  status: (r.status === "Rollback escalated" ? "rollback" : r.status === "In progress" ? "in-progress" : "complete") as
    | "rollback"
    | "in-progress"
    | "complete",
}));

export type HealthStatus = "healthy" | "warning" | "critical";

// Single source of truth for product health: derived from the raw facts
// (uptime/error rate), not hand-typed, so it can't drift from the numbers
// sitting right next to it. Thresholds chosen to match prior hand-set
// values exactly; tune here if the SLO changes.
export function computeProductHealth(uptime30d: number, errorRatePct: number): HealthStatus {
  if (errorRatePct >= 1.5 || uptime30d < 99.5) return "critical";
  if (errorRatePct >= 0.5 || uptime30d < 99.9) return "warning";
  return "healthy";
}

const productHealthFacts = [
  { id: "chat-sahayogi", name: "Chat with Sahayogi", uptime30d: 99.82, errorRatePct: 2.1 },
  { id: "boss", name: "BoSS", uptime30d: 99.9, errorRatePct: 0.6 },
  { id: "sahayogi-one", name: "Sahayogi One", uptime30d: 99.98, errorRatePct: 0.1 },
  { id: "sahayogi-cloud", name: "Sahayogi Cloud", uptime30d: 99.95, errorRatePct: 0.3 },
  { id: "tax-sahayogi", name: "Tax Sahayogi", uptime30d: 99.88, errorRatePct: 0.5 },
  { id: "office-sahayogi", name: "Office Sahayogi", uptime30d: 99.97, errorRatePct: 0.15 },
  { id: "investor-sahayogi", name: "Investor Sahayogi", uptime30d: 99.99, errorRatePct: 0.05 },
  { id: "my-sahayogi", name: "My Sahayogi", uptime30d: 99.93, errorRatePct: 0.2 },
  { id: "studio-sahayogi", name: "Studio Sahayogi", uptime30d: 99.96, errorRatePct: 0.1 },
];

export const productHealthGrid = productHealthFacts.map((p) => ({
  ...p,
  status: computeProductHealth(p.uptime30d, p.errorRatePct),
}));

function series24h(base: number, jitter: number) {
  return Array.from({ length: 24 }, (_, hour) => ({
    x: hour,
    y: Math.round((base + Math.sin(hour / 3) * jitter + jitter * ((hour * 7) % 5) * 0.1) * 100) / 100,
  }));
}

// Per-product Golden Signals (latency/traffic/errors/saturation), keyed by
// productHealthGrid.id — spec §7. Every product carries a full signal set
// in the mock so the health matrix has no empty rows.
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
  "office-sahayogi": {
    p95LatencyMs: { series: series24h(130, 12), sloMs: 400 },
    requestsPerSec: { series: series24h(45, 10) },
    errorRatePct: { series: series24h(0.15, 0.05), sloPct: 1.5 },
    saturationPct: 33,
  },
  "investor-sahayogi": {
    p95LatencyMs: { series: series24h(190, 20), sloMs: 400 },
    requestsPerSec: { series: series24h(30, 8) },
    errorRatePct: { series: series24h(0.05, 0.02), sloPct: 1.5 },
    saturationPct: 29,
  },
  "my-sahayogi": {
    p95LatencyMs: { series: series24h(170, 18), sloMs: 400 },
    requestsPerSec: { series: series24h(55, 12) },
    errorRatePct: { series: series24h(0.2, 0.06), sloPct: 1.5 },
    saturationPct: 37,
  },
  "studio-sahayogi": {
    p95LatencyMs: { series: series24h(220, 25), sloMs: 400 },
    requestsPerSec: { series: series24h(25, 6) },
    errorRatePct: { series: series24h(0.1, 0.04), sloPct: 1.5 },
    saturationPct: 44,
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

export const incidentRows = [
  {
    id: "inc-1",
    productId: "chat-sahayogi",
    title: "Chat with Sahayogi — WhatsApp delivery latency spike",
    severity: "high" as const,
    commander: "Arjun M.",
    workspaces: 3,
    affectedWorkspaces: ["Northwind Retail", "Coral Health", "Delta Fintech"],
    affectedWorkspaceIds: ["ws-1", "ws-4", "ws-5"],
    status: "Mitigating",
    timeOpen: "2h 10m",
    linkedRelease: "Chat with Sahayogi v3.4",
    linkedReleaseId: "rel-1",
  },
  {
    id: "inc-2",
    productId: "boss",
    title: "BoSS invoice webhook retry backlog",
    severity: "medium" as const,
    commander: "Rhea S.",
    workspaces: 1,
    affectedWorkspaces: ["Acme Traders"],
    affectedWorkspaceIds: ["ws-2"],
    status: "Monitoring",
    timeOpen: "45m",
    linkedRelease: null,
    linkedReleaseId: null,
  },
  {
    id: "inc-3",
    productId: "sahayogi-one",
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
    linkedReleaseId: null,
  },
];

// Open (not Resolved) incidents per severity, derived from incidentRows.
const openIncidents = incidentRows.filter((i) => i.status !== "Resolved");
export const incidentsBySeverity = [
  { label: "Critical", value: 0, color: "var(--status-critical-fg)" },
  { label: "High", value: openIncidents.filter((i) => i.severity === "high").length, color: "var(--chart-3)" },
  { label: "Medium", value: openIncidents.filter((i) => i.severity === "medium").length, color: "var(--chart-1)" },
  { label: "Low", value: openIncidents.filter((i) => i.severity === "low").length, color: "var(--status-neutral-fg)" },
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

// Provisioning drift — workspaces whose live provisioned state no longer
// matches their intended plan. Gives workspaceKpis.failedProvisioning24h
// actual rows instead of being a dead-end count.
export type ProvisioningDriftRow = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  driftType: string;
  detectedAt: string;
  severity: "warning" | "critical";
};

export const provisioningDriftRows: ProvisioningDriftRow[] = [
  { id: "drift-1", workspaceId: "ws-2", workspaceName: "Acme Traders", driftType: "Plan says Growth, provisioned compute tier is Scale", detectedAt: "3h ago", severity: "critical" },
  { id: "drift-2", workspaceId: "ws-3", workspaceName: "Bluepeak Logistics", driftType: "Entitlement flag 'advanced-reporting' enabled outside plan", detectedAt: "26m ago", severity: "warning" },
  { id: "drift-3", workspaceId: "ws-5", workspaceName: "Delta Fintech", driftType: "Seat count exceeds Enterprise plan cap by 4", detectedAt: "1h ago", severity: "warning" },
];

// Third-party/partner integrations — vendor-facing, distinct from the
// internal service dependency map above (dependencyMap).
export type IntegrationRow = {
  id: string;
  name: string;
  product: string;
  status: "healthy" | "warning" | "critical";
  lastSyncAt: string;
  errorCount24h: number;
};

export const integrationRows: IntegrationRow[] = [
  { id: "int-1", name: "WhatsApp Cloud API", product: "Chat with Sahayogi", status: "critical", lastSyncAt: "4m ago", errorCount24h: 38 },
  { id: "int-2", name: "Payment Gateway", product: "BoSS", status: "warning", lastSyncAt: "11m ago", errorCount24h: 6 },
  { id: "int-3", name: "GST Filing API", product: "Tax Sahayogi", status: "warning", lastSyncAt: "22m ago", errorCount24h: 3 },
  { id: "int-4", name: "Auth Service (SSO)", product: "Sahayogi One", status: "healthy", lastSyncAt: "1m ago", errorCount24h: 0 },
  { id: "int-5", name: "Cloud Storage Provider", product: "Sahayogi Cloud", status: "healthy", lastSyncAt: "2m ago", errorCount24h: 0 },
];

// Feature flags — active rollout flags per product, complements the
// existing release rollout timeline above (rolloutTimeline).
export type FeatureFlagRow = {
  id: string;
  flagName: string;
  product: string;
  rolloutPct: number;
  killSwitchEnabled: boolean;
  updatedAt: string;
};

export const featureFlagRows: FeatureFlagRow[] = [
  { id: "flag-1", flagName: "new-invoice-renderer", product: "BoSS", rolloutPct: 50, killSwitchEnabled: false, updatedAt: "2026-09-29" },
  { id: "flag-2", flagName: "whatsapp-delivery-v2", product: "Chat with Sahayogi", rolloutPct: 42, killSwitchEnabled: true, updatedAt: "2026-09-27" },
  { id: "flag-3", flagName: "gst-auto-reconcile", product: "Tax Sahayogi", rolloutPct: 100, killSwitchEnabled: false, updatedAt: "2026-09-18" },
  { id: "flag-4", flagName: "multi-workspace-sso", product: "Sahayogi One", rolloutPct: 10, killSwitchEnabled: false, updatedAt: "2026-09-30" },
];
