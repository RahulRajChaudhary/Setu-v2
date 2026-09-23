export const costKpis = {
  mtdTotal: 412500,
  pctChangeVsLastMonth: 8,
};

export const costByProvider = [
  { label: "Cloud (AWS)", value: 240000, color: "var(--chart-1)" },
  { label: "AI inference", value: 92000, color: "var(--chart-5)" },
  { label: "WhatsApp", value: 48000, color: "var(--chart-2)" },
  { label: "SMS", value: 21000, color: "var(--chart-3)" },
  { label: "Other APIs", value: 11500, color: "var(--status-neutral-fg)" },
];

export const costAnomalies = [
  { id: "an-1", scope: "Workspace: Delta Fintech", metric: "AI inference cost", pctSpike: 64, cause: "Office Sahayogi diagnostic model rollout, higher call volume per SME assessment" },
  { id: "an-2", scope: "Product: Chat with Sahayogi", metric: "WhatsApp cost", pctSpike: 31, cause: "Festive-season broadcast campaign, one-off spend" },
];

export const usageVsPlanAllowance = [
  { label: "BoSS", value: 82, color: "var(--chart-1)" },
  { label: "Sahayogi One", value: 64, color: "var(--chart-2)" },
  { label: "Chat w/ Sahayogi", value: 91, color: "var(--chart-3)" },
  { label: "Sahayogi Cloud", value: 55, color: "var(--chart-5)" },
  { label: "Tax Sahayogi", value: 40, color: "var(--chart-6)" },
];
