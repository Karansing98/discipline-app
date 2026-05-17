"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Mode = "focus" | "break";

export default function FocusPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [goalTitle, setGoalTitle] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(async (res) => {
      const data = await res.json();
      if (!data.user) router.push("/login");
    });
  }, [router]);

  function reset(useMode: Mode) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(useMode);
    if (useMode === "focus") {
      setMinutes(25);
      setSeconds(0);
    } else {
      setMinutes(5);
      setSeconds(0);
    }
  }

  function start() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        setMinutes((m) => {
          if (m > 0) return m - 1;
          return 0;
        });
        return 59;
      });
    }, 1000);
  }

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }

  useEffect(() => {
    if (minutes === 0 && seconds === 0 && running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);

      if (mode === "focus") {
        setSessions((s) => s + 1);
        reset("break");
      } else {
        reset("focus");
      }
    }
  }, [minutes, seconds, running, mode]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalSeconds = minutes * 60 + seconds;
  const totalInitial = mode === "focus" ? 25 * 60 : 5 * 60;
  const progress = ((totalInitial - totalSeconds) / totalInitial) * 100;

  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Focus Mode</h1>
        <p className="text-[var(--muted)] mb-8">
          {mode === "focus" ? "Time to focus on your goals" : "Take a short break"}
        </p>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 mb-6">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--border)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={mode === "focus" ? "var(--primary)" : "var(--secondary)"}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold tabular-nums">{timeStr}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => reset("focus")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === "focus"
                  ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                  : "bg-[var(--card-hover)] text-[var(--muted)]"
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => reset("break")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === "break"
                  ? "bg-[var(--secondary)]/20 text-[var(--secondary)]"
                  : "bg-[var(--card-hover)] text-[var(--muted)]"
              }`}
            >
              Break (5m)
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            {!running ? (
              <button
                onClick={start}
                className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pause}
                className="px-8 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent)]/80 transition-colors"
              >
                Pause
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-[var(--muted)]">
          Sessions completed today: <strong className="text-[var(--foreground)]">{sessions}</strong>
        </div>
      </main>
    </div>
  );
}
