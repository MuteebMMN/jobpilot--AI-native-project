"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge-client";
import type { CompanyDossier, ResearchJob, ResearchProfile } from "@/agent/researcher";

// ─── Icons ────────────────────────────────────────────────────────────────────

function BuildingIcon() {
  return (
    <svg
      className="w-8 h-8 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-3">
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-text-primary">
          <span className="text-text-muted shrink-0 mt-0.5">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-text-primary">
          <span className="text-text-muted shrink-0 mt-0.5 tabular-nums">
            {i + 1}.
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1 bg-accent-muted text-accent text-xs font-medium rounded-full"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Dossier render ───────────────────────────────────────────────────────────

function DossierView({ dossier }: { dossier: CompanyDossier }) {
  return (
    <div className="flex flex-col gap-6">
      {dossier.companyOverview && (
        <div>
          <SectionLabel>Company Overview</SectionLabel>
          <p className="text-sm text-text-primary leading-relaxed">
            {dossier.companyOverview}
          </p>
        </div>
      )}

      {dossier.techStack.length > 0 && (
        <div>
          <SectionLabel>Tech Stack</SectionLabel>
          <ChipList items={dossier.techStack} />
        </div>
      )}

      {dossier.culture.length > 0 && (
        <div>
          <SectionLabel>Culture & Values</SectionLabel>
          <BulletList items={dossier.culture} />
        </div>
      )}

      {dossier.whyThisRole && (
        <div>
          <SectionLabel>Why This Role</SectionLabel>
          <p className="text-sm text-text-primary leading-relaxed">
            {dossier.whyThisRole}
          </p>
        </div>
      )}

      {dossier.yourEdge.length > 0 && (
        <div>
          <SectionLabel>Your Edge</SectionLabel>
          <BulletList items={dossier.yourEdge} />
        </div>
      )}

      {dossier.gapsToAddress.length > 0 && (
        <div>
          <SectionLabel>Gaps to Address</SectionLabel>
          <BulletList items={dossier.gapsToAddress} />
        </div>
      )}

      {dossier.smartQuestions.length > 0 && (
        <div>
          <SectionLabel>Smart Questions to Ask</SectionLabel>
          <NumberedList items={dossier.smartQuestions} />
        </div>
      )}

      {dossier.interviewPrep.length > 0 && (
        <div>
          <SectionLabel>Interview Prep</SectionLabel>
          <NumberedList items={dossier.interviewPrep} />
        </div>
      )}

      {dossier.sources.length > 0 && (
        <div>
          <SectionLabel>Sources</SectionLabel>
          <div className="flex flex-col gap-1">
            {dossier.sources.map((src, i) => (
              <p key={i} className="text-xs text-text-muted truncate">
                {src}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type CompanyResearchProps = {
  jobId: string;
  userId: string;
  job: ResearchJob;
  profile: ResearchProfile;
  initialResearch: Record<string, unknown> | null;
};

export function CompanyResearch({
  jobId,
  userId,
  job,
  profile,
  initialResearch,
}: CompanyResearchProps) {
  const [dossier, setDossier] = useState<CompanyDossier | null>(
    initialResearch ? (initialResearch as CompanyDossier) : null,
  );
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResearch() {
    setIsResearching(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, userId, job, profile }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Research failed. Please try again.");
        return;
      }

      setDossier(json.dossier as CompanyDossier);

      const { error: saveError } = await insforge.database
        .from("jobs")
        .update({
          company_research: json.dossier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("user_id", userId);

      if (saveError) {
        console.error("[CompanyResearch] DB save failed:", saveError);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-text-primary">
          Company Research
        </h2>
        {dossier && !isResearching && (
          <button
            onClick={handleResearch}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Re-research
          </button>
        )}
      </div>

      {dossier ? (
        <DossierView dossier={dossier} />
      ) : (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-16 h-16 rounded-full bg-surface-secondary border border-border flex items-center justify-center">
            <BuildingIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary mb-1">
              No research yet
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              Get a tailored company dossier — tech stack, culture, interview
              prep, and talking points specific to your profile.
            </p>
          </div>

          {error && (
            <p className="text-sm text-[--color-error] text-center max-w-xs">
              {error}
            </p>
          )}

          {isResearching ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner />
              <p className="text-sm text-text-primary font-medium">
                Researching company...
              </p>
              <p className="text-sm text-text-muted">
                This may take up to 60 seconds
              </p>
            </div>
          ) : (
            <button
              onClick={handleResearch}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg transition-all duration-150 hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97]"
            >
              {error ? "Retry" : "Research Company"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
