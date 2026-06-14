import { NextRequest, NextResponse } from "next/server";
import { searchAdzunaJobs } from "@/agent/adzuna";
import { scoreAndFilterJobs } from "@/agent/matcher";
import { createPostHogServer } from "@/lib/posthog-server";
import type { ProfileForScoring, ScoredJob } from "@/agent/types";

type FindBody = {
  jobTitle: string;
  location: string;
  userId: string;
  profile: ProfileForScoring;
};

export type FindJobsResponse = {
  success: true;
  jobs: ScoredJob[];
  jobsFound: number;
};

export async function POST(req: NextRequest) {
  let body: FindBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobTitle, location, userId, profile } = body;

  if (!jobTitle?.trim()) {
    return NextResponse.json({ error: "Job title is required." }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const posthog = createPostHogServer();
  posthog.capture({
    distinctId: userId,
    event: "job_search_started",
    properties: { userId, jobTitle, location },
  });

  try {
    const adzunaJobs = await searchAdzunaJobs(jobTitle, location ?? "");
    const scoredJobs = await scoreAndFilterJobs(adzunaJobs, profile ?? {
      current_title: null,
      years_experience: null,
      experience_level: null,
      skills: null,
    });

    for (const job of scoredJobs) {
      posthog.capture({
        distinctId: userId,
        event: "job_found",
        properties: { userId, source: "search", matchScore: job.match_score },
      });
    }
    await posthog.shutdown();

    return NextResponse.json({
      success: true,
      jobs: scoredJobs,
      jobsFound: adzunaJobs.length,
    } satisfies FindJobsResponse);
  } catch (err) {
    await posthog.shutdown();
    const message = err instanceof Error ? err.message : "Search failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
