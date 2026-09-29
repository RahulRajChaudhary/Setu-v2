"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/shared/Card";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge, { StatusDot } from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import AdoptionBarList from "@/components/shared/charts/AdoptionBarList";
import LineChart from "@/components/shared/charts/LineChart";
import { products, productKpis, type Product } from "@/lib/mock-data/products";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === "") return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [search]);

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (r) => (
        <Link href={`/founder/products/${r.id}`} className="inline-flex items-center gap-2 font-medium text-[var(--icon-btn-navy)] hover:underline">
          <StatusDot status={r.health} />
          {r.name}
        </Link>
      ),
      sortValue: (r) => r.name,
    },
    {
      key: "brand",
      header: "Brand",
      render: (r) => (
        <span className="inline-flex items-center rounded-full bg-[var(--search-bg)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
          {r.brand}
        </span>
      ),
    },
    {
      key: "health",
      header: "Health",
      render: (r) => <StatusBadge status={r.health} label={r.health} />,
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.health,
        options: ["healthy", "warning", "critical"].map((v) => ({ value: v, label: v })),
      },
    },
    { key: "dependencyCount", header: "Dependencies", render: (r) => r.dependencyCount, sortValue: (r) => r.dependencyCount },
    { key: "adoptionPct", header: "Adoption", render: (r) => `${r.adoptionPct}%`, sortValue: (r) => r.adoptionPct },
  ];

  const adoptionData = products.map((p) => ({ label: p.name, value: p.adoptionPct, health: p.health }));

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Product 360" }]} />

      <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-3">
        <Stat label="Products live" value={productKpis.live} />
        <Stat label="Average adoption" value={`${productKpis.averageAdoptionPct}%`} />
        <Stat label="Workspaces near plan limit" value={productKpis.workspacesNearLimit} />
      </div>

      <Card title="Adoption % per product" description="Share of eligible workspaces using each product, sorted highest first">
        <AdoptionBarList data={adoptionData} average={productKpis.averageAdoptionPct} />
      </Card>

      <Card title="Usage trend, last 30 days" description="Daily usage index with change vs the start of the period">
        <div className="flex flex-wrap gap-[var(--space-md)]">
          {products.map((p) => {
            const series = p.usageTrend30d.map((y, x) => ({ x, y }));
            const first = p.usageTrend30d[0];
            const last = p.usageTrend30d[p.usageTrend30d.length - 1];
            const deltaPct = Math.round(((last - first) / first) * 100);
            const up = deltaPct >= 0;
            const color = up ? "var(--status-healthy-fg)" : "var(--status-critical-fg)";
            return (
              <Link
                key={p.id}
                href={`/founder/products/${p.id}`}
                className="card-interactive flex min-w-0 grow basis-full flex-col gap-2 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-[var(--text-muted)]" title={p.name}>
                    {p.name}
                  </p>
                  <span
                    className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold"
                    style={{ background: up ? "var(--status-healthy-bg)" : "var(--status-critical-bg)", color }}
                  >
                    {up ? "▲" : "▼"} {Math.abs(deltaPct)}%
                  </span>
                </div>
                <p className="text-lg font-bold leading-none text-[var(--text-heading)]">{last}</p>
                <LineChart series={series} height={44} color={color} fill showEndDot />
              </Link>
            );
          })}
        </div>
      </Card>

      <Card title="Products">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search products..." />
        <DataTable
          columns={columns}
          rows={filteredProducts}
          getRowKey={(r) => r.id}
          pageSize={8}
          emptyTitle="No products match"
          emptyDescription="Try a different search term, or clear the health filter."
        />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-[var(--card-radius)] border border-[var(--divider)] bg-[var(--surface)] p-[var(--card-pad)]"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-xl font-bold text-[var(--text-heading)]">{value}</p>
    </div>
  );
}
