"use client";

import { useParams } from "next/navigation";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { workspaceRows, subscriptionRows, incidentRows } from "@/lib/mock-data/operations";

// Workspace 360 — read-only for Founder (docs/Founder-Dashboard-Data-Spec.md §3).
// No action buttons render on this screen for this role.
export default function WorkspaceDetailPage() {
  const params = useParams<{ id: string }>();
  const workspace = workspaceRows.find((w) => w.id === params.id);

  if (!workspace) {
    return (
      <EmptyState
        title="Workspace not found"
        description="This workspace doesn't exist in the mock catalogue."
      />
    );
  }

  const subscriptions = subscriptionRows.filter((s) => s.workspaceId === workspace.id);
  const incidents = incidentRows.filter((i) => i.affectedWorkspaceIds.includes(workspace.id));

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Platform Ops", href: "/founder/operations?tab=workspaces" }, { label: "Workspaces", href: "/founder/operations?tab=workspaces" }, { label: workspace.name }]} />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{workspace.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-3">
        <Card title="Plan">
          <p className="text-2xl font-semibold text-[var(--text-secondary)]">{workspace.plan}</p>
        </Card>
        <Card title="Status">
          <p className="text-sm text-[var(--text-secondary)]">{workspace.status}</p>
        </Card>
        <Card title="Health">
          <StatusBadge status={workspace.health} label={workspace.health} />
          <p className="mt-2 text-xs text-[var(--role-text)]">Last activity: {workspace.lastActivity}</p>
        </Card>
      </div>

      <Card title="Subscriptions">
        {subscriptions.length === 0 ? (
          <EmptyState title="No subscriptions" description="This workspace has no linked subscriptions in the mock catalogue." />
        ) : (
          <ul className="flex flex-col gap-2">
            {subscriptions.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-[var(--card-border)] p-3 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">
                  {s.product} — {s.plan}
                </span>
                <StatusBadge status={s.status === "Active" ? "healthy" : s.status === "Grace" ? "warning" : "critical"} label={s.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Incidents affecting this workspace">
        {incidents.length === 0 ? (
          <EmptyState title="No incidents" description="No open or recent incidents reference this workspace." />
        ) : (
          <ul className="flex flex-col gap-2">
            {incidents.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-lg border border-[var(--card-border)] p-3 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">{i.title}</span>
                <StatusBadge status={i.severity === "high" ? "critical" : i.severity === "medium" ? "warning" : "healthy"} label={i.severity} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
