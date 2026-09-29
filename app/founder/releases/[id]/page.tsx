"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { releaseRows } from "@/lib/mock-data/operations";

// Release 360 — read-only for Founder (blueprint §7 mandatory 360 views).
// Approve rollback happens via the Operations Inbox item this release links
// to when escalated (docs/Founder-Dashboard-Data-Spec.md §6) — no inline
// action button on this screen.
export default function ReleaseDetailPage() {
  const params = useParams<{ id: string }>();
  const release = releaseRows.find((r) => r.id === params.id);

  if (!release) {
    return <EmptyState title="Release not found" description="This release doesn't exist in the mock catalogue." />;
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs
        items={[
          { label: "Platform Ops", href: "/founder/operations?tab=releases" },
          { label: "Releases", href: "/founder/operations?tab=releases" },
          { label: `${release.product} ${release.version}` },
        ]}
      />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">
          {release.product} {release.version}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">Deployed {release.deployedAt}</p>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-3">
        <Card title="Status">
          <StatusBadge
            status={release.approvalRef ? "critical" : release.status === "Complete" ? "healthy" : "info"}
            label={release.status}
          />
        </Card>
        <Card title="Rolled out">
          <p className="text-2xl font-semibold text-[var(--text-secondary)]">{release.blastRadiusPct}%</p>
        </Card>
        <Card title="Rollback approval">
          {release.approvalRef ? (
            <Link href="/founder/approvals" className="text-sm font-medium text-[var(--icon-btn-navy)] hover:underline">
              View in Operations Inbox &rarr;
            </Link>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Not escalated</p>
          )}
        </Card>
      </div>
    </div>
  );
}
