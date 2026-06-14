# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Shadow Utilities

Two custom shadow utilities defined in `app/globals.css`. Use these — never hardcode rgba shadow strings.

| Utility       | Use case                                  |
| ------------- | ----------------------------------------- |
| `shadow-card` | Screenshot frames, image cards, panels    |
| `shadow-hero` | Hero image — accent-tinted dramatic glow  |

---

## Global Button Animation Pattern

Established 2026-06-13 in `app/globals.css` (`@layer base`).

All `<button>:not(:disabled)` elements get this automatically:
- Hover: `scale(1.02)`
- Active/press: `scale(0.97)`
- Transition: `transform + color + background-color + border-color + opacity`, 150ms ease-out

**For `<button>` elements:** the global rule fires automatically. Replace any `transition-colors` with `transition-all duration-150` so the transform is included in the animated transition — otherwise the scale happens instantly with no animation.

**For `<Link>` elements styled as buttons:** the CSS `button` selector does not reach `<a>` tags. Add these classes explicitly:
```
hover:scale-[1.02] active:scale-[0.97] transition-all duration-150
```

**Disabled buttons:** global rule uses `:not(:disabled)` — no animation fires when `disabled` is set. Always pair with `disabled:opacity-50 disabled:cursor-not-allowed`.

**Never use `transition-colors` on any interactive button or link-button.** Always use `transition-all duration-150` so both color and transform changes are animated together.

---

## Components

### Navbar

File: `components/layout/Navbar.tsx`
Last updated: 2026-06-13

| Property      | Class                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| Wrapper       | `sticky top-0 z-50 w-full bg-surface border-b border-border`                           |
| Inner         | `max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between`                   |
| Logo text     | `text-[19px] font-bold leading-7 text-text-darkest`                                    |
| Nav link      | `text-sm font-medium text-text-dark hover:text-accent transition-colors`                |
| CTA button    | `px-4 py-2 bg-overlay text-white text-sm font-medium rounded-lg hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |

**Pattern notes:**
Navbar is an async Server Component — reads `insforge_logged_in` cookie via `cookies()` to conditionally render `<SignOutButton>` (client) vs the "Start for free" link. Never add client-side auth checks here; keep it server-read-only. CTA is a `<Link>` so animation classes are applied explicitly (not via global `button` rule).

---

### SignOutButton

File: `components/layout/SignOutButton.tsx`
Last updated: 2026-06-13

| Property   | Class                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Button     | `px-4 py-2 bg-overlay text-white text-sm font-medium rounded-lg hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |

**Pattern notes:**
Client component. Calls `insforge.auth.signOut()`, clears `insforge_logged_in` cookie with `max-age=0`, then `router.push("/login")`. This is the canonical sign-out pattern — reuse wherever sign-out is needed instead of duplicating the three-step logic.

---

### Footer

File: `components/layout/Footer.tsx`
Last updated: 2026-06-13

| Property    | Class                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| Wrapper     | `bg-surface border-t border-border`                                         |
| Inner       | `max-w-[1440px] mx-auto px-6 py-8 flex items-center justify-between`        |
| Footer link | `text-sm text-text-secondary hover:text-text-primary transition-colors`     |

---

### Hero

File: `components/homepage/Hero.tsx`
Last updated: 2026-06-13

| Property        | Class                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Section         | `bg-surface`                                                                                                                  |
| Content area    | `max-w-[720px] mx-auto px-6 pt-20 pb-12 text-center`                                                                         |
| Badge           | `inline-flex items-center gap-1.5 px-3 py-1 bg-accent-muted text-accent text-xs font-medium rounded-full mb-6 border border-accent-light` |
| H1              | `text-[52px] font-bold text-text-primary leading-[1.15] tracking-tight mb-5`                                                 |
| Subtitle        | `text-[16px] text-text-secondary leading-relaxed mb-8 max-w-lg mx-auto`                                                      |
| Primary CTA     | `px-5 py-2.5 bg-overlay text-white text-sm font-medium rounded-lg hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150`                   |
| Secondary CTA   | `px-5 py-2.5 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 inline-flex items-center gap-2` |
| Image wrapper   | `max-w-[1100px] mx-auto px-6 pb-0`                                                                                           |
| Image container | `rounded-2xl overflow-hidden border border-border shadow-hero`                                                                |

