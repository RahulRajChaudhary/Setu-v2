# Founder Dashboard Chart Restyle — Design

**Date:** 2026-09-25
**Scope:** Founder Control Room (`app/founder/dashboard/page.tsx`) only — two charts: "Controls effective by framework" (donut) and "Growth" (trend chart).

## Motivation

User shared a reference video (chart showcase: half-donut gauge, full donut with center total, stacked bar, and a smooth spline line chart with a floating tooltip bubble — all in one cohesive indigo/purple/blue/teal color family). They want this visual polish applied to the Founder dashboard's existing Controls and Growth charts — restyle only, no new chart cards, no data changes.

## Constraints from clarifying questions

- Restyle **existing charts only** — no new chart widgets added.
- Controls donut: **keep the status badges** (Effective/Needs attention/At risk) next to each framework's %. Only the donut visual and colors change.
- Growth chart: switch to **smooth spline, no area fill, floating bubble tooltip** (replacing the current filled-area + boxed side-tooltip).
- Adopt the video's **indigo/purple/teal color family**, but only for these two chart instances — not a global palette change.

## Why opt-in variants, not new components

`DonutChart` is also used by `ToggleChart` (cost-analytics page). `AreaTrendChart` is also used by the Engineering Lead dashboard. Forking new components would duplicate chart logic; changing the shared components' default look would silently restyle pages nobody asked to change. Instead: add an opt-in `variant` prop to each shared component, defaulting to their current exact behavior. Only the Founder dashboard passes the new variant.

## Changes

### 1. New color tokens (`app/globals.css`)

Additive only — existing `--chart-1..6` tokens are untouched.

```css
--chart-grad-indigo: #6366F1;
--chart-grad-purple: #8B5CF6;
--chart-grad-blue: #3B82F6;
--chart-grad-teal: #14B8A6;
```

### 2. `components/shared/charts/DonutChart.tsx` — new `variant="ring"`

- Default (`variant` omitted): unchanged — exact current `conic-gradient` disc rendering. `ToggleChart` and any other consumer is unaffected.
- `variant="ring"`: renders as an SVG ring using stacked `<circle>` strokes (`stroke-dasharray`/`stroke-dashoffset` per segment), with:
  - `stroke-linecap="round"` on each segment.
  - A small gap between segments (reduce each segment's drawn arc length by a fixed angular gap, e.g. 3°, before converting to dasharray).
  - Thicker stroke (e.g. `stroke-width` proportional to size, wider than the current visual ring implied by the conic-gradient + inset center hole).
  - Center label (total number + `centerLabel` caption) keeps its current position/markup — that part already matches the video.
- Founder's Controls-effective-by-framework passes `variant="ring"` and recolors ISO 27001/DPDP Act/GDPR to indigo/purple/teal (`--chart-grad-*`). The page's own status-badge legend list is untouched (it's built in `page.tsx`, not inside `DonutChart`).

### 3. `components/shared/charts/AreaTrendChart.tsx` — new `variant="spline"`

- Default (`variant` omitted): unchanged — exact current filled-area, straight-segment-line, boxed-tooltip behavior. Engineering Lead dashboard is unaffected.
- `variant="spline"`:
  - No area fill (skip rendering the `area` path, or render it with opacity 0).
  - Line path built via Catmull-Rom-to-Bezier interpolation through the data points instead of straight `L` segments, for a smooth spline curve.
  - Replace the current boxed side-tooltip (`absolute ... rounded-lg border ... p-2 ...` panel) with a small floating rounded bubble anchored directly above the hovered point: dark background, white bold value text, small pointer/triangle at the bottom, positioned via the point's `(scaleX, scaleY)` coordinates.
  - Recolor the two series: "New customers" → indigo, "Trial → paid" → teal.
- Founder's Growth chart passes `variant="spline"`.

### 4. No other changes

- No new mock data fields, no new API/props beyond the `variant` flag and the new color tokens.
- 7D/30D/90D filter, the 4 stats row below the Growth chart, and all other dashboard sections are untouched.

## Testing / verification

- Visually confirm in-browser: Founder dashboard's Controls donut renders as a rounded-cap gapped ring in the new palette with status badges intact; Growth chart renders as a smooth un-filled spline with a floating bubble tooltip on hover.
- Regression-check: Engineering Lead dashboard's `AreaTrendChart` and the cost-analytics page's `ToggleChart`/`DonutChart` render exactly as before (no visual diff), since they don't pass the new `variant` prop.

## Non-goals

- No new chart cards/widgets.
- No changes to Engineering Lead dashboard or cost-analytics page.
- No data model or mock-data changes.
- No global chart-color palette change.
