"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Goal {
  id: string;
  title: string;
  emoji: string;
  color: string;
  _count?: { tasks: number };
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const emojis = ["🎯", "📚", "💪", "🧘", "🌅", "🌙", "🎵", "✍️", "🏃", "🧠", "🙏", "🎨"];

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(data.goals || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, emoji }),
    });

    if (res.ok) {
      const data = await res.json();
      setGoals((prev) => [data.goal, ...prev]);
      setTitle("");
      setEmoji("🎯");
      setShowForm(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal and all its tasks?")) return;
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Goals</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
          >
            {showForm ? "Cancel" : "+ New Goal"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-6"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                placeholder="e.g., Learn English"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-lg border transition-colors ${
                      emoji === e
                        ? "border-[var(--primary)] bg-[var(--primary)]/20"
                        : "border-[var(--border)] hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
            >
              Create Goal
            </button>
          </form>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🎯</span>
            <h2 className="text-xl font-semibold mb-2">No goals yet</h2>
            <p className="text-[var(--muted)]">
              Click &quot;+ New Goal&quot; to get started
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:bg-[var(--card-hover)] transition-colors group"
              >
                <Link href={`/goals/${goal.id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{goal.emoji}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(goal.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 text-sm transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                  <h3 className="font-semibold">{goal.title}</h3>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
