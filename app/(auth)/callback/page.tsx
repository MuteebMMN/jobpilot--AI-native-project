"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge-client";
import { posthog } from "@/lib/posthog-client";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    let attempts = 0;

    const checkUser = async (): Promise<void> => {
      const { data, error } = await insforge.auth.getCurrentUser();

      if (!error && data?.user) {
        posthog.identify(data.user.id, { email: data.user.email });
        // Set optimistic auth cookie read by proxy for route protection
        document.cookie = `insforge_logged_in=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        router.push("/profile");
        return;
      }

      // SDK may still be exchanging the OAuth code — retry up to 3 times
      if (attempts < 5) {
        attempts++;
        setTimeout(checkUser, 1000);
      } else {
        setStatus("error");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    checkUser();
  }, [router]);

  return (
    <main className="flex-1 bg-background flex items-center justify-center">
      <div className="text-center">
        {status === "processing" ? (
          <>
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Signing you in...</p>
          </>
        ) : (
          <p className="text-sm text-error">
            Something went wrong. Redirecting to login...
          </p>
        )}
      </div>
    </main>
  );
}
