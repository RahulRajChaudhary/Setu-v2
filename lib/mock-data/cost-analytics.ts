export const costByProvider = [
  { label: "Cloud (AWS)", value: 240000, color: "var(--chart-1)" },
  { label: "AI inference", value: 92000, color: "var(--chart-5)" },
  { label: "WhatsApp", value: 48000, color: "var(--chart-2)" },
  { label: "SMS", value: 21000, color: "var(--chart-3)" },
  { label: "Other APIs", value: 11500, color: "var(--status-neutral-fg)" },
];

// MTD total is the sum of the provider breakdown so the headline number and
// the breakdown can never disagree. pctChangeVsLastMonth follows spec §1:
// (projected month-end cost ÷ last month) − 1.
export const costKpis = {
  mtdTotal: costByProvider.reduce((sum, p) => sum + p.value, 0),
  pctChangeVsLastMonth: 8,
};

export const costAnomalies = [
  { id: "an-1", scope: "Workspace: Delta Fintech", workspaceId: "ws-5", productId: null, metric: "AI inference cost", pctSpike: 64, cause: "Office Sahayogi diagnostic model rollout, higher call volume per SME assessment" },
  { id: "an-2", scope: "Product: Chat with Sahayogi", workspaceId: null, productId: "chat-sahayogi", metric: "WhatsApp cost", pctSpike: 31, cause: "Festive-season broadcast campaign, one-off spend" },
];

// Top workspaces by cost, MTD — Team Roles Design Guide, "Usage and cost"
// screen. workspaceId links back to Workspace 360 (app/founder/workspaces/[id]).
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

export const usageVsPlanAllowance = [
  { label: "BoSS", value: 82, color: "var(--chart-1)" },
  { label: "Sahayogi One", value: 64, color: "var(--chart-2)" },
  { label: "Chat w/ Sahayogi", value: 91, color: "var(--chart-3)" },
  { label: "Sahayogi Cloud", value: 55, color: "var(--chart-5)" },
  { label: "Tax Sahayogi", value: 40, color: "var(--chart-6)" },
];
