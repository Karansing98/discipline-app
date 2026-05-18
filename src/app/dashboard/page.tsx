"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ReminderBanner from "@/components/ReminderBanner";
import TimeReminder from "@/components/TimeReminder";
import type { GoalWithTasks, StreakData } from "@/types";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<GoalWithTasks[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [score, setScore] = useState(0);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastCheckInTime, setLastCheckInTime] = useState<Date | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [meRes, todayRes, streakRes, motivationRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/checkin/today"),
        fetch("/api/streaks"),
        fetch("/api/motivation?streak=0"),
      ]);

      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/login");
        return;
      }
      setUser(meData.user);

      const todayData = await todayRes.json();
      setGoals(todayData.goals || []);
      setScore(todayData.score || 0);
      setLastCheckInTime(new Date());
      const allCompleted =
        todayData.goals?.every(
          (g: GoalWithTasks) =>
            g.tasks.length > 0 && g.tasks.every((t) => t.completed)
        ) || false;

      const streakData = await streakRes.json();
      setStreak(streakData);

      const motivationData = await motivationRes.json();
      setMotivation(
        allCompleted
          ? motivationData.message
          : motivationData.encouragement
      );
    } catch {
      console.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();

    // Periodic reminder: check tasks and notify if incomplete
    const checkTasksAndRemind = async () => {
      try {
        const res = await fetch("/api/checkin/today");
        const data = await res.json();
        const goalsData = data.goals || [];
        const incomplete = goalsData.reduce(
          (sum: number, g: any) =>
            sum + g.tasks.filter((t: any) => !t.completed).length,
          0
        );
        if (incomplete > 0 && "Notification" in window && Notification.permission === "granted") {
          new Notification("⏰ Tasks Still Waiting!", {
            body: `${incomplete} task${incomplete > 1 ? "s" : ""} still incomplete. Your goals are worth finishing!`,
          });
        }
      } catch {}
    };

    const reminderInterval = setInterval(checkTasksAndRemind, 20 * 60 * 1000);

    return () => clearInterval(reminderInterval);
  }, [fetchData]);

  async function toggleTask(taskId: string, completed: boolean) {
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed: !completed }),
    });

    if (res.ok) {
      const data = await res.json();
      setScore(data.score);
      setGoals((prev) =>
        prev.map((g) => ({
          ...g,
          tasks: g.tasks.map((t) =>
            t.id === taskId
              ? { ...t, completed: !completed }
              : t
          ),
        }))
      );

      const allNowDone = goals.every((g) =>
        g.tasks.every((t) => (t.id === taskId ? !completed : t.completed))
      );

      if (allNowDone) {
        const motRes = await fetch(
          `/api/motivation?streak=${streak?.current || 0}&completed=true`
        );
        const motData = await motRes.json();
        setMotivation(motData.message);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  const totalTasks = goals.reduce((sum, g) => sum + g.tasks.length, 0);
  const completedTasks = goals.reduce(
    (sum, g) => sum + g.tasks.filter((t) => t.completed).length,
    0
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TimeReminder />
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name || "Champion"} 👋
            </h1>
            <p className="text-[var(--muted)] mt-1">{motivation}</p>
          </div>
          <div className="flex gap-4 items-center">
            {streak && (
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--accent)]">
                  {streak.current}🔥
                </div>
                <div className="text-xs text-[var(--muted)]">day streak</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--secondary)]">
                {Math.round(score)}%
              </div>
              <div className="text-xs text-[var(--muted)]">today</div>
            </div>
          </div>
        </div>

        <ReminderBanner
          incompleteCount={totalTasks - completedTasks}
          totalCount={totalTasks}
          lastCheckInTime={lastCheckInTime}
          onRefresh={fetchData}
        />

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--muted)]">Daily Progress</span>
            <span className="text-[var(--muted)]">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <div className="h-3 bg-[var(--card)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full transition-all duration-500"
              style={{
                width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🎯</span>
            <h2 className="text-xl font-semibold mb-2">No goals yet</h2>
            <p className="text-[var(--muted)] mb-6">
              Create your first goal to start tracking your progress
            </p>
            <a
              href="/goals"
              className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
            >
              Create a Goal
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <span className="ml-auto text-xs text-[var(--muted)]">
                    {goal.tasks.filter((t) => t.completed).length}/
                    {goal.tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {goal.tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--background)]/50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        className="w-5 h-5 rounded border-[var(--border)] accent-[var(--primary)] cursor-pointer"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          task.completed
                            ? "line-through text-[var(--muted)]"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.completed && (
                        <span className="text-[var(--secondary)]">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
