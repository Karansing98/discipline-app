import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { taskId, completed, note } = await req.json();
    const today = getTodayStart();

    let checkIn = await prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!checkIn) {
      checkIn = await prisma.dailyCheckIn.create({
        data: { userId, date: today, score: 0, note: note || "" },
      });
    } else if (note !== undefined) {
      checkIn = await prisma.dailyCheckIn.update({
        where: { id: checkIn.id },
        data: { note },
      });
    }

    const existing = await prisma.taskCompletion.findFirst({
      where: { taskId, checkInId: checkIn.id },
    });

    if (completed && !existing) {
      await prisma.taskCompletion.create({
        data: { taskId, checkInId: checkIn.id },
      });
    } else if (!completed && existing) {
      await prisma.taskCompletion.delete({ where: { id: existing.id } });
    }

    const totalTasks = await prisma.task.count({
      where: {
        goal: { userId },
      },
    });

    const completedCount = await prisma.taskCompletion.count({
      where: { checkInId: checkIn.id },
    });

    const score = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    await prisma.dailyCheckIn.update({
      where: { id: checkIn.id },
      data: { score },
    });

    const result = await prisma.dailyCheckIn.findUnique({
      where: { id: checkIn.id },
      include: {
        completions: {
          include: { task: { include: { goal: true } } },
        },
      },
    });

    return NextResponse.json({ checkIn: result, score });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
