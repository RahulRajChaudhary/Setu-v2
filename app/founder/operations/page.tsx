"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, CheckCircle2, Clock, Rocket, AlertCircle, RefreshCw } from "lucide-react";
import Card from "@/components/shared/Card";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatTile from "@/components/shared/StatTile";
import TableToolbar from "@/components/shared/TableToolbar";
import Funnel from "@/components/shared/charts/Funnel";
import ToggleChart from "@/components/shared/charts/ToggleChart";
import { PairedBarChart } from "@/components/shared/charts/BarChart";
import {
  workspaceKpis,
  workspaceFunnel,
  workspaceRows,
  subscriptionKpis,
  subscriptionStatusDonut,
  doraScorecard,
  releaseErrorRates,
  rolloutTimeline,
  productHealthGrid,
  incidentsBySeverity,
  incidentRows,
} from "@/lib/mock-data/operations";

const DORA_BAND_STATUS = {
  Elite: "healthy",
  High: "info",
  Medium: "warning",
  Low: "critical",
} as const;

const WORKSPACE_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Grace", label: "Grace" },
  { value: "Suspended", label: "Suspended" },
];

const SEVERITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function OperationsPage() {
  const [wsSearch, setWsSearch] = useState("");
  const [wsStatus, setWsStatus] = useState("all");
  const [incidentSeverity, setIncidentSeverity] = useState("all");

  const filteredWorkspaces = useMemo(() => {
    return workspaceRows.filter((r) => {
      const matchesStatus = wsStatus === "all" || r.status === wsStatus;
      const matchesSearch = wsSearch.trim() === "" || r.name.toLowerCase().includes(wsSearch.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [wsSearch, wsStatus]);

  const filteredIncidents = useMemo(() => {
    return incidentRows.filter((r) => incidentSeverity === "all" || r.severity === incidentSeverity);
  }, [incidentSeverity]);

  const workspaceColumns: Column<(typeof workspaceRows)[number]>[] = [
    { key: "name", header: "Workspace", render: (r) => r.name, sortValue: (r) => r.name },
    { key: "plan", header: "Plan", render: (r) => r.plan, sortValue: (r) => r.plan },
    { key: "status", header: "Status", render: (r) => r.status, sortValue: (r) => r.status },
    { key: "health", header: "Health", render: (r) => <StatusBadge status={r.health} label={r.health} /> },
    { key: "lastActivity", header: "Last activity", render: (r) => r.lastActivity },
  ];

  const incidentColumns: Column<(typeof incidentRows)[number]>[] = [
    { key: "title", header: "Incident", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "severity", header: "Severity", render: (r) => <StatusBadge status={r.severity === "high" ? "critical" : r.severity === "medium" ? "warning" : "healthy"} label={r.severity} /> },
    { key: "commander", header: "Commander", render: (r) => r.commander },
    { key: "workspaces", header: "Workspaces", render: (r) => r.workspaces, sortValue: (r) => r.workspaces },
    { key: "status", header: "Status", render: (r) => r.status },
    { key: "timeOpen", header: "Time open", render: (r) => r.timeOpen },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
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
          <div>
            <TableToolbar
              search={wsSearch}
              onSearchChange={setWsSearch}
              searchPlaceholder="Search workspaces..."
              filterOptions={WORKSPACE_STATUS_FILTERS}
              activeFilter={wsStatus}
              onFilterChange={setWsStatus}
            />
            <DataTable
              columns={workspaceColumns}
              rows={filteredWorkspaces}
              getRowKey={(r) => r.id}
              pageSize={5}
              emptyTitle="No workspaces match"
              emptyDescription="Try a different search term or status filter."
            />
          </div>
        </div>
      </Card>

      <Card title="Subscriptions" description="Status distribution across active plan commitments">
        <div className="mb-4 grid grid-cols-1 gap-[var(--space-sm)] screen-420:grid-cols-3">
          <StatTile label="Active" value={subscriptionKpis.active} tone="healthy" icon={<CheckCircle2 size={16} />} />
          <StatTile label="Grace" value={subscriptionKpis.grace} tone="warning" icon={<Clock size={16} />} />
          <StatTile label="Restricted" value={subscriptionKpis.restricted} tone="critical" icon={<AlertCircle size={16} />} />
        </div>
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
          <ToggleChart data={subscriptionStatusDonut} defaultType="pie" />
        </div>
      </Card>

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
      </Card>

      <Card title="Health" description="Golden-signal status per product, last 30 days">
        <div className="flex flex-wrap gap-[var(--space-sm)]">
          {productHealthGrid.map((p) => {
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

      <Card title="Incidents" description="Open incident volume by severity, live queue below">
        <div className="mb-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--card-shadow)" }}>
          <ToggleChart data={incidentsBySeverity} max={Math.max(...incidentsBySeverity.map((d) => d.value), 1)} suffix="" defaultType="bar" />
        </div>
        <TableToolbar
          filterOptions={SEVERITY_FILTERS}
          activeFilter={incidentSeverity}
          onFilterChange={setIncidentSeverity}
        />
        <DataTable
          columns={incidentColumns}
          rows={filteredIncidents}
          getRowKey={(r) => r.id}
          pageSize={5}
          emptyTitle="No incidents match"
          emptyDescription="Try a different severity filter."
        />
      </Card>
    </div>
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

function DoraMetricIcon({ label, size = 16 }: { label: string; size?: number }) {
  if (label.toLowerCase().includes("deployment")) return <Rocket size={size} />;
  if (label.toLowerCase().includes("lead time")) return <Clock size={size} />;
  if (label.toLowerCase().includes("failure")) return <AlertCircle size={size} />;
  return <RefreshCw size={size} />;
}
