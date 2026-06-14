# Memory — Features 14–16 Complete + Bug Fixes

Last updated: 2026-06-14

## What was built

**Feature 14 — Dashboard Page — Full UI (mock data)**
- `components/dashboard/StatCard.tsx` — stat card with optional trend badge or subtitle
- `components/dashboard/RecentActivity.tsx` — activity feed with green/blue dots per type; accepts `entries: ActivityEntry[] | null` (null = loading skeleton, [] = empty state)
- `components/dashboard/CompanyResearchChart.tsx` — blue bar chart (recharts), Mon–Sun mock data
- `components/dashboard/JobsOverTimeChart.tsx` — purple area chart with gradient fill (recharts), Mon–Sun mock data
- `components/dashboard/MatchScoreChart.tsx` — green bar chart (recharts), 50–100% score ranges mock data
- `app/dashboard/page.tsx` — thin server shell rendering `<DashboardPageClient />`
- `recharts` installed as new dependency

**Feature 15 — Stats Bar — Real Data**
- `components/dashboard/DashboardPageClient.tsx` — client component; fetches `match_score, company_research, found_at, company` from `jobs` in one query; computes all 4 stats client-side; shows `—` while loading

**Feature 16 — Recent Activity — Real Data**
- `DashboardPageClient.tsx` updated — runs two queries in parallel: jobs (same as stats) + `agent_runs` (completed only, ordered by `completed_at`)
- Merges run entries ("Found X jobs for Y") and research entries ("Researched Z"), sorts by timestamp desc, slices to 5
- `ActivityEntry` type exported from `RecentActivity.tsx`

**Bug fix — Job search always returned 0 results**
- `agent/matcher.ts` — removed `MATCH_THRESHOLD` filter that was discarding all jobs before saving. All scored jobs now returned regardless of score.
- `components/find-jobs/FindJobsPageClient.tsx` — `savedCount` now counts only jobs `>= MATCH_THRESHOLD` for the success message ("saved X strong matches"), while all jobs are saved to DB

**Bug fix — Recent Activity showing empty state**
- `DashboardPageClient.tsx` — changed `agent_runs` query from `created_at` (column that may not exist) to `completed_at` (explicitly written on update). Previous query was throwing silently and landing in catch → `setActivities([])`.

## Decisions made

- **`DashboardPageClient` owns all data fetching** — single client component wrapper for the dashboard; stats and activity both computed there and passed down as props. Same pattern as `JobDetailsPageClient`.
- **Single jobs query covers both stats and activity** — `select("match_score, company_research, found_at, company")` computes all 4 stats and the company research activity entries in one round-trip.
- **`agent_runs` uses `completed_at` not `created_at`** — `completed_at` is explicitly set in the update; `created_at` was never explicitly written and may not be in the schema. Always use `completed_at` for ordering agent_runs.
- **Trend badges dropped from stat cards** — trend calculation (vs last week) is not in the Feature 15 spec; all 4 cards use subtitle text instead.
- **All scored jobs saved regardless of match score** — threshold filter removed from `matcher.ts`. The "High Match / Low Match" filter tabs in the UI (Feature 11) handle display-time differentiation. `savedCount` in the success message still counts only jobs ≥ 70.
- **`found_at` used as proxy for company research timestamp** — no `researched_at` column exists on `jobs` table; research typically happens in the same session as discovery so the approximation is acceptable.

## Problems solved

- **Job search always returned 0 results** — `agent/matcher.ts` was filtering all jobs below `MATCH_THRESHOLD` (70) before returning them. Users with empty profiles scored 0 on everything. Fixed by removing the filter from `matcher.ts` and moving the count to the client success message.
- **Old searches created no `agent_runs` records** — the early return `if (scoredJobs.length === 0) { return; }` in `FindJobsPageClient` exited before the `agent_runs` insert. This means all historical searches have no activity records. New searches after the fix will create records correctly.
- **Recent Activity empty despite data existing** — `agent_runs` query was ordering by `created_at` which may not exist in the schema; the query threw silently, catch block set `activities = []`, empty state rendered. Fixed by switching to `completed_at`.
- **`recharts` is a client-only library** — all three chart components require `"use client"` directive. `<defs>` inside `<AreaChart>` is plain SVG, not a recharts export (don't import it).

## Current state

- Features 01–16 complete and building cleanly (TypeScript passes with no errors).
- Dashboard at `/dashboard`: stats cards show real data (total jobs, avg match rate, companies researched, jobs this week). Recent Activity shows real entries from `agent_runs` and jobs with company_research. Charts are still mock data (Feature 17 wires PostHog).
- Job search now saves all scored jobs (no threshold pre-filter). Users will see all matched jobs including low-match ones.
- Recent Activity will be empty for users whose only searches happened before today's bug fix — they need one new search to generate an `agent_runs` record.
- Only Feature 17 remains in the build plan.

## Next session starts with

**Feature 17 — Analytics Charts — PostHog Data**
1. Read `context/context/build-plan.md` step 17 for the full spec
2. Three charts need real PostHog data:
   - Jobs Found Over Time → `job_found` events grouped by day (last 30 days)
   - Match Score Distribution → `job_found` events, `matchScore` property grouped into ranges
   - Company Research Activity → `company_researched` events grouped by day (last 7 days)
3. PostHog query API is server-side (`lib/posthog-server.ts`) — likely needs an API route to proxy the queries
4. Run `/architect feature 17` before building — PostHog's query API is non-trivial

## Open questions

- PostHog query API for analytics: need to check if `posthog-node` supports event querying or if it requires the PostHog REST API directly. The `posthog-node` SDK is primarily for capturing events, not querying them.
- Returning users are not re-identified in PostHog until their next login — still unresolved, potentially addressed in Feature 17.
