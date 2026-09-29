import { Suspense } from "react";
import ProductDetailContent from "./ProductDetailContent";

export default function ProductDetailPage() {
  return (
    <Suspense>
      <ProductDetailContent />
    </Suspense>
  );
}
