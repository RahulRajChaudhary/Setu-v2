import { Suspense } from "react";
import OperationsContent from "./OperationsContent";

export default function OperationsPage() {
  return (
    <Suspense>
      <OperationsContent />
    </Suspense>
  );
}
