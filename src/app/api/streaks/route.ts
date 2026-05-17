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

    let streak = await prisma.streak.findUnique({ where: { userId } });

    if (!streak) {
      streak = await prisma.streak.create({ data: { userId } });
    }

    const today = getTodayStart();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayCheckIn = await prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const yesterdayCheckIn = await prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date: yesterday } },
    });

    if (todayCheckIn && todayCheckIn.score > 0) {
      let newCurrent = streak.current;

      if (streak.lastDate) {
        const lastDate = new Date(streak.lastDate);
        const diffDays = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          newCurrent += 1;
        } else if (diffDays === 0) {
          newCurrent = streak.current;
        } else {
          newCurrent = 1;
        }
      } else {
        newCurrent = 1;
      }

      const newLongest = Math.max(newCurrent, streak.longest);

      streak = await prisma.streak.update({
        where: { userId },
        data: {
          current: newCurrent,
          longest: newLongest,
          lastDate: today,
        },
      });
    } else if (!yesterdayCheckIn && streak.lastDate) {
      const lastDate = new Date(streak.lastDate);
      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 1 && !todayCheckIn) {
        streak = await prisma.streak.update({
          where: { userId },
          data: { current: 0 },
        });
      }
    }

    return NextResponse.json({
      current: streak.current,
      longest: streak.longest,
      lastDate: streak.lastDate,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
