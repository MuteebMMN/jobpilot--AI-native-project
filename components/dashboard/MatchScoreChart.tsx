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
  data: { range: string; value: number }[] | null;
};

export function MatchScoreChart({ data }: Props) {
  const isEmpty = data !== null && data.every((d) => d.value === 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col">
      <h2 className="text-base font-semibold text-text-primary mb-5">Match Score Distribution</h2>
      <div style={{ minHeight: 200 }}>
        {data === null && (
          <div className="h-[200px] rounded-lg bg-surface-secondary animate-pulse" />
        )}
        {isEmpty && (
          <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-text-secondary">No match score data yet</p>
            <p className="text-xs text-text-tertiary">Find jobs to see your score distribution.</p>
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
                dataKey="range"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
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
                cursor={{ fill: "rgba(231, 234, 243, 0.5)" }}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E7EAF3",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#101828", fontWeight: 500 }}
                itemStyle={{ color: "#10B981" }}
                formatter={(value: number) => [value, "Jobs"]}
              />
              <Bar dataKey="value" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
