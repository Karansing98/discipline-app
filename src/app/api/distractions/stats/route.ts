import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await requireAuth();

    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);

    const logs = await prisma.distractionLog.findMany({
      where: { userId, date: { gte: last7 } },
    });

    const totalTime = logs.reduce((s, l) => s + l.duration, 0);
    const totalCount = logs.length;

    const byCategory: Record<string, number> = {};
    const byCategoryCount: Record<string, number> = {};
    for (const l of logs) {
      byCategory[l.category] = (byCategory[l.category] || 0) + l.duration;
      byCategoryCount[l.category] = (byCategoryCount[l.category] || 0) + 1;
    }

    const dailyTotals: Record<string, number> = {};
    for (const l of logs) {
      const day = l.date.toISOString().split("T")[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + l.duration;
    }

    const topDistraction = Object.entries(byCategory).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const reCommitMessage = getReCommitMessage(topDistraction?.[0], totalTime);

    return NextResponse.json({
      totalTime,
      totalCount,
      byCategory,
      byCategoryCount,
      dailyTotals,
      topDistraction: topDistraction?.[0] || null,
      reCommitMessage,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

function getReCommitMessage(
  topDistraction: string | undefined,
  totalMinutes: number
): string {
  if (!topDistraction || totalMinutes === 0) {
    return "You've been distraction-free! Keep up the incredible focus! 🎯";
  }

  const messages: Record<string, string[]> = {
    social_media: [
      "Social media is designed to steal your attention. Every scroll is a vote for someone else's goal, not yours. Close the apps. Your future self will thank you.",
      "That notification can wait. Your goals can't. Put the phone down and take one action toward what matters.",
      "You've spent {m} minutes on social media. Imagine what you could have learned in that time. Start now.",
    ],
    tv: [
      "TV is entertainment. Your goals are transformation. Choose transformation. Turn it off and do 5 minutes of your task.",
      "One episode leads to another. Before you know it, the day is gone. Pause. Remember why you started.",
      "You've watched {m} minutes of TV. Use that same time to invest in yourself instead.",
    ],
    gaming: [
      "Games are built to be addictive. The real level-up happens in real life. Save your progress and work on your actual goals.",
      "One more game? That's what you always say. Your streak doesn't wait. Get back to your goals now.",
      "You've spent {m} minutes gaming. That's {m} minutes of progress you'll never get back. Start making every minute count.",
    ],
    phone_browsing: [
      "Your phone is a tool, not a master. Put it down for 25 minutes. Focus on one task. You'll be amazed what you accomplish.",
      "Endless scrolling is stealing your time. Close the browser. Open your goals. Take one step forward.",
      "You've spent {m} minutes browsing aimlessly. Redirect that energy into your discipline. You'll feel so much better.",
    ],
    other: [
      "Every moment you spend on distractions, you're choosing short-term pleasure over long-term growth. Make the conscious choice to refocus.",
      "You caught yourself getting distracted. That's the first win. Now the second win is getting back to your goal. Do it now.",
      "Discipline isn't about never getting distracted. It's about how fast you come back. Come back now. You've got this.",
    ],
  };

  const msgList = messages[topDistraction] || messages.other;
  const msg = msgList[Math.floor(Math.random() * msgList.length)];
  return msg.replace("{m}", String(totalMinutes));
}
