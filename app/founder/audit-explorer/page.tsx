"use client";

import { useMemo, useState } from "react";
import { Activity, Bot, ClipboardList, Download, Link2, ShieldCheck, User, UserCog, X } from "lucide-react";
import Card from "@/components/shared/Card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatTile from "@/components/shared/StatTile";
import TableToolbar from "@/components/shared/TableToolbar";
import { auditKpis, type AuditEvent } from "@/lib/mock-data/audit-explorer";
import { useAuditLog } from "@/lib/store/decisions-store";

const isSystem = (e: AuditEvent) => e.actor.startsWith("system:");

type ExportState = { phase: "idle" | "working" | "done"; name?: string };

export default function AuditExplorerPage() {
  const [exportState, setExportState] = useState<ExportState>({ phase: "idle" });
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("all");
  // Narrow the log to one correlation chain (e.g. every event behind a rollback).
  const [chain, setChain] = useState<string | null>(null);
  const liveEvents = useAuditLog();

  const counts = useMemo(
    () => ({
      all: liveEvents.length,
      human: liveEvents.filter((e) => !isSystem(e)).length,
      system: liveEvents.filter(isSystem).length,
      failed: liveEvents.filter((e) => e.result === "Failed").length,
    }),
    [liveEvents],
  );

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return liveEvents.filter((e) => {
      if (chain && e.correlationId !== chain) return false;
      if (actorFilter === "human" && isSystem(e)) return false;
      if (actorFilter === "system" && !isSystem(e)) return false;
      if (actorFilter === "failed" && e.result !== "Failed") return false;
      if (q === "") return true;
      return (
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.correlationId.toLowerCase().includes(q)
      );
    });
  }, [search, liveEvents, actorFilter, chain]);

  function startExport() {
    setExportState({ phase: "working" });
    // Mock: a real implementation would call the signed-export endpoint.
    window.setTimeout(() => setExportState({ phase: "done", name: `AUDIT-EXPORT-${String(Date.now()).slice(-4)}` }), 900);
  }

  const columns: Column<AuditEvent>[] = [
    {
      key: "time",
      header: "Time",
      render: (r) => {
        const [date, time] = r.time.split(" ");
        return (
          <span className="font-mono-id text-xs">
            <span className="text-[var(--text-muted)]">{date}</span> <span className="font-semibold text-[var(--text-heading)]">{time}</span>
          </span>
        );
      },
      sortValue: (r) => r.time,
      className: "whitespace-nowrap",
    },
    {
      key: "actor",
      header: "Actor",
      render: (r) => {
        const system = isSystem(r);
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                background: system ? "var(--status-neutral-bg)" : "var(--status-info-bg)",
                color: system ? "var(--status-neutral-fg)" : "var(--status-info-fg)",
              }}
              title={system ? "System actor" : "Human actor"}
            >
              {system ? <Bot size={13} /> : <User size={13} />}
            </span>
            <span className="text-[var(--text-secondary)]">{system ? r.actor.replace("system:", "") : r.actor}</span>
          </span>
        );
      },
      sortValue: (r) => r.actor,
    },
    { key: "action", header: "Action", render: (r) => <span className="font-medium text-[var(--text-secondary)]">{r.action}</span> },
    {
      key: "entity",
      header: "Entity",
      render: (r) => <span className="font-mono-id text-xs">{r.entity}</span>,
    },
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

  const humanPct = Math.round((auditKpis.humanActionedEvents / auditKpis.todaysEvents) * 100);

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Audit" }]} />

      <div className="grid grid-cols-2 gap-[var(--space-sm)] screen-sm:grid-cols-4">
        <StatTile label="Total events" value={auditKpis.totalEvents.toLocaleString()} tone="info" icon={<ClipboardList size={16} />} note="All time, immutable" />
        <StatTile label="Today's events" value={auditKpis.todaysEvents.toLocaleString()} tone="info" icon={<Activity size={16} />} note="Human + system" />
        <StatTile
          label="Human-actioned"
          value={auditKpis.humanActionedEvents.toLocaleString()}
          tone="neutral"
          icon={<UserCog size={16} />}
          note={`${humanPct}% of today`}
        />
        <StatTile
          label="System events"
          value={auditKpis.systemEvents.toLocaleString()}
          tone="neutral"
          icon={<Bot size={16} />}
          note={`${100 - humanPct}% of today`}
        />
      </div>

      <Card
        title="Event log"
        description="Read-only forensic record. Click a row for before/after and the correlation chain."
        action={
          <button
            type="button"
            onClick={startExport}
            disabled={exportState.phase === "working"}
            className="tap-pop inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-solid)] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-70"
          >
            <Download size={13} />
            {exportState.phase === "working" ? "Signing report…" : "Export signed report"}
          </button>
        }
      >
        {exportState.phase === "done" && (
          <div className="mb-3 flex items-start justify-between gap-2 rounded-lg bg-[var(--status-healthy-bg)] px-3 py-2 text-xs font-medium text-[var(--status-healthy-fg)]">
            <span className="flex items-start gap-2">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-mono-id font-semibold">{exportState.name}</span> signed — covers the {filteredEvents.length} events currently shown. The download link
                appears here once this is wired to a real API.
              </span>
            </span>
            <button type="button" aria-label="Dismiss" onClick={() => setExportState({ phase: "idle" })} className="shrink-0 rounded p-0.5 hover:bg-black/5">
              <X size={14} />
            </button>
          </div>
        )}

        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events or correlation ID..."
          filterOptions={[
            { value: "all", label: `All (${counts.all})` },
            { value: "human", label: `Human (${counts.human})` },
            { value: "system", label: `System (${counts.system})` },
            { value: "failed", label: `Failed (${counts.failed})` },
          ]}
          activeFilter={actorFilter}
          onFilterChange={setActorFilter}
        />

        {chain && (
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--status-info-bg)] py-1 pl-3 pr-1.5 text-xs font-medium text-[var(--status-info-fg)]">
            <Link2 size={12} />
            Chain <span className="font-mono-id">{chain}</span> &middot; {filteredEvents.length} events
            <button type="button" aria-label="Clear chain filter" onClick={() => setChain(null)} className="rounded-full p-0.5 hover:bg-black/10">
              <X size={12} />
            </button>
          </p>
        )}

        <DataTable
          columns={columns}
          rows={filteredEvents}
          getRowKey={(r) => r.id}
          pageSize={6}
          emptyTitle="No events match"
          emptyDescription="Try a different search term or filter, or clear the correlation chain."
          renderExpanded={(r) => {
            const chainSize = liveEvents.filter((e) => e.correlationId === r.correlationId).length;
            return (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[var(--status-critical-bg)] px-2 py-1 font-medium text-[var(--status-critical-fg)]">
                    <span className="mr-1 opacity-70">Before</span>
                    {r.before}
                  </span>
                  <span aria-hidden className="text-[var(--text-muted)]">
                    &rarr;
                  </span>
                  <span className="rounded-md bg-[var(--status-healthy-bg)] px-2 py-1 font-medium text-[var(--status-healthy-fg)]">
                    <span className="mr-1 opacity-70">After</span>
                    {r.after}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--role-text)]">
                  <span>
                    Correlation ID <span className="font-mono-id font-medium text-[var(--text-secondary)]">{r.correlationId}</span>
                  </span>
                  {chainSize > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChain(r.correlationId);
                        setActorFilter("all");
                        setSearch("");
                      }}
                      className="inline-flex items-center gap-1 font-medium text-[var(--icon-btn-navy)] hover:underline"
                    >
                      <Link2 size={12} /> Show all {chainSize} events in this chain
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />
      </Card>
    </div>
  );
}
