import posthog from "posthog-js";

export { posthog };

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false,
      person_profiles: "identified_only",
      capture_pageleave: true,
    });
  }
}
