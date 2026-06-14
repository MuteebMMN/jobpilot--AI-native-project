import Browserbase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import OpenAI from "openai";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompanyDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type ResearchJob = {
  company: string;
  title: string;
  about_role: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  source_url: string | null;
};

export type ResearchProfile = {
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  work_experience: unknown;
};

type SubPageData = {
  keyPoints: string[];
  technologies: string[];
  valuesOrCulture: string[];
  notable: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_DOSSIER: CompanyDossier = {
  companyOverview: "Research failed — please retry.",
  techStack: [],
  culture: [],
  whyThisRole: "",
  yourEdge: [],
  gapsToAddress: [],
  smartQuestions: [],
  interviewPrep: [],
  sources: [],
};

const SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

// ─── Schemas ──────────────────────────────────────────────────────────────────

const homepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z
    .array(z.string())
    .describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum([
          "about",
          "careers",
          "blog",
          "engineering",
          "product",
          "team",
          "other",
        ]),
      }),
    )
    .describe("Internal links worth visiting"),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z
    .array(z.string())
    .describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z
    .array(z.string())
    .describe("Stated values, working style, team norms"),
  notable: z
    .array(z.string())
    .describe("Customers, funding, scale, projects, awards"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveHomepageUrl(
  sourceUrl: string | null,
  companyName: string,
): Promise<string> {
  const sanitize = (name: string) =>
    name
      .replace(/\s*(inc|llc|ltd|corp|co)\.?$/i, "")
      .toLowerCase()
      .replace(/\s+/g, "");

  const fallback = `https://www.${sanitize(companyName)}.com`;

  if (!sourceUrl) return fallback;

  try {
    const res = await fetch(sourceUrl, { redirect: "follow" });
    const resolved = new URL(res.url);
    const parts = resolved.hostname.split(".");
    const rootDomain = parts.slice(-2).join(".");

    if (rootDomain.includes("adzuna")) return fallback;

    return `https://www.${rootDomain}`;
  } catch {
    return fallback;
  }
}

async function synthesize(
  job: ResearchJob,
  profile: ResearchProfile,
  homepageData: { oneLiner: string; productSummary: string; signals: string[] },
  subPagesData: SubPageData[],
  sources: string[],
): Promise<CompanyDossier> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const companyResearch = { homepage: homepageData, subPages: subPagesData };

    const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.about_role ?? "Not provided"}
Matched skills (already computed): ${(job.matched_skills ?? []).join(", ")}
Missing skills (already computed): ${(job.missing_skills ?? []).join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not provided"}
Experience: ${profile.years_experience ?? "?"} years, level ${profile.experience_level ?? "Not provided"}
Skills: ${(profile.skills ?? []).join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const dossier = JSON.parse(
      response.choices[0].message.content!,
    ) as CompanyDossier;
    return { ...dossier, sources };
  } catch {
    return { ...FALLBACK_DOSSIER, sources };
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function researchCompany(
  job: ResearchJob,
  profile: ResearchProfile,
): Promise<CompanyDossier> {
  const homepageUrl = await resolveHomepageUrl(job.source_url, job.company);

  let homepageData = {
    oneLiner: "",
    productSummary: "",
    signals: [] as string[],
    pageLinks: [] as Array<{ url: string; kind: string }>,
  };
  const subPagesData: SubPageData[] = [];
  const visitedUrls: string[] = [homepageUrl];

  // Browser research — failures are non-fatal; synthesize always runs after
  try {
    const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      timeout: 120,
    });

    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY!,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserbaseSessionID: session.id,
      model: { modelName: "openai/gpt-4o", apiKey: process.env.OPENAI_API_KEY! },
      disablePino: true,
    });

    await stagehand.init();
    const page = stagehand.context.activePage()!;

    try {
      // Homepage extraction
      try {
        await page.goto(homepageUrl);
        await page.waitForLoadState("networkidle");
        homepageData = await stagehand.extract(
          "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
          homepageSchema,
        );
      } catch {
        // homepageData stays at empty defaults — synthesize will work from job+profile
      }

      // Sub-page extraction (skip if homepage was empty — wrong site or parked domain)
      if (homepageData.oneLiner || homepageData.productSummary) {
        const preferredKinds = [
          "about",
          "engineering",
          "product",
          "blog",
          "team",
          "other",
        ];
        const links = (homepageData.pageLinks ?? [])
          .filter((l) => l.kind !== "careers")
          .sort(
            (a, b) =>
              preferredKinds.indexOf(a.kind) - preferredKinds.indexOf(b.kind),
          )
          .slice(0, 3);

        for (const link of links) {
          try {
            await stagehand.act(`Navigate to ${link.url}`);
            const subPage = await stagehand.extract(
              "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
              subPageSchema,
            );
            subPagesData.push(subPage);
            visitedUrls.push(link.url);
          } catch {
            // silently skip failed sub-pages
          }
        }
      }
    } finally {
      try {
        await stagehand.close();
      } catch {
        // swallow — session may already be dead
      }
    }
  } catch {
    // Browserbase/Stagehand init failed — synthesize with job+profile only
  }

  return synthesize(job, profile, homepageData, subPagesData, visitedUrls);
}
