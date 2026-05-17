"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Distraction {
  id: string;
  category: string;
  duration: number;
  note: string;
  date: string;
}

interface Stats {
  totalTime: number;
  totalCount: number;
  byCategory: Record<string, number>;
  byCategoryCount: Record<string, number>;
  dailyTotals: Record<string, number>;
  topDistraction: string | null;
  reCommitMessage: string;
}

const categories = [
  { value: "social_media", label: "📱 Social Media", desc: "Instagram, TikTok, YouTube, Twitter, Facebook" },
  { value: "tv", label: "📺 TV / Movies", desc: "Netflix, TV shows, movies" },
  { value: "gaming", label: "🎮 Gaming", desc: "Video games, mobile games" },
  { value: "phone_browsing", label: "📵 Phone Browsing", desc: "Endless scrolling, random browsing" },
  { value: "other", label: "🤷 Other", desc: "Any other distraction" },
];

const categoryLabels: Record<string, string> = {
  social_media: "📱 Social Media",
  tv: "📺 TV / Movies",
  gaming: "🎮 Gaming",
  phone_browsing: "📵 Phone Browsing",
  other: "🤷 Other",
};

export default function DistractionsPage() {
  const [logs, setLogs] = useState<Distraction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [category, setCategory] = useState("social_media");
  const [duration, setDuration] = useState("15");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) { router.push("/login"); return; }

      const [logsRes, statsRes] = await Promise.all([
        fetch("/api/distractions"),
        fetch("/api/distractions/stats"),
      ]);
      setLogs((await logsRes.json()).logs || []);
      setStats(await statsRes.json());
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/distractions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        duration: parseInt(duration) || 0,
        note,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setLogs((prev) => [data.log, ...prev]);
      setNote("");

      const statsRes = await fetch("/api/distractions/stats");
      setStats(await statsRes.json());
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🚫</span>
          <h1 className="text-2xl font-bold">Distraction Control</h1>
        </div>
        <p className="text-[var(--muted)] mb-8">
          Caught yourself distracted? Log it. Awareness is the first step to discipline.
        </p>

        {/* Re-commitment banner */}
        {stats && stats.reCommitMessage && (
          <div className="bg-gradient-to-r from-red-500/10 to-[var(--primary)]/10 border border-red-500/30 rounded-2xl p-5 mb-6">
            <p className="text-sm leading-relaxed">{stats.reCommitMessage}</p>
          </div>
        )}

        {/* Log form */}
        <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Log a Distraction</h2>

          <div className="space-y-3 mb-4">
            {categories.map((c) => (
              <label
                key={c.value}
                className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                  category === c.value
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c.value}
                  checked={category === c.value}
                  onChange={(e) => setCategory(e.target.value)}
                  className="sr-only"
                />
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">{c.desc}</div>
              </label>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Minutes wasted</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What pulled you away?"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Log It & Get Back to Work
          </button>
        </form>

        {/* Stats */}
        {stats && (stats.totalCount > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.totalCount}</div>
              <div className="text-xs text-[var(--muted)]">Times distracted</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[var(--accent)]">{stats.totalTime}m</div>
              <div className="text-xs text-[var(--muted)]">Total time lost</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[var(--primary)]">
                {stats.totalCount > 0
                  ? Math.round(stats.totalTime / stats.totalCount)
                  : 0}m
              </div>
              <div className="text-xs text-[var(--muted)]">Avg per session</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[var(--secondary)]">
                {Object.keys(stats.dailyTotals).length}
              </div>
              <div className="text-xs text-[var(--muted)]">Days with logs</div>
            </div>
          </div>
        )}

        {/* Top distraction */}
        {stats && stats.topDistraction && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-6">
            <h2 className="font-semibold mb-2">Your Biggest Time-Thief</h2>
            <p className="text-lg">
              {categoryLabels[stats.topDistraction] || stats.topDistraction}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              {stats.byCategory[stats.topDistraction] || 0} minutes lost this week
            </p>
          </div>
        )}

        {/* History */}
        {logs.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Recent Logs</h2>
            <div className="space-y-2">
              {logs.slice(0, 20).map((l) => (
                <div
                  key={l.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">
                      {categoryLabels[l.category] || l.category}
                    </span>
                    {l.note && (
                      <span className="text-[var(--muted)] text-sm ml-2">
                        — {l.note}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--accent)] font-medium">
                      {l.duration}m
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(l.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {logs.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">🎉</span>
            <h2 className="text-xl font-semibold mb-2">No distractions logged</h2>
            <p className="text-[var(--muted)]">
              If you catch yourself getting distracted, log it here. Awareness beats avoidance.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
