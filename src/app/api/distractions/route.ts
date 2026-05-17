import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await requireAuth();
    const logs = await prisma.distractionLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { category, duration, note } = await req.json();

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const log = await prisma.distractionLog.create({
      data: {
        userId,
        date: new Date(),
        category,
        duration: duration || 0,
        note: note || "",
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
