export const auditKpis = {
  totalEvents: 48213,
  todaysEvents: 612,
  humanActionedEvents: 89,
  systemEvents: 523,
};

export type AuditEvent = {
  id: string;
  time: string;
  actor: string;
  action: string;
  entity: string;
  before: string;
  after: string;
  result: "Success" | "Failed";
  correlationId: string;
};

export const auditEvents: AuditEvent[] = [
  { id: "evt-1", time: "2026-09-23 09:14:02", actor: "priya.n@sahayogi.in", action: "Approved risk acceptance", entity: "RISK-1042", before: "Pending", after: "Accepted", result: "Success", correlationId: "corr-8a21f" },
  { id: "evt-2", time: "2026-09-23 08:52:41", actor: "system:release-bot", action: "Rollback triggered", entity: "REL-889 (Chat with Sahayogi v3.4)", before: "42% rollout", after: "Rollback initiated", result: "Success", correlationId: "corr-77b0e" },
  { id: "evt-3", time: "2026-09-23 08:10:19", actor: "arjun.m@sahayogi.in", action: "Escalated blast-radius rollback", entity: "REL-889 (Chat with Sahayogi v3.4)", before: "Owner: Eng Lead", after: "Owner: Founder", result: "Success", correlationId: "corr-77b0e" },
  { id: "evt-4", time: "2026-09-22 22:03:55", actor: "system:fraud-detector", action: "Flagged workspace", entity: "WS-Acme Traders", before: "Active", after: "Flagged", result: "Success", correlationId: "corr-11c9a" },
  { id: "evt-5", time: "2026-09-22 21:40:12", actor: "rhea.s@sahayogi.in", action: "Acknowledged incident", entity: "INC-2201", before: "Triggered", after: "Acknowledged", result: "Success", correlationId: "corr-99f31" },
  { id: "evt-6", time: "2026-09-22 20:15:47", actor: "system:billing", action: "Retry payment capture", entity: "SUB-4471", before: "Grace", after: "Grace (retry failed)", result: "Failed", correlationId: "corr-5e02d" },
  { id: "evt-7", time: "2026-09-22 19:02:33", actor: "founder@sahayogi.in", action: "Approved rollback", entity: "REL-889 (Chat with Sahayogi v3.4)", before: "Pending approval", after: "Approved", result: "Success", correlationId: "corr-77b0e" },
  { id: "evt-8", time: "2026-09-22 18:44:01", actor: "system:audit-export", action: "Generated signed export", entity: "AUDIT-EXPORT-0912", before: "-", after: "Signed PDF generated", result: "Success", correlationId: "corr-31aa2" },
];
