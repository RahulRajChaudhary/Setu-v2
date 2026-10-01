"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DrillLink from "@/components/shared/DrillLink";
import TabBar, { useActiveTab, type Tab } from "@/components/shared/TabBar";
import LineChart from "@/components/shared/charts/LineChart";
import { products } from "@/lib/mock-data/products";
import {
  productHealthGrid,
  releaseRows,
  dependencyMap,
  integrationRows,
  syntheticChecks,
  subscriptionRows,
  incidentRows,
} from "@/lib/mock-data/operations";
import { costAnomalies } from "@/lib/mock-data/cost-analytics";

const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "health", label: "Health" },
  { id: "releases", label: "Releases" },
  { id: "dependencies", label: "Dependencies" },
  { id: "subscriptions", label: "Subscriptions" },
];

function releaseStatusLevel(status: string): "healthy" | "warning" | "critical" | "info" {
  if (status === "Complete") return "healthy";
  if (status === "In progress") return "info";
  if (status.toLowerCase().includes("rollback")) return "critical";
  return "warning";
}

export default function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const activeTab = useActiveTab(TABS);
  const product = products.find((p) => p.id === params.id);
  const healthRow = productHealthGrid.find((p) => p.id === params.id);
  const productReleases = product
    ? releaseRows
        .filter((r) => r.product === product.name)
        .slice()
        .sort((a, b) => (a.deployedAt < b.deployedAt ? 1 : -1))
    : [];
  const productDependencies = product ? dependencyMap.filter((d) => d.product === product.name) : [];
  const productIntegrations = product ? integrationRows.filter((i) => i.product === product.name) : [];
  const productSyntheticChecks = product ? syntheticChecks.filter((c) => c.product === product.name) : [];
  const productSubscriptions = product ? subscriptionRows.filter((s) => s.product === product.name) : [];
  const productCostAnomaly = product ? costAnomalies.find((a) => a.productId === product.id) : undefined;
  const activeIncidentCount = product
    ? incidentRows.filter((i) => i.productId === product.id && i.status !== "Resolved").length
    : 0;

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This product doesn't exist in the mock catalogue."
        action={
          <Link href="/founder/products" className="text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
            Back to Product 360
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Product 360", href: "/founder/products" }, { label: product.name }]} />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{product.name}</h1>
          <span className="inline-flex items-center rounded-full bg-[var(--search-bg)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {product.brand}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{product.description}</p>
      </div>

      <TabBar tabs={TABS} />

      {activeTab === "overview" && (
        <div className="flex flex-col gap-[var(--space-lg)]">
          <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-3">
            <Card title="Health">
              <StatusBadge status={product.health} label={product.health} />
              {healthRow && (
                <div className="mt-2 text-xs text-[var(--role-text)]">
                  <p>Uptime, 30d: {healthRow.uptime30d}%</p>
                  <p>Error rate: {healthRow.errorRatePct}%</p>
                </div>
              )}
            </Card>
            <Card title="Dependencies">
              <p className="text-2xl font-semibold text-[var(--text-secondary)]">{product.dependencyCount}</p>
              <p className="text-xs text-[var(--role-text)]">dependent services</p>
            </Card>
            <Card title="Adoption">
              <p className="text-2xl font-semibold text-[var(--text-secondary)]">{product.adoptionPct}%</p>
              <p className="text-xs text-[var(--role-text)]">of eligible workspaces</p>
            </Card>
          </div>

          {productCostAnomaly && (
            <Card title="Cost anomaly">
              <p className="text-sm text-[var(--text-secondary)]">
                {productCostAnomaly.metric} up {productCostAnomaly.pctSpike}% — {productCostAnomaly.cause}
              </p>
              <DrillLink href="/founder/cost-analytics">View in Cost &amp; Analytics</DrillLink>
            </Card>
          )}
          {activeIncidentCount > 0 && (
            <Card title="Active incidents">
              <p className="text-sm text-[var(--text-secondary)]">
                {activeIncidentCount} open incident{activeIncidentCount > 1 ? "s" : ""} referencing {product.name}.
              </p>
              <DrillLink href="/founder/operations" params={{ tab: "incidents" }}>
                View in Platform Ops
              </DrillLink>
            </Card>
          )}

          <Card title="Usage trend, last 30 days">
            <LineChart series={product.usageTrend30d.map((y, x) => ({ x, y }))} height={100} />
          </Card>
        </div>
      )}

      {activeTab === "health" && (
        <Card title={`${product.name} — health`}>
          <div className="flex flex-col items-start gap-2">
            <StatusBadge status={product.health} label={product.health} />
            {healthRow && (
              <div className="text-xs text-[var(--role-text)]">
                <p>Uptime, 30d: {healthRow.uptime30d}%</p>
                <p>Error rate: {healthRow.errorRatePct}%</p>
              </div>
            )}
            <DrillLink href="/founder/operations" params={{ tab: "health", product: product.id }}>
              View full health telemetry in Platform Ops
            </DrillLink>
          </div>
        </Card>
      )}

      {activeTab === "releases" && (
        productReleases.length > 0 ? (
          <Card title={`${product.name} — latest release`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--text-secondary)]">{productReleases[0].version}</span>
                <StatusBadge status={releaseStatusLevel(productReleases[0].status)} label={productReleases[0].status} />
              </div>
              <p className="text-xs text-[var(--role-text)]">Deployed {productReleases[0].deployedAt} &middot; {productReleases[0].blastRadiusPct}% rolled out</p>
              <DrillLink href="/founder/operations" params={{ tab: "releases", product: product.name }}>
                View full release history in Platform Ops
              </DrillLink>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No releases yet"
            description={`${product.name} has no recorded releases in the mock catalogue.`}
          />
        )
      )}

      {activeTab === "dependencies" && (
        <div className="flex flex-col gap-[var(--space-md)]">
          <Card title={`${product.name} — service dependencies`}>
            {productDependencies.length === 0 ? (
              <p className="text-sm text-[var(--role-text)]">No service dependencies recorded for this product.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {productDependencies.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                    <span className="text-[var(--text-secondary)]">{d.service}</span>
                    <StatusBadge status={d.status} label={d.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={`${product.name} — integrations`}>
            {productIntegrations.length === 0 ? (
              <p className="text-sm text-[var(--role-text)]">No integrations recorded for this product.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {productIntegrations.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {i.name}
                      <span className="ml-2 text-xs text-[var(--text-muted)]">
                        last sync {i.lastSyncAt} &middot; {i.errorCount24h} errors/24h
                      </span>
                    </span>
                    <StatusBadge status={i.status} label={i.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={`${product.name} — synthetic checks`}>
            {productSyntheticChecks.length === 0 ? (
              <p className="text-sm text-[var(--role-text)]">No synthetic checks recorded for this product.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {productSyntheticChecks.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                    <span className="text-[var(--text-secondary)]">{c.check}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">{c.lastRun}</span>
                      <StatusBadge status={c.status === "pass" ? "healthy" : "critical"} label={c.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <DrillLink href="/founder/operations" params={{ tab: "health", product: product.id }}>
            View full dependency and integration detail in Platform Ops
          </DrillLink>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <Card title={`${product.name} — subscribed workspaces`}>
          {productSubscriptions.length === 0 ? (
            <EmptyState
              title="No subscriptions"
              description={`No workspace currently subscribes to ${product.name} in the mock catalogue.`}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <ul className="flex flex-col gap-2">
                {productSubscriptions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                    <Link href={`/founder/workspaces/${s.workspaceId}`} className="font-medium text-[var(--icon-btn-navy)] hover:underline">
                      {s.workspace}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">{s.plan}</span>
                      <StatusBadge status={s.status === "Active" ? "healthy" : s.status === "Grace" ? "warning" : "critical"} label={s.status} />
                    </div>
                  </li>
                ))}
              </ul>
              <DrillLink href="/founder/operations" params={{ tab: "subscriptions", product: product.name }}>
                View all subscriptions in Platform Ops
              </DrillLink>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
