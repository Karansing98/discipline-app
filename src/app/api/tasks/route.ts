import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { goalId, title } = await req.json();

    if (!goalId || !title) {
      return NextResponse.json(
        { error: "goalId and title are required" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: { goalId, title },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
