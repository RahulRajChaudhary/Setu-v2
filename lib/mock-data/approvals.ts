import type { ApprovalItem } from "./types";

export const approvalQueue: ApprovalItem[] = [
  {
    id: "apr-1",
    type: "Risk acceptance",
    title: "Accept residual risk: vendor SSO outage exposure",
    requester: "Priya N. (Compliance Officer)",
    impact: "High — affects SSO for 3 workspaces",
    owner: "Founder",
    deadline: "2026-09-24",
    severity: "high",
    reason:
      "Vendor SSO provider has no committed SLA above 99.9%; alternate provider migration is 6 weeks out. Risk owner recommends acceptance with quarterly review.",
    reference: "RISK-1042",
    before: "Residual rating: High (unaccepted)",
    after: "Residual rating: High (accepted, reviewed quarterly)",
  },
  {
    id: "apr-2",
    type: "Rollback approval",
    title: "Approve rollback: Chat with Sahayogi v3.4 release",
    requester: "Arjun M. (Engineering Lead)",
    impact: "Critical — blast radius exceeds threshold (42% of WhatsApp broadcast traffic)",
    owner: "Founder",
    deadline: "2026-09-23",
    severity: "critical",
    reason:
      "v3.4 introduced a WhatsApp delivery-latency regression above SLO on 3 of 5 canary shards. Auto-rollback threshold was exceeded, escalated per blast-radius policy.",
    reference: "REL-889",
    before: "Chat with Sahayogi v3.4 — 42% rollout",
    after: "Chat with Sahayogi v3.3 — 100% rollout (rollback)",
  },
  {
    id: "apr-3",
    type: "Permanent suspension",
    title: "Suspend workspace: Acme Traders (fraud flag)",
    requester: "Ops escalation",
    impact: "Medium — 1 workspace, 4 active users",
    owner: "Founder",
    deadline: "2026-09-26",
    severity: "medium",
    reason:
      "Automated fraud detection flagged repeated card-testing patterns. Customer Ops recommends permanent suspension pending manual review.",
    reference: "CASE-2291",
    before: "Workspace status: Active",
    after: "Workspace status: Suspended (permanent)",
  },
];
