# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** 17 Analytics Charts — Real Data
**Next:** All features complete

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — Real Data

---

## Decisions Made During Build

- Navbar now in `app/layout.tsx` (moved from `app/page.tsx` in Feature 02) — shows on all pages including login/callback, which is acceptable for v1
- Image assets served from `/public/...` URL path (files are physically in `public/public/` nested folder)
- `lucide-react` installed (approved dependency) for icons in homepage components
- InsForge SDK: `@insforge/sdk` with `createClient` (MCP authority overrides `@insforge/ssr` references in architecture.md)
- Proxy auth uses optimistic `insforge_logged_in` cookie (set client-side in `/callback` after OAuth exchange). Proxy (`proxy.ts`) checks cookie presence. Real data access validates via InsForge SDK.
- OAuth callback URL: `${window.location.origin}/callback` — maps to `app/(auth)/callback/page.tsx`
- Next.js 16: `proxy.ts` replaces `middleware.ts` for route interception (Node.js runtime, not Edge)
- InsForge storage has no `upsert: true` option — SDK auto-renames files with same key. Always use the returned `key` and `url` from upload response. `library-docs.md` storage section corrected in Feature 06.
- `profiles.resume_pdf_key` column added in Feature 06 — required for future download/delete operations (Feature 07, 08).
- InsForge DB has no `.upsert()` method — profile save checks existence (`.maybeSingle()`) then INSERT or UPDATE. Logic lives in `lib/profile.ts`.
- Feature 06 uses client-side save (not Server Action) — InsForge SDK is browser-only, no `@insforge/ssr` server client exists. `lib/profile.ts` owns all DB/storage calls; components never call InsForge directly.
- InsForge storage bucket access control is bucket-level (private/public), not path-based RLS. Private bucket + server-side auth check is the correct approach — no Supabase-style `storage.foldername()` policy needed.
- UPDATE record must NOT include `id` in the body — `id` goes only in `.eq()` filter. Always add `updated_at: new Date().toISOString()` explicitly on UPDATE (DEFAULT only fires on INSERT in PostgREST).
- All async InsForge calls in components must be wrapped in try/catch/finally — SDK can throw (not just return `{ error }`). Missing try/catch caused isSaving/isUploading to get stuck permanently on network errors.
- `ProfileAttentionBanner` returns null at 100% completion — banner is only shown when there are missing fields.
- `pdf-parse` must be pinned to `v1.1.1` — `npm install pdf-parse` resolves to v2 (a different package, class-based API). Always use `pdf-parse@1.1.1`.
- `pdf-parse` added to `serverExternalPackages` in `next.config.ts` — prevents Turbopack bundling it, avoids CJS/ESM interop crash.
- Feature 07 PDF delivery: client calls `downloadResume(viewKey)` → sends Blob as FormData to `/api/resume/extract` — works for both new uploads and returning users (no need to keep File in state).
- Feature 07 form population: key reset via `formKey` state in `ProfilePageClient` — `ProfileForm` remounts with extracted data as `initialData`. No changes to ProfileForm internals.
- Only factual resume fields extracted (personal info, work history, education, skills) — preferences (remote_preference, salary, cover_letter_tone, work_authorization) are never extracted.
- Feature 08 architecture: API route (`/api/resume/generate`) is pure — receives full profile JSON from client, returns PDF binary. No InsForge access in the route. Client handles upload via existing `uploadResume()` (authenticated SDK). Consistent with existing pattern.
- `@react-pdf/renderer` added to `serverExternalPackages` in `next.config.ts` — same reason as `pdf-parse` (Turbopack CJS/ESM interop).
- API route is `route.tsx` (not `.ts`) — JSX required to pass `<ResumePDF />` to `renderToBuffer`.
- GPT-4o temperature 0.7 for resume generation (per library-docs.md) — natural variation in professional language.
- Feature 09 match score bar color thresholds taken from design PNG (source of truth): ≥90% green (`--color-success`), 80–89% blue (`--color-info`), <80% orange (`--color-warning`). This differs from written spec in ui-rules.md — design wins.
- Navbar active nav state extracted into `components/layout/NavLinks.tsx` (client component using `usePathname()`) — Navbar itself remains a server component. Active style: `text-accent border-b-2 border-accent`.
- Feature 10 architecture: `POST /api/agent/find` handles Adzuna + GPT-4o only — no InsForge DB access in the API route. Both `jobs` and `agent_runs` tables have RLS (`auth.uid() = user_id`) and InsForge SDK is browser-only, so all DB writes happen client-side after the API returns scored jobs. Client creates agent_run, bulk-inserts jobs, updates agent_run, then re-fetches jobs list.
- Feature 10 filter+sort: implemented client-side in `FindJobsPageClient` on the loaded job list. Empty state shown when no jobs or no filter matches.
- Feature 11: High Match threshold is ≥70 (not ≥80), Low Match is <70. Page size is 20 per page. Filter/sort/pagination all client-side over the 200-job loaded set.
- `lib/utils.ts` created with `MATCH_THRESHOLD = 70` and `detectCountry()` (keyword match, defaults to 'us').
- GPT-4o scoring: `Promise.all()` across all Adzuna results (parallel). Jobs scoring below threshold are filtered before returning to client. `agent/matcher.ts` wraps each individual score in try/catch — failures return null (silently skipped).
- Feature 12: Job details page is a server shell (`app/find-jobs/[id]/page.tsx`) + `JobDetailsPageClient` (client component, fetches full job by id+user_id on mount). CompanyResearch is a separate client component to isolate Feature 13 state.
- Feature 12: Both "View Job Post" and "Apply Now" link to `jobs.source_url` — `external_apply_url` is unused for search-sourced jobs.
- Feature 12: Match badge on details page uses score thresholds from ui-tokens.md: ≥90 success-lightest, ≥70 success-light, ≥50 warning/10, below 50 surface-secondary.
- Feature 12: `FindJobsPageClient` job rows now navigate to `/find-jobs/${job.id}` via `useRouter`.
- Feature 15: `DashboardPageClient` is the client component wrapper for the dashboard. Single `jobs` query (`select("match_score, company_research, found_at")`) computes all 4 stats in one round-trip. Trend badges dropped — trend calculation not in spec, subtitles used for all 4 cards instead. Shows `—` while loading.
- Feature 16: `DashboardPageClient` runs two queries in parallel (`jobs` + `agent_runs`) and merges into an `ActivityEntry[]` passed as props to `RecentActivity`. `RecentActivity` now accepts `entries: ActivityEntry[] | null` — null shows skeleton, empty shows empty state, populated renders real entries. No `researched_at` column on jobs table — uses `found_at` as timestamp proxy for company research entries. `formatRelativeDate` helper is local to `DashboardPageClient`.
- Feature 17: Charts derive from existing `jobs` row set (no new queries). Three pure helpers in `DashboardPageClient` — `computeJobsOverTime` (last 30 days), `computeMatchDistribution` (all-time score buckets 50-100), `computeResearchActivity` (last 7 days, company_research non-null). All charts accept `data | null` prop — null = pulse skeleton, empty = message, populated = recharts. Y-axis auto-scales (removed hardcoded domains). PostHog query API skipped — same data already in DB, no project API key env var configured.

---

## Notes

- Context files live at `context/context/` (nested one level deeper than architecture.md describes — use this path)
- All image assets in `public/public/` are served at `/public/...` URLs (e.g. `/public/logo.png`)
