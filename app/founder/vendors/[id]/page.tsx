"use client";

import { useParams } from "next/navigation";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { vendorTable } from "@/lib/mock-data/compliance-risk";

// Vendor 360 — read-only for Founder (blueprint §7 mandatory 360 views).
export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = vendorTable.find((v) => v.id === params.id);

  if (!vendor) {
    return <EmptyState title="Vendor not found" description="This vendor doesn't exist in the mock catalogue." />;
  }

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <Breadcrumbs
        items={[
          { label: "Compliance & Risk", href: "/founder/compliance-risk?tab=risks" },
          { label: "Risks & Vendors", href: "/founder/compliance-risk?tab=risks" },
          { label: vendor.vendor },
        ]}
      />

      <div>
        <h1 className="text-[length:var(--font-page-title)] font-bold tracking-tight text-[var(--text-heading)]">{vendor.vendor}</h1>
        <p className="text-sm text-[var(--text-muted)]">{vendor.service}</p>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-md)] screen-sm:grid-cols-3">
        <Card title="Criticality tier">
          <StatusBadge
            status={vendor.criticality === "Critical" ? "critical" : vendor.criticality === "High" ? "warning" : "info"}
            label={vendor.criticality}
          />
          <p className="mt-2 text-xs text-[var(--role-text)]">
            Residual risk {vendor.residualRisk} &middot; inherent {vendor.inherentRisk}
          </p>
        </Card>
        <Card title="DPA / contract renewal">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{vendor.renewalDate}</p>
        </Card>
        <Card title="Last review">
          <p className="text-sm text-[var(--text-secondary)]">{vendor.lastReview}</p>
        </Card>
      </div>

      {vendor.monitoringFlag && (
        <Card title="Monitoring">
          <StatusBadge status="warning" label={vendor.monitoringFlag} />
        </Card>
      )}
    </div>
  );
}
