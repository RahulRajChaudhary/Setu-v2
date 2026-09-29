"use client";

import { useParams } from "next/navigation";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { controlsTable } from "@/lib/mock-data/compliance-risk";

const CONTROL_STATUS = {
  Effective: "healthy",
  "On track": "info",
  Exception: "critical",
} as const;

// Control 360 — read-only for Founder (blueprint §7 mandatory 360 views).
// Running a test, attaching evidence, or resolving a finding is Compliance
// Officer's write scope entirely (docs/Founder-Dashboard-Data-Spec.md §10).
export default function ControlDetailPage() {
  const params = useParams<{ id: string }>();
  const control = controlsTable.find((c) => c.id === params.id);

  if (!control) {
    return <EmptyState title="Control not found" description="This control doesn't exist in the mock catalogue." />;
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs
        items={[
          { label: "Compliance & Risk", href: "/founder/compliance-risk" },
          { label: "Compliance", href: "/founder/compliance-risk" },
          { label: control.id },
        ]}
      />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{control.statement}</h1>
        <p className="font-mono-id text-xs text-[var(--text-muted)]">{control.id}</p>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-3">
        <Card title="Status">
          <StatusBadge status={CONTROL_STATUS[control.status]} label={control.status} />
        </Card>
        <Card title="Frameworks mapped">
          <p className="text-sm text-[var(--text-secondary)]">{control.frameworks}</p>
        </Card>
        <Card title="Due date">
          <p className="text-sm text-[var(--text-secondary)]">{control.dueDate}</p>
        </Card>
      </div>
    </div>
  );
}
