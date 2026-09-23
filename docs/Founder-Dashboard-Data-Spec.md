# Sahayogi Setu — Founder Dashboard Data Specification

**Purpose:** Exact data, KPIs, and chart types for every sidebar section the Founder sees.
**Frozen rule:** Sidebar item *names* below never change across personas. Only *visibility* and *which widgets render* change per role. Build the sidebar once as a persona-agnostic component; feed it a per-role visibility + widget config.

---

## 0. The frozen sidebar taxonomy (do not rename per persona)

| Group | Item (route/id) |
|---|---|
| Home | `control-room` |
| Home | `operations-inbox` |
| Customers | `workspaces` |
| Customers | `subscriptions` |
| Customers | `provisioning-drift` |
| Customers | `approvals` |
| Customers | `partners` |
| Products | `products` |
| Products | `releases` |
| Products | `feature-flags` |
| Reliability | `health` |
| Reliability | `incidents` |
| Reliability | `integrations` |
| Security & Compliance | `security-access` |
| Security & Compliance | `access-reviews` |
| Security & Compliance | `compliance` |
| Security & Compliance | `risks-vendors` |
| Security & Compliance | `privacy-requests` |
| Security & Compliance | `audit-explorer` |
| Business | `usage-cost` |
| Settings | `catalogue-rules` |

Every persona's sidebar renders from this exact list, filtered by a `visibleTo[role]` flag and a `functionalFor[role]` flag (`full` / `scoped` / `view-only` / `hidden`). Never introduce a second naming scheme.

---

## 1. Control Room (`control-room`) — Founder's landing page

**Founder's question:** Is the ecosystem healthy, controlled, compliant, and commercially sensible?

### KPI tiles (top row, 4 cards)

| KPI | Formula | Chart/component | Colour logic |
|---|---|---|---|
| Products healthy | Healthy products ÷ active products | Number card + status dot list | Green all healthy · Amber any degraded · Red any critical |
| Waiting for your approval | Count of approvals where Founder is eligible approver | Number card | Green 0 · Amber >4h old · Red past deadline |
| Open incidents | Incidents not Resolved/Closed | Number card | Green 0 · Amber low/medium only · Red any high/critical |
| Platform cost vs last month | (Projected month-end cost ÷ last month) − 1 | Number card + trend arrow | Green ≤+10% · Amber +10–25% · Red >25% |

### Needs Your Decision (list panel)
Table columns: Type · Title · Requester · Impact · Owner · Deadline. Sorted by deadline then severity. Row click → approval detail.

### Nine Areas at a Glance (3×3 status grid)
One tile per area (Platform, Customers, Commercial Control, Operations, Security, Compliance, Releases, Cost, Dependencies). Each tile: coloured dot + one-line cause + link to its full section.

### Row 3 — trend widgets
| Widget | Chart type | Data |
|---|---|---|
| Top risks | Ranked list, 3 rows | Risk name, residual rating badge, owner |
| Controls effective by framework | Horizontal bar chart, one bar per framework | ISO 27001 %, DPDP Act %, GDPR % effective |
| Growth, last 30 days | 4-stat mini list (no chart) | New customers, trial→paid %, % on 2+ products, setup success rate |

**Do not show:** revenue, invoices, receivables/payables (system of record is BoSS Finance).

---

## 2. Operations Inbox (`operations-inbox`) — scoped to Founder

**Founder sees only:** approval requests where they are the required or escalation approver — rollback, large/permanent override, risk acceptance, permanent suspension.

| Element | Detail |
|---|---|
| List | Type, title, requester, impact summary, deadline |
| Detail panel | Full request, reason, reference (case/deal/incident), before/after diff, Approve/Reject with mandatory reason |
| Chart | None — this is a queue, not an analytics screen |

Founder does **not** see the full ops queue (retries, technical exceptions, assignments) — that's Customer Ops / Platform Admin scope.

---

