# Apps Launcher (Google-style) — Design Spec

Date: 2026-09-25

## Goal

Upgrade the existing "Sahayogi Apps" header dropdown (the 9-dot grid icon in `components/shell/Header.tsx`) into a Google-Apps-launcher-style panel: real product logos, a favorites section, favorite/unfavorite toggling, and sorting (alphabetical / recently used). Reference: Google's app launcher screenshot provided by the user ("Your favorites" grid + scrollable list below, edit toggle).

## Source data

Fetched live from https://sahayogi.in/products (2026-09-25). Confirmed to match the 9 products already in `lib/mock-data/products.ts`.

| Name | Logo URL | Live link |
|---|---|---|
| Office Sahayogi | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Office%2520Sahayogi.png` | `https://sahayogi.in/products/office-sahayogi` |
| BoSS | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/BoSS.png` | `https://sahayogi.in/products/boss` |
| Sahayogi Cloud | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%2520Cloud.png` | `https://sahayogi.in/products/cloud-sahayogi` |
| Chat with Sahayogi | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Chat%2520With%2520Sahayogi.png` | `https://sahayogi.in/products/chat-with-sahayogi` |
| Investor Sahayogi | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Investor%2520Sahayogi.png` | `https://sahayogi.in/products/investor-sahayogi` |
| Tax Sahayogi | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Tax%2520Sahayogi.png` | `https://sahayogi.in/products/tax-sahayogi` |
| Sahayogi One | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%2520One.png` | `https://sahayogi.in/products/sahayogi-one` |
| My Sahayogi | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/My%2520Sahayogi.png` | `https://sahayogi.in/products/my-sahayogi` |
| Studio Sahayogi | `https://cdn.sahayogi.in/brand-assets/v1/linkedin/Studio%2520Sahayogi.png` | `https://sahayogi.in/products/studio-sahayogi` |

Plus 6 internal-only extras (not on the products page, no real logo, no live link): **Sahayogi AI, Mail, Drive, Team, Leads, BoSS Bridge** — represented with a lucide-react icon + tile color, same visual treatment as the existing `SAHAYOGI_APPS` icon/color pairs in `Header.tsx`.

## Data layer

New file `lib/mock-data/apps-launcher.ts`:

```ts
export type LauncherApp = {
  id: string;
  name: string;
  kind: "product" | "tool";
  logoUrl?: string;       // real products only
  icon?: LucideIcon;      // extras only
  bg?: string; fg?: string; // extras only (tile color)
  liveUrl?: string;       // real products only
};

export const LAUNCHER_APPS: LauncherApp[] = [ /* 9 products + 6 extras */ ];
```

No `isFavorite` or `lastUsedAt` field on the static data — those are runtime state, not mock data, so they live in `localStorage` (see below), keeping the static list a pure catalog.

### Persisted state (localStorage)

- `setu.launcher.favorites` — `string[]` of app ids. Seeded on first read with the 9 real product ids (defaults to "favorite all real products"); extras start unfavorited.
- `setu.launcher.lastUsed` — `Record<string, number>` (id → timestamp), updated when a tile is clicked (real products only, since extras have no click action).
- A small hook `useLauncherState()` in the new component file wraps read/write + re-render on change. No cross-tab sync needed (not worth the complexity for a mock-data dashboard).

## Component

Extract to `components/shell/AppsLauncher.tsx` (Header.tsx stays as the trigger button + positioning wrapper, matching how Header already composes other dropdowns inline — but this dropdown's internal markup moves out since it's growing non-trivial: two sections, sort state, edit-mode state).

Props: `onClose: () => void` (mirrors how the notifications dropdown is handled today — Header still owns `openMenu` state and renders `{openMenu === "apps" && <AppsLauncher onClose={...} />}`).

### Layout

- Panel width increases slightly (~21rem) and height becomes `max-h-[32rem] overflow-y-auto` instead of the current fixed grid — "goes way down" but stays within viewport.
- **Header row**: "Sahayogi Apps" title + **Edit** pencil toggle button (toggles `editMode`).
- **Your favorites** section: 3-col grid, larger tiles (44px logo/icon circle + label), built from `LAUNCHER_APPS` filtered to favorited ids, ordered per the active sort. Hidden entirely if there are zero favorites (no empty-grid placeholder — falls through to just the "All apps" list, which is never empty).
- Divider.
- **All apps** section: header row with the label "All apps" + a small sort control (segmented toggle: "A–Z" / "Recent") aligned right. Below it, a vertical list of every app in `LAUNCHER_APPS`: 28px logo/icon on the left, exact product name, star icon (filled if favorited) on the right. Clicking the star toggles favorite and does not navigate. Clicking the row (outside the star, and not in edit mode) triggers the click behavior below.
- In `editMode`, clicking anywhere on a favorites-grid tile toggles its favorite state instead of navigating (matches the screenshot's edit-pencil behavior); the "All apps" star icons work the same regardless of edit mode.

### Click behavior

- Real product row/tile (not in edit mode): `window.open(liveUrl, "_blank", "noopener,noreferrer")`, and records `lastUsedAt` for that id.
- Extra tool (Mail, Drive, etc.): no-op (no `liveUrl`).

### Sorting

Single sort state (`"alpha" | "recent"`) applies to both the favorites grid and the all-apps list:
- `"alpha"`: `localeCompare` on `name`.
- `"recent"`: apps with a `lastUsedAt` entry first (descending by timestamp), then remaining apps in their catalog order. Default/initial sort is `"alpha"`.

### Logo fallback

`<img src={logoUrl} onError={...} />` — on error, swap to a colored circle showing the first letter of `name` (deterministic color from a small hash, consistent with the initials-avatar pattern already used for personas in `Header.tsx`). This is a defensive fallback; all 9 current products have working logo URLs.

## Out of scope

- No changes to `/founder/products` page (confirmed: header launcher only).
- No new routes/pages for the 6 extras — they render but don't navigate anywhere yet.
- No cross-tab or server-persisted favorites — `localStorage` only.
- No drag-to-reorder of favorites (Google's launcher supports this in edit mode; not requested).
