"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LayoutGrid, CheckCircle2, Clock, Rocket, AlertCircle, RefreshCw, Layers } from "lucide-react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatTile from "@/components/shared/StatTile";
import TabBar, { useActiveTab, type Tab } from "@/components/shared/TabBar";
import Funnel from "@/components/shared/charts/Funnel";
import ToggleChart from "@/components/shared/charts/ToggleChart";
import Gauge from "@/components/shared/charts/Gauge";
import LineChart from "@/components/shared/charts/LineChart";
import { PairedBarChart } from "@/components/shared/charts/BarChart";
import {
  workspaceKpis,
  workspaceFunnel,
  workspaceRows,
  provisioningDriftRows,
  subscriptionKpis,
  subscriptionStatusDonut,
  subscriptionRows,
  doraScorecard,
  releaseErrorRates,
  rolloutTimeline,
  releaseRows,
  featureFlagRows,
  productHealthGrid,
  productHealthSignals,
  dependencyMap,
  integrationRows,
  syntheticChecks,
  incidentsBySeverity,
  incidentRows,
  mttaTrend30d,
  mttrTrend30d,
  incidentsLinkedToReleasesPct,
} from "@/lib/mock-data/operations";

const TABS: Tab[] = [
  { id: "workspaces", label: "Workspaces" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "releases", label: "Releases" },
  { id: "health", label: "Health" },
  { id: "incidents", label: "Incidents" },
];

export default function OperationsContent() {
  const active = useActiveTab(TABS);
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Platform Ops", href: "/founder/operations" }, { label: activeTab.label }]} />
      <TabBar tabs={TABS} />

      {active === "workspaces" && <WorkspacesTab />}
      {active === "subscriptions" && <SubscriptionsTab />}
      {active === "releases" && <ReleasesTab />}
      {active === "health" && <HealthTab />}
      {active === "incidents" && <IncidentsTab />}
    </div>
  );
}

function WorkspacesTab() {
  const columns: Column<(typeof workspaceRows)[number]>[] = [
    {
      key: "name",
      header: "Workspace",
      render: (r) => (
        <Link href={`/founder/workspaces/${r.id}`} className="font-medium text-[var(--icon-btn-navy)] hover:underline">
          {r.name}
        </Link>
      ),
      sortValue: (r) => r.name,
    },
    { key: "plan", header: "Plan", render: (r) => r.plan, sortValue: (r) => r.plan },
    {
      key: "status",
      header: "Status",
      render: (r) => r.status,
      sortValue: (r) => r.status,
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.status,
        options: ["Active", "Grace", "Suspended"].map((v) => ({ value: v, label: v })),
      },
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
    { key: "lastActivity", header: "Last activity", render: (r) => r.lastActivity },
  ];

  const driftColumns: Column<(typeof provisioningDriftRows)[number]>[] = [
    { key: "workspaceName", header: "Workspace", render: (r) => r.workspaceName, sortValue: (r) => r.workspaceName },
    { key: "driftType", header: "Drift", render: (r) => r.driftType },
    {
      key: "severity",
      header: "Severity",
      render: (r) => <StatusBadge status={r.severity} label={r.severity} />,
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.severity,
        options: ["warning", "critical"].map((v) => ({ value: v, label: v })),
      },
    },
    { key: "detectedAt", header: "Detected", render: (r) => r.detectedAt },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <Card title="Workspaces" description="Provisioning health and lifecycle across every workspace">
        <div className="mb-4 grid grid-cols-2 gap-[var(--space-sm)] screen-sm:grid-cols-4">
          <StatTile label="Total" value={workspaceKpis.total} tone="info" icon={<LayoutGrid size={16} />} />
          <StatTile label="Active" value={workspaceKpis.active} tone="healthy" icon={<CheckCircle2 size={16} />} />
          <StatTile label="Grace / restricted" value={workspaceKpis.graceOrRestricted} tone="warning" icon={<Clock size={16} />} />
          <StatTile
            label="Failed provisioning (24h)"
            value={workspaceKpis.failedProvisioning24h}
            tone={workspaceKpis.failedProvisioning24h > 0 ? "critical" : "healthy"}
            icon={<AlertCircle size={16} />}
          />
        </div>
        <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
            <Funnel stages={workspaceFunnel} />
          </div>
          <DataTable
            columns={columns}
            rows={workspaceRows}
            getRowKey={(r) => r.id}
            pageSize={5}
            emptyTitle="No workspaces"
          />
        </div>
      </Card>

      <Card title="Provisioning drift" description="Workspaces whose live provisioned state no longer matches their intended plan">
        <DataTable
          columns={driftColumns}
          rows={provisioningDriftRows}
          getRowKey={(r) => r.id}
          pageSize={5}
          emptyTitle="No provisioning drift"
          emptyDescription="Every workspace's provisioned state matches its plan."
        />
      </Card>
    </div>
  );
}

