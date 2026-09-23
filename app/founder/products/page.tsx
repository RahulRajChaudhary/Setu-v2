"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/shared/Card";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import AdoptionBarList from "@/components/shared/charts/AdoptionBarList";
import { products, productKpis, type Product } from "@/lib/mock-data/products";

const HEALTH_FILTERS = [
  { value: "all", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [health, setHealth] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesHealth = health === "all" || p.health === health;
      const matchesSearch = search.trim() === "" || p.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesHealth && matchesSearch;
    });
  }, [search, health]);

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (r) => (
        <Link href={`/founder/products/${r.id}`} className="font-medium text-[var(--icon-btn-navy)] hover:underline">
          {r.name}
        </Link>
      ),
      sortValue: (r) => r.name,
    },
    { key: "brand", header: "Brand", render: (r) => r.brand },
    { key: "health", header: "Health", render: (r) => <StatusBadge status={r.health} label={r.health} /> },
    { key: "dependencyCount", header: "Dependencies", render: (r) => r.dependencyCount, sortValue: (r) => r.dependencyCount },
    { key: "adoptionPct", header: "Adoption", render: (r) => `${r.adoptionPct}%`, sortValue: (r) => r.adoptionPct },
  ];

  const adoptionData = products.map((p) => ({ label: p.name, value: p.adoptionPct, health: p.health }));

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">

      <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-3">
        <Stat label="Products live" value={productKpis.live} />
        <Stat label="Average adoption" value={`${productKpis.averageAdoptionPct}%`} />
        <Stat label="Workspaces near plan limit" value={productKpis.workspacesNearLimit} />
      </div>

      <Card title="Adoption % per product" description="Share of eligible workspaces using each product, sorted highest first">
        <AdoptionBarList data={adoptionData} average={productKpis.averageAdoptionPct} />
      </Card>

      <Card title="Products">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search products..."
          filterOptions={HEALTH_FILTERS}
          activeFilter={health}
          onFilterChange={setHealth}
        />
        <DataTable
          columns={columns}
          rows={filteredProducts}
          getRowKey={(r) => r.id}
          pageSize={8}
          emptyTitle="No products match"
          emptyDescription="Try a different search term or health filter."
        />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-[var(--card-pad)]"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-xl font-bold text-[var(--text-heading)]">{value}</p>
    </div>
  );
}
