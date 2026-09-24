import { GoalItem, StepItem } from '../types';

export function calculateGoalStats(goal: GoalItem) {
  const steps = goal.steps || [];
  const total = steps.length;
  const completed = steps.filter((s) => s.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Streak calculation:
  // Sort steps by date ascending
  const sorted = [...steps].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (const s of sorted) {
    if (s.completed) {
      streak++;
    } else {
      break;
    }
  }

  // Find next pending step
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStep = steps.find((s) => s.date === todayStr);
  const nextPendingStep = steps.find((s) => !s.completed);

  return {
    total,
    completed,
    percentage,
    streak,
    todayStep,
    nextPendingStep,
    isComplete: total > 0 && completed === total,
  };
}

export function calculateOverallStats(goals: Record<string, GoalItem>) {
  const goalList = Object.values(goals);
  const totalGoals = goalList.length;

  let totalStepsCount = 0;
  let completedStepsCount = 0;
  let totalPercentSum = 0;
  let maxStreak = 0;

  let workGoalsCount = 0;
  let personalGoalsCount = 0;

  goalList.forEach((goal) => {
    if (goal.category === 'work') workGoalsCount++;
    if (goal.category === 'personal') personalGoalsCount++;

    const stats = calculateGoalStats(goal);
    totalStepsCount += stats.total;
    completedStepsCount += stats.completed;
    totalPercentSum += stats.percentage;
    if (stats.streak > maxStreak) {
      maxStreak = stats.streak;
    }
  });

  const avgCompletion = totalGoals > 0 ? Math.round(totalPercentSum / totalGoals) : 0;

  return {
    totalGoals,
    workGoalsCount,
    personalGoalsCount,
    avgCompletion,
    maxStreak,
    totalStepsCount,
    completedStepsCount,
  };
}
