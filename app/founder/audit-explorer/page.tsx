"use client";

import { useMemo, useState } from "react";
import Card from "@/components/shared/Card";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import { auditKpis, auditEvents, type AuditEvent } from "@/lib/mock-data/audit-explorer";

const RESULT_FILTERS = [
  { value: "all", label: "All" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
];

export default function AuditExplorerPage() {
  const [exported, setExported] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("all");

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((e) => {
      const matchesResult = result === "all" || e.result === result;
      const q = search.trim().toLowerCase();
      const matchesSearch = q === "" || e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q);
      return matchesResult && matchesSearch;
    });
  }, [search, result]);

  const columns: Column<AuditEvent>[] = [
    { key: "time", header: "Time", render: (r) => <span className="font-mono-id text-xs">{r.time}</span>, sortValue: (r) => r.time, className: "whitespace-nowrap" },
    { key: "actor", header: "Actor", render: (r) => r.actor, sortValue: (r) => r.actor },
    { key: "action", header: "Action", render: (r) => r.action },
    { key: "entity", header: "Entity", render: (r) => <span className="font-mono-id text-xs">{r.entity}</span> },
    {
      key: "result",
      header: "Result",
      render: (r) => <StatusBadge status={r.result === "Success" ? "healthy" : "critical"} label={r.result} />,
      sortValue: (r) => r.result,
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">

      <div className="grid grid-cols-2 gap-[var(--space-sm)] sm:grid-cols-4">
        <Stat label="Total events" value={auditKpis.totalEvents.toLocaleString()} />
        <Stat label="Today's events" value={auditKpis.todaysEvents.toLocaleString()} />
        <Stat label="Human-actioned" value={auditKpis.humanActionedEvents.toLocaleString()} />
        <Stat label="System events" value={auditKpis.systemEvents.toLocaleString()} />
      </div>

      <Card
        title="Event log"
        action={
          <button
            type="button"
            onClick={() => setExported(true)}
            className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Export signed report
          </button>
        }
      >
        {exported && (
          <p className="mb-3 rounded-lg bg-[var(--status-healthy-bg)] px-3 py-2 text-xs font-medium text-[var(--status-healthy-fg)]">
            Signed export generated — download link would appear here once wired to a real API.
          </p>
        )}
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search actor, action or entity..."
          filterOptions={RESULT_FILTERS}
          activeFilter={result}
          onFilterChange={setResult}
        />
        <DataTable
          columns={columns}
          rows={filteredEvents}
          getRowKey={(r) => r.id}
          pageSize={6}
          emptyTitle="No events match"
          emptyDescription="Try a different search term or result filter."
          renderExpanded={(r) => (
            <dl className="grid grid-cols-2 gap-[var(--space-sm)] text-xs sm:grid-cols-4">
              <div>
                <dt className="text-[var(--role-text)]">Before</dt>
                <dd className="font-medium text-[var(--text-secondary)]">{r.before}</dd>
              </div>
              <div>
                <dt className="text-[var(--role-text)]">After</dt>
                <dd className="font-medium text-[var(--text-secondary)]">{r.after}</dd>
              </div>
              <div>
                <dt className="text-[var(--role-text)]">Correlation ID</dt>
                <dd className="font-mono-id font-medium text-[var(--text-secondary)]">{r.correlationId}</dd>
              </div>
            </dl>
          )}
        />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-lg font-bold text-[var(--text-heading)]">{value}</p>
    </div>
  );
}
