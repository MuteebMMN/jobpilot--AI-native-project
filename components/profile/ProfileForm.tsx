"use client";

import { useState } from "react";
import { X, Plus, Calendar } from "lucide-react";
import { saveProfile, calculateCompletion } from "@/lib/profile";

export type WorkExperience = {
  id: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  responsibilities: string;
};

export type ProfileData = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
  current_title: string;
  experience_level: string;
  years_experience: number;
  skills: string[];
  industries: string[];
  job_titles_seeking: string;
  remote_preference: string;
  salary_expectation: string;
  preferred_locations: string;
  cover_letter_tone: string;
  highest_degree: string;
  field_of_study: string;
  institution: string;
  graduation_year: string;
  completion_percentage: number;
  missing_fields: string[];
  work_experience: WorkExperience[];
};

const EMPTY_PROFILE: ProfileData = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin_url: "",
  portfolio_url: "",
  work_authorization: "Citizen",
  current_title: "",
  experience_level: "Junior",
  years_experience: 0,
  skills: [],
  industries: [],
  job_titles_seeking: "",
  remote_preference: "Any",
  salary_expectation: "",
  preferred_locations: "",
  cover_letter_tone: "Professional",
  highest_degree: "High School",
  field_of_study: "",
  institution: "",
  graduation_year: "",
  completion_percentage: 0,
  missing_fields: [],
  work_experience: [],
};

type Props = {
  initialData: ProfileData | null;
  userId: string;
  email: string;
  onSaveComplete: (updated: ProfileData) => void;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors";

const selectClass =
  "w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors appearance-none";

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {action}
    </div>
  );
}

