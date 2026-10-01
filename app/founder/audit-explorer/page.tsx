"use client";

import { useMemo, useState } from "react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import TableToolbar from "@/components/shared/TableToolbar";
import { auditKpis, type AuditEvent } from "@/lib/mock-data/audit-explorer";
import { useAuditLog } from "@/lib/store/decisions-store";

export default function AuditExplorerPage() {
  const [exported, setExported] = useState(false);
  const [search, setSearch] = useState("");
  const liveEvents = useAuditLog();

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === "") return liveEvents;
    return liveEvents.filter(
      (e) => e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q),
    );
  }, [search, liveEvents]);

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
      filterConfig: {
        type: "multiSelect",
        accessor: (r) => r.result,
        options: ["Success", "Failed"].map((v) => ({ value: v, label: v })),
      },
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Audit" }]} />

      <div className="grid grid-cols-2 gap-[var(--space-sm)] screen-sm:grid-cols-4">
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
            className="tap-pop rounded-lg bg-[var(--accent-solid)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
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
        />
        <DataTable
          columns={columns}
          rows={filteredEvents}
          getRowKey={(r) => r.id}
          pageSize={6}
          emptyTitle="No events match"
          emptyDescription="Try a different search term or result filter, or clear a column filter."
          renderExpanded={(r) => (
            <dl className="grid grid-cols-1 gap-[var(--space-sm)] text-xs screen-420:grid-cols-3">
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
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-lg font-bold text-[var(--text-heading)]">{value}</p>
    </div>
  );
}
