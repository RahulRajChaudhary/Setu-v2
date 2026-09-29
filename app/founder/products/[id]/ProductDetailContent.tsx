"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TabBar, { useActiveTab, type Tab } from "@/components/shared/TabBar";
import LineChart from "@/components/shared/charts/LineChart";
import { products } from "@/lib/mock-data/products";
import { productHealthGrid } from "@/lib/mock-data/operations";

const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "health", label: "Health" },
  { id: "releases", label: "Releases" },
];

export default function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const activeTab = useActiveTab(TABS);
  const product = products.find((p) => p.id === params.id);
  const healthRow = productHealthGrid.find((p) => p.id === params.id);

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
    </div>
  );
}
