import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await requireAuth();

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: last30 },
      },
      orderBy: { date: "asc" },
    });

    const totalDays = checkIns.length;
    const avgScore =
      totalDays > 0
        ? checkIns.reduce((sum, c) => sum + c.score, 0) / totalDays
        : 0;

    const perfectDays = checkIns.filter((c) => c.score === 100).length;

    const streak = await prisma.streak.findUnique({ where: { userId } });

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: {
          include: {
            completions: {
              where: {
                completedAt: { gte: last30 },
              },
            },
          },
        },
      },
    });

    const goalStats = goals.map((g) => {
      const totalCompletions = g.tasks.reduce(
        (sum, t) => sum + t.completions.length,
        0
      );
      return {
        id: g.id,
        title: g.title,
        emoji: g.emoji,
        totalCompletions,
      };
    });

    return NextResponse.json({
      totalDays,
      avgScore: Math.round(avgScore),
      perfectDays,
      currentStreak: streak?.current ?? 0,
      longestStreak: streak?.longest ?? 0,
      dailyScores: checkIns.map((c) => ({
        date: c.date.toISOString().split("T")[0],
        score: c.score,
      })),
      goalStats,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
