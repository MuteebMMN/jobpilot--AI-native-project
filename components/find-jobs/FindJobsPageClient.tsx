"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge-client";
import { fetchProfile } from "@/lib/profile";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { ProfileForScoring, ScoredJob } from "@/agent/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobRow = {
  id: string;
  title: string;
  company: string;
  match_score: number;
  salary: string | null;
  found_at: string;
};

type SearchResult = {
  jobsFound: number;
  savedCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function formatRelativeDate(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 2) return "Just now";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(isoDate).toLocaleDateString();
}

function getScoreBarColor(score: number): string {
  if (score >= 90) return "var(--color-success)";
  if (score >= 80) return "var(--color-info)";
  return "var(--color-warning)";
}

function getScoreTextClass(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 80) return "text-info";
  return "text-warning";
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CompanyIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border flex items-center justify-center shrink-0">
      <svg
        className="w-4 h-4 text-text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-success-alt"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 1l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FindJobsPageClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileForScoring | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterMatch, setFilterMatch] = useState("All Matches");
  const [sortBy, setSortBy] = useState("Match Score");
  const [currentPage, setCurrentPage] = useState(1);

  const loadJobs = useCallback(async (uid: string) => {
    const { data } = await insforge.database
      .from("jobs")
      .select("id, title, company, match_score, salary, found_at")
      .eq("user_id", uid)
      .order("found_at", { ascending: false })
      .limit(200);
    setJobs((data as JobRow[]) ?? []);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: authData } = await insforge.auth.getCurrentUser();
      if (!authData.user) return;
      const uid = authData.user.id;
      setUserId(uid);

      const [profileResult] = await Promise.all([
        fetchProfile(uid),
        loadJobs(uid),
      ]);

      if (profileResult) {
        setProfile({
          current_title: profileResult.profile.current_title || null,
          years_experience:
            typeof profileResult.profile.years_experience === "number"
              ? profileResult.profile.years_experience
              : null,
          experience_level: profileResult.profile.experience_level || null,
          skills: profileResult.profile.skills?.length
            ? profileResult.profile.skills
            : null,
        });
      }
      setIsInitializing(false);
    }
    init();
  }, [loadJobs]);

  async function handleSearch() {
    if (!userId || !searchTitle.trim() || isSearching) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          jobTitle: searchTitle.trim(),
          location: searchLocation.trim(),
          profile: profile ?? {
            current_title: null,
            years_experience: null,
            experience_level: null,
            skills: null,
          },
        }),
      });

      const json = await res.json() as { success?: boolean; jobs?: ScoredJob[]; jobsFound?: number; error?: string };

      if (!res.ok || !json.success) {
        setSearchError(json.error ?? "Search failed. Please try again.");
        return;
      }

      const { jobs: scoredJobs = [], jobsFound = 0 } = json;

      if (scoredJobs.length === 0) {
        setSearchResult({ jobsFound, savedCount: 0 });
        return;
      }

      // Create agent_run
      const { data: agentRun } = await insforge.database
        .from("agent_runs")
        .insert([
          {
            user_id: userId,
            status: "running",
            job_title_searched: searchTitle.trim(),
            location_searched: searchLocation.trim(),
          },
        ])
        .select("id")
        .single();

      const runId = (agentRun as { id: string } | null)?.id ?? null;

      // Bulk insert jobs
      const now = new Date().toISOString();
      const records = scoredJobs.map((j) => ({
        user_id: userId,
        run_id: runId,
        source: "search",
        source_url: j.source_url,
        external_apply_url: j.external_apply_url,
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary,
        job_type: j.job_type,
        about_role: j.about_role,
        match_score: j.match_score,
        match_reason: j.match_reason,
        matched_skills: j.matched_skills,
        missing_skills: j.missing_skills,
        found_at: now,
      }));

      await insforge.database.from("jobs").insert(records);

      // Complete agent_run
      if (runId) {
        await insforge.database
          .from("agent_runs")
          .update({
            status: "completed",
            jobs_found: scoredJobs.length,
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId)
          .eq("user_id", userId);
      }

      await loadJobs(userId);
      const strongMatches = scoredJobs.filter(j => j.match_score >= MATCH_THRESHOLD).length;
      setSearchResult({ jobsFound, savedCount: strongMatches });
      setCurrentPage(1);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  // ─── Filter + sort ──────────────────────────────────────────────────────────

  const sorted = [...jobs].sort((a, b) => {
    if (sortBy === "Newest")
      return new Date(b.found_at).getTime() - new Date(a.found_at).getTime();
    if (sortBy === "Oldest")
      return new Date(a.found_at).getTime() - new Date(b.found_at).getTime();
    return b.match_score - a.match_score;
  });

  const filtered = sorted.filter((job) => {
    if (filterMatch === "High Match" && job.match_score < 70) return false;
    if (filterMatch === "Low Match" && job.match_score >= 70) return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      return (
        job.company.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageJobs = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function getVisiblePages(): (number | "...")[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    )
      pages.push(i);
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const notReady = isInitializing || !userId;
  const showingFrom = filtered.length === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(pageStart + PAGE_SIZE, filtered.length);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8 flex flex-col gap-6">
      {/* Search Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-end gap-4">
          {/* JOB TITLE */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase">
              Job Title
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !isSearching &&
                  !notReady &&
                  handleSearch()
                }
                placeholder="Frontend Engineer"
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase">
              Location
            </label>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !isSearching &&
                !notReady &&
                handleSearch()
              }
              placeholder="Remote, New York..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Find Jobs Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching || notReady || !searchTitle.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSearching ? (
              <>
                <LoadingSpinner />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="w-4 h-4" />
                Find Jobs
              </>
            )}
          </button>
        </div>

        {/* Success Banner */}
        {searchResult && (
          <div className="mt-4 px-4 py-2.5 bg-success-lightest border border-success-light rounded-lg flex items-center gap-2">
            <SparkleIcon />
            <p className="text-sm font-medium text-success-foreground">
              Found {searchResult.jobsFound} job
              {searchResult.jobsFound !== 1 ? "s" : ""} and saved{" "}
              {searchResult.savedCount} strong match
              {searchResult.savedCount !== 1 ? "es" : ""}.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {searchError && (
          <div className="mt-4 px-4 py-2.5 bg-surface-secondary border border-border rounded-lg">
            <p className="text-sm font-medium text-error">{searchError}</p>
          </div>
        )}
      </div>

      {/* Jobs List Card */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by company or role..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="relative">
            <select
              value={filterMatch}
              onChange={(e) => {
                setFilterMatch(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
            >
              <option>All Matches</option>
              <option>High Match</option>
              <option>Low Match</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
            >
              <option>Match Score</option>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Table or Empty State */}
        {isInitializing ? (
          <div className="px-6 py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner />
              <p className="text-sm text-text-muted">Loading jobs...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-text-primary">No jobs found</p>
            <p className="text-sm text-text-muted text-center max-w-xs">
              {jobs.length === 0
                ? "Enter a job title and click Find Jobs to start your search."
                : "No jobs match your current filters."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                  Match Score
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                  Salary Est.
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                  Date Found
                </th>
              </tr>
            </thead>
            <tbody>
              {pageJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-secondary transition-colors cursor-pointer"
                  onClick={() => router.push(`/find-jobs/${job.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CompanyIcon />
                      <span className="text-sm font-medium text-text-primary">
                        {job.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {job.title}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 h-1 bg-border-light rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${job.match_score}%`,
                            backgroundColor: getScoreBarColor(job.match_score),
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${getScoreTextClass(job.match_score)}`}
                      >
                        {job.match_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {job.salary ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {formatRelativeDate(job.found_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-border">
            <p className="text-sm text-text-muted">
              Showing{" "}
              <span className="font-medium text-text-primary">{showingFrom}</span>{" "}
              to{" "}
              <span className="font-medium text-text-primary">{showingTo}</span>{" "}
              of{" "}
              <span className="font-medium text-text-primary">
                {filtered.length}
              </span>{" "}
              results
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-secondary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {getVisiblePages().map((page, i) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-sm text-text-muted"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded-lg transition-all duration-150 ${
                      safePage === page
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-text-secondary hover:bg-surface-secondary"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-secondary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
