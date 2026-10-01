import type { Product } from "./products";
import { releaseRows, subscriptionRows, incidentRows, dependencyMap, productHealthGrid, type HealthStatus } from "./operations";

export type ProductSummary = {
  health: HealthStatus;
  uptime30d: number | null;
  errorRatePct: number | null;
  latestVersion: string | null;
  latestReleaseStatus: string | null;
  rolloutPct: number | null;
  activeWorkspaceCount: number;
  totalWorkspaceCount: number;
  openIncidentCount: number;
  dependencyIssueCount: number;
};

export function summarizeProduct(product: Pick<Product, "id" | "name">): ProductSummary {
  const latest = releaseRows
    .filter((r) => r.product === product.name)
    .slice()
    .sort((a, b) => (a.deployedAt < b.deployedAt ? 1 : -1))[0];

  const subs = subscriptionRows.filter((s) => s.product === product.name);
  const dependencyIssues = dependencyMap.filter((d) => d.product === product.name && d.status !== "healthy");
  // No uptime/error-rate facts recorded yet (e.g. a product just added via the
  // registry form) defaults to "healthy" — absence of bad signal, not a claim.
  const healthRow = productHealthGrid.find((p) => p.id === product.id);

  return {
    health: healthRow?.status ?? "healthy",
    uptime30d: healthRow?.uptime30d ?? null,
    errorRatePct: healthRow?.errorRatePct ?? null,
    latestVersion: latest?.version ?? null,
    latestReleaseStatus: latest?.status ?? null,
    rolloutPct: latest && latest.status === "In progress" ? latest.blastRadiusPct : null,
    activeWorkspaceCount: subs.filter((s) => s.status === "Active").length,
    totalWorkspaceCount: subs.length,
    openIncidentCount: incidentRows.filter((i) => i.productId === product.id && i.status !== "Resolved").length,
    dependencyIssueCount: dependencyIssues.length,
  };
}
