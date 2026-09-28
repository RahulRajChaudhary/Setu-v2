"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  RotateCcw,
  AlertTriangle,
  PackageCheck,
  ClipboardCheck,
  Settings,
  TrendingUp,
  ShieldCheck,
  FileSearch,
  Box,
  Rocket,
  Percent,
  FileWarning,
  Circle,
  ArrowRight,
} from "lucide-react";
import Card from "@/components/shared/Card";
import CalendarCard from "@/components/shared/CalendarCard";
import GreetingCard from "@/components/shared/GreetingCard";
import KPITile from "@/components/shared/KPITile";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import type { StatusLevel } from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import DrillLink from "@/components/shared/DrillLink";
import AnalyticsBarChart from "@/components/shared/charts/AnalyticsBarChart";
import AreaTrendChart from "@/components/shared/charts/AreaTrendChart";
import RolloutProgressBar from "@/components/shared/charts/RolloutProgressBar";
import {
  releaseKpis,
  releases,
  errorRateBeforeAfter,
  buildDeploymentFrequencyTrend,
  type DeploymentRangeWeeks,
  type Release,
  type RolloutStatus,
} from "@/lib/mock-data/engineering-releases";

const REFRESH_MS = 60_000;
const FAILURE_RATE = 0.2;

function useKpiRefresh() {
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const failed = Math.random() < FAILURE_RATE;
      if (failed) {
        setStale(true);
        return;
      }
      setUpdatedAt(new Date());
      setStale(false);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { updatedAt, stale };
}

const ROLLOUT_STATUS_LABEL: Record<RolloutStatus, string> = {
  active: "Active",
  paused: "Paused",
  "rolled-back": "Rolled back",
  complete: "Complete",
};

const ROLLOUT_STATUS_BADGE: Record<RolloutStatus, StatusLevel> = {
  active: "info",
  paused: "warning",
  "rolled-back": "critical",
  complete: "healthy",
};

