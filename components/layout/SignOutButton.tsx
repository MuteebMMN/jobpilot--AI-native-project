"use client";

import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge-client";
import { posthog } from "@/lib/posthog-client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    posthog.reset();
    document.cookie = "insforge_logged_in=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-overlay text-white text-sm font-medium rounded-lg hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
    >
      Sign out
    </button>
  );
}
