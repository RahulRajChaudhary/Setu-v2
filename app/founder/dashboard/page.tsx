"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Server,
  Users,
  CreditCard,
  Activity,
  Shield,
  ShieldCheck,
  Rocket,
  Wallet,
  Share2,
  Circle,
  HeartPulse,
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  Layers,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";
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
  getGrowthStats,
  buildGrowthTrend,
  type GrowthRangeDays,
  type KpiSnapshot,
} from "@/lib/mock-data/control-room";
import type { Severity } from "@/lib/mock-data/types";
import { workspaceKpis } from "@/lib/mock-data/operations";
import { complianceKpis } from "@/lib/mock-data/compliance-risk";

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

const GROWTH_RANGE_OPTIONS: { label: string; value: GrowthRangeDays }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

export default function ControlRoomPage() {
  const router = useRouter();
  const { snapshot, updatedAt, stale } = useKpiSnapshot();
  const [growthRangeDays, setGrowthRangeDays] = useState<GrowthRangeDays>(30);
  const growthTrend = useMemo(() => buildGrowthTrend(growthRangeDays), [growthRangeDays]);
  const newCustomersTotal = growthTrend[growthTrend.length - 1]?.newCustomers ?? 0;
  const growthStats = useMemo(() => getGrowthStats(growthRangeDays), [growthRangeDays]);

  const decisionColumns: Column<(typeof needsYourDecision)[number]>[] = [
    { key: "type", header: "Type", render: (r) => r.type, sortValue: (r) => r.type },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "requester", header: "Requester", render: (r) => r.requester },
    { key: "impact", header: "Impact", render: (r) => <span className="text-sm text-[var(--role-text)]">{r.impact}</span> },
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

      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 grid-cols-2 gap-[var(--space-md)] screen-sm:grid-cols-4">
          <div className="min-w-0">
            <GreetingCard name="Dhruv Singla" />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Product health"
              value={`${snapshot.productsHealthy.healthy}/${snapshot.productsHealthy.active}`}
              note="reporting healthy"
              status={snapshot.productsHealthy.status}
              drillHref="/founder/products"
              updatedAt={updatedAt}
              stale={stale}
              icon={<HeartPulse size={22} />}
              iconBg="#FCE7F3"
              iconFg="#DB2777"
            />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Pending approvals"
              value={snapshot.waitingForApproval.count}
              note="awaiting sign-off"
              status={snapshot.waitingForApproval.status}
              drillHref="/founder/approvals"
              updatedAt={updatedAt}
              stale={stale}
              icon={<ClipboardCheck size={22} />}
              iconBg="#D1FAE5"
              iconFg="#059669"
            />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Open incidents"
              value={snapshot.openIncidents.count}
              note="unresolved"
              status={snapshot.openIncidents.status}
              drillHref="/founder/operations"
              updatedAt={updatedAt}
              stale={stale}
              icon={<AlertCircle size={22} />}
              iconBg="#FEE2E2"
              iconFg="#DC2626"
            />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Cost trend (MoM)"
              value={`+${snapshot.platformCostTrend.pctChange}%`}
              note="vs last month"
              status={snapshot.platformCostTrend.status}
              drillHref="/founder/cost-analytics"
              updatedAt={updatedAt}
              stale={stale}
              icon={<TrendingUp size={22} />}
              iconBg="#CCFBF1"
              iconFg="#0D9488"
              trendDirection={snapshot.platformCostTrend.status === "critical" ? "up" : snapshot.platformCostTrend.status === "healthy" ? "down" : "up"}
              trendValue={`${snapshot.platformCostTrend.pctChange}%`}
            />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Multi-product adoption"
              value={`${workspaceKpis.multiProductAdoptionPct}%`}
              note="workspaces on 2+ products"
              status={workspaceKpis.multiProductAdoptionPct >= 50 ? "healthy" : "warning"}
              drillHref="/founder/products"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Layers size={22} />}
              iconBg="#DBEAFE"
              iconFg="#2563EB"
            />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Findings overdue"
              value={complianceKpis.findingsOverdue}
              status={complianceKpis.findingsOverdue > 0 ? "critical" : "healthy"}
              drillHref="/founder/compliance-risk"
              updatedAt={updatedAt}
              stale={stale}
              icon={<ShieldCheck size={22} />}
              iconBg="#CFFAFE"
              iconFg="#0891B2"
              secondary={[
                { label: "Failed/Exception", value: complianceKpis.controlsFailedException, color: "var(--status-warning-fg)" },
                { label: "Evidence due", value: complianceKpis.evidenceDueThisMonth, color: "var(--status-info-fg)" },
              ]}
            />
          </div>
          <div className="min-w-0">
            <KPITile
              title="Critical exceptions"
              value={workspaceKpis.criticalExceptions}
              note="provisioning drift & failures"
              status={workspaceKpis.criticalExceptions > 0 ? "critical" : "healthy"}
              drillHref="/founder/operations"
              updatedAt={updatedAt}
              stale={stale}
              icon={<AlertOctagon size={22} />}
              iconBg="#FEE2E2"
              iconFg="#DC2626"
            />
          </div>
        </div>
        <div className="hidden screen-xl:block">
          <CalendarCard />
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card title="Controls effective by framework" description="Effective controls per framework" className="min-h-[clamp(11rem,28vh,22rem)]">
          <div className="flex flex-col items-center gap-[var(--space-md)] screen-sm:flex-row screen-sm:items-center">
            <div className="flex w-full justify-center screen-sm:w-auto screen-sm:flex-1">
              <DonutChart
                data={controlsEffectiveByFramework.map((f) => ({ label: f.label, value: f.effective, color: f.color }))}
                size={112}
                centerLabel="controls"
                legend={false}
              />
            </div>
            <ul className="flex w-full flex-col gap-2.5 screen-sm:flex-1">
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
          title="Growth"
          description="New customers vs. trial-to-paid, cumulative"
          className="min-h-[clamp(11rem,28vh,22rem)]"
          action={
            <div className="flex items-center gap-0.5 rounded-full bg-[var(--surface-muted)] p-0.5">
              {GROWTH_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGrowthRangeDays(opt.value)}
                  aria-pressed={growthRangeDays === opt.value}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    growthRangeDays === opt.value
                      ? "bg-white text-[var(--text-heading)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          }
        >
          <AreaTrendChart
            className="min-h-0 flex-1"
            heightClassName="h-full min-h-[14rem]"
            series={[
              { key: "newCustomers", label: "New customers", color: "var(--chart-1)", data: growthTrend.map((d) => d.newCustomers) },
              { key: "trialToPaid", label: "Trial → paid", color: "var(--chart-3)", data: growthTrend.map((d) => d.trialToPaid) },
            ]}
            xLabels={growthTrend.map((d) => d.label)}
          />
          <dl className="mt-[var(--space-sm)] grid grid-cols-2 gap-[var(--space-sm)] border-t border-[var(--divider)] pt-[var(--space-sm)] screen-sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--role-text)]">New customers</dt>
              <dd className="text-lg font-semibold text-[var(--text-secondary)]">{newCustomersTotal}</dd>
            </div>
            {growthStats.map((g) => (
              <div key={g.label}>
                <dt className="text-xs text-[var(--role-text)]">{g.label}</dt>
                <dd className="text-lg font-semibold text-[var(--text-secondary)]">{g.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card title="Nine Areas at a Glance" description="Status across every area">
        <div className="flex flex-wrap gap-[var(--space-sm)]">
          {areasAtGlance.map((area) => {
            const tone = AREA_TONE[area.status];
            return (
              <DrillLink
                key={area.id}
                href={area.href}
                className="card-interactive tap-pop group relative flex min-w-0 grow basis-full items-center gap-2.5 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-[var(--card-pad)] screen-sm:basis-[calc((100%-var(--space-sm))/2)] screen-lg:basis-[calc((100%-(var(--space-sm)*2))/3)]"
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
                  <ArrowRight size={14} />
                </span>
              </DrillLink>
            );
          })}
        </div>
      </Card>

      <Card title="Needs Your Decision">
        <DataTable
          columns={decisionColumns}
          rows={needsYourDecision}
          getRowKey={(r) => r.id}
          emptyTitle="Nothing waiting on you"
          emptyDescription="Approvals routed to the Founder will show up here."
          onRowClick={() => router.push("/founder/approvals")}
          textClassName="text-sm"
        />
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
  const props = { size: 18 };
  switch (id) {
    case "platform":
      return <Server {...props} />;
    case "customers":
      return <Users {...props} />;
    case "commercial":
      return <CreditCard {...props} />;
    case "operations":
      return <Activity {...props} />;
    case "security":
      return <Shield {...props} />;
    case "compliance":
      return <ShieldCheck {...props} />;
    case "releases":
      return <Rocket {...props} />;
    case "cost":
      return <Wallet {...props} />;
    case "dependencies":
      return <Share2 {...props} />;
    default:
      return <Circle {...props} />;
  }
}
