"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { subscriptionRows, workspaceRows } from "@/lib/mock-data/operations";

// Subscription 360 — read-only for Founder (blueprint §7 mandatory 360 views).
export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const subscription = subscriptionRows.find((s) => s.id === params.id);
  const workspace = workspaceRows.find((w) => w.name === subscription?.workspace);

  if (!subscription) {
    return <EmptyState title="Subscription not found" description="This subscription doesn't exist in the mock catalogue." />;
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs
        items={[
          { label: "Platform Ops", href: "/founder/operations?tab=subscriptions" },
          { label: "Subscriptions", href: "/founder/operations?tab=subscriptions" },
          { label: `${subscription.product} — ${subscription.workspace}` },
        ]}
      />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{subscription.product}</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {workspace ? (
            <Link href={`/founder/workspaces/${workspace.id}`} className="text-[var(--icon-btn-navy)] hover:underline">
              {subscription.workspace}
            </Link>
          ) : (
            subscription.workspace
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-3">
        <Card title="Plan">
          <p className="text-2xl font-semibold text-[var(--text-secondary)]">{subscription.plan}</p>
        </Card>
        <Card title="Status">
          <StatusBadge
            status={subscription.status === "Active" ? "healthy" : subscription.status === "Grace" ? "warning" : "critical"}
            label={subscription.status}
          />
        </Card>
        <Card title="Renewal date">
          <p className="text-sm text-[var(--text-secondary)]">{subscription.renewalDate}</p>
        </Card>
      </div>
    </div>
  );
}
