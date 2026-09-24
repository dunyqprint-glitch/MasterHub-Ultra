import React, { useState } from 'react';
import {
  Briefcase,
  Target,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Copy,
  Plus,
  Search,
  Calendar,
} from 'lucide-react';
import { GoalItem, ActiveTab } from '../types';
import { calculateGoalStats, calculateOverallStats } from '../utils/analytics';
import { getTodayString } from '../utils/storage';
import { Achievements } from './Achievements';

interface DashboardViewProps {
  goals: Record<string, GoalItem>;
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSelectGoal: (goalKey: string) => void;
  onDeleteGoal: (goalKey: string) => void;
  onDuplicateGoal: (goalKey: string) => void;
  onOpenCreateModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  goals,
  currentTab,
  onTabChange,
  onSelectGoal,
  onDeleteGoal,
  onDuplicateGoal,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');

  const overallStats = calculateOverallStats(goals);
  const todayStr = getTodayString();

  const goalKeys = Object.keys(goals);
  const filteredKeys = goalKeys.filter((key) => {
    const item = goals[key];
    if (!item) return false;

    // Tab filter
    if (currentTab !== 'all' && item.category !== currentTab) return false;

    // Search query
    if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    const stats = calculateGoalStats(item);
    if (filterStatus === 'in_progress' && stats.isComplete) return false;
    if (filterStatus === 'completed' && !stats.isComplete) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 3 Top Ultra Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Goals */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              รายการทั้งหมดในระบบ
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {overallStats.totalGoals}{' '}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">รายการ</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/70">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <Briefcase className="w-3 h-3" /> งาน {overallStats.workGoalsCount}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <Target className="w-3 h-3" /> วินัย {overallStats.personalGoalsCount}
            </span>
          </div>
        </div>

        {/* Overall Completion */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              ความสำเร็จภาพรวมเฉลี่ย
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {overallStats.avgCompletion}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallStats.avgCompletion}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            สำเร็จแล้ว {overallStats.completedStepsCount} จาก {overallStats.totalStepsCount} งานย่อย
          </p>
        </div>

        {/* Max Streak */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              🔥 Streak สูงสุดตอนนี้
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 animate-pulse">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-500">
            {overallStats.maxStreak}{' '}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">วันติด</span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/70">
            {overallStats.maxStreak > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                โมเมนตัมกำลังยอดเยี่ยม รักษาความสม่ำเสมอไว้!
              </span>
            ) : (
              <span>เริ่มต้นเช็คลิสต์วันนี้เพื่อสะสมสตรีคแรก</span>
            )}
          </div>
        </div>
      </div>

      <Achievements totalCompleted={overallStats.completedStepsCount} />

      {/* Category Tabs: Clean Ultra segmented switchers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onTabChange('work')}
          className={`p-4 rounded-3xl border text-left transition flex items-center justify-between cursor-pointer ${
            currentTab === 'work'
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-blue-400/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs opacity-75 font-medium">หมวดหมู่หลัก</div>
              <div className="text-sm font-bold">💼 งานธุรกิจ / ร้าน</div>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              currentTab === 'work'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {overallStats.workGoalsCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange('personal')}
          className={`p-4 rounded-3xl border text-left transition flex items-center justify-between cursor-pointer ${
            currentTab === 'personal'
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs opacity-75 font-medium">หมวดหมู่หลัก</div>
              <div className="text-sm font-bold">🎯 วินัย / ส่วนตัว</div>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              currentTab === 'personal'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {overallStats.personalGoalsCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange('all')}
          className={`p-4 rounded-3xl border text-left transition flex items-center justify-between cursor-pointer ${
            currentTab === 'all'
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-purple-400/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs opacity-75 font-medium">หมวดหมู่ทั้งหมด</div>
              <div className="text-sm font-bold">🌟 รวมทุกมิติ</div>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              currentTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {overallStats.totalGoals}
          </span>
        </button>
      </div>

      {/* Main Listing Section */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              {currentTab === 'work' && '💼 รายการงานธุรกิจ / ร้านค้า'}
              {currentTab === 'personal' && '🎯 รายการวินัย / พัฒนาส่วนตัว'}
              {currentTab === 'all' && '🌟 รายการทั้งหมดในระบบ'}
            </h2>
            <span className="text-xs text-zinc-400">({filteredKeys.length} รายการ)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารายการ..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
              />
            </div>

            {/* Status select */}
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              aria-label="กรองสถานะรายการ"
              className="bg-zinc-50 dark:bg-zinc-800/70 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 focus:outline-none text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="completed">สำเร็จครบ 100%</option>
            </select>

            <button
              onClick={onOpenCreateModal}
              className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>สร้างใหม่</span>
            </button>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredKeys.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              ไม่พบรายการในหมวดหมู่นี้
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              คุณสามารถกดปุ่มสร้างรายการใหม่ หรือใช้ระบบ AI Master Coach ช่วยวางแผนและสร้างนิสัยให้โดยอัตโนมัติ
            </p>
            <button
              onClick={onOpenCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl font-medium transition cursor-pointer shadow-xs"
            >
              + สร้างรายการเป้าหมายแรก
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKeys.map((key) => {
              const item = goals[key];
              const stats = calculateGoalStats(item);

              // Find if there's a task scheduled for today
              const todayTask = item.steps?.find((s) => s.date === todayStr);

              return (
                <div
                  key={item.id || key}
                  className="bg-zinc-50/70 dark:bg-zinc-800/40 p-4.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 group relative"
                >
                  {/* Top Category & Actions */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 overflow-hidden">
                      {item.category === 'work' ? (
                        <span className="text-[11px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" /> งานธุรกิจ / ร้าน
                        </span>
                      ) : (
                        <span className="text-[11px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" /> วินัย / ส่วนตัว
                        </span>
                      )}

                      <h3
                        onClick={() => onSelectGoal(key)}
                        className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors pt-1"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onDuplicateGoal(key)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition"
                        title="ทำสำเนาเป้าหมายนี้"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(key)}
                        className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg transition"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Today's Step Banner if available */}
                  {todayTask ? (
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        todayTask.completed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span className="font-medium truncate">
                          วันนี้: {todayTask.text.replace(/^วันที่ \d+:\s*/, '')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 bg-white/60 dark:bg-zinc-900/60">
                        {todayTask.completed ? '✅ สำเร็จแล้ว' : '⏳ รอทำ'}
                      </span>
                    </div>
                  ) : stats.nextPendingStep ? (
                    <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-800/60 text-xs flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 truncate">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        ขั้นต่อไป: {stats.nextPendingStep.text.replace(/^วันที่ \d+:\s*/, '')}
                      </span>
                    </div>
                  ) : null}

                  {/* Progress & Streak Stats */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        ความสำเร็จ:{' '}
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          {stats.completed}/{stats.total}
                        </strong>{' '}
                        ({stats.percentage}%)
                      </span>
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {stats.streak} วันติด
                      </span>
                    </div>

                    <div className="w-full bg-zinc-200/80 dark:bg-zinc-700/60 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          stats.percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Manage Button */}
                  <button
                    onClick={() => onSelectGoal(key)}
                    className="w-full mt-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-[0.99] shadow-xs"
                  >
                    <span>จัดการรายการนี้</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
