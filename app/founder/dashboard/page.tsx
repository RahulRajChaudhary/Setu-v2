"use client";

import { useEffect, useState } from "react";
import Card from "@/components/shared/Card";
import CalendarCard from "@/components/shared/CalendarCard";
import GreetingCard from "@/components/shared/GreetingCard";
import KPITile from "@/components/shared/KPITile";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import type { StatusLevel } from "@/components/shared/StatusBadge";
import DrillLink from "@/components/shared/DrillLink";
import DonutChart from "@/components/shared/charts/DonutChart";
import AreaTrendChart from "@/components/shared/charts/AreaTrendChart";
import {
  generateKpiSnapshot,
  needsYourDecision,
  areasAtGlance,
  topRisks,
  controlsEffectiveByFramework,
  growthLast30Days,
  growthTrend,
  newCustomersTotal,
  type KpiSnapshot,
} from "@/lib/mock-data/control-room";
import type { Severity } from "@/lib/mock-data/types";
import { workspaceKpis, subscriptionKpis } from "@/lib/mock-data/operations";
import { productKpis } from "@/lib/mock-data/products";
import { complianceKpis } from "@/lib/mock-data/compliance-risk";
import { costKpis } from "@/lib/mock-data/cost-analytics";

const REFRESH_MS = 60_000;
const FAILURE_RATE = 0.2;

function useKpiSnapshot() {
  const [snapshot, setSnapshot] = useState<KpiSnapshot>(() => generateKpiSnapshot());
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const failed = Math.random() < FAILURE_RATE;
      if (failed) {
        setStale(true);
        return;
      }
      setSnapshot(generateKpiSnapshot());
      setUpdatedAt(new Date());
      setStale(false);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { snapshot, updatedAt, stale };
}

const SEVERITY_STATUS: Record<Severity, "healthy" | "warning" | "critical"> = {
  low: "healthy",
  medium: "warning",
  high: "critical",
  critical: "critical",
};

