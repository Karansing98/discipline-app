import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await requireAuth();
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ goals });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { title, emoji, color } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        emoji: emoji || "🎯",
        color: color || "#6366f1",
      },
      include: { tasks: true },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
