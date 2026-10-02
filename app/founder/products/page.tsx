"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Trash2, X } from "lucide-react";
import StatusBadge, { type StatusLevel } from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import EmptyState from "@/components/shared/EmptyState";
import { products as initialProducts, type Product, type LifecycleStage } from "@/lib/mock-data/products";
import { summarizeProduct } from "@/lib/mock-data/product-summary";
import type { HealthStatus } from "@/lib/mock-data/operations";

type HealthFilter = "all" | HealthStatus;
type LifecycleFilter = "all" | LifecycleStage;

const LIFECYCLE_TONE: Record<LifecycleStage, StatusLevel> = {
  GA: "healthy",
  Beta: "info",
  Sunset: "neutral",
};

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "P";
}

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", brand: "Sahayogi", description: "", owner: "", technicalOwner: "", lifecycleStage: "Beta" as LifecycleStage });

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productList.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.technicalOwner.toLowerCase().includes(q);
      const matchesHealth = healthFilter === "all" || summarizeProduct(p).health === healthFilter;
      const matchesLifecycle = lifecycleFilter === "all" || p.lifecycleStage === lifecycleFilter;
      return matchesSearch && matchesHealth && matchesLifecycle;
    });
  }, [search, healthFilter, lifecycleFilter, productList]);

  const healthOptions = useMemo(
    () => [
      { value: "all", label: `All (${productList.length})` },
      ...(["healthy", "warning", "critical"] as const).map((h) => ({
        value: h,
        label: `${h[0].toUpperCase()}${h.slice(1)} (${productList.filter((p) => summarizeProduct(p).health === h).length})`,
      })),
    ],
    [productList]
  );

  const lifecycleOptions = useMemo(
    () => [
      { value: "all", label: `All stages (${productList.length})` },
      ...(["GA", "Beta", "Sunset"] as const).map((l) => ({
        value: l,
        label: `${l} (${productList.filter((p) => p.lifecycleStage === l).length})`,
      })),
    ],
    [productList]
  );

  function resetForm() {
    setForm({ name: "", brand: "Sahayogi", description: "", owner: "", technicalOwner: "", lifecycleStage: "Beta" });
  }

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const baseId = slugify(name) || `product-${productList.length + 1}`;
    let id = baseId;
    let n = 2;
    while (productList.some((p) => p.id === id)) {
      id = `${baseId}-${n++}`;
    }
    const newProduct: Product = {
      id,
      name,
      brand: form.brand.trim() || "Sahayogi",
      description: form.description.trim() || "No description provided yet.",
      owner: form.owner.trim() || "Unassigned",
      technicalOwner: form.technicalOwner.trim() || "Unassigned",
      lifecycleStage: form.lifecycleStage,
      dependencyCount: 0,
      adoptionPct: 0,
      usageTrend30d: new Array(12).fill(0),
      launchedOn: new Date().toISOString().slice(0, 10),
    };
    setProductList((prev) => [...prev, newProduct]);
    resetForm();
    setShowAddForm(false);
  }

  function handleDelete(id: string) {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setPendingDeleteId(null);
  }

  const hasActiveFilters = search.trim() !== "" || healthFilter !== "all" || lifecycleFilter !== "all";

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <Breadcrumbs items={[{ label: "Product 360" }]} />

      

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-[14rem] flex-1">
          <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by name, ID, or owner..." />
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--icon-btn-navy)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          <Plus size={14} /> Add product
        </button>
      </div>

      <div className="flex flex-col gap-2.5 screen-sm:flex-row screen-sm:items-center screen-sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">Health:</span>
          <TableToolbar filterOptions={healthOptions} activeFilter={healthFilter} onFilterChange={(v) => setHealthFilter(v as HealthFilter)} />
        </div>
        <span className="hidden h-4 w-px bg-[var(--divider)] screen-sm:block" />
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">Stage:</span>
          <TableToolbar filterOptions={lifecycleOptions} activeFilter={lifecycleFilter} onFilterChange={(v) => setLifecycleFilter(v as LifecycleFilter)} />
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddProduct}
          className="flex flex-col gap-3 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--surface)] p-[var(--card-pad)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-heading)]">New product</h3>
            <button type="button" onClick={() => setShowAddForm(false)} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Added here for this session only — it&apos;s client-side mock state and isn&apos;t persisted to any backend.
          </p>
          <div className="grid grid-cols-1 gap-3 screen-sm:grid-cols-2">
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--icon-btn-navy)]"
                placeholder="e.g. Loan Sahayogi"
              />
            </Field>
            <Field label="Brand">
              <input
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--icon-btn-navy)]"
              />
            </Field>
            <Field label="Owner">
              <input
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--icon-btn-navy)]"
                placeholder="e.g. Rhea S."
              />
            </Field>
            <Field label="Technical owner">
              <input
                value={form.technicalOwner}
                onChange={(e) => setForm((f) => ({ ...f, technicalOwner: e.target.value }))}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--icon-btn-navy)]"
                placeholder="e.g. Arjun M."
              />
            </Field>
            <Field label="Lifecycle stage">
              <select
                value={form.lifecycleStage}
                onChange={(e) => setForm((f) => ({ ...f, lifecycleStage: e.target.value as LifecycleStage }))}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--icon-btn-navy)]"
              >
                <option value="Beta">Beta</option>
                <option value="GA">GA</option>
                <option value="Sunset">Sunset</option>
              </select>
            </Field>
            <div className="screen-sm:col-span-2">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--icon-btn-navy)]"
                />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
              Add product
            </button>
          </div>
        </form>
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No products match" : "No products yet"}
          description={hasActiveFilters ? "Try a different search term, or clear the active filters." : "Add a product to get started."}
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setHealthFilter("all");
                  setLifecycleFilter("all");
                }}
                className="text-sm font-medium text-[var(--icon-btn-navy)] hover:underline"
              >
                Clear search &amp; filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-2 screen-xl:grid-cols-3">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              confirmingDelete={pendingDeleteId === p.id}
              onRequestDelete={() => setPendingDeleteId(pendingDeleteId === p.id ? null : p.id)}
              onConfirmDelete={() => handleDelete(p.id)}
              onCancelDelete={() => setPendingDeleteId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product: p,
  confirmingDelete,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  product: Product;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const summary = summarizeProduct(p);

  return (
    <div
      className="card-interactive relative flex h-full min-w-0 flex-col rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--surface)] p-4"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRequestDelete();
        }}
        aria-label={confirmingDelete ? `Confirm delete ${p.name}` : `Delete ${p.name}`}
        className={`absolute right-3 top-3 z-10 rounded-full p-1 transition-colors ${
          confirmingDelete
            ? "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]"
            : "text-[var(--text-muted)] hover:bg-[var(--search-bg)] hover:text-[var(--status-critical-fg)]"
        }`}
      >
        <Trash2 size={14} />
      </button>

      {confirmingDelete && (
        <div
          className="absolute right-3 top-10 z-10 flex items-center gap-1 rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-1.5 text-xs"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <span className="pl-1 text-[var(--text-muted)]">Delete?</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirmDelete();
            }}
            className="rounded-md bg-[var(--status-critical-bg)] px-2 py-0.5 font-semibold text-[var(--status-critical-fg)]"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancelDelete();
            }}
            className="rounded-md px-2 py-0.5 text-[var(--text-muted)]"
          >
            Cancel
          </button>
        </div>
      )}

      <Link href={`/founder/products/${p.id}`} className="flex h-full min-w-0 flex-col gap-2.5">
        <div className="flex items-center gap-2.5 pr-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--icon-btn-navy)] text-xs font-semibold text-white">
            {initials(p.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-[var(--text-heading)]" title={p.name}>
              {p.name}
            </h3>
            <p className="truncate font-mono text-[0.6875rem] text-[var(--text-muted)]">{p.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={summary.health} label={summary.health} />
          <StatusBadge status={LIFECYCLE_TONE[p.lifecycleStage]} label={p.lifecycleStage} />
          {summary.latestVersion && (
            <span className="font-mono text-[0.6875rem] text-[var(--text-muted)]">{summary.latestVersion}</span>
          )}
        </div>

        <p className="line-clamp-1 text-xs text-[var(--text-muted)]" title={p.description}>
          {p.description}
        </p>

        <p className="text-xs text-[var(--role-text)]">
          Owner: <span className="font-medium text-[var(--text-secondary)]">{p.owner}</span>
        </p>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2 py-1.5 text-center">
          <MiniStat label="Workspaces" value={summary.activeWorkspaceCount} />
          <MiniStat label="Incidents" value={summary.openIncidentCount} critical={summary.openIncidentCount > 0} />
          <MiniStat label="Adoption" value={`${p.adoptionPct}%`} />
        </div>

        {(summary.rolloutPct !== null || summary.dependencyIssueCount > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {summary.rolloutPct !== null && (
              <span className="rounded-full bg-[var(--status-info-bg)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--status-info-fg)]">
                Rolling out &middot; {summary.rolloutPct}%
              </span>
            )}
            {summary.dependencyIssueCount > 0 && (
              <span className="rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--status-warning-fg)]">
                {summary.dependencyIssueCount} dependency issue{summary.dependencyIssueCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-end gap-1 pt-1 text-xs font-medium text-[var(--icon-btn-navy)]">
          View product <ArrowRight size={12} />
        </div>
      </Link>
    </div>
  );
}

function MiniStat({ label, value, critical }: { label: string; value: string | number; critical?: boolean }) {
  return (
    <div>
      <p className={`text-sm font-semibold ${critical ? "text-[var(--status-critical-fg)]" : "text-[var(--text-secondary)]"}`}>{value}</p>
      <p className="text-[0.625rem] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--text-muted)]">
        {label}
        {required && <span className="text-[var(--status-critical-fg)]"> *</span>}
      </span>
      {children}
    </label>
  );
}