const STATUS_ICON_TONE: Record<StatusLevel, { bg: string; fg: string }> = {
  healthy: { bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
  info: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
  neutral: { bg: "#DBEAFE", fg: "#2563EB" },
};

const AREA_STATUS_LABEL: Record<StatusLevel, string> = {
  healthy: "Healthy",
  warning: "Attention",
  critical: "Critical",
  info: "Info",
  neutral: "Out of scope",
};

const ERROR_FILTERS: { id: "all" | "escalated"; label: string }[] = [
  { id: "all", label: "All releases" },
  { id: "escalated", label: "Escalated only" },
];

const DEPLOY_RANGE_OPTIONS: { label: string; value: DeploymentRangeWeeks }[] = [
  { label: "4W", value: 4 },
  { label: "8W", value: 8 },
  { label: "12W", value: 12 },
];

export default function EngineeringLeadDashboardPage() {
  const { updatedAt, stale } = useKpiRefresh();
  const [releaseList, setReleaseList] = useState<Release[]>(releases);
  const [errorFilter, setErrorFilter] = useState<"all" | "escalated">("all");
  const [deployRangeWeeks, setDeployRangeWeeks] = useState<DeploymentRangeWeeks>(8);
  const deploymentTrend = useMemo(() => buildDeploymentFrequencyTrend(deployRangeWeeks), [deployRangeWeeks]);
  const deploymentTotal = deploymentTrend.reduce((sum, d) => sum + d.value, 0);
  const deploymentAvg = deploymentTrend.length ? Math.round(deploymentTotal / deploymentTrend.length) : 0;
  const deploymentPeak = Math.max(...deploymentTrend.map((d) => d.value), 0);
  const deploymentThisWeek = deploymentTrend[deploymentTrend.length - 1]?.value ?? 0;

  function approveRollback(id: string) {
    setReleaseList((current) =>
      current.map((r) => (r.id === id ? { ...r, rollbackEscalated: false } : r))
    );
  }

  const nonTerminal = releaseList.filter((r) => r.status === "active" || r.status === "paused");
  const pausedCount = releaseList.filter((r) => r.status === "paused").length;
  const rolledBackCount = releaseList.filter((r) => r.status === "rolled-back").length;
  const linkedIncidentCount = releaseList.filter((r) => r.linkedIncident !== null).length;
  const totalReleases = releaseList.length;
  const avgRolloutPercent = nonTerminal.length
    ? Math.round(nonTerminal.reduce((sum, r) => sum + r.rolloutPercent, 0) / nonTerminal.length)
    : 0;
  const needsDecision = releaseList.filter((r) => r.rollbackEscalated);

  const areasAtGlance: { id: string; label: string; href: string; bg: string; fg: string; status: StatusLevel; cause: string }[] = [
    {
      id: "approvals",
      label: "Approvals",
      href: "/engineering-lead/approvals",
      bg: "#D1FAE5",
      fg: "#059669",
      status: needsDecision.length > 0 ? "critical" : "healthy",
      cause:
        needsDecision.length > 0
          ? `${needsDecision.length} rollback approval${needsDecision.length === 1 ? "" : "s"} pending`
          : "Nothing waiting on you",
    },
    {
      id: "operations",
      label: "Operations",
      href: "/engineering-lead/operations",
      bg: "#DBEAFE",
      fg: "#2563EB",
      status: releaseKpis.deploymentFailures.count > 0 ? "warning" : "healthy",
      cause: `${releaseKpis.deploymentFailures.count} deployment failure${releaseKpis.deploymentFailures.count === 1 ? "" : "s"} this period`,
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/engineering-lead/cost-analytics",
      bg: "#CCFBF1",
      fg: "#0D9488",
      status: "neutral",
      cause: "Cost & adoption — not scoped to this persona",
    },
    {
      id: "compliance",
      label: "Compliance",
      href: "/engineering-lead/compliance-risk",
      bg: "#CFFAFE",
      fg: "#0891B2",
      status: "neutral",
      cause: "Not in scope for Engineering Lead",
    },
    {
      id: "audit",
      label: "Audit",
      href: "/engineering-lead/audit-explorer",
      bg: "#FFEDD5",
      fg: "#EA580C",
      status: linkedIncidentCount > 0 ? "warning" : "info",
      cause: `${linkedIncidentCount} release${linkedIncidentCount === 1 ? "" : "s"} with a linked incident — read + export only`,
    },
    {
      id: "products",
      label: "Products",
      href: "/engineering-lead/products",
      bg: "#EDE9FE",
      fg: "#7C3AED",
      status: "info",
      cause: `View only — ${totalReleases} tracked release${totalReleases === 1 ? "" : "s"} across affected products`,
    },
  ];

  const errorRateData = (errorFilter === "escalated" ? errorRateBeforeAfter.filter((d) => d.escalated) : errorRateBeforeAfter).map(
    (d) => ({
      label: d.label,
      values: { before: d.before, after: d.after },
      colorOverrides: {
        after: d.after > d.before ? "var(--status-critical-fg)" : "var(--status-healthy-fg)",
      },
    })
  );

  const decisionColumns: Column<Release>[] = [
    { key: "type", header: "Type", render: () => "Rollback approval" },
    { key: "title", header: "Release", render: (r) => <span className="font-medium">{r.buildRef}</span> },
    { key: "requester", header: "Initiator", render: (r) => r.initiator },
    { key: "impact", header: "Reason", render: (r) => <span className="text-sm text-[var(--role-text)]">{r.pauseRollbackDecision}</span> },
    {
      key: "action",
      header: "",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            approveRollback(r.id);
          }}
          className="tap-pop rounded-lg bg-[var(--status-critical-fg)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Approve rollback
        </button>
      ),
    },
  ];

  const columns: Column<Release>[] = [
    { key: "buildRef", header: "Build / commit", render: (r) => <span className="font-medium">{r.buildRef}</span>, sortValue: (r) => r.buildRef },
    { key: "targetEnv", header: "Target", render: (r) => r.targetEnv },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={ROLLOUT_STATUS_BADGE[r.status]} label={ROLLOUT_STATUS_LABEL[r.status]} />,
      sortValue: (r) => r.status,
    },
    { key: "rolloutPercent", header: "Rollout", render: (r) => `${r.rolloutPercent}%`, sortValue: (r) => r.rolloutPercent },
    {
      key: "action",
      header: "",
      render: (r) =>
        r.rollbackEscalated ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              approveRollback(r.id);
            }}
            className="tap-pop rounded-lg bg-[var(--status-critical-fg)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Approve rollback
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-xl:grid-cols-[1fr_25rem]">
      <div className="flex flex-wrap gap-[var(--space-md)]">
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <GreetingCard name="Priyanka Rao" />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Active rollouts"
            value={releaseKpis.activeRollouts}
            note="in a non-terminal state"
            status="neutral"
            updatedAt={updatedAt}
            stale={stale}
            icon={<Rocket size={22} />}
            iconBg={STATUS_ICON_TONE.neutral.bg}
            iconFg={STATUS_ICON_TONE.neutral.fg}
            secondary={[
              { label: "Paused", value: pausedCount, color: "var(--status-warning-fg)" },
            ]}
          />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Change failure rate"
            value={`${releaseKpis.changeFailureRate.pct}%`}
            note="deployments causing rollback/hotfix ÷ total"
            status={releaseKpis.changeFailureRate.status}
            updatedAt={updatedAt}
            stale={stale}
            trendDirection={releaseKpis.changeFailureRate.trendDirection}
            trendValue={releaseKpis.changeFailureRate.trendValue}
            icon={<Percent size={22} />}
            iconBg={STATUS_ICON_TONE[releaseKpis.changeFailureRate.status].bg}
            iconFg={STATUS_ICON_TONE[releaseKpis.changeFailureRate.status].fg}
          />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Deployment-related failures"
            value={releaseKpis.deploymentFailures.count}
            note="this period"
            status={releaseKpis.deploymentFailures.status}
            updatedAt={updatedAt}
            stale={stale}
            icon={<AlertCircle size={22} />}
            iconBg={STATUS_ICON_TONE[releaseKpis.deploymentFailures.status].bg}
            iconFg={STATUS_ICON_TONE[releaseKpis.deploymentFailures.status].fg}
          />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Recurring exceptions"
            value={releaseKpis.recurringExceptions.count}
            note="repeat errors post-deployment"
            status={releaseKpis.recurringExceptions.status}
            updatedAt={updatedAt}
            stale={stale}
            icon={<FileWarning size={22} />}
            iconBg={STATUS_ICON_TONE[releaseKpis.recurringExceptions.status].bg}
            iconFg={STATUS_ICON_TONE[releaseKpis.recurringExceptions.status].fg}
          />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Rolled back releases"
            value={rolledBackCount}
            note="this period"
            status={rolledBackCount > 0 ? "critical" : "healthy"}
            updatedAt={updatedAt}
            stale={stale}
            icon={<RotateCcw size={22} />}
            iconBg={STATUS_ICON_TONE[rolledBackCount > 0 ? "critical" : "healthy"].bg}
            iconFg={STATUS_ICON_TONE[rolledBackCount > 0 ? "critical" : "healthy"].fg}
          />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Linked incidents"
            value={linkedIncidentCount}
            note="releases with a linked incident/error spike"
            status={linkedIncidentCount > 0 ? "warning" : "healthy"}
            updatedAt={updatedAt}
            stale={stale}
            icon={<AlertTriangle size={22} />}
            iconBg={STATUS_ICON_TONE[linkedIncidentCount > 0 ? "warning" : "healthy"].bg}
            iconFg={STATUS_ICON_TONE[linkedIncidentCount > 0 ? "warning" : "healthy"].fg}
            drillHref="/engineering-lead/operations"
          />
        </div>
        <div className="min-w-0 grow basis-full screen-sm:basis-[calc((100%-var(--space-md))/2)] screen-lg:basis-[calc((100%-(var(--space-md)*2))/3)] screen-xl:basis-[calc((100%-(var(--space-md)*3))/4)]">
          <KPITile
            title="Total releases"
            value={totalReleases}
            note="tracked this period"
            status="neutral"
            updatedAt={updatedAt}
            stale={stale}
            icon={<PackageCheck size={22} />}
            iconBg={STATUS_ICON_TONE.neutral.bg}
            iconFg={STATUS_ICON_TONE.neutral.fg}
            secondary={[
              { label: "Avg rollout", value: `${avgRolloutPercent}%`, color: "var(--status-info-fg)" },
            ]}
          />
        </div>
      </div>
        <CalendarCard />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-lg:grid-cols-2">
        <Card
          title="Error rate before/after release"
          description="Per-release error rate, before vs. after deployment"
          action={
            <div className="flex items-center gap-0.5 rounded-full bg-[var(--surface-muted)] p-0.5">
              {ERROR_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setErrorFilter(f.id)}
                  aria-pressed={errorFilter === f.id}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    errorFilter === f.id
                      ? "bg-[var(--surface)] text-[var(--text-heading)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        >
          {errorRateData.length === 0 ? (
            <EmptyState title="No escalated releases" description="Switch back to All releases to see the full comparison." />
          ) : (
            <AnalyticsBarChart
              data={errorRateData}
              series={[
                { key: "before", label: "Before", color: "#94A3B8" },
                { key: "after", label: "After", color: "var(--status-healthy-fg)" },
              ]}
            />
          )}
        </Card>

        <Card
          title="Deployment frequency"
          description="Deployments per week"
          action={
            <div className="flex items-center gap-0.5 rounded-full bg-[var(--surface-muted)] p-0.5">
              {DEPLOY_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeployRangeWeeks(opt.value)}
                  aria-pressed={deployRangeWeeks === opt.value}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    deployRangeWeeks === opt.value
                      ? "bg-[var(--surface)] text-[var(--text-heading)] shadow-sm"
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
            series={[
              { key: "deployments", label: "Deployments", color: "var(--chart-1)", data: deploymentTrend.map((d) => d.value) },
            ]}
            xLabels={deploymentTrend.map((d) => d.label)}
          />
          <dl className="mt-[var(--space-sm)] grid grid-cols-2 gap-[var(--space-sm)] border-t border-[var(--divider)] pt-[var(--space-sm)] screen-sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--role-text)]">Deployments ({deployRangeWeeks}w)</dt>
              <dd className="text-lg font-semibold text-[var(--text-secondary)]">{deploymentTotal}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--role-text)]">Avg / week</dt>
              <dd className="text-lg font-semibold text-[var(--text-secondary)]">{deploymentAvg}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--role-text)]">Peak week</dt>
              <dd className="text-lg font-semibold text-[var(--text-secondary)]">{deploymentPeak}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--role-text)]">This week</dt>
              <dd className="text-lg font-semibold text-[var(--text-secondary)]">{deploymentThisWeek}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card
        title="Needs Your Decision"
        className={needsDecision.length > 0 ? "!border-l-4 !border-l-[var(--status-critical-fg)]" : ""}
      >
        {needsDecision.length === 0 ? (
          <EmptyState
            title="Nothing waiting on you"
            description="Escalated rollbacks (blast-radius threshold exceeded) will show up here."
          />
        ) : (
          <DataTable
            columns={decisionColumns}
            rows={needsDecision}
            getRowKey={(r) => r.id}
            emptyTitle="Nothing waiting on you"
            textClassName="text-sm"
          />
        )}
      </Card>

      <Card title="Rollout progress" description="% rolled out per active release, with pause/rollback point marked">
        {nonTerminal.length === 0 ? (
          <EmptyState title="No rollouts in progress" description="Active and paused releases will show up here." />
        ) : (
          <RolloutProgressBar
            data={nonTerminal.map((r) => ({
              label: r.buildRef,
              percent: r.rolloutPercent,
              status: r.status,
              markerPercent: r.status === "paused" ? r.rolloutPercent : undefined,
            }))}
          />
        )}
      </Card>

      <Card title="Releases">
        <DataTable
          columns={columns}
          rows={releaseList}
          getRowKey={(r) => r.id}
          emptyTitle="No releases yet"
          emptyDescription="Deployments to production will show up here."
          textClassName="text-sm"
          renderExpanded={(r) => (
            <dl className="grid grid-cols-1 gap-x-[var(--space-md)] gap-y-2 p-3 text-xs screen-sm:grid-cols-2">
              <Field label="Deployment initiator" value={r.initiator} />
              <Field label="Pipeline reference" value={r.pipelineRef} />
              <Field label="Target services" value={r.targetServices.join(", ")} />
              <Field label="Migration / config changes" value={r.migrationChanges} />
              <Field label="Rollout strategy" value={r.rolloutStrategy} />
              <Field label="Cohort" value={r.cohort} />
              <Field label="Pre-deploy health" value={r.preDeployHealth} />
              <Field label="Post-deploy health" value={r.postDeployHealth} />
              <Field label="Pause/rollback decision" value={r.pauseRollbackDecision} />
              <Field label="Rollback evidence" value={r.rollbackEvidence} />
              <Field label="Linked incident" value={r.linkedIncident ?? "—"} />
            </dl>
          )}
        />
      </Card>

      <Card title="Areas at a Glance" description="One tile per related section — colour, cause and a link to the full area">
        <div className="flex flex-wrap gap-[var(--space-sm)]">
          {areasAtGlance.map((area) => (
            <DrillLink
              key={area.id}
              href={area.href}
              className="card-interactive tap-pop group relative flex min-w-0 grow basis-full items-center gap-2.5 rounded-[var(--card-radius)] border border-[var(--divider)] bg-[var(--surface)] p-[var(--card-pad)] screen-sm:basis-[calc((100%-var(--space-sm))/2)] screen-lg:basis-[calc((100%-(var(--space-sm)*2))/3)]"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: area.bg, color: area.fg }}
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
                style={{ color: area.fg }}
              >
                <ArrowRight size={14} />
              </span>
            </DrillLink>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--role-text)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text-secondary)]">{value}</dd>
    </div>
  );
}

function AreaIcon({ id }: { id: string }) {
  const props = { size: 18 };
  switch (id) {
    case "approvals":
      return <ClipboardCheck {...props} />;
    case "operations":
      return <Settings {...props} />;
    case "analytics":
      return <TrendingUp {...props} />;
    case "compliance":
      return <ShieldCheck {...props} />;
    case "audit":
      return <FileSearch {...props} />;
    case "products":
      return <Box {...props} />;
    default:
      return <Circle {...props} />;
  }
}
