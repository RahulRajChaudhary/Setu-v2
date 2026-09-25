# Apps Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the header's "Sahayogi Apps" 9-dot dropdown into a Google-Apps-launcher-style panel with real product logos, a favorites section, favorite toggling, and A–Z / recently-used sorting.

**Architecture:** A pure-data catalog (`lib/mock-data/apps-launcher.ts`) feeds a localStorage-backed state hook (`lib/use-launcher-state.ts`), which feeds a new presentational component (`components/shell/AppsLauncher.tsx`) that replaces the inline dropdown markup currently in `components/shell/Header.tsx`.

**Tech Stack:** Next.js App Router, React 19, TypeScript (strict), Tailwind CSS, lucide-react icons. No test runner is installed in this repo (`package.json` has no jest/vitest/testing-library) — verification is `npx tsc --noEmit`, `npm run lint`, and manual browser checks via the dev server, matching this project's existing convention (no `*.test.*` files anywhere in the repo).

## Global Constraints

- Frontend-only, no backend — all state is either static mock data or `localStorage` (per `CLAUDE.md`: "Mock data lives in a single typed layer... shaped like the eventual API response").
- Don't hardcode colors that already have a design token; reuse existing CSS vars (`--divider`, `--text-heading`, `--text-muted`, `--text-secondary`, `--search-bg`, `--icon-btn-navy`, `--status-critical-fg`) already used elsewhere in `Header.tsx`.
- Match existing dropdown visual language in `Header.tsx` (white bg, `rounded-xl`, `border-[var(--divider)]`, `shadow-xl`) — the user's Google-launcher screenshot is dark-themed reference for *layout/behavior* (favorites grid + edit pencil + scrollable list), not literal color scheme, since this dashboard is light-themed.
- No `next.config.ts` changes — use plain `<img>` tags for the external CDN logos (no `next/image` remotePatterns needed).
- Real products open `liveUrl` in a new tab (`window.open(url, "_blank", "noopener,noreferrer")`); the 6 extra tools (Sahayogi AI, Mail, Drive, Team, Leads, BoSS Bridge) have no `liveUrl` and are inert on click.
- Default favorites = the 9 real Sahayogi products; the 6 extras start unfavorited.
- Spec: `docs/superpowers/specs/2026-09-25-apps-launcher-design.md`

---

### Task 1: Apps catalog data

**Files:**
- Create: `lib/mock-data/apps-launcher.ts`

**Interfaces:**
- Produces: `export type LauncherApp = { id: string; name: string; kind: "product" | "tool"; logoUrl?: string; icon?: LucideIcon; bg?: string; fg?: string; liveUrl?: string }` and `export const LAUNCHER_APPS: LauncherApp[]` (15 entries: 9 `kind: "product"`, 6 `kind: "tool"`). Consumed by Task 2 (default favorites) and Task 3 (rendering).

- [ ] **Step 1: Write the catalog file**

```ts
import type { LucideIcon } from "lucide-react";
import { Sparkles, Mail, HardDrive, Users, Target, Link2 } from "lucide-react";

export type LauncherApp = {
  id: string;
  name: string;
  kind: "product" | "tool";
  /** Real Sahayogi products only — fetched from sahayogi.in/products */
  logoUrl?: string;
  /** Internal-only tools only — no official logo exists */
  icon?: LucideIcon;
  bg?: string;
  fg?: string;
  /** Real Sahayogi products only — opens in a new tab when clicked */
  liveUrl?: string;
};

export const LAUNCHER_APPS: LauncherApp[] = [
  {
    id: "office-sahayogi",
    name: "Office Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Office%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/office-sahayogi",
  },
  {
    id: "boss",
    name: "BoSS",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/BoSS.png",
    liveUrl: "https://sahayogi.in/products/boss",
  },
  {
    id: "sahayogi-cloud",
    name: "Sahayogi Cloud",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%2520Cloud.png",
    liveUrl: "https://sahayogi.in/products/cloud-sahayogi",
  },
  {
    id: "chat-with-sahayogi",
    name: "Chat with Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Chat%2520With%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/chat-with-sahayogi",
  },
  {
    id: "investor-sahayogi",
    name: "Investor Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Investor%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/investor-sahayogi",
  },
  {
    id: "tax-sahayogi",
    name: "Tax Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Tax%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/tax-sahayogi",
  },
  {
    id: "sahayogi-one",
    name: "Sahayogi One",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%2520One.png",
    liveUrl: "https://sahayogi.in/products/sahayogi-one",
  },
  {
    id: "my-sahayogi",
    name: "My Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/My%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/my-sahayogi",
  },
  {
    id: "studio-sahayogi",
    name: "Studio Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Studio%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/studio-sahayogi",
  },
  { id: "sahayogi-ai", name: "Sahayogi AI", kind: "tool", icon: Sparkles, bg: "#EDE9FE", fg: "#7C3AED" },
  { id: "mail", name: "Mail", kind: "tool", icon: Mail, bg: "#FEE2E2", fg: "#DC2626" },
  { id: "drive", name: "Drive", kind: "tool", icon: HardDrive, bg: "#DBEAFE", fg: "#2563EB" },
  { id: "team", name: "Team", kind: "tool", icon: Users, bg: "#D1FAE5", fg: "#059669" },
  { id: "leads", name: "Leads", kind: "tool", icon: Target, bg: "#FFEDD5", fg: "#EA580C" },
  { id: "boss-bridge", name: "BoSS Bridge", kind: "tool", icon: Link2, bg: "#E2E8F0", fg: "#0B1B3B" },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `apps-launcher.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/mock-data/apps-launcher.ts
