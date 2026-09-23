# Session 1 — Scaffold + Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js + Tailwind project and build the app shell (sidebar icon rail, header, footer) matching the measured chrome in `docs/figma-design-layout.md`, responsive at 1366/1440/1920px.

**Architecture:** `create-next-app` (App Router, TypeScript, Tailwind, no `src/` dir). Three presentational shell components (`Sidebar`, `Header`, `Footer`) composed by an `AppShell` layout wrapper used in `app/layout.tsx`. No routing logic, no data fetching, no state — pure static markup this session. Design tokens (colors) live as CSS custom properties in `app/globals.css`; breakpoint-specific sizes use Tailwind's arbitrary variant syntax (`min-[1440px]:`, `min-[1920px]:`) directly in component `className`s rather than `tailwind.config` screens, so the plan works whether `create-next-app` installs Tailwind v3 or v4.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS (whatever major version `create-next-app@latest` installs — no config-file-format assumptions made).

## Global Constraints

- No external UI/component/icon libraries. Every component and every icon glyph is hand-written (plain `<svg>` markup or CSS), per the user's explicit "no library" instruction.
- Colors and pixel measurements are copied verbatim from `docs/figma-design-layout.md` §1–2. The 1440px pill/avatar sizes are smaller than 1366/1920 in the source doc — preserve this exactly, do not "fix" it.
- No test framework is in scope for this session. Verification = `npm run build` succeeding + manual visual check via `npm run dev` at browser widths 1366px, 1440px, and 1920px (use browser devtools responsive mode or resize the window).
- The 7 Founder sidebar nav items (`docs/founder-persona-final.md` §3) have no specified icon glyphs in the source design (the Figma export only shows the collapsed icon rail, no glyph detail). Render them as two-letter monogram buttons for this session — flagged inline as a placeholder pending real icon assets, not a plan gap.
- Commit after every task.

---

### Task 1: Scaffold Next.js project with Tailwind

**Files:**
- Create: entire project scaffold (`package.json`, `tsconfig.json`, `next.config.*`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, etc.) via `create-next-app`.

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a runnable Next.js app with `npm run dev` / `npm run build` scripts, an `app/` directory (App Router), a `@/*` import alias, and Tailwind wired into `app/globals.css`.

- [ ] **Step 1: Run the scaffold command**

The project root (`C:\Desktop\SetuDashboards`) already contains `docs/` and `CLAUDE.md`, so it's a non-empty directory. Run the scaffold in the current directory:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

If the CLI refuses to run in a non-empty directory (some versions do), use the fallback: scaffold into a temp subfolder, then move the generated files up.

```bash
npx create-next-app@latest setu-tmp --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
cp -r setu-tmp/. .
rm -rf setu-tmp
```

- [ ] **Step 2: Verify the dev server runs**

Run: `npm run dev`

Expected: Terminal shows `Local: http://localhost:3000` with no errors. Visiting that URL shows the default Next.js starter page.

Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 3: Verify the production build succeeds**

Run: `npm run build`

Expected: Output ends with `Compiling successfully` / a route summary table, no TypeScript or build errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold next.js app with typescript and tailwind"
```

---

### Task 2: Add shell design tokens to globals.css

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: nothing new.
- Produces: CSS custom properties (`--icon-bg`, `--icon-stroke`, `--icon-stroke-alt`, `--chevron`, `--search-border`, `--pill-border`, `--pill-border-1920`, `--avatar-bg`, `--avatar-text`, `--text-secondary`) available globally, referenced by later tasks via `bg-[var(--icon-bg)]` etc. Also produces `html, body { height: 100%; }` so the shell's `h-screen` layout (Task 6) fills the viewport.

- [ ] **Step 1: Append the tokens block to `app/globals.css`**

Add this to the end of the existing file (leave whatever `create-next-app` generated above it untouched):

```css
:root {
  --icon-bg: #F2F2F2;
  --icon-stroke: #4A5565;
  --icon-stroke-alt: #373737;
  --chevron: #1F1F1F;
  --search-border: #E9E9E9;
  --pill-border: #EBEBEB;
  --pill-border-1920: #F2F2F2;
  --avatar-bg: #DBEAFE;
  --avatar-text: #0058CE;
  --text-secondary: #383838;
}

