# Shell rebuild — design spec

**Sub-project 1 of 4** in the Founder / Engineering Lead / Compliance Officer build. This spec covers only the app shell (sidebar, top bar, responsive/persona plumbing). Page content for each persona (Control Room, Release 360, Compliance, etc.) is out of scope — those are separate specs, built one persona at a time after this lands.

## Why this is a rebuild, not a patch

Session 1 (already built, uncommitted) produced an 82–114px icon-only rail sidebar with placeholder monogram buttons, matching `docs/figma-design-layout.md`. Two new source documents supersede that:

- `docs/Setu_V2_Team_Roles_and_Screen_Design_Guide.docx` — the **Team Roles and Screen Design Guide**, dated 22 Sept 2026, covering all 12 blueprint personas with literal screen briefs (header/body/actions/data-ownership per screen), a full sidebar taxonomy, and a color/type system.
- A pasted **Founder Dashboard Data Specification** (this conversation) — confirms the sidebar must be built once, persona-agnostic, fed by a per-role visibility/widget config, not a different nav array per persona.

Per user decision, the new doc's sidebar/colors/screen content now supersede `figma-design-layout.md`'s icon-rail chrome and `founder-persona-final.md`'s page content for anything they overlap. `figma-design-layout.md` and `founder-persona-final.md` are not deleted — they remain historical record of the earlier session — but this spec and its doc take precedence going forward. **Action item folded into this session:** update `CLAUDE.md`'s "Source of truth" list to point at the new docs once this spec is approved (see Task list in the implementation plan).

