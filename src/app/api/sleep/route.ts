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
    const records = await prisma.sleepRecord.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { sleepTime, wakeTime } = await req.json();
    const today = getTodayStart();

    if (!sleepTime || !wakeTime) {
      return NextResponse.json(
        { error: "sleepTime and wakeTime are required" },
        { status: 400 }
      );
    }

    const [sh, sm] = sleepTime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    const sleepMinutes = sh * 60 + sm;
    const wakeMinutes = wh * 60 + wm;
    let hours = (wakeMinutes - sleepMinutes) / 60;
    if (hours < 0) hours += 24;

    const record = await prisma.sleepRecord.upsert({
      where: { userId_date: { userId, date: today } },
      update: { sleepTime, wakeTime, hours },
      create: { userId, date: today, sleepTime, wakeTime, hours },
    });

    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
