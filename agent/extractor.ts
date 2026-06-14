import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ExtractedProfile = {
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  current_title?: string;
  experience_level?: string;
  years_experience?: number;
  skills?: string[];
  industries?: string[];
  work_experience?: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    responsibilities: string;
  }>;
  highest_degree?: string;
  field_of_study?: string;
  institution?: string;
  graduation_year?: string;
  job_titles_seeking?: string;
};

const SYSTEM_PROMPT = `You are a resume parser. Extract structured profile information from resume text.
Return ONLY valid JSON matching the schema below. Omit any field you cannot find in the resume.
Never invent information. If a field is unclear or absent, omit it entirely.

Schema:
{
  "full_name": "string",
  "phone": "string",
  "location": "string (City, Country or City, State)",
  "linkedin_url": "string (full URL)",
  "portfolio_url": "string (GitHub, personal site, or portfolio URL)",
  "current_title": "string (most recent job title)",
  "experience_level": "one of: Junior, Mid, Senior, Lead",
  "years_experience": "number (total years of professional experience)",
  "skills": ["array of skill strings"],
  "industries": ["array of industry strings"],
  "work_experience": [
    {
      "company": "string",
      "title": "string",
      "start_date": "string (e.g. Jan 2022)",
      "end_date": "string (e.g. Mar 2024, or empty if current)",
      "is_current": "boolean",
      "responsibilities": "string (key responsibilities as a single paragraph)"
    }
  ],
  "highest_degree": "one of: High School, Associate, Bachelor, Master, PhD, Bootcamp, Other",
  "field_of_study": "string",
  "institution": "string",
  "graduation_year": "string (4-digit year)",
  "job_titles_seeking": "string (comma-separated list of roles they appear to be targeting)"
}

Return at most 3 work_experience entries (most recent first).`;

export async function extractProfileFromPDF(
  buffer: Buffer
): Promise<ExtractedProfile> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfMod = require("pdf-parse");
  const pdfParse = (pdfMod.default ?? pdfMod) as (buf: Buffer) => Promise<{ text: string }>;
  const parsed = await pdfParse(buffer);
  const text = parsed.text?.trim();

  if (!text || text.length < 100) {
    throw new Error(
      "Could not extract text from this PDF. Please try a different file."
    );
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract profile information from this resume:\n\n${text.slice(0, 12000)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from AI model.");

  return JSON.parse(raw) as ExtractedProfile;
}
