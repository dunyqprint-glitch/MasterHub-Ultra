import React from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Briefcase,
  Target,
  ArrowLeft,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { GoalItem, DailyReflection, AntiGoalItem } from '../types';
import { calculateOverallStats, calculateGoalStats } from '../utils/analytics';
import { getTodayString } from '../utils/storage';

interface AnalyticsViewProps {
  goals: Record<string, GoalItem>;
  reflections: Record<string, Record<string, DailyReflection>>;
  antiGoals: Record<string, AntiGoalItem[]>;
  onBackToDashboard: () => void;
  onSelectGoal: (key: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  goals,
  reflections,
  antiGoals,
  onBackToDashboard,
  onSelectGoal,
}) => {
  const overallStats = calculateOverallStats(goals);
  const todayStr = getTodayString();

  // Mood counting
  const moodCounts = { '🔥': 0, '💪': 0, '🌱': 0, '⚡': 0 };
  Object.values(reflections).forEach((goalRefMap) => {
    Object.values(goalRefMap).forEach((r) => {
      if (r.mood && moodCounts[r.mood] !== undefined) {
        moodCounts[r.mood]++;
      }
    });
  });

  // Anti-Goal stats
  let totalAntiGoals = 0;
  let avoidedAntiGoals = 0;
  Object.values(antiGoals).forEach((list) => {
    list.forEach((ag) => {
      totalAntiGoals++;
      if (ag.avoided) avoidedAntiGoals++;
    });
  });
  const antiGoalAvoidRate =
    totalAntiGoals > 0 ? Math.round((avoidedAntiGoals / totalAntiGoals) * 100) : 100;

  // Goals sorted by completion rate
  const goalItems = Object.entries(goals).map(([key, item]) => ({
    key,
    ...item,
    stats: calculateGoalStats(item),
  }));

  const sortedByCompletion = [...goalItems].sort(
    (a, b) => b.stats.percentage - a.stats.percentage
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ศูนย์วิเคราะห์ความก้าวหน้า & วินัย (Ultra Analytics)
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-1">
          <div className="text-xs text-zinc-400 font-medium">ความสำเร็จรวมทุกเป้าหมาย</div>
          <div className="text-2xl font-bold text-emerald-500">
            {overallStats.avgCompletion}%
          </div>
          <div className="text-[11px] text-zinc-500">
            {overallStats.completedStepsCount} / {overallStats.totalStepsCount} เช็คลิสต์
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-1">
          <div className="text-xs text-zinc-400 font-medium">สตรีคต่อเนื่องสูงสุด</div>
          <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
            <Flame className="w-5 h-5" />
            <span>{overallStats.maxStreak} วัน</span>
          </div>
          <div className="text-[11px] text-zinc-500">ความต่อเนื่องชนะทุกสิ่ง</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-1">
          <div className="text-xs text-zinc-400 font-medium">อัตราการเลี่ยง Anti-Goals</div>
          <div className="text-2xl font-bold text-rose-500 flex items-center gap-1">
            <ShieldCheck className="w-5 h-5" />
            <span>{antiGoalAvoidRate}%</span>
          </div>
          <div className="text-[11px] text-zinc-500">
            เลี่ยงพฤติกรรมหลุดโฟกัสได้ {avoidedAntiGoals}/{totalAntiGoals} ครั้ง
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-1">
          <div className="text-xs text-zinc-400 font-medium">สัดส่วนหมวดเป้าหมาย</div>
          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 pt-1 flex items-center gap-2">
            <span className="text-blue-500">💼 {overallStats.workGoalsCount} ธุรกิจ</span>
            <span>:</span>
            <span className="text-indigo-500">🎯 {overallStats.personalGoalsCount} วินัย</span>
          </div>
          <div className="text-[11px] text-zinc-500">สร้างความสมดุลทั้งงานและชีวิต</div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Performance Leaderboard */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>อันดับความคืบหน้ารายเป้าหมาย</span>
          </h3>

          <div className="space-y-3">
            {sortedByCompletion.map((g) => (
              <div
                key={g.key}
                onClick={() => onSelectGoal(g.key)}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60 hover:border-indigo-400/50 transition cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[70%]">
                    {g.category === 'work' ? '💼' : '🎯'} {g.title}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {g.stats.percentage}%
                  </span>
                </div>

                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      g.stats.percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${g.stats.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                  <span>
                    เสร็จ {g.stats.completed}/{g.stats.total} วัน
                  </span>
                  <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                    <Flame className="w-3 h-3" /> {g.stats.streak} วันติด
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood & Energy Distribution */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>สถิติพลังงานและอารมณ์ (Energy Distribution)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { mood: '🔥', label: 'ไฟแรง', count: moodCounts['🔥'], desc: 'พร้อมลุยงานเต็มที่' },
              { mood: '💪', label: 'สู้ชีวิต', count: moodCounts['💪'], desc: 'กัดฟันเอาชนะอุปสรรค' },
              { mood: '🌱', label: 'เรื่อยๆ', count: moodCounts['🌱'], desc: 'โฟกัสความสม่ำเสมอ' },
              { mood: '⚡', label: 'เหนื่อย', count: moodCounts['⚡'], desc: 'ต้องการการพักผ่อน' },
            ].map((m) => (
              <div
                key={m.mood}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60 flex items-center gap-3"
              >
                <div className="text-2xl p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
                  {m.mood}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {m.label}: {m.count} วัน
                  </div>
                  <div className="text-[10px] text-zinc-400">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Executive Insight Box */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
            <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              💡 บทวิเคราะห์จาก Master Coach:
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              เมื่อพลังงานลดลงสู่ระดับ ⚡ เหนื่อยหรือ 🌱 เรื่อยๆ ให้เปิดใช้ <strong>โหมดเพดานต่ำสุด (Min Floor Mode)</strong> ทันที เพื่อลดปริมาณงานเหลือเพียง 1 ข้อต่อวัน ซึ่งจะช่วยรักษาสตรีคความต่อเนื่องไว้ได้โดยไม่ต้องกดดันตัวเองเกินไป
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
