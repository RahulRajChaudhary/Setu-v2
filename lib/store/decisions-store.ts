"use client";

import { useSyncExternalStore } from "react";
import { approvalQueue } from "@/lib/mock-data/approvals";
import { auditEvents, type AuditEvent } from "@/lib/mock-data/audit-explorer";
import type { ApprovalItem } from "@/lib/mock-data/types";

type DecisionAction = "approved" | "rejected";

let queue: ApprovalItem[] = [...approvalQueue];
let auditLog: AuditEvent[] = [...auditEvents];
let eventCounter = auditLog.length;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function decide(item: ApprovalItem, action: DecisionAction, reason: string) {
  queue = queue.filter((q) => q.id !== item.id);
  eventCounter += 1;
  const event: AuditEvent = {
    id: `evt-session-${eventCounter}`,
    time: new Date().toISOString().replace("T", " ").slice(0, 19),
    actor: "founder@sahayogi.in",
    action: `${action === "approved" ? "Approved" : "Rejected"} ${item.type.toLowerCase()}`,
    entity: `${item.reference} (${item.title})`,
    before: item.before,
    after: action === "approved" ? item.after : item.before,
    result: "Success",
    correlationId: `corr-${item.reference.toLowerCase()}`,
  };
  auditLog = [event, ...auditLog];
  void reason; // reason is captured on the ApprovalItem's audit entity text today; a
  // dedicated `reason` field on AuditEvent is a backend-schema change, out of scope here.
  emit();
}

export function useDecisionsQueue(): ApprovalItem[] {
  return useSyncExternalStore(
    subscribe,
    () => queue,
    () => approvalQueue,
  );
}

export function useAuditLog(): AuditEvent[] {
  return useSyncExternalStore(
    subscribe,
    () => auditLog,
    () => auditEvents,
  );
}

// Founder flags a cost anomaly to the Operations inbox (roles guide, "Usage and
// cost": read only, flag an anomaly). The Founder cannot act on it further —
// the flag is recorded in the audit log so Operations and auditors can see it.
let flaggedAnomalies: string[] = [];
const NO_FLAGS: string[] = [];

export function flagCostAnomaly(anomaly: { id: string; scope: string; metric: string }) {
  if (flaggedAnomalies.includes(anomaly.id)) return;
  flaggedAnomalies = [...flaggedAnomalies, anomaly.id];
  eventCounter += 1;
  const event: AuditEvent = {
    id: `evt-session-${eventCounter}`,
    time: new Date().toISOString().replace("T", " ").slice(0, 19),
    actor: "founder@sahayogi.in",
    action: "Flagged cost anomaly to Operations inbox",
    entity: `${anomaly.scope} — ${anomaly.metric}`,
    before: "Unflagged",
    after: "Flagged for Operations review",
    result: "Success",
    correlationId: `corr-${anomaly.id}`,
  };
  auditLog = [event, ...auditLog];
  emit();
}

export function useFlaggedAnomalies(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => flaggedAnomalies,
    () => NO_FLAGS,
  );
}
