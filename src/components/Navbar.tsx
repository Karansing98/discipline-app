"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/goals", label: "Goals", icon: "🎯" },
  { href: "/focus", label: "Focus", icon: "⏱️" },
  { href: "/sleep", label: "Sleep", icon: "🌙" },
  { href: "/distractions", label: "Focus", icon: "🚫" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="text-xl">⚡</span>
          <span className="hidden sm:inline">Discipline Pro</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                pathname === l.href
                  ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                  : "hover:bg-[var(--card)] text-[var(--muted)]"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--card)] transition-colors"
        >
          Logout
        </button>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden px-2 py-1 rounded-lg hover:bg-[var(--card)]"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-2 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${
                pathname === l.href
                  ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                  : "hover:bg-[var(--card)] text-[var(--muted)]"
              }`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
