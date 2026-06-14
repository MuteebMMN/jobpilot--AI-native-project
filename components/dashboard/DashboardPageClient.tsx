"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge-client";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import type { ActivityEntry } from "@/components/dashboard/RecentActivity";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsOverTimeChart } from "@/components/dashboard/JobsOverTimeChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";

type Stats = {
  totalJobs: number;
  avgMatchRate: number;
  companiesResearched: number;
  jobsThisWeek: number;
};

type JobRow = {
  match_score: number | null;
  company_research: unknown;
  found_at: string;
  company: string;
};

type ChartData = {
  jobsOverTime: { date: string; count: number }[];
  matchDistribution: { range: string; value: number }[];
  researchActivity: { date: string; count: number }[];
};

function computeJobsOverTime(rows: JobRow[]): { date: string; count: number }[] {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const map = new Map<string, number>();
  for (const row of rows) {
    const d = new Date(row.found_at);
    if (d < cutoff) continue;
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const result: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (map.has(key)) result.push({ date: key, count: map.get(key)! });
  }
  return result;
}

function computeMatchDistribution(rows: JobRow[]): { range: string; value: number }[] {
  const b: Record<string, number> = {
    "50-60%": 0,
    "60-70%": 0,
    "70-80%": 0,
    "80-90%": 0,
    "90-100%": 0,
  };
  for (const row of rows) {
    const s = row.match_score;
    if (s == null) continue;
    if (s >= 90) b["90-100%"]++;
    else if (s >= 80) b["80-90%"]++;
    else if (s >= 70) b["70-80%"]++;
    else if (s >= 60) b["60-70%"]++;
    else if (s >= 50) b["50-60%"]++;
  }
  return Object.entries(b).map(([range, value]) => ({ range, value }));
}

function computeResearchActivity(rows: JobRow[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row.company_research == null) continue;
    const isoDay = row.found_at.slice(0, 10); // "2025-06-08" — reliable sort key
    map.set(isoDay, (map.get(isoDay) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDay, count]) => ({
      date: new Date(isoDay + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count,
    }));
}

type AgentRunRow = {
  job_title_searched: string;
  jobs_found: number | null;
  completed_at: string;
};

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function DashboardPageClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[] | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await insforge.auth.getCurrentUser();

        if (!user || authError) {
          setIsLoading(false);
          setActivities([]);
          return;
        }

        const sevenDaysAgo = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();

        const [jobsResult, runsResult] = await Promise.all([
          insforge.database
            .from("jobs")
            .select("match_score, company_research, found_at, company")
            .eq("user_id", user.id),
          insforge.database
            .from("agent_runs")
            .select("job_title_searched, jobs_found, completed_at")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("completed_at", { ascending: false })
            .limit(10),
        ]);

        // ── Stats ──────────────────────────────────────────────────────────────
        const rows = (jobsResult.data ?? []) as JobRow[];

        const totalJobs = rows.length;
        const scores = rows
          .map((j) => j.match_score)
          .filter((s): s is number => s != null && !isNaN(s));
        const avgMatchRate =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
        const companiesResearched = rows.filter(
          (j) => j.company_research != null,
        ).length;
        const jobsThisWeek = rows.filter(
          (j) => j.found_at >= sevenDaysAgo,
        ).length;

        setStats({ totalJobs, avgMatchRate, companiesResearched, jobsThisWeek });

        setChartData({
          jobsOverTime: computeJobsOverTime(rows),
          matchDistribution: computeMatchDistribution(rows),
          researchActivity: computeResearchActivity(rows),
        });

        // ── Activity ───────────────────────────────────────────────────────────
        const runs = (runsResult.data ?? []) as AgentRunRow[];

        type TimestampedEntry = ActivityEntry & { isoTime: string };

        const runEntries: TimestampedEntry[] = runs.map((r) => ({
          type: "job_found",
          text: `Found ${r.jobs_found ?? 0} jobs for ${r.job_title_searched}`,
          timestamp: formatRelativeDate(r.completed_at),
          isoTime: r.completed_at,
        }));

        const researchedEntries: TimestampedEntry[] = rows
          .filter((j) => j.company_research != null)
          .sort((a, b) => b.found_at.localeCompare(a.found_at))
          .slice(0, 10)
          .map((j) => ({
            type: "company_researched",
            text: `Researched ${j.company}`,
            timestamp: formatRelativeDate(j.found_at),
            isoTime: j.found_at,
          }));

        const merged: ActivityEntry[] = [...runEntries, ...researchedEntries]
          .sort((a, b) => b.isoTime.localeCompare(a.isoTime))
          .slice(0, 5)
          .map(({ isoTime: _iso, ...entry }) => entry);

        setActivities(merged);
      } catch (err) {
        console.error("[DashboardPageClient] loadData", err);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  function statValue(val: number | undefined, suffix = ""): string {
    return isLoading ? "—" : `${val ?? 0}${suffix}`;
  }

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-[1440px] mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            label="Total Jobs Found"
            value={statValue(stats?.totalJobs)}
            subtitle="All time"
          />
          <StatCard
            label="Avg. Match Rate"
            value={statValue(stats?.avgMatchRate, "%")}
            subtitle="Across all jobs"
          />
          <StatCard
            label="Companies Researched"
            value={statValue(stats?.companiesResearched)}
            subtitle="Total researched"
          />
          <StatCard
            label="Jobs This Week"
            value={statValue(stats?.jobsThisWeek)}
            subtitle="New this week"
          />
        </div>

        {/* Middle row — Recent Activity + Company Research Chart */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2">
            <RecentActivity entries={isLoading ? null : activities} />
          </div>
          <div className="col-span-3">
            <CompanyResearchChart data={chartData?.researchActivity ?? null} />
          </div>
        </div>

        {/* Bottom row — Jobs Over Time + Match Score Distribution */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <JobsOverTimeChart data={chartData?.jobsOverTime ?? null} />
          </div>
          <div className="col-span-2">
            <MatchScoreChart data={chartData?.matchDistribution ?? null} />
          </div>
        </div>
      </div>
    </main>
  );
}
