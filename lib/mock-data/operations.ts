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

export const incidentsBySeverity = [
  { label: "Critical", value: 0, color: "var(--status-critical-fg)" },
  { label: "High", value: 1, color: "var(--chart-3)" },
  { label: "Medium", value: 2, color: "var(--chart-1)" },
  { label: "Low", value: 3, color: "var(--status-neutral-fg)" },
];

export const incidentRows = [
  { id: "inc-1", title: "Chat with Sahayogi — WhatsApp delivery latency spike", severity: "high" as const, commander: "Arjun M.", workspaces: 3, status: "Mitigating", timeOpen: "2h 10m" },
  { id: "inc-2", title: "BoSS invoice webhook retry backlog", severity: "medium" as const, commander: "Rhea S.", workspaces: 1, status: "Monitoring", timeOpen: "45m" },
  { id: "inc-3", title: "Sahayogi One dashboard stale cache", severity: "low" as const, commander: "Dev K.", workspaces: 6, status: "Resolved", timeOpen: "3h 5m" },
];