git commit -m "feat: add apps launcher catalog data"
```

---

### Task 2: Favorites / recent-use state hook

**Files:**
- Create: `lib/use-launcher-state.ts`

**Interfaces:**
- Consumes: `LAUNCHER_APPS` from `@/lib/mock-data/apps-launcher` (Task 1) — reads `.kind` and `.id` only.
- Produces: `export function useLauncherState(): { favorites: string[]; lastUsed: Record<string, number>; toggleFavorite: (id: string) => void; recordUsed: (id: string) => void }`. Consumed by Task 3.

- [ ] **Step 1: Write the hook**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { LAUNCHER_APPS } from "@/lib/mock-data/apps-launcher";

const FAVORITES_KEY = "setu.launcher.favorites";
const LAST_USED_KEY = "setu.launcher.lastUsed";

function defaultFavorites(): string[] {
  return LAUNCHER_APPS.filter((app) => app.kind === "product").map((app) => app.id);
}

function readFavorites(): string[] {
  const raw = window.localStorage.getItem(FAVORITES_KEY);
  if (!raw) return defaultFavorites();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultFavorites();
  } catch {
    return defaultFavorites();
  }
}

function readLastUsed(): Record<string, number> {
  const raw = window.localStorage.getItem(LAST_USED_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function useLauncherState() {
  const [favorites, setFavorites] = useState<string[]>(defaultFavorites);
  const [lastUsed, setLastUsed] = useState<Record<string, number>>({});

  useEffect(() => {
    setFavorites(readFavorites());
    setLastUsed(readLastUsed());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const recordUsed = useCallback((id: string) => {
    setLastUsed((current) => {
      const next = { ...current, [id]: Date.now() };
      window.localStorage.setItem(LAST_USED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, lastUsed, toggleFavorite, recordUsed };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `use-launcher-state.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/use-launcher-state.ts
