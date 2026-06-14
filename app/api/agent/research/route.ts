import { NextRequest, NextResponse } from "next/server";
import { researchCompany } from "@/agent/researcher";
import { createPostHogServer } from "@/lib/posthog-server";
import type { ResearchJob, ResearchProfile } from "@/agent/researcher";

type ResearchBody = {
  jobId: string;
  userId: string;
  job: ResearchJob;
  profile: ResearchProfile;
};

export type ResearchResponse = {
  success: true;
  dossier: Awaited<ReturnType<typeof researchCompany>>;
};

export async function POST(req: NextRequest) {
  let body: ResearchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobId, userId, job, profile } = body;

  if (!jobId || !userId || !job?.company) {
    return NextResponse.json(
      { error: "jobId, userId, and job.company are required." },
      { status: 400 },
    );
  }

  const posthog = createPostHogServer();
  posthog.capture({
    distinctId: userId,
    event: "company_researched",
    properties: { userId, jobId, company: job.company },
  });

  try {
    const dossier = await researchCompany(job, profile);
    await posthog.shutdown();
    return NextResponse.json({ success: true, dossier } satisfies ResearchResponse);
  } catch (err) {
    await posthog.shutdown();
    const message =
      err instanceof Error ? err.message : "Research failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