export function ProfileForm({ initialData, userId, email, onSaveComplete }: Props) {
  const base = initialData ?? EMPTY_PROFILE;

  const [fullName, setFullName] = useState(base.full_name);
  const [phone, setPhone] = useState(base.phone);
  const [location, setLocation] = useState(base.location);
  const [linkedinUrl, setLinkedinUrl] = useState(base.linkedin_url);
  const [portfolioUrl, setPortfolioUrl] = useState(base.portfolio_url);
  const [workAuthorization, setWorkAuthorization] = useState(base.work_authorization);
  const [currentTitle, setCurrentTitle] = useState(base.current_title);
  const [experienceLevel, setExperienceLevel] = useState(base.experience_level);
  const [yearsExperience, setYearsExperience] = useState(String(base.years_experience));
  const [skills, setSkills] = useState<string[]>(base.skills);
  const [skillInput, setSkillInput] = useState("");
  const [industries, setIndustries] = useState<string[]>(base.industries);
  const [industryInput, setIndustryInput] = useState("");
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(base.work_experience);
  const [highestDegree, setHighestDegree] = useState(base.highest_degree);
  const [fieldOfStudy, setFieldOfStudy] = useState(base.field_of_study);
  const [institution, setInstitution] = useState(base.institution);
  const [graduationYear, setGraduationYear] = useState(base.graduation_year);
  const [jobTitlesSeeking, setJobTitlesSeeking] = useState(base.job_titles_seeking);
  const [remotePreference, setRemotePreference] = useState(base.remote_preference);
  const [salaryExpectation, setSalaryExpectation] = useState(base.salary_expectation);
  const [preferredLocations, setPreferredLocations] = useState(base.preferred_locations);
  const [coverLetterTone, setCoverLetterTone] = useState(base.cover_letter_tone);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  }

  function addIndustry() {
    const trimmed = industryInput.trim();
    if (trimmed && !industries.includes(trimmed)) {
      setIndustries([...industries, trimmed]);
    }
    setIndustryInput("");
  }

  function addWorkExperience() {
    setWorkExperiences([
      ...workExperiences,
      {
        id: Date.now().toString(),
        company: "",
        title: "",
        start_date: "",
        end_date: "",
        is_current: false,
        responsibilities: "",
      },
    ]);
  }

  function updateWorkExp(
    id: string,
    field: keyof WorkExperience,
    value: string | boolean
  ) {
    setWorkExperiences(
      workExperiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus("idle");
    setSaveError(null);

    const currentForm: ProfileData = {
      full_name: fullName,
      email: base.email || email,
      phone,
      location,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      work_authorization: workAuthorization,
      current_title: currentTitle,
      experience_level: experienceLevel,
      years_experience: parseInt(yearsExperience, 10) || 0,
      skills,
      industries,
      job_titles_seeking: jobTitlesSeeking,
      remote_preference: remotePreference,
      salary_expectation: salaryExpectation,
      preferred_locations: preferredLocations,
      cover_letter_tone: coverLetterTone,
      highest_degree: highestDegree,
      field_of_study: fieldOfStudy,
      institution,
      graduation_year: graduationYear,
      work_experience: workExperiences,
      completion_percentage: 0,
      missing_fields: [],
    };

    const { percentage, missingFields } = calculateCompletion({
      full_name: fullName,
      email: currentForm.email,
      phone,
      location,
      current_title: currentTitle,
      experience_level: experienceLevel,
      years_experience: currentForm.years_experience,
      skills,
      job_titles_seeking: jobTitlesSeeking,
      institution,
    });

    currentForm.completion_percentage = percentage;
    currentForm.missing_fields = missingFields;

    try {
      const result = await saveProfile(userId, email, currentForm);

      if (result.error) {
        setSaveStatus("error");
        setSaveError(result.error);
      } else {
        setSaveStatus("success");
        onSaveComplete(currentForm);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      setSaveStatus("error");
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-text-primary">
          Profile Information
        </h2>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          This section is used to accurately represent you in agent interactions.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* ── Personal Info ── */}
        <section className="flex flex-col gap-4">
          <SectionHeading title="Personal Info" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={base.email || email}
                disabled
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface-secondary text-text-secondary cursor-not-allowed"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone Number">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(123) 456-7890"
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="LinkedIn URL">
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className={inputClass}
              />
            </Field>
            <Field label="Portfolio / GitHub">
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourname"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Work Authorization">
            <div className="relative">
              <select
                value={workAuthorization}
                onChange={(e) => setWorkAuthorization(e.target.value)}
                className={selectClass}
              >
                <option>Citizen</option>
                <option>Permanent Resident</option>
                <option>H1B</option>
                <option>F1/OPT</option>
                <option>Other</option>
              </select>
              <ChevronDown />
            </div>
          </Field>
        </section>

        {/* ── Professional Info ── */}
        <section className="flex flex-col gap-4">
          <SectionHeading title="Professional Info" />

          <Field label="Current / Recent Job Title">
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Experience Level">
              <div className="relative">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className={selectClass}
                >
                  <option>Junior</option>
                  <option>Mid-level</option>
                  <option>Senior</option>
                  <option>Lead</option>
                  <option>Executive</option>
                </select>
                <ChevronDown />
              </div>
            </Field>
            <Field label="Years of Experience">
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Skills">
            <div className="border border-border rounded-lg p-3 bg-surface flex flex-col gap-3">
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 px-3 py-1 bg-accent-light text-accent text-xs font-medium rounded-full"
                    >
                      {skill}
                      <button
                        onClick={() =>
                          setSkills(skills.filter((s) => s !== skill))
                        }
                        className="text-accent hover:text-accent-dark transition-colors ml-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-1.5 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
                >
                  Add
                </button>
              </div>
            </div>
          </Field>

          <Field label="Industries (Optional)">
            <div className="border border-border rounded-lg p-3 bg-surface flex flex-col gap-3">
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {industries.map((ind) => (
                    <span
                      key={ind}
                      className="flex items-center gap-1 px-3 py-1 bg-surface-secondary text-text-secondary text-xs font-medium rounded-full"
                    >
                      {ind}
                      <button
                        onClick={() =>
                          setIndustries(industries.filter((i) => i !== ind))
                        }
                        className="text-text-muted hover:text-text-secondary transition-colors ml-0.5"
                        aria-label={`Remove ${ind}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addIndustry()}
                  placeholder="E.g. FinTech, Healthcare"
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                />
                <button
                  onClick={addIndustry}
                  className="px-4 py-1.5 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
                >
                  Add
                </button>
              </div>
            </div>
          </Field>
        </section>

        {/* ── Work Experience ── */}
        <section className="flex flex-col gap-4">
          <SectionHeading
            title="Work Experience"
            action={
              <button
                onClick={addWorkExperience}
                className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
              >
                <Plus size={14} />
                Add role
              </button>
            }
          />

          {workExperiences.map((exp, index) => (
            <div key={exp.id} className="flex flex-col gap-4">
              {index > 0 && <div className="border-t border-border-light" />}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Company Name">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      updateWorkExp(exp.id, "company", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Job Title">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) =>
                      updateWorkExp(exp.id, "title", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date">
                  <input
                    type="text"
                    value={exp.start_date}
                    onChange={(e) =>
                      updateWorkExp(exp.id, "start_date", e.target.value)
                    }
                    placeholder="E.g. January 2022"
                    className={inputClass}
                  />
                </Field>
                <Field label="End Date">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={exp.end_date}
                        onChange={(e) =>
                          updateWorkExp(exp.id, "end_date", e.target.value)
                        }
                        placeholder="E.g. March 2024"
                        disabled={exp.is_current}
                        className={[
                          inputClass,
                          "pl-9",
                          exp.is_current
                            ? "bg-surface-secondary text-text-muted cursor-not-allowed"
                            : "",
                        ].join(" ")}
                      />
                      <Calendar
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={exp.is_current}
                        onChange={(e) =>
                          updateWorkExp(exp.id, "is_current", e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded border-border accent-accent"
                      />
                      <span className="text-xs text-text-secondary">
                        Currently working here
                      </span>
                    </label>
                  </div>
                </Field>
              </div>

              <Field label="Key Responsibilities">
                <textarea
                  value={exp.responsibilities}
                  onChange={(e) =>
                    updateWorkExp(exp.id, "responsibilities", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors resize-none"
                />
              </Field>
            </div>
          ))}
        </section>

        {/* ── Education ── */}
        <section className="flex flex-col gap-4">
          <SectionHeading title="Education" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Highest Degree">
              <div className="relative">
                <select
                  value={highestDegree}
                  onChange={(e) => setHighestDegree(e.target.value)}
                  className={selectClass}
                >
                  <option>High School</option>
                  <option>{"Associate's"}</option>
                  <option>{"Bachelor's"}</option>
                  <option>{"Master's"}</option>
                  <option>PhD</option>
                  <option>Other</option>
                </select>
                <ChevronDown />
              </div>
            </Field>
            <Field label="Field of Study">
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="E.g. Computer Science"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Institution Name">
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="E.g. State University"
                className={inputClass}
              />
            </Field>
            <Field label="Graduation Year">
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="YYYY"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* ── Job Preferences ── */}
        <section className="flex flex-col gap-4">
          <SectionHeading title="Job Preferences" />

          <Field label="Job Titles Seeking">
            <input
              type="text"
              value={jobTitlesSeeking}
              onChange={(e) => setJobTitlesSeeking(e.target.value)}
              placeholder="E.g. Frontend Engineer, React Developer"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Remote Preference">
              <div className="relative">
                <select
                  value={remotePreference}
                  onChange={(e) => setRemotePreference(e.target.value)}
                  className={selectClass}
                >
                  <option>Any</option>
                  <option>Remote Only</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
                <ChevronDown />
              </div>
            </Field>
            <Field label="Salary Expectation (Optional)">
              <input
                type="text"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                placeholder="E.g. $125k+"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Preferred Locations (Optional)">
            <input
              type="text"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              placeholder="E.g. New York, London"
              className={inputClass}
            />
          </Field>

          <Field label="Cover Letter Tone">
            <div className="relative">
              <select
                value={coverLetterTone}
                onChange={(e) => setCoverLetterTone(e.target.value)}
                className={selectClass}
              >
                <option>Professional</option>
                <option>Conversational</option>
                <option>Enthusiastic</option>
                <option>Formal</option>
              </select>
              <ChevronDown />
            </div>
          </Field>
        </section>
      </div>

      {/* ── Save ── */}
      <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
        {saveStatus === "error" && saveError && (
          <p className="text-sm text-error text-center">{saveError}</p>
        )}
        {saveStatus === "success" && (
          <p className="text-sm text-success text-center font-medium">
            Profile saved successfully.
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
    >
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