git commit -m "feat: add localStorage-backed launcher favorites/recent-use hook"
```

---

### Task 3: AppsLauncher component

**Files:**
- Create: `components/shell/AppsLauncher.tsx`

**Interfaces:**
- Consumes: `LAUNCHER_APPS`, `LauncherApp` (Task 1); `useLauncherState()` (Task 2).
- Produces: `export default function AppsLauncher({ onClose }: { onClose: () => void }): JSX.Element`. Consumed by Task 4 (`Header.tsx`).

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useMemo, useState } from "react";
import { Pencil, Star } from "lucide-react";
import { LAUNCHER_APPS, type LauncherApp } from "@/lib/mock-data/apps-launcher";
import { useLauncherState } from "@/lib/use-launcher-state";

type SortMode = "alpha" | "recent";

function sortApps(apps: LauncherApp[], mode: SortMode, lastUsed: Record<string, number>): LauncherApp[] {
  const copy = [...apps];
  if (mode === "alpha") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => (lastUsed[b.id] ?? 0) - (lastUsed[a.id] ?? 0));
  }
  return copy;
}

function AppIcon({ app, size }: { app: LauncherApp; size: number }) {
  const [errored, setErrored] = useState(false);

  if (app.logoUrl && !errored) {
    return (
      <img
        src={app.logoUrl}
        alt={app.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
        onError={() => setErrored(true)}
      />
    );
  }

  if (app.icon) {
    const Icon = app.icon;
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: app.bg ?? "#E2E8F0" }}
      >
        <Icon size={Math.round(size * 0.5)} color={app.fg ?? "#0B1B3B"} />
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[var(--search-bg)] text-sm font-semibold text-[var(--text-secondary)]"
      style={{ width: size, height: size }}
    >
      {app.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function AppsLauncher({ onClose }: { onClose: () => void }) {
  const { favorites, lastUsed, toggleFavorite, recordUsed } = useLauncherState();
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [editMode, setEditMode] = useState(false);

  const favoriteApps = useMemo(
    () => sortApps(LAUNCHER_APPS.filter((app) => favorites.includes(app.id)), sortMode, lastUsed),
    [favorites, sortMode, lastUsed]
  );

  const allApps = useMemo(() => sortApps(LAUNCHER_APPS, sortMode, lastUsed), [sortMode, lastUsed]);

  function openApp(app: LauncherApp) {
    if (!app.liveUrl) return;
    recordUsed(app.id);
    window.open(app.liveUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div
      className="
        absolute right-0 top-[calc(100%+0.5rem)] z-50
        flex max-h-[32rem] w-[21rem] max-w-[calc(100vw-1.5rem)]
        flex-col overflow-hidden rounded-xl border border-[var(--divider)]
        bg-white shadow-xl
      "
    >
      <div className="flex shrink-0 items-center justify-between px-4 pt-4">
        <p className="text-sm font-semibold text-[var(--text-heading)]">Sahayogi Apps</p>
        <button
          type="button"
          title={editMode ? "Done editing" : "Edit favorites"}
          onClick={() => setEditMode((v) => !v)}
          className={`tap-pop flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            editMode
              ? "bg-[var(--icon-btn-navy)] text-white"
              : "text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <Pencil size={14} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2">
        {favoriteApps.length > 0 && (
          <>
            <p className="px-1 pb-1 pt-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Your favorites
            </p>
            <div className="grid grid-cols-3 gap-1 pb-2">
              {favoriteApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => (editMode ? toggleFavorite(app.id) : openApp(app))}
                  className="tap-pop flex flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors hover:bg-[var(--search-bg)]"
                >
                  <span className="relative">
                    <AppIcon app={app} size={44} />
                    {editMode && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-critical-fg)] text-[0.5rem] text-white">
                        &minus;
                      </span>
                    )}
                  </span>
                  <span className="text-[0.6875rem] font-medium leading-tight text-[var(--text-secondary)]">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-[var(--divider)]" />
          </>
        )}

        <div className="flex items-center justify-between px-1 pb-1 pt-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            All apps
          </p>
          <div className="flex overflow-hidden rounded-full border border-[var(--divider)] text-[0.625rem]">
            <button
              type="button"
              onClick={() => setSortMode("alpha")}
              className={`px-2 py-0.5 font-medium transition-colors ${
                sortMode === "alpha"
                  ? "bg-[var(--icon-btn-navy)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
              }`}
            >
              A&ndash;Z
            </button>
            <button
              type="button"
              onClick={() => setSortMode("recent")}
              className={`px-2 py-0.5 font-medium transition-colors ${
                sortMode === "recent"
                  ? "bg-[var(--icon-btn-navy)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
              }`}
            >
              Recent
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {allApps.map((app) => {
            const isFavorite = favorites.includes(app.id);
            return (
              <div
                key={app.id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--search-bg)]"
              >
                <button
                  type="button"
                  onClick={() => openApp(app)}
                  disabled={!app.liveUrl}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                >
                  <AppIcon app={app} size={28} />
                  <span className="truncate text-xs font-medium text-[var(--text-secondary)]">{app.name}</span>
                </button>
                <button
                  type="button"
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => toggleFavorite(app.id)}
                  className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--icon-btn-navy)]"
                >
                  <Star
                    size={14}
                    fill={isFavorite ? "currentColor" : "none"}
                    className={isFavorite ? "text-[var(--icon-btn-navy)]" : ""}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors mentioning `AppsLauncher.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/shell/AppsLauncher.tsx
git commit -m "feat: add Google-style AppsLauncher component"
```

---

### Task 4: Wire AppsLauncher into Header

**Files:**
- Modify: `components/shell/Header.tsx:1-34` (imports + `SAHAYOGI_APPS` constant), `components/shell/Header.tsx:314-380` (inline apps dropdown JSX)

**Interfaces:**
- Consumes: `AppsLauncher` default export from `@/components/shell/AppsLauncher` (Task 3).

