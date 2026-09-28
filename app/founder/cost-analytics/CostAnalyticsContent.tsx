"use client";

import { TrendingUp } from "lucide-react";
import Card from "@/components/shared/Card";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import ToggleChart from "@/components/shared/charts/ToggleChart";
import LineChart from "@/components/shared/charts/LineChart";
import UsageAllowanceBar from "@/components/shared/charts/UsageAllowanceBar";
import AdoptionBarList from "@/components/shared/charts/AdoptionBarList";
import { costKpis, costByProvider, costAnomalies, usageVsPlanAllowance } from "@/lib/mock-data/cost-analytics";
import { products, productKpis } from "@/lib/mock-data/products";

const TABS = [
  { id: "cost", label: "Cost" },
  { id: "adoption", label: "Adoption" },
];

export default function CostAnalyticsContent() {
  const active = useActiveTab(TABS);

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <TabBar tabs={TABS} />

      {active === "cost" ? <CostTab /> : <AdoptionTab />}
    </div>
  );
}

function CostTab() {
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

      <Card title="Cost anomalies">
        <ul className="flex flex-col gap-[var(--space-sm)]">
          {costAnomalies.map((a) => (
            <li key={a.id} className="rounded-lg border border-[var(--divider)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">{a.scope}</span>
                <span className="rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--status-warning-fg)]">
                  +{a.pctSpike}%
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--role-text)]">{a.metric} — {a.cause}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Usage vs plan allowance" description="Share of each product's plan capacity used this month">
        <UsageAllowanceBar data={usageVsPlanAllowance} />
      </Card>
    </div>
  );
}

function AdoptionTab() {
  const adoptionData = products.map((p) => ({ label: p.name, value: p.adoptionPct, health: p.health }));

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
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
              <div
                key={p.id}
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
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
