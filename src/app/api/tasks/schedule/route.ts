import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST: Schedule a task at a specific time
export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { taskId, scheduledTime } = await req.json();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { goal: true },
    });

    if (!task || task.goal.userId !== userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { scheduledTime: scheduledTime || "", snoozedUntil: null },
    });

    return NextResponse.json({ task: updated });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PUT: Snooze a task until later
export async function PUT(req: Request) {
  try {
    const userId = await requireAuth();
    const { taskId, snoozeMinutes } = await req.json();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { goal: true },
    });

    if (!task || task.goal.userId !== userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const snoozedUntil = new Date(Date.now() + (snoozeMinutes || 30) * 60 * 1000);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { snoozedUntil },
    });

    return NextResponse.json({ task: updated, snoozedUntil: snoozedUntil.toISOString() });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
