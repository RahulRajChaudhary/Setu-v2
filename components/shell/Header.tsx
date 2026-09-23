"use client";

import { useState } from "react";
import { workspaceRows } from "@/lib/mock-data/operations";

const WORKSPACES = [
  { id: "all", name: "All Workspaces" },
  ...workspaceRows.map((ws) => ({ id: ws.id, name: ws.name })),
];

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
    "profile" | "notifications" | "workspace" | null
  >(null);
  const [activeWorkspace, setActiveWorkspace] = useState(WORKSPACES[0].id);

  function toggle(menu: "profile" | "notifications" | "workspace") {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <header
      className="
        relative z-30 flex shrink-0 items-center
        h-[58px]
        gap-2
        bg-[var(--shell-bg)]
        px-3

        screen-sm:h-[68px]
        screen-sm:gap-2.5
        screen-sm:px-4

        screen-lg:h-[72px]
        screen-lg:px-5

        screen-xl:h-[76px]

        screen-2xl:h-[80px]
        screen-2xl:px-6
      "
    >
      {/* Backdrop to close menus */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenu(null)}
        />
      )}

      {/* Workspace */}
      <div className="relative z-50 hidden screen-sm:block">
        <button
          type="button"
          onClick={() => toggle("workspace")}
          className={`
            tap-pop flex shrink-0 items-center
            gap-1.5
            rounded-lg
            border
            bg-[var(--surface-muted)]
            px-3
            h-8
            text-xs font-semibold
            text-[var(--text-secondary)]
            transition-colors
            hover:bg-[var(--search-bg)]

            screen-2xl:h-10
            screen-2xl:px-4
            screen-2xl:text-sm

            ${openMenu === "workspace" ? "border-[var(--icon-btn-navy)] bg-white hover:bg-white" : "border-transparent"}
          `}
        >
          <span className="max-w-[140px] truncate screen-2xl:max-w-none">
            {WORKSPACES.find((w) => w.id === activeWorkspace)?.name ?? "Setu Founder"}
          </span>
          <span className={`shrink-0 transition-transform ${openMenu === "workspace" ? "rotate-180" : ""}`}>
            <ChevronDownIcon />
          </span>
        </button>

        {/* Workspace dropdown */}
        {openMenu === "workspace" && (
          <div
            className="
              absolute
              left-0
              top-[calc(100%+0.375rem)]
              z-50
              w-72
              max-w-[calc(100vw-1.5rem)]
              overflow-hidden
              rounded-xl
              border
              border-[var(--icon-btn-navy)]
              bg-white
              shadow-xl
            "
          >
            <div className="flex max-h-64 flex-col overflow-y-auto py-1">
              {WORKSPACES.map((ws) => {
                const selected = ws.id === activeWorkspace;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      setActiveWorkspace(ws.id);
                      setOpenMenu(null);
                    }}
                    className={`
                      tap-pop
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-2
                      px-4
                      py-2.5
                      text-left
                      text-sm
                      transition-colors
                      ${
                        selected
                          ? "bg-[var(--status-info-bg)] font-semibold text-[var(--text-heading)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
                      }
                    `}
                  >
                    <span className="truncate">{ws.name}</span>
                    {selected && (
                      <span className="shrink-0 text-[var(--icon-btn-navy)]">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex min-w-0 flex-1 justify-center px-1 screen-sm:px-2">
        <div
          className="
            flex h-9 w-full
            max-w-[420px]
            items-center
            gap-2
            rounded-lg
            border
            border-transparent
            bg-[var(--search-bg)]
            px-3

            screen-sm:h-10
            screen-sm:max-w-[480px]
            screen-sm:border-[var(--divider)]
            screen-sm:px-3.5

            screen-lg:h-11
            screen-lg:max-w-[500px]

            screen-xl:h-12
            screen-xl:max-w-[520px]

            screen-1366:h-[48px]!
            screen-1366:max-w-[300px]!

            screen-1440:h-[60px]!
            screen-1440:max-w-[375px]!

            screen-2xl:h-[54px]!
            screen-2xl:max-w-[529px]!
            screen-2xl:gap-[10px]
            screen-2xl:rounded-lg
            screen-2xl:pl-[25px]
            screen-2xl:pr-[25px]
            screen-2xl:py-[15px]
          "
        >
          <SearchIcon />

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

          {/* Keyboard shortcut */}
          <span
            className="
              hidden shrink-0
              rounded-md
              bg-white
              px-1.5
              py-0.5
              text-xs
              text-[var(--search-placeholder)]

              screen-sm:inline-block
            "
          >
            &#8984;K
          </span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex shrink-0 items-center gap-1.5 screen-sm:gap-2">
        {/* Resources */}
        <span className="hidden screen-sm:inline-flex">
          <IconButton
            label="Resources"
            bg="var(--icon-btn-bg)"
          >
            <BookIcon color="#4A5565" />
          </IconButton>
        </span>

        {/* Create */}
        <IconButton
          label="Create"
          bg="var(--icon-btn-navy)"
        >
          <PlusIcon color="#FFFFFF" />
        </IconButton>

        {/* Notifications */}
        <div className="relative z-50">
          <IconButton
            label="Notifications"
            bg="var(--icon-btn-bg)"
            onClick={() => toggle("notifications")}
          >
            <span className="relative">
              <BellIcon color="#4A5565" />

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
                top-[calc(100%+0.5rem)]
                z-50
                flex
                w-[290px]
                max-w-[calc(100vw-1.5rem)]
                flex-col
                overflow-hidden
                rounded-xl
                border
                border-[var(--divider)]
                bg-white
                shadow-xl

                screen-sm:w-80

                screen-2xl:w-[420px]
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
                  py-3
                "
              >
                <p className="text-sm font-semibold text-[var(--text-heading)]">
                  Notifications
                </p>

                <button
                  type="button"
                  className="
                    text-[11px]
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
                      py-3
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
                          text-xs
                          font-medium
                          text-[var(--text-heading)]
                        "
                      >
                        {notification.title}
                      </span>

                      <span
                        className="
                          text-[11px]
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

        {/* Profile */}
        <div className="relative z-50">
          <button
            type="button"
            onClick={() => toggle("profile")}
            className="
              tap-pop
              flex
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              border-[var(--divider)]
              py-1
              pl-1
              pr-2.5
              transition-colors
              hover:bg-[var(--surface-muted)]

              screen-sm:pr-3

              screen-1366:h-[65px]!
              screen-1366:w-[220px]!
              screen-1366:justify-between
              screen-1366:px-3!
              screen-1366:py-2!

              screen-1440:h-[53px]!

              screen-2xl:h-[66px]!
            "
          >
            {/* Avatar */}
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[var(--avatar-bg)]
                text-xs
                font-semibold
                text-[var(--avatar-text)]

                screen-2xl:h-10
                screen-2xl:w-10
                screen-2xl:text-sm
              "
            >
              DS
            </div>

            {/* Name / role */}
            <span
              className="
                hidden
                text-left
                leading-tight
                screen-sm:inline
              "
            >
              <span
                className="
                  block
                  text-xs
                  font-semibold
                  text-[var(--text-secondary)]

                  screen-2xl:text-sm
                "
              >
                Dhruv Singla
              </span>

              <span
                className="
                  block
                  text-[10px]
                  text-[var(--role-text)]

                  screen-2xl:text-xs
                "
              >
                Founder
              </span>
            </span>

            {/* Chevron */}
            <span className="hidden screen-sm:inline">
              <ChevronDownIcon />
            </span>
          </button>

          {/* Profile dropdown */}
          {openMenu === "profile" && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+0.5rem)]
                z-50
                w-56
                overflow-hidden
                rounded-xl
                border
                border-[var(--divider)]
                bg-white
                shadow-xl
              "
            >
              <p
                className="
                  truncate
                  px-4
                  py-3
                  text-xs
                  text-[var(--text-muted)]
                "
              >
                dhruv.singla@setu.in
              </p>

              <div className="border-t border-[var(--divider)]">
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
                    text-sm
                    text-[var(--text-heading)]
                    transition-colors
                    hover:bg-[var(--search-bg)]
                  "
                >
                  <UserIcon />
                  View Profile
                </button>
              </div>

              <div className="border-t border-[var(--divider)]">
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
                    text-sm
                    font-medium
                    text-[var(--status-critical-fg)]
                    transition-colors
                    hover:bg-[var(--status-critical-bg)]
                  "
                >
                  <SignOutIcon />
                  Sign Out
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
      style={{ backgroundColor: bg }}
      className="
        tap-pop
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-lg
        transition-transform
        duration-150
        hover:scale-105

        screen-sm:h-10
        screen-sm:w-10

        screen-lg:h-11
        screen-lg:w-11

        screen-1366:h-[46px]!
        screen-1366:w-[46px]!
      "
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="7"
        cy="7"
        r="5"
        stroke="#9CA3AF"
        strokeWidth="1.5"
      />

      <path
        d="M14 14L11 11"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 4.5C7.5 3.5 5 3 3 3.5V13.5C5 13 7.5 13.5 9 14.5C10.5 13.5 13 13 15 13.5V3.5C13 3 10.5 3.5 9 4.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M9 4.5V14.5"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 3V15M3 9H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 2C6.8 2 5 3.8 5 6V9L3.5 11.5H14.5L13 9V6C13 3.8 11.2 2 9 2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M7.5 13.5C7.5 14.3 8.2 15 9 15C9.8 15 10.5 14.3 10.5 13.5"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 7.5L5.5 10L11 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="var(--chevron)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="5.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M3 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 14H3.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10.5 11L14 7.5L10.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14 7.5H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