**Pattern notes:**
`shadow-hero` is the accent-tinted dramatic glow — only use it for the main hero image. Lighter image frames use `shadow-card`.

---

### Features

File: `components/homepage/Features.tsx`
Last updated: 2026-06-13

| Property          | Class                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Section wrapper   | `bg-background`                                                                          |
| Content grid      | `max-w-[1200px] mx-auto px-6 py-24` → `grid grid-cols-2 gap-16 items-center`            |
| Section heading   | `text-[32px] font-bold text-text-primary leading-tight mb-3`                            |
| Section subtitle  | `text-[14px] text-text-secondary leading-relaxed`                                       |
| Feature item      | `flex gap-4`                                                                             |
| Feature icon box  | `shrink-0 w-10 h-10 rounded-xl flex items-center justify-center` + color variant        |
| Feature title     | `text-[14px] font-semibold text-text-primary mb-1 leading-5`                            |
| Feature body      | `text-[14px] text-text-secondary leading-relaxed`                                       |
| Screenshot card   | `rounded-2xl overflow-hidden border border-border shadow-card`                          |

**Icon color variants (use these three only):**
| Variant | Background       | Text                   |
| ------- | ---------------- | ---------------------- |
| Purple  | `bg-accent-light`   | `text-accent`         |
| Blue    | `bg-info-lightest`  | `text-info-dark`      |
| Green   | `bg-success-lightest` | `text-success-foreground` |

---

### Testimonial

File: `components/homepage/Testimonial.tsx`
Last updated: 2026-06-13

| Property      | Class                                                              |
| ------------- | ------------------------------------------------------------------ |
| Section       | `bg-surface py-20 px-6`                                           |
| Content       | `max-w-[680px] mx-auto text-center`                               |
| Quote mark    | `text-[72px] font-serif leading-none mb-2 select-none text-accent` |
| Quote text    | `text-[20px] font-medium text-text-primary leading-relaxed mb-8`  |
| Author name   | `text-[14px] font-semibold text-text-primary`                     |
| Author title  | `text-[12px] text-text-muted`                                     |
| Avatar        | `rounded-full object-cover` at 48×48                              |

**Pattern notes:**
Alternates `bg-surface` / `bg-background` with the sections around it for visual rhythm. Quote mark uses `text-accent` class — never `style={{ color: var(--color-accent) }}`.

---

### BottomCTA

File: `components/homepage/BottomCTA.tsx`
Last updated: 2026-06-13