export default function ControlRoomPage() {
  const { snapshot, updatedAt, stale } = useKpiSnapshot();

  const decisionColumns: Column<(typeof needsYourDecision)[number]>[] = [
    { key: "type", header: "Type", render: (r) => r.type, sortValue: (r) => r.type },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "requester", header: "Requester", render: (r) => r.requester },
    { key: "impact", header: "Impact", render: (r) => <span className="text-xs text-[var(--role-text)]">{r.impact}</span> },
    {
      key: "deadline",
      header: "Deadline",
      render: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={SEVERITY_STATUS[r.severity]} label={r.deadline} />
        </div>
      ),
      sortValue: (r) => r.deadline,
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">

      <div className="grid grid-cols-1 gap-[var(--space-md)] xl:grid-cols-[1fr_383px]">
      <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 xl:grid-cols-5">
        <GreetingCard name="Dhruv Singla" />
        <KPITile
          title="Products healthy"
          value={`${snapshot.productsHealthy.healthy}/${snapshot.productsHealthy.active}`}
          note="active products reporting healthy"
          status={snapshot.productsHealthy.status}
          drillHref="/founder/products"
          updatedAt={updatedAt}
          stale={stale}
          icon={<HealthIcon />}
        />
        <KPITile
          title="Waiting for your approval"
          value={snapshot.waitingForApproval.count}
          note="approvals need Founder sign-off"
          status={snapshot.waitingForApproval.status}
          drillHref="/founder/approvals"
          updatedAt={updatedAt}
          stale={stale}
          icon={<ApprovalIcon />}
        />
        <KPITile
          title="Open incidents"
          value={snapshot.openIncidents.count}
          note="not yet resolved or closed"
          status={snapshot.openIncidents.status}
          drillHref="/founder/operations"
          updatedAt={updatedAt}
          stale={stale}
          icon={<IncidentIcon />}
        />
        <KPITile
          title="Platform cost vs last month"
          value={`+${snapshot.platformCostTrend.pctChange}%`}
          note="projected month-end vs last month"
          status={snapshot.platformCostTrend.status}
          drillHref="/founder/cost-analytics"
          updatedAt={updatedAt}
          stale={stale}
          icon={<CostIcon />}
          trendDirection={snapshot.platformCostTrend.status === "critical" ? "up" : snapshot.platformCostTrend.status === "healthy" ? "down" : "up"}
          trendValue={`${snapshot.platformCostTrend.pctChange}%`}
        />
        <KPITile
          title="Total workspaces"
          value={workspaceKpis.total}
          note={`${workspaceKpis.active} active · ${workspaceKpis.graceOrRestricted} grace/restricted`}
          status={workspaceKpis.failedProvisioning24h > 0 ? "warning" : "healthy"}
          drillHref="/founder/operations"
          updatedAt={updatedAt}
          stale={stale}
          icon={<WorkspaceIcon />}
        />
        <KPITile
          title="Active subscriptions"
          value={subscriptionKpis.active}
          note={`${subscriptionKpis.grace} in grace · ${subscriptionKpis.restricted} restricted`}
          status={subscriptionKpis.restricted > 0 ? "warning" : "healthy"}
          drillHref="/founder/operations"
          updatedAt={updatedAt}
          stale={stale}
          icon={<SubscriptionIcon />}
        />
        <KPITile
          title="Average adoption"
          value={`${productKpis.averageAdoptionPct}%`}
          note={`${productKpis.workspacesNearLimit} workspaces near plan limit`}
          status={productKpis.averageAdoptionPct >= 60 ? "healthy" : "warning"}
          drillHref="/founder/products"
          updatedAt={updatedAt}
          stale={stale}
          icon={<AdoptionIcon />}
        />
        <KPITile
          title="Findings overdue"
          value={complianceKpis.findingsOverdue}
          note={`${complianceKpis.controlsFailedException} controls failed/exception`}
          status={complianceKpis.findingsOverdue > 0 ? "critical" : "healthy"}
          drillHref="/founder/compliance-risk"
          updatedAt={updatedAt}
          stale={stale}
          icon={<ComplianceIcon />}
        />
        <KPITile
          title="Platform cost, MTD"
          value={`₹${(costKpis.mtdTotal / 100000).toFixed(1)}L`}
          note={`+${costKpis.pctChangeVsLastMonth}% vs last month`}
          status={costKpis.pctChangeVsLastMonth > 15 ? "warning" : "healthy"}
          drillHref="/founder/cost-analytics"
          updatedAt={updatedAt}
          stale={stale}
          icon={<CostIcon />}
        />
      </div>
        <CalendarCard />
      </div>

      <div className="grid grid-cols-1 items-start gap-[var(--space-md)] lg:grid-cols-2">
        <Card title="Controls effective by framework" description="Effective controls ÷ total controls, per compliance framework">
          <div className="flex flex-col items-center gap-[var(--space-md)] sm:flex-row sm:items-center">
            <DonutChart
              data={controlsEffectiveByFramework.map((f) => ({ label: f.label, value: f.effective, color: f.color }))}
              size={132}
              centerLabel="controls"
              legend={false}
            />
            <ul className="flex w-full flex-col gap-2.5">
              {controlsEffectiveByFramework.map((f) => {
                const status = f.value >= 90 ? "healthy" : f.value >= 75 ? "warning" : "critical";
                const bandWord = f.value >= 90 ? "Effective" : f.value >= 75 ? "Needs attention" : "At risk";
                return (
                  <li key={f.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-[var(--role-text)]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.color }} />
                      {f.label}
                      <span className="text-xs text-[var(--text-muted)]">({f.effective}/{f.total})</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-secondary)]">{f.value}%</span>
                      <StatusBadge status={status} label={bandWord} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-[var(--space-md)] border-t border-[var(--divider)] pt-[var(--space-md)]">
            <h3 className="mb-[var(--space-sm)] text-sm font-semibold text-[var(--text-heading)]">Top risks</h3>
            <ul className="flex flex-col gap-[var(--space-sm)]">
              {topRisks.map((risk) => (
                <li key={risk.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{risk.label}</p>
                    <p className="text-xs text-[var(--role-text)]">Owner: {risk.owner}</p>
                  </div>
                  <StatusBadge
                    status={risk.likelihood * risk.impact >= 16 ? "critical" : "warning"}
                    label={`${risk.likelihood * risk.impact}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card
          title="Growth, last 30 days"
          description="New customers vs. trial-to-paid conversions, cumulative"
          action={<span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">Last 30 days</span>}
        >
          <AreaTrendChart
            series={[
              { key: "newCustomers", label: "New customers", color: "var(--chart-1)", data: growthTrend.map((d) => d.newCustomers) },
              { key: "trialToPaid", label: "Trial → paid", color: "var(--chart-3)", data: growthTrend.map((d) => d.trialToPaid) },
            ]}
            xLabels={growthTrend.map((d) => d.label)}
          />
          <dl className="mt-[var(--space-sm)] grid grid-cols-2 gap-[var(--space-sm)] border-t border-[var(--divider)] pt-[var(--space-sm)] sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--role-text)]">New customers</dt>
              <dd className="text-lg font-semibold text-[var(--text-secondary)]">{newCustomersTotal}</dd>
            </div>
            {growthLast30Days.map((g) => (
              <div key={g.label}>
                <dt className="text-xs text-[var(--role-text)]">{g.label}</dt>
                <dd className="text-lg font-semibold text-[var(--text-secondary)]">{g.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card title="Needs Your Decision" action={<DrillLink href="/founder/approvals">Open queue</DrillLink>}>
        <DataTable
          columns={decisionColumns}
          rows={needsYourDecision}
          getRowKey={(r) => r.id}
          emptyTitle="Nothing waiting on you"
          emptyDescription="Approvals routed to the Founder will show up here."
        />
      </Card>

      <Card title="Nine Areas at a Glance" description="One tile per area — colour, cause and a link to the full section">
        <div className="grid grid-cols-1 gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-3">
          {areasAtGlance.map((area) => {
            const tone = AREA_TONE[area.status];
            return (
              <DrillLink
                key={area.id}
                href={area.href}
                className="card-interactive tap-pop group relative flex items-center gap-2.5 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-[var(--card-pad)]"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <AreaIcon id={area.id} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--text-heading)]">{area.label}</span>
                    <StatusBadge status={area.status} label={AREA_STATUS_LABEL[area.status]} />
                  </span>
                  <span className="truncate text-xs text-[var(--text-muted)]">{area.cause}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ color: tone.fg }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </DrillLink>
            );
          })}
        </div>
      </Card>

    </div>
  );
}

const AREA_TONE: Record<StatusLevel, { bg: string; fg: string }> = {
  healthy: { bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
  info: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
  neutral: { bg: "var(--status-neutral-bg)", fg: "var(--status-neutral-fg)" },
};

const AREA_STATUS_LABEL: Record<StatusLevel, string> = {
  healthy: "Healthy",
  warning: "Attention",
  critical: "Critical",
  info: "Info",
  neutral: "—",
};

function AreaIcon({ id }: { id: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (id) {
    case "platform":
      return <svg {...props}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><circle cx="7" cy="7" r="0.6" fill="currentColor" /><circle cx="7" cy="17" r="0.6" fill="currentColor" /></svg>;
    case "customers":
      return <svg {...props}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.2c2.5.4 4.5 2.5 4.5 5.3" /></svg>;
    case "commercial":
      return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M8 7V5.5C8 4.7 8.7 4 9.5 4h5c.8 0 1.5.7 1.5 1.5V7" /></svg>;
    case "operations":
      return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>;
    case "security":
      return <svg {...props}><path d="M12 3l7 3v5.5c0 4.2-3 7.6-7 8.5-4-.9-7-4.3-7-8.5V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "compliance":
      return <svg {...props}><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M8 3.5V2.5C8 2 8.4 1.5 9 1.5h6c.6 0 1 .5 1 1v1" /><path d="M8.5 11L11 13.5L15.5 9" /></svg>;
    case "releases":
      return <svg {...props}><path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-1 3-2-2-2 2-1-3c-1-1-2-3-2-5 0-4 2-8 5-10Z" /><circle cx="12" cy="10" r="1.6" /></svg>;
    case "cost":
      return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="7" cy="14.5" r="1" fill="currentColor" /></svg>;
    case "dependencies":
      return <svg {...props}><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M9.1 9.1L14.9 14.9" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

function HealthIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 8.5C20 13 12 19 12 19S4 13 4 8.5C4 5.9 6.1 4 8.5 4C10 4 11.3 4.7 12 5.8C12.7 4.7 14 4 15.5 4C17.9 4 20 5.9 20 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ApprovalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12L11 14L15 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IncidentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function CostIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorkspaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="14" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SubscriptionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
      <path d="M7 14.5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AdoptionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16V12M12 16V8M17 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ComplianceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v5.5c0 4.2-3 7.6-7 8.5-4-.9-7-4.3-7-8.5V6l7-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 8V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}
