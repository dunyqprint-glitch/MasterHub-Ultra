import React from 'react';
import { Achievement } from '../types';
import { ACHIEVEMENTS } from '../utils/achievements';

interface AchievementsProps {
  totalCompleted: number;
}

export const Achievements: React.FC<AchievementsProps> = ({ totalCompleted }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
      <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        เหรียญเกียรติยศ (Achievements)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = totalCompleted >= a.threshold;
          return (
            <div
              key={a.id}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition ${
                isUnlocked
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 opacity-60'
              }`}
            >
              <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{a.icon}</div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{a.name}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{a.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
