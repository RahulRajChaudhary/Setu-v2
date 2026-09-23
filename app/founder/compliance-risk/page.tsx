import { Suspense } from "react";
import ComplianceRiskContent from "./ComplianceRiskContent";

export default function ComplianceRiskPage() {
  return (
    <Suspense>
      <ComplianceRiskContent />
    </Suspense>
  );
}
