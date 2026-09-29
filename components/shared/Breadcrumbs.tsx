"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { personaConfigFromPathname } from "@/lib/personas";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Back link + breadcrumb trail for every Founder screen below the persona
// home. `items` excludes "Home" (added automatically, pointed at the current
// persona's dashboard) — the current page is the last entry, passed without
// an href; everything before it should have one.
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  const persona = personaConfigFromPathname(pathname);
  const trail: BreadcrumbItem[] = [{ label: "Home", href: `${persona.routeBase}/dashboard` }, ...items];
  const parent = trail[trail.length - 2];

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href={parent.href ?? `${persona.routeBase}/dashboard`}
        className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-[var(--role-text)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <span className="h-3.5 w-px shrink-0 bg-[var(--divider)]" />

      <nav aria-label="Breadcrumb" className="min-w-0 overflow-hidden">
        <ol className="flex items-center gap-1.5 overflow-hidden text-xs text-[var(--role-text)]">
          {trail.map((item, index) => {
            const isCurrent = index === trail.length - 1;
            return (
              <li
                key={`${item.label}-${index}`}
                className={`flex items-center gap-1.5 ${isCurrent ? "min-w-0" : "shrink-0"}`}
              >
                {index > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                {isCurrent || !item.href ? (
                  <span
                    aria-current={isCurrent ? "page" : undefined}
                    className={isCurrent ? "truncate font-medium text-[var(--text-heading)]" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-[var(--text-secondary)]">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

export default Breadcrumbs;
