"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge-client";
import { fetchProfile, calculateCompletion, uploadResume } from "@/lib/profile";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { ProfileData } from "@/components/profile/ProfileForm";
import type { ExtractedProfile } from "@/agent/extractor";

type LoadedState = {
  userId: string;
  email: string;
  profileData: ProfileData | null;
  resumeUrl: string | null;
  resumeKey: string | null;
};

export function ProfilePageClient() {
  const [state, setState] = useState<LoadedState | null>(null);
  const [authError, setAuthError] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
          error,
        } = await insforge.auth.getCurrentUser();

        if (!user || error) {
          setAuthError(true);
          return;
        }

        const result = await fetchProfile(user.id);
        setState({
          userId: user.id,
          email: user.email ?? "",
          profileData: result?.profile ?? null,
          resumeUrl: result?.resumeUrl ?? null,
          resumeKey: result?.resumeKey ?? null,
        });
      } catch {
        setAuthError(true);
      }
    }
    load();
  }, []);

  if (authError) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-text-secondary">
          Session expired. Please{" "}
          <a href="/login" className="text-accent hover:underline">
            sign in again
          </a>
          .
        </p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="h-[120px] bg-surface border border-border rounded-2xl animate-pulse mb-6" />
        <div className="h-[200px] bg-surface border border-border rounded-2xl animate-pulse mb-6" />
        <div className="h-[600px] bg-surface border border-border rounded-2xl animate-pulse" />
      </div>
    );
  }

  const { userId, email, profileData, resumeUrl, resumeKey } = state;

  const { percentage, missingFields } = profileData
    ? calculateCompletion({
        full_name: profileData.full_name,
        email: profileData.email || email,
        phone: profileData.phone,
        location: profileData.location,
        current_title: profileData.current_title,
        experience_level: profileData.experience_level,
        years_experience: profileData.years_experience,
        skills: profileData.skills,
        job_titles_seeking: profileData.job_titles_seeking,
        institution: profileData.institution,
      })
    : { percentage: 0, missingFields: [] };

  function handleSaveComplete(updatedData: ProfileData) {
    setState((prev) =>
      prev ? { ...prev, profileData: updatedData } : prev
    );
  }

  function handleResumeUpload(url: string, key: string) {
    setState((prev) => (prev ? { ...prev, resumeUrl: url, resumeKey: key } : prev));
  }

  async function handleGenerate(): Promise<{ url: string; key: string }> {
    if (!profileData) {
      throw new Error("Please save your profile before generating a resume.");
    }

    const res = await fetch("/api/resume/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: profileData }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? "Generation failed. Please try again.");
    }

    const blob = await res.blob();
    const file = new File([blob], "resume.pdf", { type: "application/pdf" });
    const result = await uploadResume(userId, email, file);
    if (result.error) throw new Error(result.error);
    handleResumeUpload(result.url!, result.key!);
    return { url: result.url!, key: result.key! };
  }

  function handleExtract(extracted: ExtractedProfile) {
    setState((prev) => {
      if (!prev) return prev;
      const current = prev.profileData ?? ({} as ProfileData);
      const merged: ProfileData = {
        ...current,
        full_name: extracted.full_name ?? current.full_name ?? "",
        phone: extracted.phone ?? current.phone ?? "",
        location: extracted.location ?? current.location ?? "",
        linkedin_url: extracted.linkedin_url ?? current.linkedin_url ?? "",
        portfolio_url: extracted.portfolio_url ?? current.portfolio_url ?? "",
        current_title: extracted.current_title ?? current.current_title ?? "",
        experience_level: extracted.experience_level ?? current.experience_level ?? "Junior",
        years_experience: extracted.years_experience ?? current.years_experience ?? 0,
        skills: extracted.skills ?? current.skills ?? [],
        industries: extracted.industries ?? current.industries ?? [],
        job_titles_seeking: extracted.job_titles_seeking ?? current.job_titles_seeking ?? "",
        highest_degree: extracted.highest_degree ?? current.highest_degree ?? "High School",
        field_of_study: extracted.field_of_study ?? current.field_of_study ?? "",
        institution: extracted.institution ?? current.institution ?? "",
        graduation_year: extracted.graduation_year ?? current.graduation_year ?? "",
        work_experience: extracted.work_experience
          ? extracted.work_experience.map((exp, i) => ({
              id: String(i + 1),
              company: exp.company,
              title: exp.title,
              start_date: exp.start_date,
              end_date: exp.end_date,
              is_current: exp.is_current,
              responsibilities: exp.responsibilities,
            }))
          : current.work_experience ?? [],
      };
      return { ...prev, profileData: merged };
    });
    setFormKey((k) => k + 1);
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8 flex flex-col gap-6">
      <ProfileAttentionBanner
        percentage={percentage}
        missingFields={missingFields}
      />
      <ResumeSection
        userId={userId}
        email={email}
        existingResumeUrl={resumeUrl}
        existingResumeKey={resumeKey}
        onUpload={handleResumeUpload}
        onExtract={handleExtract}
        onGenerate={handleGenerate}
      />
      <ProfileForm
        key={formKey}
        initialData={profileData}
        userId={userId}
        email={email}
        onSaveComplete={handleSaveComplete}
      />
    </div>
  );
}
