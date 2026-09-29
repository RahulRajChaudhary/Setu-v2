"use client";

import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { approvalQueue } from "@/lib/mock-data/approvals";
import type { ApprovalItem, Severity } from "@/lib/mock-data/types";

const SEVERITY_STATUS: Record<Severity, "healthy" | "warning" | "critical"> = {
  low: "healthy",
  medium: "warning",
  high: "critical",
  critical: "critical",
};

type Decision = { id: string; action: "approved" | "rejected"; reason: string };

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<ApprovalItem[]>(approvalQueue);
  const [selectedId, setSelectedId] = useState<string | null>(approvalQueue[0]?.id ?? null);
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState<Decision[]>([]);

  const selected = queue.find((item) => item.id === selectedId) ?? null;

  function decide(action: "approved" | "rejected") {
    if (!selected || reason.trim().length === 0) return;
    setHistory((h) => [...h, { id: selected.id, action, reason: reason.trim() }]);
    const remaining = queue.filter((item) => item.id !== selected.id);
    setQueue(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setReason("");
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Operations Inbox" }]} />

      {queue.length === 0 ? (
        <EmptyState
          title="Nothing waiting on you"
          description="Approvals routed to the Founder will show up here as they're escalated."
        />
      ) : (
        <div className="grid grid-cols-1 gap-[var(--space-md)] screen-lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <ul className="flex flex-col gap-2">
            {queue.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setReason("");
                  }}
                  className={`tap-pop flex w-full flex-col gap-1.5 rounded-[var(--card-radius)] border p-3 text-left transition-all ${
                    selectedId === item.id
                      ? "border-[var(--icon-btn-navy)] bg-[var(--search-bg)]"
                      : "card-interactive border-[var(--card-border)] bg-[var(--surface)] hover:bg-[var(--search-bg)]"
                  }`}
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--role-text)]">{item.type}</span>
                    <StatusBadge status={SEVERITY_STATUS[item.severity]} label={item.deadline} />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">{item.title}</p>
                  <p className="text-xs text-[var(--role-text)]">{item.requester}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.impact}</p>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="flex flex-col gap-[var(--space-md)] rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--surface)] p-5" style={{ boxShadow: "var(--card-shadow)" }}>
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={SEVERITY_STATUS[selected.severity]} label={selected.type} />
                <span className="text-xs text-[var(--role-text)]">{selected.reference}</span>
              </div>
              <h2 className="text-base font-semibold text-[var(--text-secondary)]">{selected.title}</h2>

              <dl className="grid grid-cols-2 gap-[var(--space-sm)] text-sm">
                <Field label="Requester" value={selected.requester} />
                <Field label="Deadline" value={selected.deadline} />
                <Field label="Impact" value={selected.impact} />
                <Field label="Owner" value={selected.owner} />
              </dl>

              <div>
                <p className="text-xs font-medium text-[var(--role-text)]">Reason</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{selected.reason}</p>
              </div>

              <div className="rounded-lg border border-[var(--divider)] p-3">
                <p className="mb-2 text-xs font-medium text-[var(--role-text)]">Before / after</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-[var(--status-critical-bg)] px-2 py-1 text-[var(--status-critical-fg)]">
                    {selected.before}
                  </span>
                  <span aria-hidden="true">&rarr;</span>
                  <span className="rounded-md bg-[var(--status-healthy-bg)] px-2 py-1 text-[var(--status-healthy-fg)]">
                    {selected.after}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="text-xs font-medium text-[var(--role-text)]">
                  Decision reason (required)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Explain your decision — this is recorded in the audit trail"
                  className="mt-1 w-full rounded-lg border border-[var(--divider)] p-2 text-sm outline-none focus:border-[var(--icon-btn-navy)]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={reason.trim().length === 0}
                  onClick={() => decide("approved")}
                  className="tap-pop flex-1 rounded-lg bg-[var(--status-healthy-fg)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={reason.trim().length === 0}
                  onClick={() => decide("rejected")}
                  className="tap-pop flex-1 rounded-lg bg-[var(--status-critical-fg)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
          <p className="mb-2 text-xs font-semibold text-[var(--role-text)]">Decisions this session</p>
          <ul className="flex flex-col gap-1 text-xs text-[var(--role-text)]">
            {history.map((h, i) => (
              <li key={i}>
                <span className="font-medium text-[var(--text-secondary)]">{h.action}</span> — {h.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--role-text)]">{label}</dt>
      <dd className="font-medium text-[var(--text-secondary)]">{value}</dd>
    </div>
  );
}
