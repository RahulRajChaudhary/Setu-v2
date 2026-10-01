"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BellRing, Check, Gauge, PackageCheck, TrendingUp } from "lucide-react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import StatTile from "@/components/shared/StatTile";
import StatusBadge, { type StatusLevel } from "@/components/shared/StatusBadge";
import UsageAllowanceBar from "@/components/shared/charts/UsageAllowanceBar";
import DrillLink from "@/components/shared/DrillLink";
import { costKpis, costByProvider, costAnomalies, topWorkspacesByCost, usageVsPlanAllowance } from "@/lib/mock-data/cost-analytics";

const TABS = [
  { id: "cost", label: "Cost" },
  { id: "adoption", label: "Adoption" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Spec §1 colour logic for "platform cost vs last month":
// green <= +10%, amber +10-25%, red > +25%.
function trendTone(pct: number): { status: StatusLevel; fg: string; bg: string } {
  if (pct > 25) return { status: "critical", fg: "var(--status-critical-fg)", bg: "var(--status-critical-bg)" };
  if (pct > 10) return { status: "warning", fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)" };
  return { status: "healthy", fg: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)" };
}

export default function CostAnalyticsContent() {
  const active = useActiveTab(TABS);
  const activeLabel = TABS.find((t) => t.id === active)?.label ?? TABS[0].label;

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Cost & Analytics", href: "/founder/cost-analytics" }, { label: activeLabel }]} />
      <TabBar tabs={TABS} />

      {active === "cost" ? <CostTab /> : <AdoptionTab />}
    </div>
  );
}

function CostTab() {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const trend = trendTone(costKpis.pctChangeVsLastMonth);
  const providers = [...costByProvider].sort((a, b) => b.value - a.value);
  const largest = providers[0];
  const maxWorkspaceCost = Math.max(...topWorkspacesByCost.map((w) => w.costMtd), 1);

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <Card title="Total platform cost, MTD" description="Cloud + AI + WhatsApp + SMS + APIs">
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--icon-chip-bg)", color: "var(--icon-chip-fg)" }}
              >
                <TrendingUp size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-3xl font-bold leading-none text-[var(--text-heading)]">{inr(costKpis.mtdTotal)}</p>
                <span
                  className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold"
                  style={{ background: trend.bg, color: trend.fg }}
                >
                  <ArrowUpRight size={12} />
                  {costKpis.pctChangeVsLastMonth}% vs last month
                </span>
              </div>
            </div>
            <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-heading)]">{largest.label}</span> is the largest cost at{" "}
              {Math.round((largest.value / costKpis.mtdTotal) * 100)}% of spend. Revenue and invoices live in BoSS Finance, not here.
            </p>
          </div>
        </Card>

        <Card title="Cost by provider" description="Share of month-to-date spend">
          <div
            className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={providers.map((p) => `${p.label} ${inr(p.value)}`).join(", ")}
          >
            {providers.map((p) => (
              <div key={p.label} style={{ flex: p.value, backgroundColor: p.color }} title={`${p.label}: ${inr(p.value)}`} />
            ))}
          </div>
          <ul className="mt-4 flex flex-col">
            {providers.map((p) => {
              const pct = (p.value / costKpis.mtdTotal) * 100;
              return (
                <li key={p.label} className="flex items-center gap-3 border-b border-[var(--divider)] py-2 text-sm last:border-b-0">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 text-[var(--text-secondary)]">{p.label}</span>
                  <span className="w-24 text-right font-semibold text-[var(--text-heading)]">{inr(p.value)}</span>
                  <span className="w-12 text-right text-xs text-[var(--text-muted)]">{pct < 1 ? "<1" : Math.round(pct)}%</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card title="Cost anomalies" description="Spikes worth a look — flag one to push it to your Operations Inbox">
        <ul className="grid grid-cols-1 gap-[var(--space-sm)] screen-lg:grid-cols-2">
          {costAnomalies.map((a) => {
            const drillHref = a.workspaceId ? `/founder/workspaces/${a.workspaceId}` : a.productId ? `/founder/products/${a.productId}` : null;
            const isFlagged = flagged.has(a.id);
            const severe = a.pctSpike >= 50;
            const tone = severe ? "var(--status-critical-fg)" : "var(--status-warning-fg)";
            return (
              <li key={a.id} className="flex flex-col gap-2 rounded-xl border border-[var(--divider)] p-3" style={{ borderLeft: `3px solid ${tone}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {drillHref ? (
                      <Link href={drillHref} className="text-sm font-semibold text-[var(--icon-btn-navy)] hover:underline">
                        {a.scope}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">{a.scope}</span>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{a.metric}</p>
                  </div>
                  <StatusBadge status={severe ? "critical" : "warning"} label={`+${a.pctSpike}%`} />
                </div>
                <p className="text-xs text-[var(--role-text)]">{a.cause}</p>
                <div className="mt-auto pt-1">
                  {isFlagged ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--status-healthy-fg)]">
                      <Check size={14} /> Flagged to Operations Inbox
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFlagged((prev) => new Set(prev).add(a.id))}
                      className="tap-pop inline-flex items-center gap-1.5 rounded-lg border border-[var(--divider)] px-2.5 py-1 text-xs font-medium text-[var(--icon-btn-navy)] hover:border-[var(--icon-btn-navy)]"
                    >
                      <BellRing size={12} /> Flag to Operations Inbox
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Top workspaces by cost" description="Highest MTD spend and share of total platform cost">
        <ul className="flex flex-col">
          {topWorkspacesByCost.map((w, i) => (
            <li key={w.workspaceId} className="flex items-center gap-3 border-b border-[var(--divider)] py-2.5 last:border-b-0">
              <span className="w-5 shrink-0 text-center text-xs font-bold text-[var(--text-muted)]">{i + 1}</span>
              <Link
                href={`/founder/workspaces/${w.workspaceId}`}
                className="w-40 shrink-0 truncate text-sm font-medium text-[var(--icon-btn-navy)] hover:underline"
              >
                {w.workspace}
              </Link>
              <div className="h-2 flex-1 rounded-full bg-[var(--surface-muted)]" title={`${w.pctOfTotal}% of total platform cost`}>
                <div className="h-full rounded-full" style={{ width: `${(w.costMtd / maxWorkspaceCost) * 100}%`, backgroundColor: "var(--chart-1)" }} />
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-semibold text-[var(--text-heading)]">{inr(w.costMtd)}</span>
              <span className="w-10 shrink-0 text-right text-xs text-[var(--text-muted)]">{w.pctOfTotal}%</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// Per-product adoption % and its 30-day usage sparkline live on the Products
// page (docs/Founder-Dashboard-Data-Spec.md §5) — this tab keeps the
// capacity-vs-allowance view, which is genuinely cost/analytics-flavored
// (plan headroom, not adoption itself), and cross-links to Products for the
// adoption breakdown instead of duplicating that chart here.
function AdoptionTab() {
  const sorted = [...usageVsPlanAllowance].sort((a, b) => b.value - a.value);
  const nearLimit = sorted.filter((p) => p.value >= 80);
  const avg = Math.round(sorted.reduce((sum, p) => sum + p.value, 0) / sorted.length);

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-2">
        <StatTile
          label="Products near plan limit"
          value={nearLimit.length}
          tone={nearLimit.length > 0 ? "warning" : "healthy"}
          icon={<PackageCheck size={16} />}
          note={nearLimit.map((p) => p.label).join(", ") || "All within allowance"}
        />
        <StatTile label="Average plan usage" value={`${avg}%`} tone="info" icon={<Gauge size={16} />} note={`Across ${sorted.length} products`} />
      </div>

      <Card
        title="Usage vs plan allowance"
        description="Share of each product's plan capacity used this month, highest first"
        action={<DrillLink href="/founder/products">See per-product adoption</DrillLink>}
      >
        <UsageAllowanceBar data={sorted} />
      </Card>
    </div>
  );
}
