"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  data: { date: string; count: number }[] | null;
};

export function CompanyResearchChart({ data }: Props) {
  const isEmpty = data !== null && data.length === 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
      <h2 className="text-base font-semibold text-text-primary mb-5">Company Research Activity</h2>
      <div className="flex-1" style={{ minHeight: 200 }}>
        {data === null && (
          <div className="h-[200px] rounded-lg bg-surface-secondary animate-pulse" />
        )}
        {isEmpty && (
          <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-text-secondary">No company research yet</p>
            <p className="text-xs text-text-tertiary">Research a company from a job details page.</p>
          </div>
        )}
        {data !== null && !isEmpty && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barCategoryGap="35%">
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
                width={24}
              />
              <Tooltip
                cursor={{ fill: "rgba(231, 234, 243, 0.5)" }}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E7EAF3",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#101828", fontWeight: 500 }}
                itemStyle={{ color: "#61A8FF" }}
                formatter={(value: number) => [value, "Researched"]}
              />
              <Bar dataKey="count" fill="#61A8FF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