## 3. Workspaces (`workspaces`) — view only for Founder

| Element | Detail |
|---|---|
| List KPIs | Total workspaces, active, in grace/restricted, failed provisioning (last 24h) |
| Chart | Funnel: Trial → Active → At Risk → Churned (workspace counts per stage) |
| Table | Workspace, plan, status pill, health dot, last activity — click → full Workspace 360 (read-only for Founder) |

No action buttons rendered for Founder role.

---

## 4. Subscriptions (`subscriptions`) — view only

| Element | Detail |
|---|---|
| KPI tiles | Active subscriptions, in grace, restricted, MRR-equivalent plan mix (count only, not ₹ — ₹ stays in BoSS) |
| Chart | Donut: subscription status distribution (Trial/Active/Grace/Restricted/Suspended/Cancelled) |
| Table | Product, workspace, plan, status, renewal date |

---

## 5. Products (`products`) — view only

| Element | Detail |
|---|---|
| KPI tiles | Products live, average adoption %, workspaces near plan limits |
| Chart | Bar chart: adoption % per product (8 bars) |
| Chart | Sparkline per product: usage trend, last 30 days |
| Table | Product, brand, health, dependency count — click → Product 360 |

---

## 6. Releases (`releases`) — scoped: view all, approve rollback only

Grounded in **DORA metrics** (DevOps Research & Assessment — the standard framework for release performance):

| KPI | Definition | Benchmark reference |
|---|---|---|
| Deployment frequency | Deployments per day/week | Elite: multiple/day |
| Lead time for changes | Commit → production | Elite: <1 hour |
| Change failure rate | % of deployments causing rollback/hotfix/degradation | Elite: 0–15% |
| Mean time to recovery (MTTR) | Time to restore after a failed deployment | Elite: <1 hour |

| Element | Chart type |
|---|---|
| DORA scorecard | 4 KPI cards with Elite/High/Medium/Low band indicator |
| Before/after error rate per release | Paired bar (before vs after) per release row |
| Rollout timeline | Horizontal progress bar (% rolled out) with pause/rollback markers |

Founder sees the full releases table but the **Approve rollback** button renders only when a rollback is escalated to them (blast-radius threshold exceeded).

---

## 7. Health (`health`) — view only

Grounded in **Google SRE's Four Golden Signals** (Latency, Traffic, Errors, Saturation) and the **RED method** (Rate, Errors, Duration) — the industry-standard model for service health dashboards.

| KPI (per product) | Signal | Chart |
|---|---|---|
| p95/p99 latency | Latency | Line chart, last 24h, split success vs error latency |
| Requests per second | Traffic (Rate) | Line chart |
| Error rate % | Errors | Line chart with SLO threshold line |
| Resource saturation | Saturation | Gauge or horizontal bar (CPU/queue/memory %) |
| Uptime, 30-day | — | Number card, e.g. 99.98% |

| Element | Chart type |
|---|---|
| Product health grid | 8 cards, one per product, colour-coded status |
| Dependency map | Simple node list: product → dependent services, status dot each |
| Synthetic checks | Pass/fail table: login, signup, message-send, last run time |

---

## 8. Incidents (`incidents`) — view only

| KPI | Formula | Chart |
|---|---|---|
| Open incidents by severity | Count per severity | Stacked bar: Critical/High/Medium/Low |
| MTTA (mean time to acknowledge) | Avg time from detection to commander assigned | Trend line, last 30 days |
| MTTR (mean time to resolve) | Avg time from detection to resolved | Trend line, last 30 days |
| Incidents linked to releases | % of incidents with a release as root cause | Number card |

Table: ID, title, severity, commander, affected workspaces, status, time open. Row → Incident 360 (read-only for Founder).

---

## 9. Integrations (`integrations`) — **not shown to Founder**
Diagnostic detail (token status, webhook retries) belongs to Technical Support/SRE. Excluded from Founder's sidebar entirely, not just hidden-but-listed.

