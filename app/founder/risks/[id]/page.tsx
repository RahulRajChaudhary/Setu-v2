"use client";

import { useParams } from "next/navigation";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { topRisks } from "@/lib/mock-data/compliance-risk";

// Risk 360 — read-only for Founder (blueprint §7 mandatory 360 views).
// Founder can Accept/Treat a risk only when it's escalated via the
// Operations Inbox (docs/Founder-Dashboard-Data-Spec.md §11) — no action
// buttons render on this screen itself.
export default function RiskDetailPage() {
  const params = useParams<{ id: string }>();
  const risk = topRisks.find((r) => r.id === params.id);

  if (!risk) {
    return <EmptyState title="Risk not found" description="This risk doesn't exist in the mock catalogue." />;
  }

  const score = risk.likelihood * risk.impact;

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs
        items={[
          { label: "Compliance & Risk", href: "/founder/compliance-risk?tab=risks" },
          { label: "Risks & Vendors", href: "/founder/compliance-risk?tab=risks" },
          { label: risk.label },
        ]}
      />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{risk.label}</h1>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-4">
        <Card title="Residual score">
          <StatusBadge status={score >= 16 ? "critical" : "warning"} label={`${score}`} />
          <p className="mt-2 text-xs text-[var(--role-text)]">Likelihood {risk.likelihood} &times; Impact {risk.impact}</p>
        </Card>
        <Card title="Owner">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{risk.owner}</p>
        </Card>
        <Card title="Treatment status">
          <p className="text-sm text-[var(--text-secondary)]">{risk.treatmentStatus}</p>
        </Card>
        <Card title="Due date">
          <p className="text-sm text-[var(--text-secondary)]">{risk.dueDate}</p>
        </Card>
      </div>
    </div>
  );
}
