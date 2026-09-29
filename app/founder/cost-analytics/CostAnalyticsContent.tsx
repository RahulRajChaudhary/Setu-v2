"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import ToggleChart from "@/components/shared/charts/ToggleChart";
import UsageAllowanceBar from "@/components/shared/charts/UsageAllowanceBar";
import DrillLink from "@/components/shared/DrillLink";
import { costKpis, costByProvider, costAnomalies, topWorkspacesByCost, usageVsPlanAllowance } from "@/lib/mock-data/cost-analytics";

const TABS = [
  { id: "cost", label: "Cost" },
  { id: "adoption", label: "Adoption" },
];

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

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card title="Total platform cost, MTD">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--icon-chip-bg)", color: "var(--icon-chip-fg)" }}
            >
              <TrendingUp size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none text-[var(--text-heading)]">
                ₹{costKpis.mtdTotal.toLocaleString("en-IN")}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[0.6875rem] font-semibold text-[var(--trend-up-fg)]">
                ▲ {costKpis.pctChangeVsLastMonth}% vs last month
              </span>
            </div>
          </div>
        </Card>
        <Card title="Cost by provider">
          <ToggleChart data={costByProvider} defaultType="pie" />
        </Card>
      </div>

      <Card title="Top workspaces by cost" description="Highest MTD spend, share of total platform cost">
        <ul className="flex flex-col gap-[var(--space-sm)]">
          {topWorkspacesByCost.map((w) => (
            <li key={w.workspaceId} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3">
              <Link href={`/founder/workspaces/${w.workspaceId}`} className="text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
                {w.workspace}
              </Link>
              <span className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-[var(--text-secondary)]">₹{w.costMtd.toLocaleString("en-IN")}</span>
                <span className="text-xs text-[var(--text-muted)]">{w.pctOfTotal}% of total</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Cost anomalies">
        <ul className="flex flex-col gap-[var(--space-sm)]">
          {costAnomalies.map((a) => {
            const drillHref = a.workspaceId ? `/founder/workspaces/${a.workspaceId}` : a.productId ? `/founder/products/${a.productId}` : null;
            const isFlagged = flagged.has(a.id);
            return (
              <li key={a.id} className="rounded-lg border border-[var(--divider)] p-3">
                <div className="flex items-center justify-between gap-2">
                  {drillHref ? (
                    <Link href={drillHref} className="text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
                      {a.scope}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-[var(--text-secondary)]">{a.scope}</span>
                  )}
                  <span className="rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--status-warning-fg)]">
                    +{a.pctSpike}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--role-text)]">{a.metric} — {a.cause}</p>
                <div className="mt-2">
                  {isFlagged ? (
                    <span className="text-xs font-medium text-[var(--status-healthy-fg)]">Flagged to Operations Inbox</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFlagged((prev) => new Set(prev).add(a.id))}
                      className="tap-pop text-xs font-medium text-[var(--icon-btn-navy)] hover:underline"
                    >
                      Flag to Operations Inbox
                    </button>
                  )}
                </div>
              </li>
            );
          })}
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
  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <Card
        title="Usage vs plan allowance"
        description="Share of each product's plan capacity used this month"
        action={<DrillLink href="/founder/products">See per-product adoption</DrillLink>}
      >
        <UsageAllowanceBar data={usageVsPlanAllowance} />
      </Card>
    </div>
  );
}