**Conflicts resolved by explicit user decision (recorded here so they aren't silently re-litigated later):**
- Font: doc says Figtree → **Inter** wins (user's explicit instruction). IBM Plex Mono is kept for IDs only, per the doc.
- Responsive scope: doc only specifies desktop (1440 canvas, "must work at 1280") → **full mobile support** is in scope, added by this spec, not sourced from either doc.
- Icon system: doc doesn't specify an icon package → **react-icons**, single sub-family (`react-icons/fi`, Feather) for visual consistency, replacing CLAUDE.md's original "no icon library, hand-written SVG" rule for icons specifically (component architecture — hand-built, no UI component library — is unchanged).

## Architecture

`components/shell/Sidebar.tsx`, `Header.tsx`, `Footer.tsx`, `AppShell.tsx` are rewritten (not extended) — the visual language changed completely, so keeping the old icon-rail markup around would fight the new layout at every breakpoint.

**`lib/nav-config.ts`** — single source of truth for the sidebar taxonomy. Structure:

```ts
type Role = "founder" | "engineering-lead" | "compliance-officer"
  | "platform-administrator" | "customer-operations-agent" | "technical-support-agent"
  | "devops-sre" | "security-administrator" | "product-manager"
  | "commercial-administrator" | "partner-operations" | "auditor-reviewer";

type Visibility = "full" | "scoped" | "view-only" | "hidden";

type NavItem = {
  id: string;            // e.g. "control-room" — matches the frozen taxonomy id, never renamed
  label: string;
  group: NavGroup;        // "Home" | "Customers" | "Products" | "Reliability" | "Security & Compliance" | "Business" | "Settings"
  route: string;
  icon: IconType;          // react-icons component
  countBadge?: "operations-inbox" | "incidents" | "approvals"; // mock count source, wired later
  visibility: Record<Role, Visibility>;
};
```

All 20 items from the frozen taxonomy (`control-room`, `operations-inbox`, `workspaces`, `subscriptions`, `provisioning-drift`, `approvals`, `partners`, `products`, `releases`, `feature-flags`, `health`, `incidents`, `integrations`, `security-access`, `access-reviews`, `compliance`, `risks-vendors`, `privacy-requests`, `audit-explorer`, `usage-cost`, `catalogue-rules`) are declared with real `visibility` entries for `founder`, `engineering-lead`, `compliance-officer` (per the screen-brief "lands on" / "can act on" tables); all other 9 roles default to `hidden` for every item — typed but inert, so later persona sessions add config only, never touch this file's structure.

Per-role visibility (this session's 3 roles only; `hidden` omitted from the DOM entirely, never greyed out):

| id | founder | engineering-lead | compliance-officer |
|---|---|---|---|
| control-room | full | hidden | hidden |
| operations-inbox | scoped (approvals routed to them only) | hidden | hidden |
| workspaces | view-only | hidden | hidden |
| subscriptions | view-only | hidden | hidden |
| provisioning-drift | hidden | hidden | hidden |
| approvals | scoped | hidden | hidden |
| partners | hidden | hidden | hidden |
| products | view-only | full | hidden |
| releases | view-only | full | hidden |
| feature-flags | hidden | full | hidden |
| health | view-only | hidden | hidden |
| incidents | view-only | scoped (linked releases only) | hidden |
| integrations | hidden | hidden | hidden |
| security-access | hidden | hidden | hidden |
| access-reviews | hidden | hidden | hidden |
| compliance | view-only | hidden | full |
| risks-vendors | scoped (accept/treat if escalated) | hidden | full |
| privacy-requests | hidden | hidden | scoped |
| audit-explorer | view-only (export) | hidden | view-only |
| usage-cost | full | hidden | hidden |
| catalogue-rules | hidden | scoped (feature matrix only) | hidden |

This table is the acceptance criteria for the nav-visibility task below — it is not exhaustive of the other 9 roles (out of scope), but it is exhaustive for these 3.

## Persona switching (no backend auth yet)

A `PersonaProvider` React context (`components/shell/PersonaContext.tsx`) holds `currentRole: Role`, initialized from a `?role=` query param, defaulting to `founder` when absent or invalid. No persistence beyond the URL — refreshing without the param resets to Founder, which is acceptable for a frontend-only mock. The top bar's account menu is the switcher: a dropdown listing the 3 built roles (the other 9 are visible in the list but disabled with a "not built yet" hint, so the full persona set is visually acknowledged without pretending they work).

## Sidebar (248px desktop)

- Background `#1B2250` (navy), grouped sections per taxonomy, group headers as small caps labels.
- Each item: `react-icons/fi` icon + label + optional count badge (pill, right-aligned). Badge counts are hardcoded placeholders this session (e.g. Operations inbox `3`, Incidents `1`, Approvals `2`) — comment marks them for wiring to real mock data in the Founder session.
- Active item: 3px `Primary` (`#3346C4`) left bar, bold label, per the doc's shared-component convention.
- `view-only` and `scoped` items render identically to `full` in the sidebar itself (the difference is enforced inside each page — action buttons hidden/shown — which is out of scope until those pages exist). This session only implements the `visibility !== "hidden"` gate.
- **1024–1279px:** collapses to icon-only rail (56px wide), label shown as a tooltip on hover/focus. Group headers hidden at this width.
- **<1024px:** sidebar becomes a full-height drawer, hidden by default, opened by a hamburger button in the top bar, closes on route change or backdrop click.

## Top bar (64px desktop, 56px mobile)

Left-to-right: hamburger (only rendered <1024px) → page title/breadcrumb slot (empty this session, pages will fill it) → global search (Ctrl+K, collapses to a search icon that opens an overlay below 640px) → quick-add icon button → help/runbooks icon button → environment pill ("Production", red; doc notes staging gets a different color, not needed until an env exists) → notifications bell → account menu (avatar, current role name, persona switcher, elevation badge slot for later).

## Visual tokens (`app/globals.css`)

Full replacement of the Session-1 token block with the doc's table:

```css
:root {
  --ink: #141A33;
  --muted: #4A5170;
  --background: #F5F6FA;
  --surface: #FFFFFF;
  --line: #DDE1EC;
  --sidebar: #1B2250;
  --primary: #3346C4;
  --status-healthy-fg: #17603A;   --status-healthy-bg: #E3F4EA;
  --status-warning-fg: #7A4B00;   --status-warning-bg: #FDF3DC;
  --status-critical-fg: #9B1C1C;  --status-critical-bg: #FDECEA;
  --status-info-fg: #2A36A0;      --status-info-bg: #E8EBFB;
  --status-governance-fg: #4F2C94; --status-governance-bg: #EFE8FB;
}
```

Font: Inter (via `next/font/google`) for all UI text; IBM Plex Mono (same mechanism) applied only via a `.font-mono-id` utility class for workspace/correlation/audit IDs — no component in this session uses it yet, but the class is defined so later sessions don't reinvent it.

## Responsive breakpoints

| Range | Sidebar | Top bar | Content |
|---|---|---|---|
| ≥1280px | Full 248px, labeled | Full 64px | As designed |
| 1024–1279px | Icon rail, 56px | Full 64px | Slightly narrower, no layout change |
| 768–1023px | Drawer (closed by default) | 56px, hamburger visible | Full width; page-shell patterns (stat tiles, tables) still desktop-shaped since no pages exist yet — later sessions handle per-page stacking |
| <768px | Drawer (closed by default) | 56px, search collapses to overlay | Full width |

The last two breakpoints don't have page content to reflow yet — this session only proves the shell itself (sidebar/top bar/drawer) works at all five reference widths (1920/1440/1280/900/480). Per-page mobile stacking (stat tiles to 1 column, detail panel to full-screen sheet, tables to cards) is documented here as the standard every later persona session must follow, but isn't implemented against real content until that content exists.

## Footer

The original figma doc's footer strip + floating gradient chat button isn't mentioned in the new doc (which doesn't cover a footer at all). Default: keep it, restyled to the new token set (white surface, primary-colored button instead of the old blue gradient) — it's a harmless holdover, not a conflict, so no user decision needed here.

## Out of scope this session

- No page content, KPIs, or charts for any persona.
- No mock-data layer beyond the 3 hardcoded badge-count placeholders.
- No route guards or permission enforcement beyond nav-item visibility (nothing to guard yet — pages don't exist).
- Quick-add, help/runbooks, notifications bell, and global search render visually (correct icon, correct position, hover/focus states) but have no click behavior this session — no dropdown, no modal, no results panel. Only the persona-switcher account menu is functional, since it's this session's own mechanism.
- No `security-access`, `access-reviews`, `privacy-requests`, `catalogue-rules` page implementations — they're in the nav config (per the frozen taxonomy) but route to nothing yet for our 3 roles either (all `hidden` for now except `catalogue-rules` scoped for engineering-lead and `privacy-requests` scoped for compliance-officer, both deferred to their respective persona sessions).

## Verification

No test framework (matches Session 1 precedent). `npm run build` succeeding + manual check in a browser:
- At 1920/1440/1280/900/480px: sidebar/top bar render correctly for each breakpoint tier above, no horizontal scroll, no overlap.
- Toggle `?role=founder` / `?role=engineering-lead` / `?role=compliance-officer`: confirm the nav items shown match the visibility table above exactly (hidden items absent from the DOM, not just visually hidden — check via devtools element inspector, not just eyeballing).
- Confirm Inter renders for body text and IBM Plex Mono class is defined (even if unused) via devtools computed styles.
