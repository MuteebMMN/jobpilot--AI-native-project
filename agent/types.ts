export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1";
  contract_type?: string;
  created: string;
  category: { tag: string; label: string };
};

export type ScoredJob = {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  job_type: string;
  about_role: string;
  source_url: string;
  external_apply_url: string;
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
};

export type ProfileForScoring = {
  current_title: string | null;
  years_experience: number | null;
  experience_level: string | null;
  skills: string[] | null;
};
