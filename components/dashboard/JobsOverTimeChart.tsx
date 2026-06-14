"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  data: { date: string; count: number }[] | null;
};

export function JobsOverTimeChart({ data }: Props) {
  const isEmpty = data !== null && data.length === 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
      <h2 className="text-base font-semibold text-text-primary mb-5">Jobs Found Over Time</h2>
      <div style={{ minHeight: 200 }}>
        {data === null && (
          <div className="h-[200px] rounded-lg bg-surface-secondary animate-pulse" />
        )}
        {isEmpty && (
          <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-text-secondary">No jobs found in the last 30 days</p>
            <p className="text-xs text-text-tertiary">Run a job search to see results here.</p>
          </div>
        )}
        {data !== null && !isEmpty && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#E7EAF3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                cursor={{ stroke: "#7C5CFC", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E7EAF3",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#101828", fontWeight: 500 }}
                itemStyle={{ color: "#7C5CFC" }}
                formatter={(value: number) => [value, "Jobs"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#7C5CFC"
                strokeWidth={3}
                fill="url(#jobsGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#7C5CFC", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
