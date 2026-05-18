"use client";

import { useEffect, useState, useCallback } from "react";

interface Props {
  incompleteCount: number;
  totalCount: number;
  lastCheckInTime: Date | null;
  onRefresh: () => void;
}

export default function ReminderBanner({
  incompleteCount,
  totalCount,
  lastCheckInTime,
  onRefresh,
}: Props) {
  const [timeAgo, setTimeAgo] = useState("");
  const [notifSent, setNotifSent] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (isBrowser && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isBrowser]);

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (!isBrowser || !("Notification" in window)) return;
      if (Notification.permission === "granted" && !notifSent) {
        new Notification(title, { body });
        setNotifSent(true);
      }
    },
    [notifSent, isBrowser]
  );

  useEffect(() => {
    function update() {
      if (!lastCheckInTime) { setTimeAgo("never"); return; }
      const diff = Date.now() - lastCheckInTime.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) setTimeAgo("just now");
      else if (mins < 60) setTimeAgo(`${mins}m ago`);
      else setTimeAgo(`${Math.floor(mins / 60)}h ${mins % 60}m ago`);
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [lastCheckInTime]);

  useEffect(() => {
    if (incompleteCount > 0 && !notifSent && isBrowser) {
      const timer = setTimeout(() => {
        sendNotification("⏰ Tasks Waiting!", `You have ${incompleteCount} incomplete task${incompleteCount > 1 ? "s" : ""}. Don't break your streak!`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [incompleteCount, notifSent, sendNotification, isBrowser]);

  useEffect(() => {
    if (!isBrowser) return;
    function handleVisibility() {
      if (document.visibilityState === "visible" && incompleteCount > 0 && "Notification" in window && Notification.permission === "granted") {
        new Notification("👋 Welcome Back!", { body: `You have ${incompleteCount} task${incompleteCount > 1 ? "s" : ""} waiting. Let's finish them!` });
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [incompleteCount, isBrowser]);

  if (incompleteCount === 0) {
    return (
      <div className="bg-gradient-to-r from-[var(--secondary)]/20 to-[var(--primary)]/20 border border-[var(--secondary)]/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-semibold text-[var(--secondary)]">All tasks completed!</p>
          <p className="text-sm text-[var(--muted)]">
            You're on track. Great discipline!
            {timeAgo !== "just now" && ` Last checked: ${timeAgo}`}
          </p>
        </div>
      </div>
    );
  }

  const urgency = incompleteCount === totalCount ? "high" : incompleteCount > totalCount / 2 ? "medium" : "low";

  const colors: Record<string, string> = {
    high: "from-red-500/20 to-orange-500/10 border-red-500/30",
    medium: "from-yellow-500/20 to-[var(--primary)]/10 border-yellow-500/30",
    low: "from-blue-500/20 to-[var(--primary)]/10 border-blue-500/30",
  };

  const messages: Record<string, string> = {
    high: "You haven't started today's tasks yet! Every goal begins with a single step.",
    medium: "More than half your tasks are waiting. Don't let today slip away.",
    low: "Almost there! Just a few tasks remaining. Finish strong!",
  };

  return (
    <div className={`bg-gradient-to-r ${colors[urgency]} border rounded-2xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{urgency === "high" ? "⏰" : urgency === "medium" ? "⚠️" : "💪"}</span>
        <div className="flex-1">
          <p className="font-semibold">{incompleteCount} task{incompleteCount > 1 ? "s" : ""} incomplete</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {timeAgo !== "never" ? `Last checked in ${timeAgo} · ${messages[urgency]}` : messages[urgency]}
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={onRefresh} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors">
              Check Now
            </button>
            {isBrowser && "Notification" in window && Notification.permission === "default" && (
              <button onClick={() => Notification.requestPermission()} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--card)] transition-colors">
                Enable Reminders
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
