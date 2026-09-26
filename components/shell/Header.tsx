"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell, ExternalLink, History, Settings } from "lucide-react";
import { personaConfigFromPathname } from "@/lib/personas";
import AppsLauncher from "@/components/shell/AppsLauncher";
import ThemeToggle from "@/components/shell/ThemeToggle";

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Rollback approval waiting on you",
    time: "10m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Chat with Sahayogi v3.4 flagged critical",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Evidence upload due — ISO A.12.4 logging",
    time: "5h ago",
    unread: false,
  },
];

export default function Header() {
  const [openMenu, setOpenMenu] = useState<
    "profile" | "notifications" | "apps" | null
  >(null);
  const pathname = usePathname();
  const persona = personaConfigFromPathname(pathname);

  function toggle(menu: "profile" | "notifications" | "apps") {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <header
      className="
        relative z-30 flex shrink-0 items-center
        h-[var(--header-h)]
        gap-2
        bg-[var(--shell-bg)]
        pl-3

        screen-lg:pl-4
        screen-2xl:pl-5

        screen-sm:mr-[2.1rem]
        screen-2xl:mr-[2.5rem]
      "
    >

      {/* Backdrop to close menus */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenu(null)}
        />
      )}

      {/* Search — a normal flex item (not position:fixed), so it can never paint over
          the icon cluster on the right. min-w-0 lets it shrink on narrow/foldable
          screens instead of overlapping anything; max-w caps it on wide screens. */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-1 screen-sm:px-2">
        <div
          className="
            flex h-[3.125rem] w-full min-w-0
            max-w-[30rem]
            items-center
            gap-2
            rounded-lg
            border
            border-transparent
            bg-[var(--search-bg)]
            px-3

            screen-sm:border-[var(--divider)]
          "
        >
          <span className="shrink-0">
            <Search size={20} className="shrink-0" color="var(--search-placeholder)" />
          </span>

          <input
            type="text"
            placeholder="Search KPIs, approvals, audit logs..."
            className="
              min-w-0 w-full
              bg-transparent
              text-xs
              text-[var(--text-secondary)]
              outline-none
              placeholder:text-[var(--search-placeholder)]

              screen-sm:text-sm
            "
          />
        </div>
      </div>

      {/* Right side actions — h-full so this row's bottom edge matches the header's bottom edge,
          which dropdown tops (top-[calc(100%+var(--page-pad-y))]) key off to align with where
          the dashboard content (e.g. KPI tiles) starts below the header. */}
      <div className="relative ml-auto flex h-full shrink-0 items-center gap-1.5 screen-sm:gap-2">
        {/* Create */}
        <IconButton
          label="Create"
          bg="transparent"
        >
          <Plus color="var(--text-secondary)" size={20} />
        </IconButton>

        {/* Notifications */}
        <div className="flex h-full items-center">
          <IconButton
            label="Notifications"
            bg="transparent"
            onClick={() => toggle("notifications")}
          >
            <span className="relative">
              <Bell color="var(--text-secondary)" size={20} />

              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[var(--status-critical-fg)]
                "
              />
            </span>
          </IconButton>

          {/* Notification dropdown */}
          {openMenu === "notifications" && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+var(--page-pad-y))]
                z-50
                flex
                w-[21rem]
                max-w-[calc(100vw-1.5rem)]
                flex-col
                overflow-hidden
                rounded-xl
                border
                border-[var(--divider)]
                bg-[var(--surface)]
                shadow-xl

                screen-2xl:w-[26rem]
              "
            >
              {/* Header */}
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-between
                  px-4
                  py-3.5
                "
              >
                <p className="text-base font-semibold text-[var(--text-heading)]">
                  Notifications
                </p>

                <button
                  type="button"
                  className="
                    text-xs
                    font-medium
                    text-[var(--icon-btn-navy)]
                    hover:underline
                  "
                >
                  Mark all read
                </button>
              </div>

              {/* Notifications */}
              <div
                className="
                  divide-y
                  divide-[var(--divider)]
                  overflow-y-auto
                  border-t
                  border-[var(--divider)]
                "
              >
                {NOTIFICATIONS.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="
                      tap-pop
                      flex
                      w-full
                      items-start
                      gap-2
                      px-4
                      py-3.5
                      text-left
                      transition-colors
                      hover:bg-[var(--search-bg)]
                    "
                  >
                    <span
                      className={`
                        mt-1.5
                        h-1.5
                        w-1.5
                        shrink-0
                        rounded-full
                        ${
                          notification.unread
                            ? "bg-[var(--icon-btn-navy)]"
                            : "bg-transparent"
                        }
                      `}
                    />

                    <span className="min-w-0 flex-1">
                      <span
                        className="
                          block
                          truncate
                          text-sm
                          font-medium
                          text-[var(--text-heading)]
                        "
                      >
                        {notification.title}
                      </span>

                      <span
                        className="
                          text-xs
                          text-[var(--text-muted)]
                        "
                      >
                        {notification.time}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sahayogi Apps launcher */}
        <IconButton
          label="Sahayogi Apps"
          bg="transparent"
          onClick={() => toggle("apps")}
        >
          <AppsGridIcon color="var(--text-secondary)" />
        </IconButton>

        {/* Apps dropdown — anchored to the shared right edge of this row */}
        {openMenu === "apps" && <AppsLauncher onClose={() => setOpenMenu(null)} />}

        {/* Profile */}
        <div>
          <button
            type="button"
            onClick={() => toggle("profile")}
            title={persona.identity.name}
            className="
              tap-pop
              flex
              h-[3.25rem]
              w-[3.25rem]
              shrink-0
              items-center
              justify-center
              rounded-full
              transition-all
              duration-150
              hover:bg-[var(--search-bg)]
            "
          >
            <span
              className="
                flex
                h-[2.6rem]
                w-[2.6rem]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-tr
                from-[#6366F1]
                via-[#8B5CF6]
                to-[#3B82F6]
                p-[0.1875rem]
              "
            >
            <span
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                rounded-full
                bg-[var(--avatar-bg)]
                text-sm
                font-semibold
                text-[var(--avatar-text)]
              "
            >
              {persona.identity.initials}
              </span>
            </span>
          </button>

          {/* Profile dropdown */}
          {openMenu === "profile" && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+var(--page-pad-y))]
                z-50
                w-[22rem]
                max-w-[calc(100vw-1.5rem)]
                overflow-hidden
                rounded-xl
                border
                border-[var(--divider)]
                bg-[var(--surface)]
                shadow-xl
              "
            >
              {/* Brand row */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <p className="text-base font-semibold text-[var(--text-heading)]">
                  Sahayogi One
                </p>

                <button
                  type="button"
                  className="text-sm font-medium text-[var(--status-critical-fg)] hover:underline"
                >
                  Sign out
                </button>
              </div>

              {/* Account summary */}
              <div
                className="
                  flex
                  items-start
                  gap-3
                  border-t
                  border-[var(--divider)]
                  px-4
                  py-5
                "
              >
                <span
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--avatar-bg)]
                    text-lg
                    font-semibold
                    text-[var(--avatar-text)]
                  "
                >
                  {persona.identity.initials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-[var(--text-heading)]">
                    {persona.identity.name}
                  </p>

                  <p className="truncate text-sm text-[var(--text-muted)]">
                    {persona.identity.name.toLowerCase().replace(" ", ".")}@setu.in
                  </p>

                  <p className="truncate text-sm text-[var(--role-text)]">
                    {persona.identity.role}
                  </p>

                  <button
                    type="button"
                    className="
                      tap-pop
                      mt-2
                      flex
                      items-center
                      gap-1
                      text-sm
                      font-medium
                      text-[var(--icon-btn-navy)]
                      hover:underline
                    "
                  >
                    View account
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between border-t border-[var(--divider)] px-4 py-3">
                <span className="text-base text-[var(--text-secondary)]">Theme</span>
                <ThemeToggle />
              </div>

              {/* Menu items */}
              <div className="border-t border-[var(--divider)] py-1">
                <Link
                  href={`${persona.routeBase}/audit-explorer`}
                  onClick={() => setOpenMenu(null)}
                  className="
                    tap-pop
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-2
                    px-4
                    py-3
                    text-left
                    text-base
                    text-[var(--text-secondary)]
                    transition-colors
                    hover:bg-[var(--search-bg)]
                  "
                >
                  <span className="flex items-center gap-2.5">
                    <History size={18} className="text-[var(--text-muted)]" />
                    My activity
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">Audit trail</span>
                </Link>

                <button
                  type="button"
                  className="
                    tap-pop
                    flex
                    w-full
                    items-center
                    gap-2.5
                    px-4
                    py-3
                    text-left
                    text-base
                    text-[var(--text-secondary)]
                    transition-colors
                    hover:bg-[var(--search-bg)]
                  "
                >
                  <Settings size={18} className="text-[var(--text-muted)]" />
                  Settings
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Icon Button                                                                 */
/* -------------------------------------------------------------------------- */

function IconButton({
  label,
  bg,
  children,
  onClick,
}: {
  label: string;
  bg: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      style={bg === "transparent" ? undefined : { backgroundColor: bg }}
      className={`
        tap-pop
        flex
        h-[2.875rem]
        w-[2.875rem]
        shrink-0
        items-center
        justify-center
        rounded-lg
        transition-all
        duration-150
        hover:scale-105
        ${bg === "transparent" ? "hover:bg-[var(--search-bg)]" : ""}
      `}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Apps Grid Icon (Google-style 3x3 dots)                                     */
/* -------------------------------------------------------------------------- */

function AppsGridIcon({ color }: { color: string }) {
  const positions = [0, 1, 2];

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {positions.map((row) =>
        positions.map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={3 + col * 7}
            cy={3 + row * 7}
            r="2"
            fill={color}
          />
        ))
      )}
    </svg>
  );
}