- [ ] **Step 1: Remove unused icon imports and the `SAHAYOGI_APPS` constant**

In `components/shell/Header.tsx`, the current imports (lines 1-20) pull in `Briefcase, LayoutGrid, Cloud, MessageCircle, TrendingUp, Receipt, Layers, Wallet, Palette` from `lucide-react` solely for `SAHAYOGI_APPS` (lines 24-34), which is being replaced by the data-driven `AppsLauncher`. Replace the top of the file:

```tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus, Bell, ExternalLink } from "lucide-react";
import { PERSONA_LIST, personaConfigFromPathname } from "@/lib/personas";
import AppsLauncher from "@/components/shell/AppsLauncher";

const IS_DEV = process.env.NODE_ENV !== "production";
```

This removes the old `import { Search, Plus, Bell, ExternalLink, Briefcase, LayoutGrid, Cloud, MessageCircle, TrendingUp, Receipt, Layers, Wallet, Palette } from "lucide-react";` block and the entire `const SAHAYOGI_APPS = [...]` array (old lines 24-34), replacing them with the trimmed import list above plus the new `AppsLauncher` import. The `NOTIFICATIONS` constant that follows is untouched.

- [ ] **Step 2: Replace the inline apps dropdown with `<AppsLauncher />`**

Find this block (the dropdown JSX rendered when `openMenu === "apps"`, currently spanning from `{/* Apps dropdown — anchored to the shared right edge of this row */}` through its closing `)}`):

```tsx
        {/* Apps dropdown — anchored to the shared right edge of this row */}
        {openMenu === "apps" && (
          <div
            className="
              absolute
              right-0
              top-[calc(100%+0.5rem)]
              z-50
              w-[19.5rem]
              max-w-[calc(100vw-1.5rem)]
              overflow-hidden
              rounded-xl
              border
              border-[var(--divider)]
              bg-white
              shadow-xl
            "
          >
            <p className="px-4 pt-4 text-sm font-semibold text-[var(--text-heading)]">
              Sahayogi Apps
            </p>

            <div className="grid grid-cols-3 gap-1 p-3">
              {SAHAYOGI_APPS.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.name}
                    type="button"
                    className="
                      tap-pop
                      flex
                      flex-col
                      items-center
                      gap-2
                      rounded-lg
                      px-2
                      py-3
                      text-center
                      transition-colors
                      hover:bg-[var(--search-bg)]
                    "
                  >
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                      "
                      style={{ backgroundColor: app.bg }}
                    >
                      <Icon size={20} color={app.fg} />
                    </span>

                    <span className="text-[0.6875rem] font-medium leading-tight text-[var(--text-secondary)]">
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
```

Replace it with:

```tsx
        {/* Apps dropdown — anchored to the shared right edge of this row */}
        {openMenu === "apps" && <AppsLauncher onClose={() => setOpenMenu(null)} />}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors; no unused-import warnings for the removed lucide icons.

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`

In a browser (or via the claude-in-chrome tool):
1. Navigate to `http://localhost:3000/founder/dashboard` (or whichever founder route loads by default).
2. Click the 9-dot grid icon in the header. Confirm the panel opens showing a **"Your favorites"** section with the 9 real Sahayogi products (real logos loading from `cdn.sahayogi.in`, not lucide icons), followed by an **"All apps"** section listing all 15 apps including Sahayogi AI / Mail / Drive / Team / Leads / BoSS Bridge with lucide icons.
3. Click the star icon next to "Mail" in the "All apps" list. Confirm it now appears in "Your favorites".
4. Reload the page, reopen the panel. Confirm "Mail" is still in favorites (localStorage persisted).
5. Click the pencil "Edit" icon, click a favorite tile — confirm it's removed from favorites instead of opening a new tab. Click the pencil again to exit edit mode.
6. Click "Sahayogi Cloud" (not in edit mode) — confirm a new tab opens to `https://sahayogi.in/products/cloud-sahayogi`.
7. Switch the sort toggle from "A–Z" to "Recent" — confirm "Sahayogi Cloud" now sorts near the top of both sections (it was just used).
8. Click "Mail" or another tool with no `liveUrl` — confirm nothing happens (no navigation, no error in console).

Expected: all 8 checks pass with no console errors.

- [ ] **Step 5: Commit**

```bash
git add components/shell/Header.tsx
git commit -m "feat: wire AppsLauncher into header, replacing inline apps dropdown"
```