---

## 10. Compliance (`compliance`) — view only

Grounded in standard **ISO 27001 / compliance evidence dashboard** patterns (control status, evidence freshness, finding remediation SLA).

| KPI | Formula | Chart |
|---|---|---|
| Controls effective | Effective controls ÷ total, per framework | Horizontal bar, one per framework (ISO 27001, DPDP Act, GDPR) |
| Controls failed/exception | Count | Number card, red if >0 |
| Evidence due this month | Count with due date in current month | Number card |
| Findings overdue | Count past remediation SLA | Number card + list with owner and days overdue |

Table: Control ID, statement, frameworks mapped, due date, status pill.

---

## 11. Risks and Vendors (`risks-vendors`) — scoped: view all, approve/accept risk only

| Element | Chart type |
|---|---|
| Risk heat map | Standard likelihood × impact matrix (5×5 grid), risks plotted as dots |
| Top risks list | Ranked by residual rating, with owner, treatment status, due date |
| Vendor criticality table | Vendor, service, criticality tier, DPA/contract renewal date, last review |

Founder can **Accept/Treat** a risk only when it's escalated to them; cannot create/edit risk entries.

---

## 12. Audit Explorer (`audit-explorer`) — read + export only

| Element | Detail |
|---|---|
| KPI tiles | Total events, today's events, human-actioned events, system events |
| Table | Time, actor, action, entity, before/after, result, correlation ID |
| Chart | None required — this is a forensic search tool, not a trend dashboard |
| Action | Export signed report only |

---

## 13. Usage and Cost (`usage-cost`) — view only

| KPI | Formula | Chart |
|---|---|---|
| Total platform cost, MTD | Sum of cloud + AI + WhatsApp + SMS + API costs | Number card + trend arrow vs last month |
| Cost by provider | Breakdown | Donut or stacked bar |
| Cost anomalies | Workspaces/products with >X% cost spike | List with cause |
| Usage vs plan allowance | % of workspaces near/over limit | Bar chart per product |

**Excluded:** revenue, receivables, payables — BoSS Finance is system of record (blueprint §2 data-boundary rule).

---

## 14. Sections hidden from Founder entirely
`security-access`, `access-reviews`, `privacy-requests`, `catalogue-rules`, `integrations`, `partners` (unless Founder is also acting as Partner Ops) — these are operator tools with no founder-level decision attached. Do not render even as greyed-out; omit from the DOM.

---

## 15. Chart type decision rule (apply consistently across all personas)

| Data shape | Chart type |
|---|---|
| Single point-in-time metric with context | Number card + one-line note (never a bare number) |
| Metric over time | Line chart, always with an SLO/threshold reference line if one exists |
| Category comparison | Horizontal or vertical bar chart |
| Part-of-whole (≤6 categories) | Donut chart |
| Stage progression (funnel-shaped process) | Funnel chart |
| Two-dimensional risk/priority | Scatter/heat-map matrix (likelihood × impact) |
| Percentage of capacity | Gauge or horizontal progress bar |
| Anything requiring row-level drill-down | Table, never a chart |

**Never** use a chart where a number card with a link answers the question faster. Every widget must open the filtered record set behind it — no dead-end numbers (blueprint §21 decision test).

---

## 16. Sources used
- Blueprint: *Sahayogi Setu V2 Detailed Blueprint* (§2, §6, §16.3, §17, §21, §26, §31, §33)
- DORA metrics: Google DevOps Research & Assessment (deployment frequency, lead time, change failure rate, MTTR)
- Golden Signals: Google SRE Book — Latency, Traffic, Errors, Saturation
- RED method: Tom Wilkie, 2015 — Rate, Errors, Duration
- Risk heat map: standard likelihood × impact 5×5 matrix (ISO 31000-aligned risk management convention)
- Figma: `Shell-all (Copy)` file — header, KPI card, and rail component specs (pixel values used in the published Founder Control Room artifact)
