export type GoalCategory = 'work' | 'personal';
export type GoalType = 'habit' | 'custom' | 'ai_generated';
export type MoodType = '🔥' | '💪' | '🌱' | '⚡';

export interface StepItem {
  id: number;
  text: string;
  date: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface GoalItem {
  id: string;
  title: string;
  category: GoalCategory;
  type: GoalType;
  totalDays: number;
  startDate: string;
  steps: StepItem[];
  createdAt: string;
  description?: string;
}

export interface AntiGoalItem {
  id: number;
  text: string;
  avoided: boolean;
}

export interface DailyReflection {
  mood: MoodType;
  note: string;
  updatedAt: string;
}

export interface CoachChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ActiveTab = 'work' | 'personal' | 'all';
export type ActiveView = 'dashboard' | 'detail' | 'analytics' | 'coach';
