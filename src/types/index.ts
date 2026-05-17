export interface GoalWithTasks {
  id: string;
  title: string;
  emoji: string;
  color: string;
  tasks: TaskWithCompletion[];
}

export interface TaskWithCompletion {
  id: string;
  title: string;
  goalId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface DailyProgress {
  date: string;
  score: number;
  completedTasks: number;
  totalTasks: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastDate: string | null;
}
