"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { incidentRows } from "@/lib/mock-data/operations";

// Incident 360 — read-only for Founder (docs/Founder-Dashboard-Data-Spec.md §8).
// No declare/mitigate/close actions render on this screen for this role.
export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const incident = incidentRows.find((i) => i.id === params.id);

  if (!incident) {
    return (
      <EmptyState
        title="Incident not found"
        description="This incident doesn't exist in the mock catalogue."
      />
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs items={[{ label: "Platform Ops", href: "/founder/operations?tab=incidents" }, { label: "Incidents", href: "/founder/operations?tab=incidents" }, { label: incident.id }]} />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{incident.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-4">
        <Card title="Severity">
          <StatusBadge status={incident.severity === "high" ? "critical" : incident.severity === "medium" ? "warning" : "healthy"} label={incident.severity} />
        </Card>
        <Card title="Commander">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{incident.commander}</p>
        </Card>
        <Card title="Status">
          <p className="text-sm text-[var(--text-secondary)]">{incident.status}</p>
        </Card>
        <Card title="Time open">
          <p className="text-sm text-[var(--text-secondary)]">{incident.timeOpen}</p>
        </Card>
      </div>

      <Card title="Affected workspaces">
        <ul className="flex flex-wrap gap-2">
          {incident.affectedWorkspaces.map((w) => (
            <li key={w} className="rounded-full bg-[var(--search-bg)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
              {w}
            </li>
          ))}
        </ul>
      </Card>

      {incident.linkedRelease && (
        <Card title="Linked release">
          {incident.linkedReleaseId ? (
            <Link
              href={`/founder/releases/${incident.linkedReleaseId}`}
              className="text-sm font-medium text-[var(--icon-btn-navy)] hover:underline"
            >
              {incident.linkedRelease} &rarr;
            </Link>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">{incident.linkedRelease}</p>
          )}
        </Card>
      )}
    </div>
  );
}
