"use client";

import Link from "next/link";
import { ArrowUpRight, BellRing, Check, Gauge, Layers, PackageCheck, TrendingUp, Wallet } from "lucide-react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import StatTile from "@/components/shared/StatTile";
import StatusBadge from "@/components/shared/StatusBadge";
import UsageAllowanceBar from "@/components/shared/charts/UsageAllowanceBar";
import MultiLineChart from "@/components/shared/charts/MultiLineChart";
import DrillLink from "@/components/shared/DrillLink";
import { products } from "@/lib/mock-data/products";
import { workspaceKpis } from "@/lib/mock-data/operations";
import {
  ALLOWANCE_WARN_PCT,
  allowanceByPlan,
  allowanceSummary,
  costAnomalies,
  costByProduct,
  costByProvider,
  costKpis,
  dailyCost30d,
  topWorkspacesByCost,
  weekOverWeekCostPct,
  workspacePressure,
  workspacesNearLimitByProduct,
} from "@/lib/mock-data/cost-analytics";
import { flagCostAnomaly, useFlaggedAnomalies } from "@/lib/store/decisions-store";

const TABS = [
  { id: "cost", label: "Cost" },
  { id: "adoption", label: "Adoption" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const dayLabel = (x: number) => (x === 29 ? "today" : `${29 - x}d ago`);

// Founder spec §1 colour logic for "platform cost vs last month":
// green <= +10%, amber +10-25%, red > +25%.
function trendTone(pct: number): "healthy" | "warning" | "critical" {
  if (pct > 25) return "critical";
  if (pct > 10) return "warning";
  return "healthy";
}

const TONE_VARS = {
  healthy: { fg: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)" },
  warning: { fg: "var(--status-warning-fg)", bg: "var(--status-warning-bg)" },
  critical: { fg: "var(--status-critical-fg)", bg: "var(--status-critical-bg)" },
};

// Meter bands match UsageAllowanceBar: <70 healthy, 70-89 near limit, 90+ at limit.
function meterTone(pct: number): "healthy" | "warning" | "critical" {
  if (pct >= 90) return "critical";
  if (pct >= ALLOWANCE_WARN_PCT - 10) return "warning";
  return "healthy";
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
  const flagged = useFlaggedAnomalies();
  const trend = trendTone(costKpis.pctChangeVsLastMonth);
  const providers = [...costByProvider].sort((a, b) => b.value - a.value);
  const topProduct = costByProduct.find((p) => p.productId !== null) ?? costByProduct[0];
  const maxProductCost = Math.max(...costByProduct.map((p) => p.total), 1);
  const maxWorkspaceCost = Math.max(...topWorkspacesByCost.map((w) => w.costMtd), 1);
  const wowTone = trendTone(weekOverWeekCostPct);

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-2 gap-[var(--space-sm)] screen-lg:grid-cols-4">
        <StatTile
          label="Spend, month to date"
          value={inr(costKpis.mtdTotal)}
          tone="info"
          icon={<Wallet size={16} />}
          note="Cloud + AI + WhatsApp + SMS + APIs"
        />
        <StatTile
          label="Variance vs last period"
          value={`+${costKpis.pctChangeVsLastMonth}%`}
          tone={trend}
          icon={<ArrowUpRight size={16} />}
          note="Projected month-end vs last month"
        />
        <StatTile
          label="Top cost product"
          value={topProduct.product}
          tone="neutral"
          icon={<TrendingUp size={16} />}
          note={`${inr(topProduct.total)} · ${Math.round((topProduct.total / costKpis.mtdTotal) * 100)}% of spend`}
          href={topProduct.productId ? `/founder/products/${topProduct.productId}` : undefined}
        />
        <StatTile
          label="Over 80% of allowance"
          value={allowanceSummary.overWarn}
          tone={allowanceSummary.overWarn > 0 ? "warning" : "healthy"}
          icon={<Gauge size={16} />}
          note={`workspaces · ${Math.round((allowanceSummary.overWarn / allowanceSummary.paidWorkspaces) * 100)}% of ${allowanceSummary.paidWorkspaces} paid`}
          href="/founder/cost-analytics?tab=adoption"
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-2">
        <Card title="Daily platform cost" description="Last 30 days — where spend is heading">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold"
              style={{ background: TONE_VARS[wowTone].bg, color: TONE_VARS[wowTone].fg }}
            >
              <ArrowUpRight size={12} />
              {weekOverWeekCostPct >= 0 ? "+" : ""}
              {weekOverWeekCostPct}% last 7 days
            </span>
            vs the 7 days before
          </div>
          <MultiLineChart
            lines={[{ label: "Daily cost", color: "var(--chart-1)", series: dailyCost30d }]}
            zeroBased={false}
            width={640}
            height={190}
            xLabel={dayLabel}
            format={(n) => `₹${Math.round(n / 1000)}k`}
          />
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
                  <span className="flex flex-1 items-center gap-2 text-[var(--text-secondary)]">
                    {p.label}
                    {p.estimated && (
                      <span
                        className="rounded bg-[var(--status-neutral-bg)] px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-[var(--status-neutral-fg)]"
                        title="Estimated from metered token usage × list price, not a provider bill"
                      >
                        Est.
                      </span>
                    )}
                  </span>
                  <span className="w-24 text-right font-semibold text-[var(--text-heading)]">{inr(p.value)}</span>
                  <span className="w-12 text-right text-xs text-[var(--text-muted)]">{pct < 1 ? "<1" : Math.round(pct)}%</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card title="Cost by product" description="Each bar is split by provider, so you can see what drives a product's spend">
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
          {costByProvider.map((p) => (
            <li key={p.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
              {p.label}
            </li>
          ))}
        </ul>
        <ul className="flex flex-col">
          {costByProduct.map((p) => (
            <li key={p.product} className="flex items-center gap-3 border-b border-[var(--divider)] py-2.5 last:border-b-0">
              {p.productId ? (
                <Link href={`/founder/products/${p.productId}`} className="w-40 shrink-0 truncate text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
                  {p.product}
                </Link>
              ) : (
                <span className="w-40 shrink-0 truncate text-sm font-medium text-[var(--text-muted)]" title="Infrastructure not attributable to a single product">
                  {p.product}
                </span>
              )}
              <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div className="flex h-full gap-px" style={{ width: `${(p.total / maxProductCost) * 100}%` }}>
                  {p.byProvider
                    .filter((s) => s.value > 0)
                    .map((s) => (
                      <div key={s.id} style={{ flex: s.value, backgroundColor: s.color }} title={`${s.label}: ${inr(s.value)}`} />
                    ))}
                </div>
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-semibold text-[var(--text-heading)]">{inr(p.total)}</span>
              <span className="w-10 shrink-0 text-right text-xs text-[var(--text-muted)]">{Math.round((p.total / costKpis.mtdTotal) * 100)}%</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Cost anomalies" description="Each spike links to its product and workspaces. Flagging notifies the Operations inbox and is logged in Audit.">
        <ul className="grid grid-cols-1 gap-[var(--space-sm)] screen-lg:grid-cols-3">
          {costAnomalies.map((a) => {
            const isFlagged = flagged.includes(a.id);
            const severe = a.pctSpike >= 50;
            const tone = severe ? "var(--status-critical-fg)" : "var(--status-warning-fg)";
            return (
              <li key={a.id} className="flex flex-col gap-2 rounded-xl border border-[var(--divider)] p-3" style={{ borderLeft: `3px solid ${tone}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-heading)]">{a.scope}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      {a.metric}
                      {a.estimated && <span className="rounded bg-[var(--status-neutral-bg)] px-1 text-[0.625rem] font-semibold uppercase text-[var(--status-neutral-fg)]">Est.</span>}
                    </p>
                  </div>
                  <StatusBadge status={severe ? "critical" : "warning"} label={`+${a.pctSpike}%`} />
                </div>
                <p className="text-xs text-[var(--role-text)]">{a.cause}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-heading)]">+{inr(a.extraCostInr)}</span> extra &middot; detected {a.detectedAt}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="text-[var(--text-muted)]">Trace:</span>
                  {a.productId && a.productName && (
                    <Link href={`/founder/products/${a.productId}`} className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-medium text-[var(--icon-btn-navy)] hover:underline">
                      {a.productName}
                    </Link>
                  )}
                  {a.workspaces.map((w) => (
                    <Link key={w.id} href={`/founder/workspaces/${w.id}`} className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-medium text-[var(--icon-btn-navy)] hover:underline">
                      {w.name}
                    </Link>
                  ))}
                </p>
                <div className="mt-auto pt-1">
                  {isFlagged ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--status-healthy-fg)]">
                      <Check size={14} /> Flagged to Operations inbox
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => flagCostAnomaly(a)}
                      className="tap-pop inline-flex items-center gap-1.5 rounded-lg border border-[var(--divider)] px-2.5 py-1 text-xs font-medium text-[var(--icon-btn-navy)] hover:border-[var(--icon-btn-navy)]"
                    >
                      <BellRing size={12} /> Flag to Operations inbox
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
              <Link href={`/founder/workspaces/${w.workspaceId}`} className="w-40 shrink-0 truncate text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
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

// Adoption tab = how customers are consuming what they bought: plan headroom,
// workspaces under limit pressure, and the headline adoption numbers. The full
// per-product adoption chart and sparklines live on the Products page
// (docs/Founder-Dashboard-Data-Spec.md §5), so this tab links there instead of
// repeating them.
function AdoptionTab() {
  const avgAdoption = Math.round(products.reduce((sum, p) => sum + p.adoptionPct, 0) / products.length);
  const atLimit = workspacePressure.filter((w) => Math.max(...Object.values(w.meters)) >= 90);

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-3">
        <StatTile
          label="Workspaces at limit (90%+)"
          value={atLimit.length}
          tone={atLimit.length > 0 ? "critical" : "healthy"}
          icon={<PackageCheck size={16} />}
          note={atLimit.map((w) => w.workspace).join(", ") || "None at limit"}
        />
        <StatTile
          label="Average product adoption"
          value={`${avgAdoption}%`}
          tone="info"
          icon={<Gauge size={16} />}
          note={`Across ${products.length} products`}
          href="/founder/products"
        />
        <StatTile
          label="Workspaces on 2+ products"
          value={`${workspaceKpis.multiProductAdoptionPct}%`}
          tone="info"
          icon={<Layers size={16} />}
          note="Multi-product adoption"
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-2">
        <Card title="Allowance vs actual, per plan" description="Average share of plan allowance consumed">
          <UsageAllowanceBar data={allowanceByPlan.map((p) => ({ label: `${p.plan} (${p.workspaces})`, value: p.avgUsedPct }))} warnAt={ALLOWANCE_WARN_PCT} />
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--divider)] pt-3 text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">Already over {ALLOWANCE_WARN_PCT}%:</span>
            {allowanceByPlan.map((p) => (
              <span key={p.plan}>
                {p.plan} <span className="font-semibold text-[var(--text-heading)]">{p.overWarn}</span>
              </span>
            ))}
          </p>
        </Card>

        <Card
          title="Workspaces near limit, by product"
          description="Share of each product's workspaces at 80%+ of their allowance"
          action={<DrillLink href="/founder/products">Per-product adoption</DrillLink>}
        >
          <ul className="flex flex-col gap-[var(--space-sm)]">
            {workspacesNearLimitByProduct.map((p) => (
              <li key={p.label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs text-[var(--text-muted)]" title={p.label}>
                  {p.label}
                </span>
                <div className="h-3 flex-1 rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full rounded-full" style={{ width: `${(p.value / 30) * 100}%`, backgroundColor: p.color }} />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-semibold text-[var(--text-heading)]">{p.value}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Closest to their allowance" description="Workspaces under the most limit pressure, with the meter driving it">
        <ul className="flex flex-col">
          {workspacePressure.map((w) => {
            const worst = Math.max(...Object.values(w.meters));
            return (
              <li key={w.workspaceId} className="flex flex-col gap-2 border-b border-[var(--divider)] py-3 last:border-b-0 screen-lg:flex-row screen-lg:items-center screen-lg:gap-4">
                <div className="flex items-center gap-2 whitespace-nowrap screen-lg:w-80 screen-lg:shrink-0">
                  <Link href={`/founder/workspaces/${w.workspaceId}`} className="truncate text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
                    {w.workspace}
                  </Link>
                  <span className="shrink-0 rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.6875rem] font-medium text-[var(--role-text)]">{w.plan}</span>
                  {worst >= ALLOWANCE_WARN_PCT && <StatusBadge status={meterTone(worst)} label={worst >= 90 ? "At limit" : "Near limit"} />}
                </div>
                <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-1.5 screen-sm:grid-cols-3">
                  {Object.entries(w.meters).map(([meter, pct]) => (
                    <div key={meter} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">{meter}</span>
                      <div className="relative h-2 flex-1 rounded-full bg-[var(--surface-muted)]">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: TONE_VARS[meterTone(pct)].fg }} />
                        <span
                          className="absolute top-0 h-full w-px bg-[var(--text-muted)]/50"
                          style={{ left: `${ALLOWANCE_WARN_PCT}%` }}
                          title={`${ALLOWANCE_WARN_PCT}% warning line`}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs font-semibold text-[var(--text-heading)]">{pct}%</span>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