| Property      | Class / Value                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Section       | `relative overflow-hidden py-24 px-6`                                                               |
| Background    | inline gradient: `linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)`   |
| Content       | `relative max-w-[600px] mx-auto text-center`                                                         |
| Heading       | `text-[38px] font-bold text-white leading-tight mb-4`                                               |
| Subtitle      | `text-white/75 text-[15px] mb-10 leading-relaxed`                                                   |
| Primary CTA   | `px-5 py-2.5 bg-white text-text-darkest text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |
| Secondary CTA | `px-5 py-2.5 text-white text-sm font-medium rounded-lg hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 inline-flex items-center gap-2 border` + inline rgba glass |

**Pattern notes:**
Only section in the app with an accent gradient background — do not replicate elsewhere unless it is a full-bleed CTA. Decorative blobs use inline styles because they are purely ornamental. The secondary CTA glass treatment (`rgba(255,255,255,0.12)` background, `rgba(255,255,255,0.25)` border) is acceptable inline-only because it is context-specific to the gradient background.

---

### Login Page

File: `app/(auth)/login/page.tsx`
Last updated: 2026-06-13

| Property       | Class                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Page wrapper   | `flex-1 bg-background flex items-center justify-center px-4 py-16`                                                  |
| Card           | `bg-surface border border-border rounded-2xl p-8 shadow-sm`                                                         |
| Card width     | `w-full max-w-md`                                                                                                    |
| Page heading   | `text-xl font-semibold text-text-primary text-center mb-2`                                                           |
| Page subtitle  | `text-sm text-text-secondary text-center mb-8`                                                                       |
| Error banner   | `px-4 py-3 bg-accent-muted border border-accent-light rounded-md text-sm text-accent`                               |
| Primary button | `flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-surface border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed` |
| Dark button    | `flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-overlay text-white border border-overlay rounded-md text-sm font-medium hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed` |
| Fine print     | `text-xs text-text-muted text-center mt-6`                                                                           |

**Pattern notes:**
Auth pages use `rounded-2xl p-8 shadow-sm` card — distinct from homepage cards which use `shadow-card`. Error state uses accent color (`bg-accent-muted border-accent-light text-accent`) not red — errors in auth are not destructive, just informational. Disabled state always: `disabled:opacity-50 disabled:cursor-not-allowed`.

---

### Dashboard (stub)

File: `app/dashboard/page.tsx`
Last updated: 2026-06-13

| Property     | Class                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| Page wrapper | `flex-1 bg-background flex items-center justify-center`                    |

**Pattern notes:**
Stub only — full dashboard built in Phase 5. No session validation on this stub (removed — was causing a race condition that cleared the auth cookie and broke navigation to other protected routes). The middleware handles route protection via the `insforge_logged_in` cookie. Real session validation added in Feature 14 when data fetching is wired.

---

### ProfilePageClient

File: `components/profile/ProfilePageClient.tsx`
Last updated: 2026-06-13

| Property        | Class                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Page layout     | `max-w-[800px] mx-auto px-6 py-8 flex flex-col gap-6`                 |
| Loading skeleton| Three `animate-pulse` divs with `bg-surface border border-border rounded-2xl` at fixed heights |

**Pattern notes:**
Client Component wrapper — manages shared state for the profile page. On mount: calls `insforge.auth.getCurrentUser()` then `fetchProfile(userId)` from `lib/profile.ts`. State: `{ userId, email, profileData, resumeUrl }`. Passes computed `{ percentage, missingFields }` (via `calculateCompletion`) down to `ProfileAttentionBanner`. Passes `onUpload` callback to `ResumeSection` and `onSaveComplete` callback to `ProfileForm`. Both callbacks update local state so the banner reflects changes without a page reload. This is the only place in the profile page that calls `insforge.auth.getCurrentUser()` — never duplicate this call in child components.

---

### ProfileAttentionBanner

File: `components/profile/ProfileAttentionBanner.tsx`
Last updated: 2026-06-13

| Property       | Class / Value                                                                          |
| -------------- | -------------------------------------------------------------------------------------- |
| Card wrapper   | `bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6` |
| Warning icon   | Inline SVG — orange filled circle (`var(--color-warning)`) with white `!`             |
| Title          | `text-sm font-semibold text-text-primary`                                              |
| Subtitle       | `text-xs text-text-secondary leading-relaxed`                                          |
| Missing tag    | `px-2 py-0.5 bg-error-light text-error text-[10px] font-semibold rounded-full tracking-wider` |
| Progress ring  | SVG donut — track `var(--color-border)`, fill `var(--color-accent)`, strokeWidth 8, r=40 |
| Ring text      | `text-base font-semibold text-text-primary` centered via `absolute inset-0`           |

**Pattern notes:**
SVG ring uses `-rotate-90` on the `<svg>` element to start from top. `stroke-dasharray` = `[filled, gap]` where filled = `(percentage / 100) * circumference`. Two tokens added to `globals.css` for this component: `--color-error-light: #fee2e2` and `--color-warning-light: #fff7ed`.

---

### ResumeSection

File: `components/profile/ResumeSection.tsx`
Last updated: 2026-06-13

