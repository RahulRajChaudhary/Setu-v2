import { Suspense } from "react";
import CostAnalyticsContent from "./CostAnalyticsContent";

export default function CostAnalyticsPage() {
  return (
    <Suspense>
      <CostAnalyticsContent />
    </Suspense>
  );
}
