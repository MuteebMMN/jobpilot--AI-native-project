import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  isLoggedIn: boolean;
};

export function BottomCTA({ isLoggedIn }: Props) {
  return (
    <section
      className="relative overflow-hidden py-24 px-6"
      style={{
        background:
          "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"
        style={{
          background: "rgba(255,255,255,0.06)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none"
        style={{
          background: "rgba(94, 76, 255, 0.4)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative max-w-[600px] mx-auto text-center">
        <h2 className="text-[38px] font-bold text-white leading-tight mb-4">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="text-white/75 text-[15px] mb-10 leading-relaxed">
          Set up your profile once, upload your resume, and let JobPilot find
          your perfect match — from discovery to interview prep.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="px-5 py-2.5 bg-white text-text-darkest text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </Link>
          <Link
            href={isLoggedIn ? "/find-jobs" : "/login"}
            className="px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] inline-flex items-center gap-2 border"
            style={{
              background: "rgba(255,255,255,0.12)",
              borderColor: "rgba(255,255,255,0.25)",
            }}
          >
            Find Your First Match
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
