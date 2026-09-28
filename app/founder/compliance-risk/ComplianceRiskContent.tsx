"use client";

import { useMemo, useState } from "react";
import Card from "@/components/shared/Card";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import FrameworkScoreGrid from "@/components/shared/charts/FrameworkScoreGrid";
import RiskHeatMap from "@/components/shared/charts/RiskHeatMap";
import {
  complianceKpis,
  controlsEffectiveByFramework,
  findingsOverdueList,
  controlsTable,
  topRisks,
  vendorTable,
} from "@/lib/mock-data/compliance-risk";

const TABS = [
  { id: "compliance", label: "Compliance" },
  { id: "risks", label: "Risks & Vendors" },
];

const CONTROL_STATUS = {
  Effective: "healthy",
  "On track": "info",
  Exception: "critical",
} as const;

const CONTROL_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "Effective", label: "Effective" },
  { value: "On track", label: "On track" },
  { value: "Exception", label: "Exception" },
];

const CRITICALITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High" },
];

export default function ComplianceRiskContent() {
  const active = useActiveTab(TABS);
  const [controlStatus, setControlStatus] = useState("all");
  const [vendorCriticality, setVendorCriticality] = useState("all");

  const filteredControls = useMemo(
    () => controlsTable.filter((c) => controlStatus === "all" || c.status === controlStatus),
    [controlStatus]
  );

  const filteredVendors = useMemo(
    () => vendorTable.filter((v) => vendorCriticality === "all" || v.criticality === vendorCriticality),
    [vendorCriticality]
  );

  const controlColumns: Column<(typeof controlsTable)[number]>[] = [
    { key: "id", header: "Control ID", render: (r) => <span className="font-mono-id text-xs">{r.id}</span> },
    { key: "statement", header: "Statement", render: (r) => r.statement },
    { key: "frameworks", header: "Frameworks", render: (r) => <span className="text-xs text-[var(--role-text)]">{r.frameworks}</span> },
    { key: "dueDate", header: "Due date", render: (r) => r.dueDate, sortValue: (r) => r.dueDate },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={CONTROL_STATUS[r.status]} label={r.status} /> },
  ];

  const vendorColumns: Column<(typeof vendorTable)[number]>[] = [
    { key: "vendor", header: "Vendor", render: (r) => <span className="font-medium">{r.vendor}</span>, sortValue: (r) => r.vendor },
    { key: "service", header: "Service", render: (r) => r.service },
    {
      key: "criticality",
      header: "Criticality",
      render: (r) => (
        <StatusBadge status={r.criticality === "Critical" ? "critical" : "warning"} label={r.criticality} />
      ),
    },
    { key: "renewalDate", header: "Renewal", render: (r) => r.renewalDate, sortValue: (r) => r.renewalDate },
    { key: "lastReview", header: "Last review", render: (r) => r.lastReview },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <TabBar tabs={TABS} />

      {active === "compliance" ? (
        <div className="flex flex-col gap-[var(--space-md)]">
          <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-3">
            <Stat label="Controls failed / exception" value={complianceKpis.controlsFailedException} tone="critical" />
            <Stat label="Evidence due this month" value={complianceKpis.evidenceDueThisMonth} tone="warning" />
            <Stat label="Findings overdue" value={complianceKpis.findingsOverdue} tone="critical" />
          </div>

          <Card title="Controls effective by framework">
            <FrameworkScoreGrid data={controlsEffectiveByFramework} columns={3} />
          </Card>

          <Card title="Findings overdue">
            <ul className="flex flex-col gap-2">
              {findingsOverdueList.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--divider)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{f.title}</p>
                    <p className="text-xs text-[var(--role-text)]">Owner: {f.owner}</p>
                  </div>
                  <StatusBadge status="critical" label={`${f.daysOverdue}d overdue`} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Controls">
            <TableToolbar filterOptions={CONTROL_STATUS_FILTERS} activeFilter={controlStatus} onFilterChange={setControlStatus} />
            <DataTable
              columns={controlColumns}
              rows={filteredControls}
              getRowKey={(r) => r.id}
              pageSize={6}
              emptyTitle="No controls match"
              emptyDescription="Try a different status filter."
            />
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--space-md)]">
          <Card title="Risk heat map">
            <RiskHeatMap risks={topRisks} />
          </Card>

          <Card title="Top risks">
            <ul className="flex flex-col gap-[var(--space-sm)]">
              {topRisks.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-2 rounded-lg border border-[var(--divider)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{r.label}</p>
                    <p className="text-xs text-[var(--role-text)]">
                      Owner: {r.owner} &middot; {r.treatmentStatus} &middot; due {r.dueDate}
                    </p>
                  </div>
                  <StatusBadge status={r.likelihood * r.impact >= 16 ? "critical" : "warning"} label={`${r.likelihood * r.impact}`} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Vendor criticality">
            <TableToolbar filterOptions={CRITICALITY_FILTERS} activeFilter={vendorCriticality} onFilterChange={setVendorCriticality} />
            <DataTable
              columns={vendorColumns}
              rows={filteredVendors}
              getRowKey={(r) => r.id}
              pageSize={6}
              emptyTitle="No vendors match"
              emptyDescription="Try a different criticality filter."
            />
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "critical" | "warning" }) {
  return (
    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`text-lg font-bold ${value > 0 ? (tone === "critical" ? "text-[var(--status-critical-fg)]" : "text-[var(--status-warning-fg)]") : "text-[var(--text-heading)]"}`}>
        {value}
      </p>
    </div>
  );
}
