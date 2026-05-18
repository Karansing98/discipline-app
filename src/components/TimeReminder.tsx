"use client";

import { useEffect, useRef } from "react";

interface TaskDue {
  title: string;
  goalTitle: string;
  emoji: string;
  taskId: string;
}

// This component runs silently in the background on the Dashboard
// It checks every 30 seconds if any task's scheduled time has arrived
export default function TimeReminder() {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();

    const checkDueTasks = async () => {
      try {
        const res = await fetch("/api/checkin/today");
        const data = await res.json();
        const goals = data.goals || [];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const due: TaskDue[] = [];

        for (const goal of goals) {
          for (const task of goal.tasks) {
            if (task.completed) continue;
            if (!task.scheduledTime) continue;

            // Check if snoozed
            if (task.snoozedUntil) {
              const snoozed = new Date(task.snoozedUntil);
              if (snoozed.getTime() > now.getTime()) continue;
            }

            const [th, tm] = task.scheduledTime.split(":").map(Number);
            const taskMinutes = th * 60 + tm;
            const diff = currentMinutes - taskMinutes;

            // Notify if within 0-2 minutes of scheduled time
            // And not already notified for this task today
            if (diff >= 0 && diff <= 2) {
              const key = `${task.id}-${currentTimeStr.slice(0, 5)}`;
              if (!notifiedRef.current.has(key)) {
                due.push({
                  title: task.title,
                  goalTitle: goal.title,
                  emoji: goal.emoji,
                  taskId: task.id,
                });
                notifiedRef.current.add(key);
              }
            }
          }
        }

        for (const d of due) {
          if (Notification.permission === "granted") {
            new Notification(`⏰ ${d.emoji} ${d.goalTitle}`, {
              body: `Time to do: ${d.title}`,
            });
          }
        }
      } catch {}
    };

    checkDueTasks();
    const interval = setInterval(checkDueTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
