import { insforge } from "@/lib/insforge-client";
import type { ProfileData, WorkExperience } from "@/components/profile/ProfileForm";

// ─── Internal DB shape ────────────────────────────────────────────────────────

type DBWorkExperience = Omit<WorkExperience, "id">;

type DBProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: DBWorkExperience[] | null;
  education: {
    highest_degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: string;
  } | null;
  job_titles_seeking: string[] | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  remote_preference: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  resume_pdf_key: string | null;
  is_complete: boolean;
  completion_percentage: number;
  missing_fields: string[];
};

// ─── Completion calculation ───────────────────────────────────────────────────

type CompletionInput = {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  current_title?: string;
  experience_level?: string;
  years_experience?: number | string;
  skills?: string[];
  job_titles_seeking?: string;
  institution?: string;
};

export function calculateCompletion(data: CompletionInput): {
  percentage: number;
  missingFields: string[];
} {
  const checks = [
    { label: "NAME", filled: !!data.full_name?.trim() },
    { label: "EMAIL", filled: !!data.email?.trim() },
    { label: "PHONE", filled: !!data.phone?.trim() },
    { label: "LOCATION", filled: !!data.location?.trim() },
    { label: "TITLE", filled: !!data.current_title?.trim() },
    { label: "LEVEL", filled: !!data.experience_level?.trim() },
    { label: "EXPERIENCE", filled: Number(data.years_experience) > 0 },
    { label: "SKILLS", filled: (data.skills?.length ?? 0) > 0 },
    { label: "JOB TITLES", filled: !!data.job_titles_seeking?.trim() },
    { label: "EDUCATION", filled: !!data.institution?.trim() },
  ];

  const missingFields = checks.filter((c) => !c.filled).map((c) => c.label);
  const filled = checks.length - missingFields.length;
  const percentage = Math.round((filled / checks.length) * 100);

  return { percentage, missingFields };
}

// ─── Transforms ───────────────────────────────────────────────────────────────

function splitCSV(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function transformFromDB(row: DBProfile): ProfileData {
  return {
    full_name: row.full_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    location: row.location ?? "",
    linkedin_url: row.linkedin_url ?? "",
    portfolio_url: row.portfolio_url ?? "",
    work_authorization: row.work_authorization ?? "Citizen",
    current_title: row.current_title ?? "",
    experience_level: row.experience_level ?? "Junior",
    years_experience: row.years_experience ?? 0,
    skills: row.skills ?? [],
    industries: row.industries ?? [],
    job_titles_seeking: (row.job_titles_seeking ?? []).join(", "),
    remote_preference: row.remote_preference ?? "Any",
    salary_expectation: row.salary_expectation ?? "",
    preferred_locations: (row.preferred_locations ?? []).join(", "),
    cover_letter_tone: row.cover_letter_tone ?? "Professional",
    highest_degree: row.education?.highest_degree ?? "High School",
    field_of_study: row.education?.field_of_study ?? "",
    institution: row.education?.institution ?? "",
    graduation_year: row.education?.graduation_year ?? "",
    completion_percentage: row.completion_percentage ?? 0,
    missing_fields: row.missing_fields ?? [],
    work_experience: (row.work_experience ?? []).map((exp, i) => ({
      id: String(i + 1),
      company: exp.company ?? "",
      title: exp.title ?? "",
      start_date: exp.start_date ?? "",
      end_date: exp.end_date ?? "",
      is_current: exp.is_current ?? false,
      responsibilities: exp.responsibilities ?? "",
    })),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type FetchProfileResult = {
  profile: ProfileData;
  resumeUrl: string | null;
  resumeKey: string | null;
} | null;

export async function fetchProfile(
  userId: string
): Promise<FetchProfileResult> {
  const { data, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as DBProfile;
  return {
    profile: transformFromDB(row),
    resumeUrl: row.resume_pdf_url ?? null,
    resumeKey: row.resume_pdf_key ?? null,
  };
}

export async function saveProfile(
  userId: string,
  email: string,
  form: ProfileData
): Promise<{ error?: string }> {
  const { percentage, missingFields } = calculateCompletion({
    full_name: form.full_name,
    email: form.email || email,
    phone: form.phone,
    location: form.location,
    current_title: form.current_title,
    experience_level: form.experience_level,
    years_experience: form.years_experience,
    skills: form.skills,
    job_titles_seeking: form.job_titles_seeking,
    institution: form.institution,
  });

  const { data: existing } = await insforge.database
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  const record = {
    id: userId,
    email: form.email || email,
    full_name: form.full_name,
    phone: form.phone,
    location: form.location,
    current_title: form.current_title,
    experience_level: form.experience_level,
    years_experience: parseInt(String(form.years_experience), 10) || 0,
    skills: form.skills,
    industries: form.industries,
    work_experience: form.work_experience.map(
      ({ id: _id, ...rest }) => rest
    ),
    education: {
      highest_degree: form.highest_degree,
      field_of_study: form.field_of_study,
      institution: form.institution,
      graduation_year: form.graduation_year,
    },
    job_titles_seeking: splitCSV(form.job_titles_seeking),
    preferred_locations: splitCSV(form.preferred_locations),
    salary_expectation: form.salary_expectation,
    remote_preference: form.remote_preference,
    cover_letter_tone: form.cover_letter_tone,
    linkedin_url: form.linkedin_url,
    portfolio_url: form.portfolio_url,
    work_authorization: form.work_authorization,
    is_complete: missingFields.length === 0,
    completion_percentage: percentage,
    missing_fields: missingFields,
  };

  let error;
  if (!existing) {
    const result = await insforge.database
      .from("profiles")
      .insert([{ ...record, resume_pdf_url: null, resume_pdf_key: null }]);
    error = result.error;
  } else {
    const { id: _id, ...updateRecord } = record;
    const result = await insforge.database
      .from("profiles")
      .update({ ...updateRecord, updated_at: new Date().toISOString() })
      .eq("id", userId);
    error = result.error;
  }

  return error ? { error: error.message } : {};
}

export async function uploadResume(
  userId: string,
  email: string,
  file: File
): Promise<{ url?: string; key?: string; error?: string }> {
  const { data, error } = await insforge.storage
    .from("resumes")
    .upload(`resumes/${userId}/resume.pdf`, file);

  if (error || !data) {
    return { error: error?.message ?? "Upload failed" };
  }

  const { data: existing } = await insforge.database
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  let dbError;
  if (!existing) {
    const result = await insforge.database.from("profiles").insert([
      {
        id: userId,
        email,
        resume_pdf_url: data.url,
        resume_pdf_key: data.key,
        completion_percentage: 0,
        missing_fields: [],
        is_complete: false,
      },
    ]);
    dbError = result.error;
  } else {
    const result = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: data.url, resume_pdf_key: data.key })
      .eq("id", userId);
    dbError = result.error;
  }

  if (dbError) {
    return { error: dbError.message };
  }

  return { url: data.url, key: data.key };
}

export async function downloadResume(
  key: string
): Promise<{ blob?: Blob; error?: string }> {
  const { data, error } = await insforge.storage.from("resumes").download(key);
  if (error || !data) return { error: error?.message ?? "Download failed" };
  return { blob: data };
}
