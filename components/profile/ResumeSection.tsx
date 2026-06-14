"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { uploadResume, downloadResume } from "@/lib/profile";
import type { ExtractedProfile } from "@/agent/extractor";

type Props = {
  userId: string;
  email: string;
  existingResumeUrl: string | null;
  existingResumeKey: string | null;
  onUpload: (url: string, key: string) => void;
  onExtract: (data: ExtractedProfile) => void;
  onGenerate: () => Promise<{ url: string; key: string }>;
};

function filenameFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split("/");
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

export function ResumeSection({
  userId,
  email,
  existingResumeUrl,
  existingResumeKey,
  onUpload,
  onExtract,
  onGenerate,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(
    filenameFromUrl(existingResumeUrl)
  );
  const [viewKey, setViewKey] = useState<string | null>(existingResumeKey);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") return;
    setUploadError(null);
    setIsUploading(true);
    setSelectedFile(file.name);

    try {
      const result = await uploadResume(userId, email, file);

      if (result.error) {
        setUploadError(result.error);
        setSelectedFile(null);
      } else if (result.url && result.key) {
        setViewKey(result.key);
        onUpload(result.url, result.key);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleView() {
    if (!viewKey || isViewing) return;
    setIsViewing(true);
    try {
      const result = await downloadResume(viewKey);
      if (result.error || !result.blob) return;
      const objectUrl = URL.createObjectURL(result.blob);
      window.open(objectUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } finally {
      setIsViewing(false);
    }
  }

  async function handleExtract() {
    if (!viewKey || isExtracting) return;
    setExtractError(null);
    setIsExtracting(true);
    try {
      const download = await downloadResume(viewKey);
      if (download.error || !download.blob) {
        setExtractError("Could not download resume. Please try again.");
        return;
      }

      const formData = new FormData();
      formData.append("file", download.blob, "resume.pdf");

      const res = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setExtractError(json.error ?? "Extraction failed. Please try again.");
        return;
      }

      onExtract(json.data);
    } catch {
      setExtractError("Something went wrong. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleGenerate() {
    if (isGenerating) return;
    setGenerateError(null);
    setIsGenerating(true);
    try {
      const result = await onGenerate();
      setViewKey(result.key);
      setSelectedFile("resume.pdf");
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Generation failed. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary mb-1">Resume</h2>
      <p className="text-xs text-text-secondary mb-5 leading-relaxed">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 px-6 transition-colors",
          isDragging
            ? "border-accent bg-accent-muted"
            : "border-border-muted bg-surface-tertiary",
        ].join(" ")}
      >
        <div className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center mb-4">
          <Upload size={22} className="text-accent" />
        </div>

        {isUploading ? (
          <p className="text-sm font-medium text-text-secondary mb-1">
            Uploading…
          </p>
        ) : selectedFile ? (
          <p className="text-sm font-medium text-success mb-1 text-center break-all max-w-xs">
            {selectedFile}
          </p>
        ) : (
          <p className="text-sm font-medium text-text-primary mb-1">
            Click to upload or drag and drop
          </p>
        )}

        <p className="text-xs text-text-muted">
          PDF formatting only. Maximum file size 8MB
        </p>

        {uploadError && (
          <p className="mt-2 text-xs text-error text-center">{uploadError}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading…" : "Select Resume"}
          </button>
          {viewKey && !isUploading && (
            <button
              onClick={handleView}
              disabled={isViewing}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-text-secondary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:text-text-primary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isViewing ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="animate-spin">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="8 8" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M5.5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 1h4m0 0v4m0-4L6 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {isViewing ? "Opening…" : "View"}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3">
        {viewKey && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
            >
              {isExtracting ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="animate-spin">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="8 8" />
                  </svg>
                  Extracting…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 10l3-3 2.5 2.5L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Extract from Resume
                </>
              )}
            </button>
            {extractError && (
              <p className="text-xs text-error">{extractError}</p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Need a fresh document based on the fields below?
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="animate-spin">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="8 8" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Generate Resume from Profile
                </>
              )}
            </button>
          </div>
          {generateError && (
            <p className="text-xs text-error text-right">{generateError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
