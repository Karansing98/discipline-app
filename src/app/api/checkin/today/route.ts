import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    const userId = await requireAuth();
    const today = getTodayStart();

    let checkIn = await prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date: today } },
      include: {
        completions: {
          include: { task: { include: { goal: true } } },
        },
      },
    });

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: { tasks: true },
      orderBy: { createdAt: "desc" },
    });

    const completedTaskIds = new Set(
      checkIn?.completions.map((c) => c.taskId) ?? []
    );

    const goalsWithStatus = goals.map((g) => ({
      ...g,
      tasks: g.tasks.map((t) => ({
        ...t,
        completed: completedTaskIds.has(t.id),
        completedAt: checkIn?.completions.find((c) => c.taskId === t.id)
          ?.completedAt,
      })),
    }));

    return NextResponse.json({
      checkIn,
      goals: goalsWithStatus,
      score: checkIn?.score ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
