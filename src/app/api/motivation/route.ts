import { NextResponse } from "next/server";
import { getMotivationalMessage, getEncouragement } from "@/lib/motivation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const streak = parseInt(searchParams.get("streak") || "0");
  const justCompleted = searchParams.get("completed") === "true";

  const message = getMotivationalMessage(streak, justCompleted);
  const encouragement = getEncouragement();

  return NextResponse.json({ message, encouragement });
}
