"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  bg: string;
  fg: string;
  icon: (color: string) => ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/founder/dashboard",
    bg: "#FCE7F3",
    fg: "#DB2777",
    icon: (color) => <GridIcon color={color} />,
  },
  {
    label: "Approvals",
    href: "/founder/approvals",
    bg: "#D1FAE5",
    fg: "#059669",
    icon: (color) => <CheckClipboardIcon color={color} />,
  },
  {
    label: "Operations",
    href: "/founder/operations",
    bg: "#DBEAFE",
    fg: "#2563EB",
    icon: (color) => <GearIcon color={color} />,
  },
  {
    label: "Cost & Analytics",
    href: "/founder/cost-analytics",
    bg: "#CCFBF1",
    fg: "#0D9488",
    icon: (color) => <TrendingUpIcon color={color} />,
  },
  {
    label: "Compliance & Risk",
    href: "/founder/compliance-risk",
    bg: "#CFFAFE",
    fg: "#0891B2",
    icon: (color) => <ShieldCheckIcon color={color} />,
  },
  {
    label: "Audit Explorer",
    href: "/founder/audit-explorer",
    bg: "#FFEDD5",
    fg: "#EA580C",
    icon: (color) => <SearchDocIcon color={color} />,
  },
  {
    label: "Product 360",
    href: "/founder/products",
    bg: "#EDE9FE",
    fg: "#7C3AED",
    icon: (color) => <CubeIcon color={color} />,
  },
];

const ACTIVE_BG = "#0B1B3B";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed inset-x-0 bottom-0 z-40
        flex h-16 w-full
        flex-row items-center justify-around
        gap-1 overflow-x-auto
        bg-[var(--shell-bg)]
        px-1 py-1

        screen-sm:static
        screen-sm:h-full
        screen-sm:w-[76px]
        screen-sm:flex-col
        screen-sm:items-center
        screen-sm:justify-start
        screen-sm:gap-1
        screen-sm:overflow-visible
        screen-sm:px-0
        screen-sm:py-0

        screen-1366:w-[81px]
        screen-1440:w-[86px]
        screen-2xl:w-[114px]
      "
      aria-label="Primary navigation"
    >
      {/* Logo */}
      <Link
        href="/founder/dashboard"
        aria-label="Go to dashboard"
        className="
          hidden
          w-full
          shrink-0
          items-center
          justify-center

          screen-sm:flex
          screen-sm:h-[68px]

          screen-lg:h-[72px]

          screen-xl:h-[76px]

          screen-2xl:h-[80px]
        "
      >
        <Image
          src="/logo.svg"
          alt="Setu"
          width={63}
          height={77}
          className="
            h-6 w-[20px]

            screen-sm:h-7 screen-sm:w-[23px]

            screen-lg:h-7 screen-lg:w-[23px]

            screen-2xl:h-8 screen-2xl:w-[26px]
          "
          priority
        />
      </Link>

      {/* Navigation */}
      <nav
        className="
          flex
          w-full
          flex-row
          items-center
          justify-around
          gap-1

          screen-sm:flex-1
          screen-sm:flex-col
          screen-sm:items-center
          screen-sm:justify-start
          screen-sm:gap-1.5
          screen-sm:overflow-y-auto
          screen-sm:overflow-x-hidden
          screen-sm:px-1.5
          screen-sm:pt-1
        "
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          const iconColor = isActive ? "#FFFFFF" : item.fg;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={isActive ? "page" : undefined}
              className="
                group
                tap-pop
                flex
                shrink-0
                flex-col
                items-center
                gap-1
              "
            >
              {/* Icon */}
              <span
                className="
                  flex
                  h-8 w-8
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  duration-200
                  group-hover:scale-105

                  screen-sm:h-9 screen-sm:w-9

                  screen-lg:h-9 screen-lg:w-9

                  screen-2xl:h-11 screen-2xl:w-11
                "
                style={{
                  backgroundColor: isActive ? ACTIVE_BG : item.bg,
                }}
              >
                {item.icon(iconColor)}
              </span>

              {/* Label */}
              <span
                className={`
                  hidden
                  min-h-[22px]
                  max-w-[68px]
                  text-center
                  text-[9px]
                  font-medium
                  leading-[11px]
                  tracking-tight

                  screen-420:block

                  screen-sm:block
                  screen-sm:max-w-[86px]

                  ${isActive ? "font-semibold text-[#0B1B3B]" : "text-slate-600"}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

type IconProps = {
  color: string;
};

function GridIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="6"
        height="6"
        rx="1.5"
        stroke={color}
        strokeWidth="1.6"
      />
      <rect
        x="11"
        y="3"
        width="6"
        height="6"
        rx="1.5"
        stroke={color}
        strokeWidth="1.6"
      />
      <rect
        x="3"
        y="11"
        width="6"
        height="6"
        rx="1.5"
        stroke={color}
        strokeWidth="1.6"
      />
      <rect
        x="11"
        y="11"
        width="6"
        height="6"
        rx="1.5"
        stroke={color}
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CheckClipboardIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4.5"
        y="3.5"
        width="11"
        height="14"
        rx="1.5"
        stroke={color}
        strokeWidth="1.6"
      />

      <path
        d="M7.5 3.5V2.5C7.5 2 7.9 1.5 8.5 1.5H11.5C12.1 1.5 12.5 2 12.5 2.5V3.5"
        stroke={color}
        strokeWidth="1.6"
      />

      <path
        d="M7 10.5L9 12.5L13 8.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="3"
        stroke={color}
        strokeWidth="1.6"
      />

      <path
        d="
          M10 2.5V4.5
          M10 15.5V17.5
          M17.5 10H15.5
          M4.5 10H2.5
          M15.36 4.64L13.95 6.05
          M6.05 13.95L4.64 15.36
          M15.36 15.36L13.95 13.95
          M6.05 6.05L4.64 4.64
        "
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrendingUpIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 14L8 9L11.5 12.5L17 6.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M12.5 6.5H17V11"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldCheckIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5L16 4.8V9.5C16 13.2 13.4 16.4 10 17.5C6.6 16.4 4 13.2 4 9.5V4.8L10 2.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M7.3 9.8L9.2 11.7L12.7 8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchDocIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 2.5H12L15.5 6V17.5H5V2.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M7 8H12M7 11H10"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <circle
        cx="8.5"
        cy="14"
        r="2"
        stroke={color}
        strokeWidth="1.6"
      />

      <path
        d="M10.2 15.7L11.8 17.3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CubeIcon({ color }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5L17 6.25V13.75L10 17.5L3 13.75V6.25L10 2.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M3 6.25L10 10L17 6.25M10 10V17.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}