function SubscriptionsTab() {
  const searchParams = useSearchParams();
  const productFilter = searchParams.get("product");
  const filteredSubscriptionRows = productFilter
    ? subscriptionRows.filter((s) => s.product === productFilter)
    : subscriptionRows;
  const totalPlanMix = subscriptionKpis.planMix.reduce((sum, p) => sum + p.count, 0);

  const columns: Column<(typeof subscriptionRows)[number]>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <Link href={`/founder/subscriptions/${r.id}`} className="font-medium text-[var(--icon-btn-navy)] hover:underline">
          {r.product}
        </Link>
      ),
      sortValue: (r) => r.product,
    },
    { key: "workspace", header: "Workspace", render: (r) => r.workspace, sortValue: (r) => r.workspace },
    { key: "plan", header: "Plan", render: (r) => r.plan, sortValue: (r) => r.plan },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status === "Active" ? "healthy" : r.status === "Grace" ? "warning" : "critical"} label={r.status} />,
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.status,
        options: ["Active", "Grace", "Restricted"].map((v) => ({ value: v, label: v })),
      },
    },
    { key: "renewalDate", header: "Renewal", render: (r) => r.renewalDate, sortValue: (r) => r.renewalDate },
  ];

  return (
    <Card
      title="Subscriptions"
      description="Status distribution across active plan commitments"
      action={
        productFilter ? (
          <Link href="/founder/operations?tab=subscriptions" className="text-xs font-medium text-[var(--icon-btn-navy)] hover:underline">
            Filtered to {productFilter} &middot; Clear
          </Link>
        ) : undefined
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-[var(--space-sm)] screen-sm:grid-cols-4">
        <StatTile label="Active" value={subscriptionKpis.active} tone="healthy" icon={<CheckCircle2 size={16} />} />
        <StatTile label="Grace" value={subscriptionKpis.grace} tone="warning" icon={<Clock size={16} />} />
        <StatTile label="Restricted" value={subscriptionKpis.restricted} tone="critical" icon={<AlertCircle size={16} />} />
        <StatTile label="Plan mix" value={totalPlanMix} tone="info" icon={<Layers size={16} />} />
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
          <ToggleChart data={subscriptionStatusDonut} defaultType="pie" />
        </div>
        <DataTable columns={columns} rows={filteredSubscriptionRows} getRowKey={(r) => r.id} pageSize={5} emptyTitle="No subscriptions" />
      </div>
    </Card>
  );
}

