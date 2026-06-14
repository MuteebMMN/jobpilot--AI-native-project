import OpenAI from "openai";
import type { AdzunaJob, ScoredJob, ProfileForScoring } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type MatchResult = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

async function scoreJob(job: AdzunaJob, profile: ProfileForScoring): Promise<MatchResult> {
  const systemPrompt = `You are a job matching assistant. Score how well this candidate matches this job.

Return ONLY valid JSON:
{
  "matchScore": <integer 0-100>,
  "matchReason": "<one paragraph explaining the match quality>",
  "matchedSkills": ["<skill>"],
  "missingSkills": ["<skill>"]
}`;

  const userPrompt = `JOB:
Title: ${job.title}
Company: ${job.company.display_name}
Description: ${job.description}

CANDIDATE:
Current title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? "?"} years, level ${profile.experience_level ?? "Unknown"}
Skills: ${(profile.skills ?? []).join(", ") || "None listed"}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return JSON.parse(response.choices[0].message.content!) as MatchResult;
}

export async function scoreAndFilterJobs(
  jobs: AdzunaJob[],
  profile: ProfileForScoring
): Promise<ScoredJob[]> {
  const results = await Promise.all(
    jobs.map(async (job): Promise<ScoredJob | null> => {
      try {
        const scored = await scoreJob(job, profile);

        return {
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          salary: job.salary_min
            ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round((job.salary_max ?? job.salary_min) / 1000)}k`
            : null,
          job_type: job.contract_type ?? "fulltime",
          about_role: job.description,
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          match_score: scored.matchScore,
          match_reason: scored.matchReason,
          matched_skills: scored.matchedSkills,
          missing_skills: scored.missingSkills,
        };
      } catch {
        return null;
      }
    })
  );

  return results.filter((j): j is ScoredJob => j !== null);
}
