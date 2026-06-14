import Image from "next/image";
import {
  Search,
  Building2,
  LayoutDashboard,
  Zap,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
};

const manageFeatures: Feature[] = [
  {
    icon: Search,
    iconBg: "bg-accent-light",
    iconColor: "text-accent",
    title: "Find Jobs That Actually Fit You",
    description:
      "We search Adzuna and score every result against your skills using GPT-4o — so you only see jobs worth your time.",
  },
  {
    icon: Building2,
    iconBg: "bg-info-lightest",
    iconColor: "text-info-dark",
    title: "Know the Company Before You Apply",
    description:
      "One click triggers a full AI research session on the company's website — culture, tech stack, and what this role is really for.",
  },
  {
    icon: LayoutDashboard,
    iconBg: "bg-success-lightest",
    iconColor: "text-success-foreground",
    title: "Keep Track of Every Application",
    description:
      "Your dashboard shows match scores, recent activity, and analytics — all in one place, always up to date.",
  },
];

const confidenceFeatures: Feature[] = [
  {
    icon: Zap,
    iconBg: "bg-accent-light",
    iconColor: "text-accent",
    title: "AI Match Scoring",
    description:
      "Every job gets a 0–100 score showing which skills match and which gaps need addressing — with a clear explanation from GPT-4o.",
  },
  {
    icon: BookOpen,
    iconBg: "bg-info-lightest",
    iconColor: "text-info-dark",
    title: "Company Research Dossier",
    description:
      "We surface the company's real culture, tech choices, and what this role is meant to solve — straight from their own pages.",
  },
  {
    icon: MessageSquare,
    iconBg: "bg-success-lightest",
    iconColor: "text-success-foreground",
    title: "Personalized Interview Prep",
    description:
      "Smart talking points and questions tailored to your background and this specific company — not generic advice.",
  },
];

function FeatureItem({ feature }: { feature: Feature }) {
  return (
    <div className="flex gap-4">
      <div
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${feature.iconBg} ${feature.iconColor}`}
      >
        <feature.icon size={18} />
      </div>
      <div>
        <h3 className="text-[14px] font-semibold text-text-primary mb-1 leading-5">
          {feature.title}
        </h3>
        <p className="text-[14px] text-text-secondary leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <div className="bg-background">
      {/* Section 1 — text left, image right */}
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
                Manage Your Job Search
                <br />
                With Ease
              </h2>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                Everything you need to find, evaluate, and prepare for the right
                opportunities — in one place.
              </p>
            </div>
            <div className="space-y-6">
              {manageFeatures.map((f) => (
                <FeatureItem key={f.title} feature={f} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border shadow-card">
            <Image
              src="/public/images/jobs-lists.png"
              alt="JobPilot jobs list"
              width={700}
              height={460}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Section 2 — image left, text right */}
      <div className="max-w-[1200px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden border border-border shadow-card">
            <Image
              src="/public/images/agnet-log.png"
              alt="JobPilot agent activity"
              width={700}
              height={460}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-[32px] font-bold text-text-primary leading-tight mb-3">
                Apply With More Confidence,
                <br />
                Every Time
              </h2>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                AI-powered research turns every application into an informed,
                confident decision.
              </p>
            </div>
            <div className="space-y-6">
              {confidenceFeatures.map((f) => (
                <FeatureItem key={f.title} feature={f} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
