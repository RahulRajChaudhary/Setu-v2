import type { StatusLevel } from "./types";

export const releaseKpis = {
  activeRollouts: 4,
  changeFailureRate: { pct: 6, trendDirection: "down" as const, trendValue: "2%", status: "healthy" as StatusLevel },
  deploymentFailures: { count: 1, status: "warning" as StatusLevel },
  recurringExceptions: { count: 0, status: "healthy" as StatusLevel },
};

export type RolloutStatus = "active" | "paused" | "rolled-back" | "complete";

export type Release = {
  id: string;
  buildRef: string;
  initiator: string;
  pipelineRef: string;
  targetEnv: string;
  targetServices: string[];
  migrationChanges: string;
  rolloutStrategy: string;
  cohort: string;
  preDeployHealth: string;
  postDeployHealth: string;
  rolloutPercent: number;
  status: RolloutStatus;
  pauseRollbackDecision: string;
  rollbackEvidence: string;
  linkedIncident: string | null;
  rollbackEscalated: boolean;
};

export const releases: Release[] = [
  {
    id: "rel-2091",
    buildRef: "boss-api@4.12.0 (commit 8f2c1a4)",
    initiator: "Arjun M. via GitHub Actions",
    pipelineRef: "pipeline-deploy-boss-prod-#1842",
    targetEnv: "Production",
    targetServices: ["BoSS API", "BoSS Worker"],
    migrationChanges: "Adds nullable `risk_score` column to `assessments` table",
    rolloutStrategy: "Canary, 10% → 50% → 100%",
    cohort: "All workspaces",
    preDeployHealth: "Error rate 0.4%, p95 latency 220ms",
    postDeployHealth: "Error rate 0.5%, p95 latency 235ms",
    rolloutPercent: 100,
    status: "complete",
    pauseRollbackDecision: "None — rollout completed clean",
    rollbackEvidence: "—",
    linkedIncident: null,
    rollbackEscalated: false,
  },
  {
    id: "rel-2092",
    buildRef: "chat-sahayogi@3.4.1 (commit c91ffe0)",
    initiator: "Priyanka Rao via GitHub Actions",
    pipelineRef: "pipeline-deploy-chat-prod-#903",
    targetEnv: "Production",
    targetServices: ["Chat Gateway", "WhatsApp Adapter"],
    migrationChanges: "None",
    rolloutStrategy: "Percentage rollout, cohort-gated",
    cohort: "Named beta cohort: 'chat-power-users'",
    preDeployHealth: "Error rate 0.3%, p95 latency 180ms",
    postDeployHealth: "Error rate 2.1%, p95 latency 410ms",
    rolloutPercent: 35,
    status: "paused",
    pauseRollbackDecision: "Auto-paused at 35% — error rate crossed 2% SLO threshold",
    rollbackEvidence: "Error spike linked to malformed webhook payloads from a subset of tenants",
    linkedIncident: "INC-4471",
    rollbackEscalated: true,
  },
  {
    id: "rel-2093",
    buildRef: "sahayogi-cloud@1.9.0 (commit 2ad77b1)",
    initiator: "Rahul K. via GitHub Actions",
    pipelineRef: "pipeline-deploy-cloud-prod-#511",
    targetEnv: "Production",
    targetServices: ["Sahayogi Cloud API"],
    migrationChanges: "Backfills `plan_tier` default for legacy accounts",
    rolloutStrategy: "Canary, 10% → 50% → 100%",
    cohort: "All workspaces",
    preDeployHealth: "Error rate 0.2%, p95 latency 150ms",
    postDeployHealth: "Error rate 0.2%, p95 latency 155ms",
    rolloutPercent: 50,
    status: "active",
    pauseRollbackDecision: "None yet — within SLO, proceeding to 100%",
    rollbackEvidence: "—",
    linkedIncident: null,
    rollbackEscalated: false,
  },
  {
    id: "rel-2094",
    buildRef: "tax-sahayogi@2.2.3 (commit 7b3e9d2)",
    initiator: "Meera S. via GitHub Actions",
    pipelineRef: "pipeline-deploy-tax-prod-#276",
    targetEnv: "Production",
    targetServices: ["Tax Sahayogi API", "GST Filing Worker"],
    migrationChanges: "None",
    rolloutStrategy: "Full rollout",
    cohort: "All workspaces",
    preDeployHealth: "Error rate 1.8%, p95 latency 300ms",
    postDeployHealth: "Error rate 6.4%, p95 latency 890ms",
    rolloutPercent: 100,
    status: "rolled-back",
    pauseRollbackDecision: "Manually rolled back 40 minutes after full rollout",
    rollbackEvidence: "GST filing worker timeouts during multi-state batch runs; reverted to tax-sahayogi@2.2.2",
    linkedIncident: "INC-4468",
    rollbackEscalated: true,
  },
];

export const errorRateBeforeAfter = [
  { label: "boss-api@4.12.0", before: 4, after: 5, escalated: false },
  { label: "chat-sahayogi@3.4.1", before: 3, after: 21, escalated: true },
  { label: "sahayogi-cloud@1.9.0", before: 2, after: 2, escalated: false },
  { label: "tax-sahayogi@2.2.3", before: 18, after: 64, escalated: true },
];

// Deterministic pseudo-random weekly counts (seeded — same output every run).
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEPLOY_WINDOW_WEEKS = 12;

function buildWeeklyDeploySeries(seed: number, min: number, max: number) {
  const random = mulberry32(seed);
  return Array.from({ length: DEPLOY_WINDOW_WEEKS }, () => min + Math.floor(random() * (max - min + 1)));
}

const DEPLOYMENTS_WEEKLY = buildWeeklyDeploySeries(77, 4, 13);

export type DeploymentRangeWeeks = 4 | 8 | 12;
export type DeploymentTrendPoint = { label: string; value: number };

export function buildDeploymentFrequencyTrend(rangeWeeks: DeploymentRangeWeeks = 8): DeploymentTrendPoint[] {
  const slice = DEPLOYMENTS_WEEKLY.slice(DEPLOY_WINDOW_WEEKS - rangeWeeks);
  return slice.map((value, i) => ({ label: `W${i + 1}`, value }));
}

export const deploymentFrequencyTrend = buildDeploymentFrequencyTrend(8);
