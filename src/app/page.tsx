import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold">Discipline Pro</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Personal
            <span className="text-[var(--primary)]"> Discipline</span> Companion
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
            Build unbreakable habits, stay consistent with your goals, and
            become the person you want to be — one day at a time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-[var(--primary)] text-white text-lg font-semibold hover:bg-[var(--primary-hover)] transition-all hover:scale-105"
            >
              Start Your Journey
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl border border-[var(--border)] text-lg font-semibold hover:bg-[var(--card)] transition-all"
            >
              I Already Have an Account
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Stay Disciplined
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
              >
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-[var(--muted)] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const features = [
  {
    icon: "🎯",
    title: "Goal-Based Tasks",
    desc: "Organize your daily tasks around specific life goals. Every task has a purpose.",
  },
  {
    icon: "🔥",
    title: "Streak System",
    desc: "Build momentum with visual streaks. Don't break the chain!",
  },
  {
    icon: "⏱️",
    title: "Focus Mode",
    desc: "Pomodoro timer to help you stay in deep work without distractions.",
  },
  {
    icon: "📊",
    title: "Progress Analytics",
    desc: "See your consistency score, trends, and improvement over time.",
  },
  {
    icon: "💪",
    title: "Daily Motivation",
    desc: "Get encouraging messages based on your progress and time of day.",
  },
  {
    icon: "🌙",
    title: "Sleep Tracking",
    desc: "Track sleep and wake-up times to build a healthy daily rhythm.",
  },
];