| Property         | Class                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| Card wrapper     | `bg-surface border border-border rounded-2xl p-6 shadow-sm`                            |
| Upload zone      | `border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 px-6 transition-colors` |
| Upload zone idle | `border-border-muted bg-surface-tertiary`                                               |
| Upload zone drag | `border-accent bg-accent-muted`                                                         |
| Upload icon box  | `w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center`              |
| Primary text     | `text-sm font-medium text-text-primary`                                                 |
| Helper text      | `text-xs text-text-muted`                                                               |
| Select button    | `px-4 py-2 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |
| Footer row       | `flex items-center justify-between mt-5 pt-5 border-t border-border`                   |
| Generate button  | `flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |

**Pattern notes:**
Client component. Accepts `{ userId, email, existingResumeUrl, onUpload }` props. Calls `uploadResume()` from `lib/profile.ts` immediately on file select or drop — NOT deferred to the Save Profile button. Success state: filename shown in `text-success`. Error state: message shown in `text-error`. `isUploading` disables the Select button. `<input type="file" accept="application/pdf">` is `sr-only`, triggered via ref. Drag over swaps border and background to accent variants. `existingResumeUrl` is parsed with `filenameFromUrl()` to show just the filename on load.

---

### ProfileForm

File: `components/profile/ProfileForm.tsx`
Last updated: 2026-06-13

