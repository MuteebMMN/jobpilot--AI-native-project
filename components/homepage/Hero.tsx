import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

type Props = {
  isLoggedIn: boolean;
};

export function Hero({ isLoggedIn }: Props) {
  return (
    <section className="bg-surface">
      {/* Text content */}
      <div className="max-w-[720px] mx-auto px-6 pt-20 pb-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-muted text-accent text-xs font-medium rounded-full mb-6 border border-accent-light">
          <Sparkles size={12} />
          AI-Powered Job Hunting
        </div>

        {/* Headline */}
        <h1 className="text-[52px] font-bold text-text-primary leading-[1.15] tracking-tight mb-5">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] text-text-secondary leading-relaxed mb-8 max-w-lg mx-auto">
          JobPilot discovers jobs, scores each one against your profile, and
          researches every company for you. Set up your profile once and apply
          with confidence.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="px-5 py-2.5 bg-overlay text-white text-sm font-medium rounded-lg hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </Link>
          <Link
            href={isLoggedIn ? "/find-jobs" : "/login"}
            className="px-5 py-2.5 bg-surface border border-border text-text-primary text-sm font-medium rounded-lg hover:bg-surface-secondary hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 inline-flex items-center gap-2"
          >
            Find Your First Match
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="max-w-[1100px] mx-auto px-6 pb-0">
        <div className="rounded-2xl overflow-hidden border border-border shadow-hero">
          <Image
            src="/public/images/dashboard-demo.png"
            alt="JobPilot dashboard preview"
            width={1100}
            height={680}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