function ReleasesTab() {
  const searchParams = useSearchParams();
  const productFilter = searchParams.get("product");
  const filteredReleaseRows = productFilter
    ? releaseRows.filter((r) => r.product === productFilter)
    : releaseRows;

  const columns: Column<(typeof releaseRows)[number]>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <Link href={`/founder/releases/${r.id}`} className="font-medium text-[var(--icon-btn-navy)] hover:underline">
          {r.product} {r.version}
        </Link>
      ),
      sortValue: (r) => r.product,
    },
    { key: "deployedAt", header: "Deployed", render: (r) => r.deployedAt, sortValue: (r) => r.deployedAt },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.approvalRef ? (
          <Link href="/founder/approvals" className="hover:underline">
            <StatusBadge status="critical" label={r.status} />
          </Link>
        ) : (
          <StatusBadge status={r.status === "Complete" ? "healthy" : "info"} label={r.status} />
        ),
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.status,
        options: ["Rollback escalated", "Complete", "In progress"].map((v) => ({ value: v, label: v })),
      },
    },
    { key: "blastRadiusPct", header: "Rolled out", render: (r) => `${r.blastRadiusPct}%`, sortValue: (r) => r.blastRadiusPct },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
    <Card title="Releases — DORA scorecard" description="Deployment performance benchmarked against DORA elite/high/medium/low bands">
      <div className="grid grid-cols-2 gap-[var(--space-sm)] screen-sm:grid-cols-4">
        {doraScorecard.map((k) => {
          const tone = DORA_TONE[k.band];
          return (
            <div
              key={k.label}
              className="card-interactive flex flex-col gap-2 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <DoraMetricIcon label={k.label} size={16} />
                </span>
                <StatusBadge status={DORA_BAND_STATUS[k.band]} label={k.band} />
              </div>
              <p className="text-xs font-medium text-[var(--text-muted)]">{k.label}</p>
              <p className="text-lg font-bold text-[var(--text-heading)]">{k.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--role-text)]">Error rate before/after release</p>
          <PairedBarChart data={releaseErrorRates} />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--role-text)]">Rollout timeline</p>
          <div className="flex flex-col gap-[var(--space-sm)]">
            {rolloutTimeline.map((r) => (
              <div key={r.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-secondary)]">{r.product}</span>
                  <StatusBadge
                    status={r.status === "rollback" ? "critical" : r.status === "in-progress" ? "info" : "healthy"}
                    label={r.status}
                  />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--search-bg)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.pctRolledOut}%`,
                      backgroundColor: r.status === "rollback" ? "var(--status-critical-fg)" : "var(--chart-1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--role-text)]">
            Releases — a rollback badge links to its escalated Operations Inbox entry
          </p>
          {productFilter && (
            <Link href="/founder/operations?tab=releases" className="text-xs font-medium text-[var(--icon-btn-navy)] hover:underline">
              Filtered to {productFilter} &middot; Clear
            </Link>
          )}
        </div>
        <DataTable columns={columns} rows={filteredReleaseRows} getRowKey={(r) => r.id} pageSize={5} emptyTitle="No releases" emptyDescription="No releases for this product." />
      </div>
    </Card>
    <FeatureFlagsCard productFilter={productFilter ?? undefined} />
    </div>
  );
}

function FeatureFlagsCard({ productFilter }: { productFilter?: string }) {
  const rows = productFilter ? featureFlagRows.filter((f) => f.product === productFilter) : featureFlagRows;
  return (
    <Card title="Feature flags" description="Active rollout flags per product">
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--role-text)]">No feature flags for this product.</p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-sm)]">
          {rows.map((f) => (
            <li key={f.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-secondary)]">
                  {f.flagName} <span className="text-[var(--text-muted)]">&middot; {f.product}</span>
                </span>
                {f.killSwitchEnabled ? (
                  <StatusBadge status="critical" label="Kill switch armed" />
                ) : (
                  <span className="text-[var(--text-muted)]">{f.rolloutPct}% rolled out</span>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--search-bg)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${f.rolloutPct}%`,
                    backgroundColor: f.killSwitchEnabled ? "var(--status-critical-fg)" : "var(--chart-1)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function HealthTab() {
  const searchParams = useSearchParams();
  const productFilter = searchParams.get("product");
  const filteredHealthGrid = productFilter
    ? productHealthGrid.filter((p) => p.id === productFilter)
    : productHealthGrid;
  const productName = productFilter ? filteredHealthGrid[0]?.name : undefined;
  const filteredDependencyMap = productName ? dependencyMap.filter((d) => d.product === productName) : dependencyMap;
  const filteredIntegrationRows = productName ? integrationRows.filter((i) => i.product === productName) : integrationRows;
  const filteredSyntheticChecks = productName ? syntheticChecks.filter((c) => c.product === productName) : syntheticChecks;

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <Card
        title="Health"
        description="Golden-signal status per product, last 30 days"
        action={
          productFilter ? (
            <Link href="/founder/operations?tab=health" className="text-xs font-medium text-[var(--icon-btn-navy)] hover:underline">
              Filtered to {filteredHealthGrid[0]?.name ?? productFilter} &middot; Clear
            </Link>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-[var(--space-sm)]">
          {filteredHealthGrid.map((p) => {
            const tone = AREA_TONE[p.status];
            const StatusIcon = p.status === "healthy" ? CheckCircle2 : p.status === "warning" ? Clock : AlertCircle;
            return (
              <div
                key={p.id}
                className="card-interactive flex min-w-0 grow basis-[calc((100%-var(--space-sm))/2)] flex-col gap-2 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 screen-sm:basis-[calc((100%-(var(--space-sm)*3))/4)]"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: tone.bg, color: tone.fg }}
                  >
                    <StatusIcon size={16} />
                  </span>
                  <StatusBadge status={p.status} label={p.status} />
                </div>
                <span className="text-sm font-medium text-[var(--text-heading)]">{p.name}</span>
                <p className="text-xs text-[var(--text-muted)]">Uptime 30d: {p.uptime30d}%</p>
                <p className="text-xs text-[var(--text-muted)]">Error rate: {p.errorRatePct}%</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Golden signals per product" description="p95 latency, traffic, error rate (with SLO line) and resource saturation, last 24h">
        <div className="flex flex-col gap-[var(--space-md)]">
          {filteredHealthGrid
            .filter((p) => productHealthSignals[p.id])
            .map((p) => {
              const signals = productHealthSignals[p.id];
              return (
                <div key={p.id} className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
                  <p className="mb-3 text-sm font-semibold text-[var(--text-heading)]">{p.name}</p>
                  <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-4">
                    <div>
                      <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">p95 latency (ms)</p>
                      <LineChart
                        series={signals.p95LatencyMs.series}
                        thresholdY={signals.p95LatencyMs.sloMs}
                        thresholdLabel="SLO"
                        height={64}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">Requests / sec</p>
                      <LineChart series={signals.requestsPerSec.series} color="var(--chart-2)" height={64} />
                    </div>
                    <div>
                      <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">Error rate % (SLO line)</p>
                      <LineChart
                        series={signals.errorRatePct.series}
                        thresholdY={signals.errorRatePct.sloPct}
                        thresholdLabel="SLO"
                        color="var(--chart-4)"
                        height={64}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[0.6875rem] font-medium text-[var(--role-text)]">Saturation</p>
                      <Gauge
                        value={signals.saturationPct}
                        status={signals.saturationPct >= 80 ? "critical" : signals.saturationPct >= 60 ? "warning" : "healthy"}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      <Card title="Dependency map" description="Product to dependent service, with live status">
        {filteredDependencyMap.length === 0 ? (
          <p className="text-sm text-[var(--role-text)]">No service dependencies for this product.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredDependencyMap.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                <span className="text-[var(--text-secondary)]">
                  <span className="font-medium">{d.product}</span> &rarr; {d.service}
                </span>
                <StatusBadge status={d.status} label={d.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Integrations" description="Third-party and partner integration health, separate from internal service dependencies above">
        {filteredIntegrationRows.length === 0 ? (
          <p className="text-sm text-[var(--role-text)]">No integrations for this product.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredIntegrationRows.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                <span className="text-[var(--text-secondary)]">
                  <span className="font-medium">{i.name}</span> &middot; {i.product}
                  <span className="ml-2 text-xs text-[var(--text-muted)]">
                    last sync {i.lastSyncAt} &middot; {i.errorCount24h} errors/24h
                  </span>
                </span>
                <StatusBadge status={i.status} label={i.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Synthetic checks" description="Login, signup and message-send probes">
        {filteredSyntheticChecks.length === 0 ? (
          <p className="text-sm text-[var(--role-text)]">No synthetic checks for this product.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredSyntheticChecks.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3 text-sm">
                <span className="text-[var(--text-secondary)]">
                  <span className="font-medium">{c.product}</span> — {c.check}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">{c.lastRun}</span>
                  <StatusBadge status={c.status === "pass" ? "healthy" : "critical"} label={c.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function IncidentsTab() {
  const columns: Column<(typeof incidentRows)[number]>[] = [
    {
      key: "id",
      header: "ID",
      render: (r) => (
        <Link href={`/founder/incidents/${r.id}`} className="font-mono-id text-xs text-[var(--icon-btn-navy)] hover:underline">
          {r.id}
        </Link>
      ),
    },
    {
      key: "title",
      header: "Incident",
      render: (r) => (
        <Link href={`/founder/incidents/${r.id}`} className="font-medium hover:underline">
          {r.title}
        </Link>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (r) => <StatusBadge status={r.severity === "high" ? "critical" : r.severity === "medium" ? "warning" : "healthy"} label={r.severity} />,
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.severity,
        options: ["high", "medium", "low"].map((v) => ({ value: v, label: v })),
      },
    },
    { key: "commander", header: "Commander", render: (r) => r.commander },
    { key: "workspaces", header: "Workspaces", render: (r) => r.workspaces, sortValue: (r) => r.workspaces },
    { key: "status", header: "Status", render: (r) => r.status },
    { key: "timeOpen", header: "Time open", render: (r) => r.timeOpen },
  ];

  return (
    <Card title="Incidents" description="Open incident volume by severity, MTTA/MTTR trends and live queue below">
      <div className="mb-4 grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4 screen-sm:col-span-2" style={{ boxShadow: "var(--card-shadow)" }}>
          <p className="mb-2 text-xs font-semibold text-[var(--role-text)]">Open by severity</p>
          <ToggleChart data={incidentsBySeverity} max={Math.max(...incidentsBySeverity.map((d) => d.value), 1)} suffix="" defaultType="bar" />
        </div>
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
          <p className="mb-1 text-xs font-semibold text-[var(--role-text)]">MTTA, 30d (min)</p>
          <LineChart series={mttaTrend30d} height={56} color="var(--chart-3)" />
        </div>
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
          <p className="mb-1 text-xs font-semibold text-[var(--role-text)]">MTTR, 30d (min)</p>
          <LineChart series={mttrTrend30d} height={56} color="var(--chart-4)" />
        </div>
      </div>
      <div className="mb-4">
        <StatTile
          label="Incidents linked to releases"
          value={`${incidentsLinkedToReleasesPct}%`}
          tone={incidentsLinkedToReleasesPct > 0 ? "warning" : "healthy"}
          icon={<RefreshCw size={16} />}
        />
      </div>
      <DataTable columns={columns} rows={incidentRows} getRowKey={(r) => r.id} pageSize={5} emptyTitle="No incidents" />
    </Card>
  );
}

const AREA_TONE: Record<"healthy" | "warning" | "critical", { bg: string; fg: string }> = {
  healthy: { bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
};

const DORA_TONE: Record<"Elite" | "High" | "Medium" | "Low", { bg: string; fg: string }> = {
  Elite: { bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  High: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
  Medium: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  Low: { bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
};

const DORA_BAND_STATUS = {
  Elite: "healthy",
  High: "info",
  Medium: "warning",
  Low: "critical",
} as const;

function DoraMetricIcon({ label, size = 16 }: { label: string; size?: number }) {
  if (label.toLowerCase().includes("deployment")) return <Rocket size={size} />;
  if (label.toLowerCase().includes("lead time")) return <Clock size={size} />;
  if (label.toLowerCase().includes("failure")) return <AlertCircle size={size} />;
  return <RefreshCw size={size} />;
}
