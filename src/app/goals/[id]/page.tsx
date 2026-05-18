"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Task {
  id: string;
  title: string;
  scheduledTime: string;
  snoozedUntil: string | null;
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
  const [taskTime, setTaskTime] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) { router.push("/login"); return; }

      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) { router.push("/goals"); return; }
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
      body: JSON.stringify({ goalId: id, title: newTask, scheduledTime: taskTime }),
    });

    if (res.ok) {
      const data = await res.json();
      setGoal((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, data.task] } : prev
      );
      setNewTask("");
      setTaskTime("");
    }
  }

  async function handleDeleteTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setGoal((prev) =>
        prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) } : prev
      );
    }
  }

  async function handleSnooze(taskId: string) {
    const res = await fetch("/api/tasks/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, snoozeMinutes: 30 }),
    });
    if (res.ok) {
      const data = await res.json();
      setGoal((prev) =>
        prev ? {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, snoozedUntil: data.snoozedUntil } : t
          ),
        } : prev
      );
    }
  }

  async function handleSetTime(taskId: string) {
    const time = prompt("Enter time (HH:MM format, e.g. 09:00):", "09:00");
    if (!time) return;
    const res = await fetch("/api/tasks/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, scheduledTime: time }),
    });
    if (res.ok) {
      const data = await res.json();
      setGoal((prev) =>
        prev ? {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, scheduledTime: data.task.scheduledTime, snoozedUntil: null } : t
          ),
        } : prev
      );
    }
  }

  // Sort tasks: unscheduled first, then by scheduled time
  const sortedTasks = [...(goal?.tasks || [])].sort((a, b) => {
    if (!a.scheduledTime && !b.scheduledTime) return 0;
    if (!a.scheduledTime) return -1;
    if (!b.scheduledTime) return 1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const now = Date.now();

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

          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="flex gap-2">
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
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--muted)]">⏰ Remind me at:</span>
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm"
              />
              {taskTime && (
                <button
                  type="button"
                  onClick={() => setTaskTime("")}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-2">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10 text-[var(--muted)]">
              No tasks yet. Add your first daily task above.
            </div>
          ) : (
            sortedTasks.map((task, i) => {
              const isSnoozed = task.snoozedUntil && new Date(task.snoozedUntil).getTime() > now;
              return (
                <div
                  key={task.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-[var(--muted)]">{i + 1}.</span>
                    <div>
                      <span className={isSnoozed ? "opacity-50" : ""}>{task.title}</span>
                      <div className="flex gap-2 mt-0.5">
                        {task.scheduledTime && (
                          <span className="text-xs text-[var(--primary)]">
                            ⏰ {task.scheduledTime}
                          </span>
                        )}
                        {isSnoozed && (
                          <span className="text-xs text-[var(--accent)]">
                            🔕 Snoozed until {new Date(task.snoozedUntil!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!task.scheduledTime ? (
                      <button
                        onClick={() => handleSetTime(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded bg-[var(--card-hover)] text-[var(--muted)] transition-opacity"
                      >
                        Set Time
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSnooze(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded bg-[var(--card-hover)] text-[var(--accent)] transition-opacity"
                      >
                        Snooze 30m
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 text-sm transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2">⏰ How Time Reminders Work</h3>
          <ul className="text-xs text-[var(--muted)] space-y-1">
            <li>• Set a time (e.g. 09:00) → Browser will notify you at that time</li>
            <li>• Missed it? Click "Snooze 30m" to be reminded later</li>
            <li>• Tasks with times appear sorted on your Dashboard</li>
            <li>• On the Android app, notifications pop on your phone screen</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
