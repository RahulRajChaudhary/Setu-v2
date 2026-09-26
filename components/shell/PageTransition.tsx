"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.closest("main")?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <div key={pathname} ref={rootRef} className="page-transition">
      {children}
    </div>
  );
}
