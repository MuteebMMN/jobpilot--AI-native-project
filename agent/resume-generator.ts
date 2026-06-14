import OpenAI from "openai";
import type { ProfileData } from "@/components/profile/ProfileForm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type GeneratedResume = {
  summary: string;
  workExperience: Array<{
    company: string;
    title: string;
    period: string;
    bullets: string[];
  }>;
};

const SYSTEM_PROMPT = `You are a professional resume writer. Given structured profile data, generate polished resume content.
Return ONLY valid JSON matching the schema below. Write in first-person-implied (no "I"), active voice, achievement-focused language.

Schema:
{
  "summary": "string (2-3 sentence professional summary)",
  "workExperience": [
    {
      "company": "string (company name from input)",
      "title": "string (job title from input)",
      "period": "string (e.g. 'Jan 2022 — Present' or 'Mar 2020 — Dec 2021')",
      "bullets": ["string (3-4 achievement-oriented bullet points)"]
    }
  ]
}

Rules:
- summary must be tailored to the candidate's experience level, skills, and target roles
- bullets must transform raw responsibilities into measurable achievements where possible
- if no work experience is provided, return an empty workExperience array
- period must be derived from start_date and end_date fields; use 'Present' if is_current is true`;

export async function generateResume(
  profile: ProfileData
): Promise<GeneratedResume> {
  const workEntries = (profile.work_experience ?? [])
    .map(
      (w) =>
        `Company: ${w.company}\nTitle: ${w.title}\nStart: ${w.start_date}\nEnd: ${w.is_current ? "Present" : w.end_date}\nResponsibilities: ${w.responsibilities}`
    )
    .join("\n\n");

  const userPrompt = `Generate resume content for this candidate:

Name: ${profile.full_name}
Current Title: ${profile.current_title}
Experience Level: ${profile.experience_level}
Years of Experience: ${profile.years_experience}
Skills: ${(profile.skills ?? []).join(", ")}
Industries: ${(profile.industries ?? []).join(", ")}
Target Roles: ${profile.job_titles_seeking}

Work Experience:
${workEntries || "None provided"}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from AI model.");

  return JSON.parse(raw) as GeneratedResume;
}
