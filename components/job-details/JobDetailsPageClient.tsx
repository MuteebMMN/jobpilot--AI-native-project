"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge-client";
import { CompanyResearch } from "./CompanyResearch";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResearchProfile = {
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  work_experience: unknown;
};

type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  about_company: string | null;
  source_url: string | null;
  external_apply_url: string | null;
  match_score: number;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: Record<string, unknown> | null;
  found_at: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  benefits: string[] | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMatchBadgeClasses(score: number): string {
  if (score >= 90) return "bg-success-lightest text-success-foreground";
  if (score >= 70) return "bg-success-light text-success-foreground";
  if (score >= 50) return "bg-warning/10 text-warning";
  return "bg-surface-secondary text-text-muted";
}

function getMatchLabel(score: number): string {
  return score >= 70 ? "High Match" : "Low Match";
}

function formatFoundDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <div className="w-14 h-14 rounded-xl bg-surface-secondary border border-border flex items-center justify-center shrink-0">
      <svg
        className="w-7 h-7 text-text-muted"
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

function ExternalLinkIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin w-5 h-5 text-accent"
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
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
      />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-1.5">
        {label}
      </p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JobDetailsPageClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ResearchProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: userData } = await insforge.auth.getCurrentUser();
        if (!userData?.user) {
          setError("Not authenticated.");
          return;
        }

        const uid = userData.user.id;

        const [{ data, error: dbError }, { data: profileData }] =
          await Promise.all([
            insforge.database
              .from("jobs")
              .select("*")
              .eq("id", jobId)
              .eq("user_id", uid)
              .maybeSingle(),
            insforge.database
              .from("profiles")
              .select(
                "current_title, experience_level, years_experience, skills, work_experience",
              )
              .eq("id", uid)
              .maybeSingle(),
          ]);

        if (dbError || !data) {
          setError("Job not found.");
          return;
        }

        setUserId(uid);
        setJob(data as JobDetail);
        setProfile((profileData as ResearchProfile) ?? null);
      } catch {
        setError("Something went wrong loading this job.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [jobId]);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner />
            <p className="text-sm text-text-muted">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────

  if (error || !job) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <Link
          href="/find-jobs"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeftIcon />
          Back to Jobs
        </Link>
        <div className="bg-surface border border-border rounded-2xl p-12 shadow-sm flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-text-primary">
            {error ?? "Job not found"}
          </p>
          <p className="text-sm text-text-muted">
            This job may have been removed or you may not have access.
          </p>
        </div>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────

  const applyUrl = job.source_url ?? job.external_apply_url ?? "#";
  const matchedSkills = job.matched_skills ?? [];
  const missingSkills = job.missing_skills ?? [];
  const responsibilities = job.responsibilities ?? [];
  const requirements = job.requirements ?? [];
  const niceToHave = job.nice_to_have ?? [];
  const benefits = job.benefits ?? [];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 flex flex-col gap-5">
      {/* Back link */}
      <Link
        href="/find-jobs"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors self-start"
      >
        <ArrowLeftIcon />
        Back to Jobs
      </Link>

      {/* Job header card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <CompanyIcon />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-lg font-semibold text-text-primary leading-snug">
                  {job.title}
                </h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  {job.company}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getMatchBadgeClasses(job.match_score)}`}
                >
                  {job.match_score}% — {getMatchLabel(job.match_score)}
                </span>
                {applyUrl !== "#" && (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
                  >
                    View Job Post
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info cards row */}
      <div className="flex gap-4 flex-wrap">
        <InfoCard label="Salary Est." value={job.salary ?? "Not specified"} />
        <InfoCard label="Location" value={job.location ?? "Not specified"} />
        <InfoCard
          label="Job Type"
          value={
            job.job_type
              ? job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)
              : "Not specified"
          }
        />
        <InfoCard label="Date Found" value={formatFoundDate(job.found_at)} />
      </div>

      {/* AI Match Reasoning */}
      {job.match_reason && (
        <SectionCard title="AI Match Reasoning">
          <p className="text-sm text-text-primary leading-relaxed">
            {job.match_reason}
          </p>
        </SectionCard>
      )}

      {/* Skills comparison */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <SectionCard title="Required Skills vs Your Profile">
          <div className="flex flex-col gap-5">
            {matchedSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
                  Skills You Have
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-success-lightest text-success-foreground text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
                  Skills to Develop
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-accent-muted text-accent text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Job Description */}
      <SectionCard title="Job Description">
        <div className="flex flex-col gap-5">
          {job.about_role && (
            <p className="text-sm text-text-primary leading-relaxed">
              {job.about_role}
            </p>
          )}
          {responsibilities.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
                Responsibilities
              </p>
              <ul className="flex flex-col gap-2">
                {responsibilities.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-primary">
                    <span className="text-text-muted shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {requirements.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
                Requirements
              </p>
              <ul className="flex flex-col gap-2">
                {requirements.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-primary">
                    <span className="text-text-muted shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {niceToHave.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
                Nice to Have
              </p>
              <ul className="flex flex-col gap-2">
                {niceToHave.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-primary">
                    <span className="text-text-muted shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {benefits.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
                Benefits
              </p>
              <ul className="flex flex-col gap-2">
                {benefits.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-primary">
                    <span className="text-text-muted shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!job.about_role &&
            responsibilities.length === 0 &&
            requirements.length === 0 && (
              <p className="text-sm text-text-muted">
                No description available for this job.
              </p>
            )}
        </div>
      </SectionCard>

      {/* Company Research */}
      {userId && profile && (
        <CompanyResearch
          jobId={job.id}
          userId={userId}
          job={{
            company: job.company,
            title: job.title,
            about_role: job.about_role,
            matched_skills: job.matched_skills,
            missing_skills: job.missing_skills,
            source_url: job.source_url,
          }}
          profile={profile}
          initialResearch={job.company_research}
        />
      )}

      {/* Apply Now */}
      {applyUrl !== "#" && (
        <div className="flex justify-end">
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
          >
            Apply Now
            <ExternalLinkIcon />
          </a>
        </div>
      )}
    </div>
  );
}
