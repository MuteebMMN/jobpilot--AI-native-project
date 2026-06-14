"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { insforge } from "@/lib/insforge-client";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github"): Promise<void> => {
    setLoading(provider);
    setError(null);

    const { error: oauthError } = await insforge.auth.signInWithOAuth(
      provider,
      {
        redirectTo: `${window.location.origin}/callback`,
      },
    );

    if (oauthError) {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
    // On success, browser auto-redirects to OAuth provider — no further action needed
  };

  return (
    <main className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image
            src="/public/logo.png"
            alt="JobPilot"
            width={36}
            height={36}
            className="rounded-[10px]"
          />
          <span className="text-[19px] font-bold text-text-darkest">
            jobpilot
          </span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-text-primary text-center mb-2">
            Sign in to JobPilot
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8">
            Find smarter. Apply faster. Land better jobs.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-accent-muted border border-accent-light rounded-md text-sm text-accent">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-surface border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <span className="text-text-muted">Connecting...</span>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOAuth("github")}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-overlay text-white border border-overlay rounded-md text-sm font-medium hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "github" ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <GitHubIcon />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-text-muted text-center mt-6">
            By signing in, you agree to our{" "}
            <Link href="/" className="text-accent hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="text-sm text-text-secondary text-center mt-6">
          <Link href="/" className="hover:text-accent transition-colors">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z"
        fill="#4285F4"
      />
      <path
        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.96409 10.71C3.78409 10.17 3.68182 9.5932 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1732 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12C0 17.302 3.438 21.8 8.207 23.387C8.806 23.498 9 23.126 9 22.81V20.576C5.662 21.302 4.967 19.16 4.967 19.16C4.421 17.773 3.634 17.404 3.634 17.404C2.545 16.659 3.717 16.675 3.717 16.675C4.922 16.759 5.556 17.912 5.556 17.912C6.626 19.746 8.363 19.216 9.048 18.909C9.155 18.134 9.466 17.604 9.81 17.305C7.145 17 4.343 15.971 4.343 11.374C4.343 10.063 4.812 8.993 5.579 8.153C5.455 7.85 5.044 6.629 5.696 4.977C5.696 4.977 6.704 4.655 8.997 6.207C9.954 5.941 10.98 5.808 12 5.803C13.02 5.808 14.047 5.941 15.006 6.207C17.297 4.655 18.303 4.977 18.303 4.977C18.956 6.63 18.545 7.851 18.421 8.153C19.191 8.993 19.656 10.064 19.656 11.374C19.656 15.983 16.849 16.998 14.177 17.295C14.607 17.667 15 18.397 15 19.517V22.81C15 23.129 15.192 23.504 15.801 23.386C20.566 21.797 24 17.3 24 12C24 5.373 18.627 0 12 0Z" />
    </svg>
  );
}
