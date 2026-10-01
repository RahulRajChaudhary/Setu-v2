"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertOctagon, CalendarClock, ClipboardX, Handshake, ShieldAlert, UserCheck } from "lucide-react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TabBar, { useActiveTab } from "@/components/shared/TabBar";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge, { type StatusLevel } from "@/components/shared/StatusBadge";
import StatTile from "@/components/shared/StatTile";
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
import { daysFromToday } from "@/lib/mock-data/mock-clock";

const TABS = [
  { id: "compliance", label: "Compliance" },
  { id: "risks", label: "Risks & Vendors" },
];

const CONTROL_STATUS = {
  Effective: "healthy",
  "On track": "info",
  Exception: "critical",
} as const;

// Same bands as the heat map so a score reads the same everywhere.
function riskBand(score: number): { word: string; status: StatusLevel } {
  if (score >= 16) return { word: "Critical", status: "critical" };
  if (score >= 9) return { word: "High", status: "warning" };
  if (score >= 4) return { word: "Medium", status: "info" };
  return { word: "Low", status: "healthy" };
}

// "in 9d" / "today" / "4d overdue", coloured by urgency — a raw date makes the
// reader do the subtraction.
function DueLabel({ date, soonDays = 14, done = false }: { date: string; soonDays?: number; done?: boolean }) {
  const d = daysFromToday(date);
  const text = d === 0 ? "today" : d > 0 ? `in ${d}d` : `${-d}d overdue`;
  const tone = done ? "var(--text-muted)" : d < 0 ? "var(--status-critical-fg)" : d <= soonDays ? "var(--status-warning-fg)" : "var(--text-muted)";
  return (
    <span className="whitespace-nowrap">
      <span className="text-[var(--text-secondary)]">{date}</span>
      <span className="ml-1.5 text-xs font-medium" style={{ color: tone }}>
        {text}
      </span>
    </span>
  );
}

export default function ComplianceRiskContent() {
  const active = useActiveTab(TABS);
  const activeLabel = TABS.find((t) => t.id === active)?.label ?? TABS[0].label;

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Compliance & Risk", href: "/founder/compliance-risk" }, { label: activeLabel }]} />
      <TabBar tabs={TABS} />
      {active === "compliance" ? <ComplianceTab /> : <RisksTab />}
    </div>
  );
}

function ComplianceTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const overdueSorted = useMemo(() => [...findingsOverdueList].sort((a, b) => b.daysOverdue - a.daysOverdue), []);
  const maxOverdue = Math.max(...overdueSorted.map((f) => f.daysOverdue), 1);
  const nextEvidence = useMemo(
    () =>
      controlsTable
        .filter((c) => daysFromToday(c.dueDate) >= 0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0],
    [],
  );

  const filteredControls = useMemo(() => {
    const q = search.trim().toLowerCase();
    return controlsTable.filter(
      (c) =>
        (statusFilter === "all" || c.status === statusFilter) &&
        (q === "" || c.id.includes(q) || c.statement.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q) || c.frameworks.toLowerCase().includes(q)),
    );
  }, [search, statusFilter]);

  const controlColumns: Column<(typeof controlsTable)[number]>[] = [
    {
      key: "id",
      header: "Control ID",
      render: (r) => (
        <Link href={`/founder/controls/${r.id}`} className="font-mono-id text-xs text-[var(--icon-btn-navy)] hover:underline">
          {r.id}
        </Link>
      ),
      sortValue: (r) => Number(r.id.replace("ctrl-", "")),
    },
    { key: "statement", header: "Statement", render: (r) => <span className="font-medium text-[var(--text-secondary)]">{r.statement}</span> },
    {
      key: "frameworks",
      header: "Frameworks",
      render: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.frameworks.split(", ").map((f) => (
            <span key={f} className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.6875rem] font-medium text-[var(--role-text)]">
              {f}
            </span>
          ))}
        </span>
      ),
    },
    { key: "owner", header: "Owner", render: (r) => r.owner, sortValue: (r) => r.owner },
    {
      key: "dueDate",
      header: "Evidence due",
      render: (r) => <DueLabel date={r.dueDate} done={r.status === "Effective"} />,
      sortValue: (r) => r.dueDate,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={CONTROL_STATUS[r.status]} label={r.status} />,
      sortValue: (r) => r.status,
    },
  ];

  const statusCounts = (["Exception", "On track", "Effective"] as const).map((s) => ({
    value: s,
    count: controlsTable.filter((c) => c.status === s).length,
  }));

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-3">
        <StatTile
          label="Controls failed / exception"
          value={complianceKpis.controlsFailedException}
          tone={complianceKpis.controlsFailedException > 0 ? "critical" : "healthy"}
          icon={<ClipboardX size={16} />}
          note={`of ${controlsTable.length} controls`}
          href="#controls"
        />
        <StatTile
          label="Evidence due this month"
          value={complianceKpis.evidenceDueThisMonth}
          tone="warning"
          icon={<CalendarClock size={16} />}
          note={nextEvidence ? `Next: ${nextEvidence.id} ${nextEvidence.dueDate}` : "None due"}
          href="#controls"
        />
        <StatTile
          label="Findings overdue"
          value={complianceKpis.findingsOverdue}
          tone={complianceKpis.findingsOverdue > 0 ? "critical" : "healthy"}
          icon={<AlertOctagon size={16} />}
          note={`Oldest: ${maxOverdue}d overdue`}
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-2">
        <Card title="Controls effective by framework" description="Effective controls ÷ total, per framework">
          <FrameworkScoreGrid data={controlsEffectiveByFramework} columns={1} />
        </Card>

        <Card title="Findings overdue" description="Longest-overdue first">
          <ul className="flex flex-col gap-[var(--space-sm)]">
            {overdueSorted.map((f) => (
              <li key={f.id} className="rounded-lg border border-[var(--divider)] p-3" style={{ borderLeft: "3px solid var(--status-critical-fg)" }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{f.title}</p>
                  <StatusBadge status="critical" label={`${f.daysOverdue}d overdue`} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <UserCheck size={12} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--role-text)]">{f.owner}</span>
                  <div className="ml-auto h-1.5 w-24 rounded-full bg-[var(--surface-muted)]" title="Relative to the longest-overdue finding">
                    <div className="h-full rounded-full" style={{ width: `${(f.daysOverdue / maxOverdue) * 100}%`, backgroundColor: "var(--status-critical-fg)" }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div id="controls" className="scroll-mt-4">
        <Card title="Controls" description="Evidence due dates are relative to today; exceptions need an owner action">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search control, owner or framework..."
            filterOptions={[
              { value: "all", label: `All (${controlsTable.length})` },
              ...statusCounts.map((s) => ({ value: s.value, label: `${s.value} (${s.count})` })),
            ]}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
          <DataTable
            columns={controlColumns}
            rows={filteredControls}
            getRowKey={(r) => r.id}
            pageSize={6}
            emptyTitle="No controls match"
            emptyDescription="Try a different search term or status."
          />
        </Card>
      </div>
    </div>
  );
}

function RisksTab() {
  const criticalRisks = topRisks.filter((r) => r.likelihood * r.impact >= 16).length;
  const escalated = topRisks.filter((r) => r.treatmentStatus === "Escalated").length;
  const renewingSoon = vendorTable.filter((v) => daysFromToday(v.renewalDate) <= 30);

  const vendorColumns: Column<(typeof vendorTable)[number]>[] = [
    {
      key: "vendor",
      header: "Vendor",
      render: (r) => (
        <Link href={`/founder/vendors/${r.id}`} className="font-medium text-[var(--icon-btn-navy)] hover:underline">
          {r.vendor}
        </Link>
      ),
      sortValue: (r) => r.vendor,
    },
    { key: "service", header: "Service", render: (r) => r.service },
    {
      key: "criticality",
      header: "Criticality",
      render: (r) => <StatusBadge status={r.criticality === "Critical" ? "critical" : "warning"} label={r.criticality} />,
      sortValue: (r) => (r.criticality === "Critical" ? 0 : 1),
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.criticality,
        options: ["Critical", "High"].map((v) => ({ value: v, label: v })),
      },
    },
    { key: "renewalDate", header: "DPA / contract renewal", render: (r) => <DueLabel date={r.renewalDate} soonDays={30} />, sortValue: (r) => r.renewalDate },
    { key: "lastReview", header: "Last review", render: (r) => r.lastReview, sortValue: (r) => r.lastReview },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="grid grid-cols-1 gap-[var(--space-sm)] screen-sm:grid-cols-3">
        <StatTile
          label="Critical risks"
          value={criticalRisks}
          tone={criticalRisks > 0 ? "critical" : "healthy"}
          icon={<ShieldAlert size={16} />}
          note="Residual score 16+"
        />
        <StatTile
          label="Escalated to you"
          value={escalated}
          tone={escalated > 0 ? "warning" : "healthy"}
          icon={<UserCheck size={16} />}
          note={escalated > 0 ? "Accept or treat in Approvals" : "Nothing waiting"}
          href="/founder/approvals"
        />
        <StatTile
          label="Vendors renewing in 30 days"
          value={renewingSoon.length}
          tone={renewingSoon.length > 0 ? "warning" : "healthy"}
          icon={<Handshake size={16} />}
          note={renewingSoon.map((v) => v.vendor).join(", ") || "None due"}
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-2">
        <Card title="Risk heat map" description="Likelihood × impact; each dot is the risk’s rank in the list beside it">
          <RiskHeatMap risks={topRisks} showList={false} rankDots />
        </Card>

        <Card title="Top risks" description="Ranked by residual score, highest first">
          <ol className="flex flex-col gap-[var(--space-sm)]">
            {topRisks.map((r, i) => {
              const score = r.likelihood * r.impact;
              const band = riskBand(score);
              return (
                <li key={r.id} className="flex items-start gap-3 rounded-lg border border-[var(--divider)] p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--text-secondary)]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/founder/risks/${r.id}`}
                      className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--icon-btn-navy)] hover:underline"
                    >
                      {r.label}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--role-text)]">
                      <span>{r.owner}</span>
                      <span aria-hidden>&middot;</span>
                      <span>{r.treatmentStatus}</span>
                      <span aria-hidden>&middot;</span>
                      <DueLabel date={r.dueDate} done={false} />
                    </p>
                  </div>
                  <StatusBadge status={band.status} label={`${band.word} · ${score}`} />
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <Card title="Vendor criticality" description="Renewal dates are relative to today; sort by criticality or renewal">
        <DataTable columns={vendorColumns} rows={vendorTable} getRowKey={(r) => r.id} pageSize={6} emptyTitle="No vendors" />
      </Card>
    </div>
  );
}
