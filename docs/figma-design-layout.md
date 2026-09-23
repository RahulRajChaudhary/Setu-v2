# Figma design layout — final spec

Consolidates `shell-design-tokens.md` (chrome measurements) with page-layout guidance for the Founder screens. Pair with `founder-persona-final.md` for content. This is styling and structure only — no copy, no business logic.

Source: "Shell all (Copy)" Figma file, node 37:5778, exported as SVG (vector paths — every measurement below is read from the geometry, not estimated from a screenshot).

**Known limitation:** the workspace-switcher pill label and avatar initials are outlined glyph paths in the export — exact text can't be read from vectors. Everything else below is exact.

---

## 1. Shell chrome — measured per breakpoint

| Element | 1366px | 1440px | 1920px |
|---|---|---|---|
| Sidebar (icon rail) width | 82px | 95px | 114px |
| Header height | 84px | 98px | 118px |
| Icon button size | 46 × 46px, radius 8px | same | same |
| Search bar | 299 × 47px, radius 7.5px | 374 × 59px, radius 7.5px | 528 × 53px, radius 7.5px |
| Workspace pill | 219 × 65px, radius 32.5px | 219 × 53px, radius 26.5px | 219 × 65px, radius 32.5px |
| Avatar diameter | 48px | 40px | 48px |
| Footer height | 40px | 47px | 55px |

**Flag for the Figma file owner:** the pill/avatar sizes at 1440px don't match the other two breakpoints (smaller there than both 1366 and 1920). Measured as-is — worth confirming intentional vs. a copy/paste inconsistency before building.

## 2. Colors — consistent across all breakpoints

| Token | Value | Used for |
|---|---|---|
| `--icon-bg` | `#F2F2F2` | Icon button background |
| `--icon-stroke` | `#4A5565` | Icon glyph stroke (create/archive/bell) |
| `--icon-stroke-alt` | `#373737` | Search icon stroke |
| `--chevron` | `#1F1F1F` | Workspace pill dropdown chevron |
| `--border-search` | `#E9E9E9` | Search bar border |
| `--border-pill` | `#EBEBEB` (1366/1440) / `#F2F2F2` (1920) | Workspace pill border |
| `--avatar-bg` | `#DBEAFE` | Avatar circle background |
| `--avatar-text` | `#0058CE` | Avatar initials |
| `--text-secondary` | `#383838` | Search placeholder / secondary pill text |
| Brand gradient | `#001433 → #0058DD → #1572FF` | Logo mark, top-left of sidebar |
| Footer bubble gradient | `#F5F9FF → #CCE1FF` | Floating chat/help button, bottom-right |

## 3. Header layout, left to right

1. Sidebar icon rail (widths above) — logo mark at top, icon-only nav below
2. Header bar, right-aligned cluster:
   - Search bar (icon on the **left** inside the field)
   - Icon button: create/compose (plus + message-bubble outline)
   - Icon button: archive/folder
   - Icon button: bell (notifications)
   - Workspace-switcher pill (two-line label + chevron-down)
   - Avatar circle
3. Footer: full-width white strip, floating round gradient button pinned bottom-right (chat/help)

The Figma export only shows the sidebar in its **collapsed icon-rail state** — no expanded nav-item labels are in this reference. The Founder's 7 sidebar labels (Control Room, Approvals, Operations, Cost & Analytics, Compliance & Risk, Audit Explorer, Product 360) come from `founder-persona-final.md`, not from this file.

## 4. Founder page layout (structural, not pixel-sourced from Figma — no Founder-specific screen exists in the export yet)

### Shell
```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar (rail width per breakpoint) │  Header (height per bp) │
│                                      ├─────────────────────────┤
│  Logo                                │  Page content           │
│  ● Control Room                      │                         │
│  ● Approvals            [badge]      │                         │
│  ● Operations                        │                         │
│  ● Cost & Analytics                  │                         │
│  ● Compliance & Risk                 │                         │
│  ○ Audit Explorer                    │                         │
│  ● Product 360                       │                         │
└──────────────────────────────────────────────────────────────┘
```
`●` = pinned item, `○` = on-demand (dimmer, still navigable, per `founder-persona-final.md` §3).

### Control Room tile grid
3-column grid on desktop (>1200px), 2-column tablet, 1-column mobile. Tiles: Platform Health, Critical Exceptions, Commercial Control, Releases, Security & Compliance, Dependencies — content and KPIs per `founder-persona-final.md` §4.

Each tile: title, status-color border-top (ok=green / warning=amber / critical=red), primary metric (large number), 1–2 secondary metrics, a drill-down link, last-updated timestamp. Auto-refresh every 60s; on fetch failure, keep last known value with a stale indicator rather than blanking the tile.

### Shared components
| Component | Notes |
|---|---|
| `KPITile` | Configurable title/status/metrics/drill-link, per Control Room grid above |
| `StatusBadge` | healthy→green, degraded→amber, critical→red |
| `DataTable` | Sortable, paginated, row-expandable — used by Compliance & Risk, Audit Explorer |
| `TabBar` | Cost & Analytics' Cost/Adoption tabs, synced to `?tab=` query param |
| `EmptyState` | Approvals queue, any empty table |
| `StaleIndicator` | Control Room tiles on refresh failure |
| `DrillLink` | Carries filter context via query params to the target page |

## 5. Error and edge-case handling (applies across all Founder pages)

| Scenario | Behaviour |
|---|---|
| API 401 | Redirect to SSO login, return to current route after |
| API 403 | Inline "you don't have access" — not a full-page error |
| Control Room tile fetch fails | Keep last cached value + stale indicator; retry in 60s |
| Full page load fails, no cache | Full-page error state with retry button |
| Zero items in any list/queue | Empty state, not a blank page |