| Property         | Class                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Card wrapper     | `bg-surface border border-border rounded-2xl p-6 shadow-sm`                             |
| Section heading  | `text-sm font-semibold text-text-primary` + bottom border `border-b border-border`      |
| Field label      | `text-[10px] font-semibold text-text-secondary tracking-wider uppercase`                |
| Text input       | `w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent` |
| Disabled input   | `bg-surface-secondary text-text-secondary cursor-not-allowed` (email field)             |
| Select           | Same as input + `appearance-none` + inline `ChevronDown` SVG at `right-3`              |
| Skill tag        | `flex items-center gap-1 px-3 py-1 bg-accent-light text-accent text-xs font-medium rounded-full` |
| Industry tag     | `flex items-center gap-1 px-3 py-1 bg-surface-secondary text-text-secondary text-xs font-medium rounded-full` |
| Tag input box    | `border border-border rounded-lg p-3 bg-surface flex flex-col gap-3`                   |
| Add button       | `px-4 py-1.5 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |
| Textarea         | Same as text input + `resize-none`                                                       |
| Add role link    | `flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |
| Save button      | `w-full py-3 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |

**Pattern notes:**
Client component with one `useState` per field. Accepts `{ initialData: ProfileData | null, userId, email, onSaveComplete }`. `initialData ?? EMPTY_PROFILE` seeds all state. `handleSave` builds `currentForm`, calls `calculateCompletion`, then calls `saveProfile(userId, email, form)` from `lib/profile.ts`. Save states: `"idle" | "success" | "error"` — success auto-resets after 3s. `isSaving` disables the button and shows "Saving…". `WorkExperience[]` array managed with `updateWorkExp(id, field, value)` helper. Skills and industries use tag-input pattern: array state + text input + Add button (also triggers on Enter key). `ChevronDown` is a local SVG helper function. All five form sections inside one card with `SectionHeading` dividers. Types `ProfileData` and `WorkExperience` exported for use elsewhere.

---

### NavLinks

File: `components/layout/NavLinks.tsx`
Last updated: 2026-06-14

| Property      | Class                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Nav wrapper   | `flex items-center gap-8`                                                                              |
| Active link   | `text-sm font-medium transition-colors pb-0.5 border-b-2 text-accent border-accent`                   |
| Inactive link | `text-sm font-medium transition-colors pb-0.5 border-b-2 text-text-dark border-transparent hover:text-accent` |

**Pattern notes:**
Client component using `usePathname()`. Active check: `pathname === href || pathname.startsWith(\`${href}/\`)`. Using `border-b-2 border-transparent` on inactive links prevents layout shift when switching active state. Navbar remains a server component — only the nav links are extracted here.

---

### FindJobsPageClient

File: `components/find-jobs/FindJobsPageClient.tsx`
Last updated: 2026-06-14

**Search Card:**

| Property        | Class                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Card            | `bg-surface border border-border rounded-2xl p-6 shadow-sm`                                           |
| Label           | `text-[10px] font-semibold text-text-secondary tracking-wider uppercase`                               |
| Input (with icon) | `w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent` |
| Input (plain)   | `w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent` |
| Find Jobs btn   | `flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shrink-0` |
| Success banner  | `mt-4 px-4 py-2.5 bg-success-lightest border border-success-light rounded-lg flex items-center gap-2` |
| Success text    | `text-sm font-medium text-success-foreground`                                                          |

**Jobs List Card / Filter Bar:**

| Property        | Class                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Card            | `bg-surface border border-border rounded-2xl shadow-sm overflow-hidden`                               |
| Filter bar      | `px-6 py-4 border-b border-border flex items-center gap-3`                                            |
| Dropdown select | `appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer` |

**Jobs Table:**

| Property        | Class                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Table header    | `px-6 py-3 text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider`            |
| Table row       | `border-b border-border last:border-b-0 hover:bg-surface-secondary transition-colors cursor-pointer`  |
| Company name    | `text-sm font-medium text-text-primary`                                                                |
| Role text       | `text-sm text-text-primary`                                                                            |
| Score bar track | `w-24 h-1 bg-border-light rounded-full overflow-hidden shrink-0`                                       |
| Score bar fill  | inline `backgroundColor: getScoreBarColor(score)` — CSS variable based on threshold                   |
| Score text      | `text-sm font-semibold tabular-nums` + `text-success` / `text-info` / `text-warning`                  |
| Date text       | `text-sm text-text-muted`                                                                              |

**Pagination:**

| Property        | Class                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Prev/Next btn   | `px-3 py-1.5 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-secondary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed` |
| Active page     | `w-8 h-8 text-sm rounded-lg bg-accent text-accent-foreground font-medium transition-all duration-150` |
| Inactive page   | `w-8 h-8 text-sm rounded-lg text-text-secondary hover:bg-surface-secondary transition-all duration-150` |

**Pattern notes:**
Mock data replaced with real InsForge DB data in Feature 10. On mount: `insforge.auth.getCurrentUser()` → `fetchProfile(uid)` + `insforge.database.from("jobs").select(...).eq("user_id", uid).order("found_at", { ascending: false }).limit(200)`. Match score bar color thresholds: ≥90% `--color-success` (green), 80–89% `--color-info` (blue), <80% `--color-warning` (orange) — derived from design PNG. Filter + sort are client-side on the loaded `jobs` array. Pagination is real: `PAGE_SIZE = 6`, dynamic `totalPages`, `getVisiblePages()` returns `(number | "...")[]`. Empty state shown when `jobs.length === 0` (prompt to search) or `filtered.length === 0` (no filter match). Loading state: `isInitializing` shows a centered spinner + text instead of the table. Error banner uses `bg-surface-secondary border border-border text-error` (no `error-lightest` token exists). `LoadingSpinner` is an inline SVG with `animate-spin`. `formatRelativeDate(isoDate)` converts ISO timestamp to relative display ("Just now", "X hours ago", "Yesterday", "X days ago", or locale date). Feature 12 added `useRouter` + row `onClick` navigation to `/find-jobs/${job.id}`.

---

### JobDetailsPageClient

File: `components/job-details/JobDetailsPageClient.tsx`
Last updated: 2026-06-14

| Property         | Class                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Page wrapper     | `max-w-[900px] mx-auto px-6 py-8 flex flex-col gap-5`                                     |
| Back link        | `inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors self-start` |
| Job header card  | `bg-surface border border-border rounded-2xl p-6 shadow-sm`                               |
| Job title        | `text-lg font-semibold text-text-primary leading-snug`                                     |
| Company name     | `text-sm text-text-secondary mt-0.5`                                                       |
| Match badge      | `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold` + score color |
| View Job Post    | `inline-flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |
| Info card        | `bg-surface border border-border rounded-2xl p-5 shadow-sm flex-1 min-w-0`                |
| Info label       | `text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-1.5`            |
| Info value       | `text-sm font-medium text-text-primary`                                                    |
| Section card     | `bg-surface border border-border rounded-2xl p-6 shadow-sm`                               |
| Section title    | `text-base font-semibold text-text-primary mb-5`                                           |
| Matched skill    | `px-3 py-1 bg-success-lightest text-success-foreground text-xs font-medium rounded-full`  |
| Missing skill    | `px-3 py-1 bg-accent-muted text-accent text-xs font-medium rounded-full`                  |
| Sub-section label| `text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3`              |
| Bullet list item | `flex gap-2 text-sm text-text-primary` with `text-text-muted shrink-0 mt-0.5` bullet      |
| Apply Now        | `inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150` |

**Match badge colors by score:**
| Range   | Classes                                     |
| ------- | ------------------------------------------- |
| ≥90     | `bg-success-lightest text-success-foreground` |
| 70–89   | `bg-success-light text-success-foreground`    |
| 50–69   | `bg-warning/10 text-warning`                  |
| <50     | `bg-surface-secondary text-text-muted`        |

**Pattern notes:**
Client component shell: server page passes `jobId` from params. On mount: `insforge.auth.getCurrentUser()` → `.from("jobs").select("*").eq("id", jobId).eq("user_id", uid).maybeSingle()`. Error state shown for unauthenticated or not-found. Info cards row uses `flex flex-wrap gap-4` so cards stack on narrow viewports. Job description renders `about_role` + conditional bullet sections (`responsibilities`, `requirements`, `nice_to_have`, `benefits`) — each section only shown if array is non-empty. Both "View Job Post" and "Apply Now" link to `source_url` (Adzuna redirect URL stored in DB). `CompanyResearch` is a separate component to isolate Feature 13 state.

---

### CompanyResearch

File: `components/job-details/CompanyResearch.tsx`
Last updated: 2026-06-14

| Property       | Class                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Card wrapper   | `bg-surface border border-border rounded-2xl p-6 shadow-sm`                             |
| Icon circle    | `w-16 h-16 rounded-full bg-surface-secondary border border-border flex items-center justify-center` |
| Empty text     | `text-sm font-medium text-text-primary mb-1`                                             |
| Empty subtext  | `text-sm text-text-muted max-w-xs`                                                       |
| Research btn   | `flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed` |

**Pattern notes:**
Accepts `jobId` prop (stored in `data-job-id` on wrapper div for Feature 13 to read). Button is `disabled` in Feature 12 — Feature 13 wires up the `onClick` and loading state. Empty state only — no dossier render yet.

---

### StatCard

File: `components/dashboard/StatCard.tsx`
Last updated: 2026-06-14

| Property     | Class                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| Card wrapper | `bg-surface border border-border rounded-2xl p-6 shadow-sm`              |
| Label        | `text-sm font-medium text-text-secondary mb-3`                            |
| Stat number  | `text-[30px] font-semibold text-text-primary leading-9 mb-3`             |
| Trend badge  | `px-2 py-0.5 bg-success-lightest text-success-darker text-xs font-medium rounded-sm` |
| Trend suffix | `text-xs text-text-muted`                                                 |
| Subtitle     | `text-xs text-text-muted`                                                 |

**Pattern notes:**
Server component. Accepts `{ label, value, trend?, subtitle? }`. When `trend` is set, renders the green badge + "vs last week" text. When `subtitle` is set, renders muted text below the number. The two are mutually exclusive in use (trend cards 1–2, subtitle cards 3–4 in the dashboard design). Stat number is 30px/semibold per ui-tokens spec.

---

### RecentActivity

File: `components/dashboard/RecentActivity.tsx`
Last updated: 2026-06-14

| Property      | Class                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| Card wrapper  | `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col` |
| Card title    | `text-base font-semibold text-text-primary mb-5`                        |
| Entry row     | `flex items-start gap-3`                                                |
| Entry text    | `text-sm font-medium text-text-primary leading-5`                       |
| Timestamp     | `text-xs text-text-muted mt-0.5`                                        |

**Activity dot pattern:**
| Type               | Outer ring  | Inner dot |
| ------------------ | ----------- | --------- |
| `job_found`        | `#D0FAE5`   | `#00BC7D` |
| `company_researched` | `#DBEAFE` | `#61A8FF` |

Dot: `w-4 h-4 rounded-full` outer, `w-2 h-2 rounded-full` inner. Colors applied via inline `style` (not Tailwind) because they reference hex values not available as utility classes for SVG/ring combos.

**Pattern notes:**
Server component with hardcoded mock data. Feature 16 replaces mock with real DB + agent_runs data. Two dot types: `job_found` (green) and `company_researched` (blue). Purple dot from ui-tokens is for "resume tailored" which is out of scope.

---

### CompanyResearchChart

File: `components/dashboard/CompanyResearchChart.tsx`
Last updated: 2026-06-14

| Property     | Value                                          |
| ------------ | ---------------------------------------------- |
| Card wrapper | `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col` |
| Bar color    | `#61A8FF` (info token)                         |
| Grid lines   | `strokeDasharray="4 4"` stroke `#E7EAF3`       |
| Y axis range | `[0, 12]`, ticks `[0, 3, 6, 9, 12]`           |
| Chart height | `200px` via `ResponsiveContainer height={200}` |

**Pattern notes:**
Client component (`"use client"`) — recharts requires browser. `ResponsiveContainer` fills card width. Bars use `radius={[3, 3, 0, 0]}` for rounded top corners. `vertical={false}` on CartesianGrid shows only horizontal grid lines. Feature 17 replaces mock data with PostHog `company_researched` event counts grouped by day.

---

### JobsOverTimeChart

File: `components/dashboard/JobsOverTimeChart.tsx`
Last updated: 2026-06-14

| Property      | Value                                                                        |
| ------------- | ---------------------------------------------------------------------------- |
| Card wrapper  | `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col`   |
| Line stroke   | `#7C5CFC` (accent), strokeWidth 3                                            |
| Gradient fill | `linearGradient` id `jobsGradient` — 20% opacity at top, 0% at bottom       |
| Grid lines    | `strokeDasharray="4 4"` stroke `#E7EAF3`                                    |
| Y axis range  | `[0, 100]`, ticks `[0, 25, 50, 75, 100]`                                   |
| Chart height  | `200px`                                                                      |

**Pattern notes:**
Client component. Uses `<AreaChart>` with `<Area type="monotone">` and `fill="url(#jobsGradient)"`. `dot={false}` hides individual data points; `activeDot` shows on hover. `<defs>` for the SVG gradient is placed directly inside `<AreaChart>` (recharts renders it as SVG children). Feature 17 replaces mock data with PostHog `job_found` event counts grouped by day.

---

### MatchScoreChart

File: `components/dashboard/MatchScoreChart.tsx`
Last updated: 2026-06-14

| Property     | Value                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| Card wrapper | `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col` |
| Bar color    | `#10B981` (success token)                                                  |
| Grid lines   | `strokeDasharray="4 4"` stroke `#E7EAF3`                                  |
| Y axis range | `[0, 100]`, ticks `[0, 25, 50, 75, 100]`                                 |
| X axis keys  | `"50-60%"`, `"60-70%"`, `"70-80%"`, `"80-90%"`, `"90-100%"`             |
| Chart height | `200px`                                                                    |

**Pattern notes:**
Client component. X axis `tick={{ fontSize: 11 }}` (reduced from 12) so score range labels fit without overlap. Feature 17 replaces mock data with PostHog `job_found` event `matchScore` property grouped into ranges.
