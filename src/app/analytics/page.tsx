"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsData {
  totalDays: number;
  avgScore: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  dailyScores: { date: string; score: number }[];
  goalStats: { id: string; title: string; emoji: string; totalCompletions: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/analytics");
      const analyticsData = await res.json();
      setData(analyticsData);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.dailyScores.map((d) => ({
    date: d.date.slice(5),
    score: Math.round(d.score),
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">📈</span>
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Days Tracked"
            value={data.totalDays.toString()}
            color="var(--primary)"
          />
          <StatCard
            label="Avg Score"
            value={`${data.avgScore}%`}
            color="var(--secondary)"
          />
          <StatCard
            label="Current Streak"
            value={`${data.currentStreak}🔥`}
            color="var(--accent)"
          />
          <StatCard
            label="Best Streak"
            value={`${data.longestStreak}🔥`}
            color="var(--accent)"
          />
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Daily Scores (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  stroke="var(--muted)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted)"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1e3a",
                    border: "1px solid #2d2d5e",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.goalStats.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Task Completions by Goal</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.goalStats}>
                  <XAxis
                    dataKey="emoji"
                    stroke="var(--muted)"
                    fontSize={20}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--muted)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e1e3a",
                      border: "1px solid #2d2d5e",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                    formatter={(value: number) => [`${value} completions`]}
                  />
                  <Bar
                    dataKey="totalCompletions"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[var(--muted)] mt-1">{label}</div>
    </div>
  );
}
