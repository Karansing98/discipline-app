"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface SleepRecord {
  id: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  hours: number;
}

export default function SleepPage() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/sleep");
      const data = await res.json();
      setRecords(data.records || []);

      if (data.records && data.records.length > 0) {
        const latest = data.records[0];
        setSleepTime(latest.sleepTime);
        setWakeTime(latest.wakeTime);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);

    const res = await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sleepTime, wakeTime }),
    });

    if (res.ok) {
      const data = await res.json();
      setRecords((prev) => {
        const filtered = prev.filter((r) => r.date !== data.record.date);
        return [data.record, ...filtered];
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  const avgHours =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.hours, 0) / records.length
      : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🌙</span>
          <h1 className="text-2xl font-bold">Sleep Tracker</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8"
        >
          <h2 className="font-semibold mb-4">Log Today&apos;s Sleep</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
          >
            {saved ? "Saved! ✓" : "Save"}
          </button>
        </form>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-2">Sleep Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-[var(--background)]">
              <div className="text-2xl font-bold text-[var(--secondary)]">
                {avgHours.toFixed(1)}h
              </div>
              <div className="text-xs text-[var(--muted)]">Avg sleep</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--background)]">
              <div className="text-2xl font-bold text-[var(--primary)]">
                {records.length}
              </div>
              <div className="text-xs text-[var(--muted)]">Nights logged</div>
            </div>
          </div>
        </div>

        {records.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Recent Records</h2>
            <div className="space-y-2">
              {records.slice(0, 14).map((r) => (
                <div
                  key={r.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm">
                    {new Date(r.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {r.sleepTime} - {r.wakeTime}
                  </span>
                  <span className="text-sm font-semibold text-[var(--secondary)]">
                    {r.hours.toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
