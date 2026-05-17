"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Task {
  id: string;
  title: string;
}

interface Goal {
  id: string;
  title: string;
  emoji: string;
  color: string;
  tasks: Task[];
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [newTask, setNewTask] = useState("");
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

      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) {
        router.push("/goals");
        return;
      }
      const data = await res.json();
      setGoal(data.goal);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: id, title: newTask }),
    });

    if (res.ok) {
      const data = await res.json();
      setGoal((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, data.task] } : prev
      );
      setNewTask("");
    }
  }

  async function handleDeleteTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setGoal((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }
          : prev
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  if (!goal) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/goals"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-4 inline-block"
        >
          ← Back to Goals
        </Link>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{goal.emoji}</span>
            <h1 className="text-xl font-bold">{goal.title}</h1>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="Add a new task..."
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        <div className="space-y-2">
          {goal.tasks.length === 0 ? (
            <div className="text-center py-10 text-[var(--muted)]">
              No tasks yet. Add your first daily task above.
            </div>
          ) : (
            goal.tasks.map((task, i) => (
              <div
                key={task.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted)]">{i + 1}.</span>
                  <span>{task.title}</span>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 text-sm transition-opacity"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
