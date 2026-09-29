"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TabBar, { useActiveTab, type Tab } from "@/components/shared/TabBar";
import LineChart from "@/components/shared/charts/LineChart";
import Gauge from "@/components/shared/charts/Gauge";
import { products } from "@/lib/mock-data/products";
import { productHealthGrid, productHealthSignals, releaseRows } from "@/lib/mock-data/operations";

const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "health", label: "Health" },
  { id: "releases", label: "Releases" },
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
  const signals = product ? productHealthSignals[product.id] : undefined;
  const productReleases = product
    ? releaseRows
        .filter((r) => r.product === product.name)
        .slice()
        .sort((a, b) => (a.deployedAt < b.deployedAt ? 1 : -1))
    : [];

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

          <Card title="Usage trend, last 30 days">
            <LineChart series={product.usageTrend30d.map((y, x) => ({ x, y }))} height={100} />
          </Card>
        </div>
      )}

      {activeTab === "health" && (
        signals ? (
          <Card title={`${product.name} — golden signals`} description="p95 latency, traffic, error rate (with SLO line) and resource saturation, last 24h">
            <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-4">
              <div>
                <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">p95 latency (ms)</p>
                <LineChart series={signals.p95LatencyMs.series} thresholdY={signals.p95LatencyMs.sloMs} thresholdLabel="SLO" height={64} />
              </div>
              <div>
                <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">Requests / sec</p>
                <LineChart series={signals.requestsPerSec.series} color="var(--chart-2)" height={64} />
              </div>
              <div>
                <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">Error rate % (SLO line)</p>
                <LineChart series={signals.errorRatePct.series} thresholdY={signals.errorRatePct.sloPct} thresholdLabel="SLO" color="var(--chart-4)" height={64} />
              </div>
              <div>
                <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">Saturation</p>
                <Gauge
                  value={signals.saturationPct}
                  status={signals.saturationPct >= 80 ? "critical" : signals.saturationPct >= 60 ? "warning" : "healthy"}
                />
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No golden-signal telemetry"
            description={`${product.name} doesn't have p95 latency, traffic, error-rate or saturation telemetry wired up in the mock yet.`}
          />
        )
      )}

      {activeTab === "releases" && (
        productReleases.length > 0 ? (
          <Card title={`${product.name} — release history`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--divider)] text-left text-xs font-medium text-[var(--text-muted)]">
                    <th className="py-2 pr-4">Version</th>
                    <th className="py-2 pr-4">Deployed</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Blast radius</th>
                    <th className="py-2 pr-4">Approval ref</th>
                  </tr>
                </thead>
                <tbody>
                  {productReleases.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--divider)] last:border-0">
                      <td className="py-2 pr-4 font-medium text-[var(--text-secondary)]">{r.version}</td>
                      <td className="py-2 pr-4 text-[var(--role-text)]">{r.deployedAt}</td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={releaseStatusLevel(r.status)} label={r.status} />
                      </td>
                      <td className="py-2 pr-4 text-[var(--role-text)]">{r.blastRadiusPct}%</td>
                      <td className="py-2 pr-4 text-[var(--role-text)]">{r.approvalRef ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No releases yet"
            description={`${product.name} has no recorded releases in the mock catalogue.`}
          />
        )
      )}
    </div>
  );
}
