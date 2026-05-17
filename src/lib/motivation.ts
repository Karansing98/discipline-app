const messages = {
  morning: [
    "Rise and shine! A new day to conquer your goals.",
    "Today is the perfect day to start something great.",
    "Your only limit is you. Let's go!",
    "Small steps every day lead to big results.",
    "Discipline is choosing what you want most over what you want now.",
  ],
  afternoon: [
    "Keep going! You're doing amazing.",
    "Half the day is done. Stay focused!",
    "Don't stop now. Great things take time.",
    "Your consistency is building something powerful.",
    "Every task you complete brings you closer to your goal.",
  ],
  evening: [
    "Great job today! Rest and recharge for tomorrow.",
    "Reflect on your progress. Every bit counts.",
    "You showed up today. That's a win.",
    "Tomorrow is another opportunity to grow.",
    "Be proud of yourself. You're becoming disciplined.",
  ],
  streak: [
    "🔥 You're on fire! Keep that streak alive!",
    "Don't break the chain! Your streak is inspiring.",
    "Consistency is key. You've got this!",
    "Your streak proves you're unstoppable!",
    "One more day! Your discipline is legendary.",
  ],
  milestone: [
    "🎉 Congratulations on completing your goal!",
    "You did it! All your hard work paid off.",
    "This is just the beginning. On to the next goal!",
    "Amazing achievement! You're a true discipline master.",
  ],
  encouragement: [
    "It's okay to have an off day. Tomorrow is fresh.",
    "Progress, not perfection. Keep moving forward.",
    "You're stronger than your excuses.",
    "The best time to start was yesterday. The next best time is now.",
    "Your future self will thank you for today's effort.",
  ],
};

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function getMotivationalMessage(
  streak?: number,
  justCompleted?: boolean
): string {
  if (justCompleted) {
    const msgs = messages.milestone;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  if (streak && streak >= 3 && Math.random() < 0.3) {
    const msgs = messages.streak;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  const timeOfDay = getTimeOfDay();
  const msgs = messages[timeOfDay];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export function getEncouragement(): string {
  const msgs = messages.encouragement;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