html,
body {
  height: 100%;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run dev`, visit `http://localhost:3000`.

Expected: page still loads with no console errors (the tokens aren't used by any component yet, so visually nothing changes).

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add shell design tokens to globals.css"
```

---

### Task 3: Build the Sidebar component

**Files:**
- Create: `components/shell/Sidebar.tsx`

**Interfaces:**
- Consumes: CSS vars `--icon-bg`, `--icon-stroke` from Task 2.
- Produces: `export default function Sidebar(): JSX.Element` — a self-contained component taking no props, rendering a `<aside>` with `aria-label="Primary navigation"`.

- [ ] **Step 1: Create `components/shell/Sidebar.tsx`**

```tsx
type NavItem = {
  label: string;
  href: string;
  pinned: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Control Room", href: "/founder/control-room", pinned: true },
  { label: "Approvals", href: "/founder/approvals", pinned: true },
  { label: "Operations", href: "/founder/operations", pinned: true },
  { label: "Cost & Analytics", href: "/founder/cost-analytics", pinned: true },
  { label: "Compliance & Risk", href: "/founder/compliance-risk", pinned: true },
  { label: "Audit Explorer", href: "/founder/audit-explorer", pinned: false },
  { label: "Product 360", href: "/founder/products", pinned: true },
];

function initials(label: string): string {
  return label
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar() {
  return (
    <aside
      className="flex h-full w-[82px] min-[1440px]:w-[95px] min-[1920px]:w-[114px] flex-col items-center gap-2 bg-white py-4"
      aria-label="Primary navigation"
    >
      <div className="mb-4 h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[#001433] via-[#0058DD] to-[#1572FF]" />
      <nav className="flex flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            title={item.label}
            className={`flex h-[46px] w-[46px] items-center justify-center rounded-lg bg-[var(--icon-bg)] text-sm font-semibold text-[var(--icon-stroke)] ${
              item.pinned ? "" : "opacity-60"
            }`}
          >
            {initials(item.label)}
          </a>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`

Expected: no errors (the component isn't imported anywhere yet, so this just confirms the file itself is valid TypeScript/TSX).

- [ ] **Step 3: Commit**

```bash
git add components/shell/Sidebar.tsx
git commit -m "feat: add Sidebar shell component"
```

---

### Task 4: Build the Header component

**Files:**
- Create: `components/shell/Header.tsx`

**Interfaces:**
- Consumes: CSS vars `--icon-bg`, `--search-border`, `--text-secondary`, `--pill-border`, `--pill-border-1920`, `--avatar-bg`, `--avatar-text` from Task 2.
- Produces: `export default function Header(): JSX.Element` — a self-contained component taking no props, rendering a `<header>`.

- [ ] **Step 1: Create `components/shell/Header.tsx`**

```tsx
export default function Header() {
  return (
    <header className="flex h-[84px] min-[1440px]:h-[98px] min-[1920px]:h-[118px] w-full items-center justify-end gap-3 bg-white px-4">
      <div className="flex h-[47px] w-[299px] min-[1440px]:h-[59px] min-[1440px]:w-[374px] min-[1920px]:h-[53px] min-[1920px]:w-[528px] items-center gap-2 rounded-[7.5px] border border-[var(--search-border)] px-3">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent text-sm text-[var(--text-secondary)] outline-none placeholder:text-[var(--text-secondary)]"
        />
      </div>

      <IconButton label="Create">
        <PlusIcon />
      </IconButton>
      <IconButton label="Archive">
        <ArchiveIcon />
      </IconButton>
      <IconButton label="Notifications">
        <BellIcon />
      </IconButton>

      <button
        type="button"
        className="flex h-[65px] min-[1440px]:h-[53px] min-[1920px]:h-[65px] w-[219px] items-center justify-between rounded-full border border-[var(--pill-border)] min-[1920px]:border-[var(--pill-border-1920)] px-4"
      >
        <span className="text-left text-sm leading-tight text-[var(--text-secondary)]">
          Workspace
          <br />
          name
        </span>
        <ChevronDownIcon />
      </button>

      <div className="flex h-[48px] w-[48px] min-[1440px]:h-[40px] min-[1440px]:w-[40px] min-[1920px]:h-[48px] min-[1920px]:w-[48px] items-center justify-center rounded-full bg-[var(--avatar-bg)] text-sm font-semibold text-[var(--avatar-text)]">
        SD
      </div>
    </header>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      className="flex h-[46px] w-[46px] items-center justify-center rounded-lg bg-[var(--icon-bg)]"
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="#373737" strokeWidth="1.5" />
      <path d="M14 14L11 11" stroke="#373737" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3V15M3 9H15" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="12" height="9" rx="1.5" stroke="#4A5565" strokeWidth="1.5" />
      <path d="M2 3H16V5H2V3Z" stroke="#4A5565" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 2C6.8 2 5 3.8 5 6V9L3.5 11.5H14.5L13 9V6C13 3.8 11.2 2 9 2Z"
        stroke="#4A5565"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.5 13.5C7.5 14.3 8.2 15 9 15C9.8 15 10.5 14.3 10.5 13.5" stroke="#4A5565" strokeWidth="1.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shell/Header.tsx
git commit -m "feat: add Header shell component"
```

---

### Task 5: Build the Footer component

**Files:**
- Create: `components/shell/Footer.tsx`

**Interfaces:**
- Consumes: nothing from CSS vars (uses inline gradient hex stops directly, per `docs/figma-design-layout.md` §2 footer bubble gradient).
- Produces: `export default function Footer(): JSX.Element` — a self-contained component taking no props, rendering a `<footer>`.

- [ ] **Step 1: Create `components/shell/Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="relative flex h-[40px] min-[1440px]:h-[47px] min-[1920px]:h-[55px] w-full items-center bg-white px-4">
      <button
        type="button"
        title="Chat / help"
        className="absolute -top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F5F9FF] to-[#CCE1FF] shadow-md"
      >
        <ChatIcon />
      </button>
    </footer>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 4H17V13H8L4 16V13H3V4Z" stroke="#1572FF" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shell/Footer.tsx
git commit -m "feat: add Footer shell component"
```

---

### Task 6: Compose AppShell, wire root layout, verify end-to-end

**Files:**
- Create: `components/shell/AppShell.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Sidebar` (Task 3), `Header` (Task 4), `Footer` (Task 5) — all no-prop components.
- Produces: `export default function AppShell({ children }: { children: React.ReactNode }): JSX.Element`, used by `app/layout.tsx`.

- [ ] **Step 1: Create `components/shell/AppShell.tsx`**

```tsx
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the contents of `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Setu Dashboards",
  description: "Founder dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace the contents of `app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
      Control Room content goes here (Session 3).
    </div>
  );
}
```

- [ ] **Step 4: Visual verification across all three breakpoints**

Run: `npm run dev`, open `http://localhost:3000`.

Using browser devtools responsive mode (or by resizing the window), check at each width:

- **1366px:** Sidebar ~82px wide, header ~84px tall, search bar ~299×47px, workspace pill ~219×65px with `#EBEBEB` border, avatar 48×48px, footer ~40px tall with floating gradient button bottom-right.
- **1440px:** Sidebar ~95px wide, header ~98px tall, search bar ~374×59px, workspace pill ~219×53px, avatar 40×40px, footer ~47px tall.
- **1920px:** Sidebar ~114px wide, header ~118px tall, search bar ~528×53px, workspace pill ~219×65px with `#F2F2F2` border, avatar 48×48px, footer ~55px tall.

Expected: layout reflows correctly at each width with no overlapping elements, no horizontal scrollbar, and the placeholder "Control Room content goes here" box visible in the main content area.

Stop the dev server.

- [ ] **Step 5: Verify the production build still succeeds**

Run: `npm run build`

Expected: builds successfully with no TypeScript or lint errors.

- [ ] **Step 6: Commit**

```bash
git add components/shell/AppShell.tsx app/layout.tsx app/page.tsx
git commit -m "feat: compose AppShell and wire into root layout"
```

---

## Self-Review

- **Spec coverage:** Sidebar widths/colors (§1–2), header height/search/icon-buttons/pill/avatar (§1–2), footer height + gradient bubble (§1–2), 7 Founder nav items (`founder-persona-final.md` §3) with pinned/on-demand dimming — all covered. Chevron color (`--chevron`) is defined in Task 2 but not yet consumed by name in Header (the chevron SVG uses its hex directly, `#1F1F1F`) — intentional, since inline SVG `stroke` attributes can't reference CSS vars as cleanly as Tailwind classes; the var is defined for future reuse but this session's chevron icon hardcodes the same value. No functional gap.
- **Placeholder scan:** No TBD/TODO left. The "monogram instead of real icons" and "1440px size discrepancy preserved" points are explicit, justified decisions documented in Global Constraints, not unresolved placeholders.
- **Type consistency:** `Sidebar`, `Header`, `Footer` are all zero-prop components; `AppShell` takes `{ children: React.ReactNode }` — consistent with how `app/layout.tsx` calls it in Task 6 Step 2.
