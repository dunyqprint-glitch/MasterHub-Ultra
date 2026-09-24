import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Bot,
  Plus,
  Trash2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Check,
  RefreshCw,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { GoalItem, MoodType, AntiGoalItem, DailyReflection } from '../types';
import { calculateGoalStats } from '../utils/analytics';
import { getTodayString, exportToExcelFile } from '../utils/storage';
import { fireCelebration, fireMegaMilestone } from '../utils/confetti';

interface GoalDetailViewProps {
  currentGoalKey: string;
  goals: Record<string, GoalItem>;
  onSelectGoal: (key: string) => void;
  onBackToDashboard: () => void;
  onUpdateGoal: (updatedGoal: GoalItem) => void;
  onDeleteGoal: (key: string) => void;
  antiGoals: Record<string, AntiGoalItem[]>;
  onUpdateAntiGoals: (updated: Record<string, AntiGoalItem[]>) => void;
  reflections: Record<string, Record<string, DailyReflection>>;
  onUpdateReflections: (updated: Record<string, Record<string, DailyReflection>>) => void;
  onOpenCoachHub: () => void;
}

export const GoalDetailView: React.FC<GoalDetailViewProps> = ({
  currentGoalKey,
  goals,
  onSelectGoal,
  onBackToDashboard,
  onUpdateGoal,
  onDeleteGoal,
  antiGoals,
  onUpdateAntiGoals,
  reflections,
  onUpdateReflections,
  onOpenCoachHub,
}) => {
  const goal = goals[currentGoalKey];
  const todayStr = getTodayString();

  // Filters & Toggles
  const [filterStep, setFilterStep] = useState<'today' | 'all' | 'pending' | 'completed'>('today');
  const [isMinMode, setIsMinMode] = useState<boolean>(false);

  // New sub-item inputs
  const [newSubText, setNewSubText] = useState('');
  const [newSubDate, setNewSubDate] = useState(todayStr);

  // Anti-Goal input
  const [newAntiGoalText, setNewAntiGoalText] = useState('');

  // AI Advice state
  const [aiAdvice, setAiAdvice] = useState<string>('กำลังประมวลผลคำแนะนำจาก AI Master Coach...');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [adviceSource, setAdviceSource] = useState<'gemini' | 'local' | 'fallback'>('local');

  // Reflection state
  const currentReflection = reflections[currentGoalKey]?.[todayStr] || {
    mood: '🔥',
    note: '',
    updatedAt: new Date().toISOString(),
  };

  // Pomodoro Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      fireCelebration();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fetch AI Coaching Advice
  const fetchAdvice = async () => {
    if (!goal) return;
    setIsLoadingAdvice(true);
    try {
      const stats = calculateGoalStats(goal);
      const res = await fetch('/api/coach/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalName: goal.title,
          category: goal.category,
          completionRate: stats.percentage,
          streak: stats.streak,
          todayStep: stats.todayStep?.text || stats.nextPendingStep?.text || null,
          mood: currentReflection.mood,
          note: currentReflection.note,
          antiGoals: (antiGoals[todayStr] || []).map((ag) => ag.text),
          isMinMode,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.advice || 'ตั้งสมาธิกับงานชิ้นแรก แล้วความต่อเนื่องจะพาคุณไปถึงเป้าหมาย');
      setAdviceSource(data.source || 'local');
    } catch {
      setAiAdvice('💡 คำแนะนำ: เริ่มจากภารกิจ 25 นาทีแรกของวัน ลงมือทำทันทีโดยไม่ลังเล!');
      setAdviceSource('fallback');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [currentGoalKey, isMinMode]);

  if (!goal) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-zinc-500">ไม่พบรายการเป้าหมายนี้</p>
        <button
          onClick={onBackToDashboard}
          className="text-xs bg-zinc-900 text-white px-4 py-2 rounded-xl"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const stats = calculateGoalStats(goal);

  // Toggle step completion
  const handleToggleStep = (stepId: number) => {
    const updatedSteps = (goal.steps || []).map((s) => {
      if (s.id === stepId) {
        const nextState = !s.completed;
        if (nextState) {
          fireCelebration();
        }
        return { ...s, completed: nextState };
      }
      return s;
    });

    const updatedGoal = { ...goal, steps: updatedSteps };
    onUpdateGoal(updatedGoal);

    // If reached 100%
    const newStats = calculateGoalStats(updatedGoal);
    if (newStats.percentage === 100) {
      fireMegaMilestone();
    }
  };

  // Add custom step
  const handleAddSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubText.trim()) return;

    const newStep = {
      id: Date.now(),
      text: newSubText.trim(),
      date: newSubDate || todayStr,
      completed: false,
    };

    const updatedSteps = [...(goal.steps || []), newStep];
    onUpdateGoal({ ...goal, steps: updatedSteps });
    setNewSubText('');
  };

  // Remove sub-step
  const handleRemoveStep = (stepId: number) => {
    const updatedSteps = (goal.steps || []).filter((s) => s.id !== stepId);
    onUpdateGoal({ ...goal, steps: updatedSteps });
  };

  // Anti-Goal actions
  const todayAntiGoals = antiGoals[todayStr] || [];

  const handleAddAntiGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAntiGoalText.trim()) return;

    const newAg: AntiGoalItem = {
      id: Date.now(),
      text: newAntiGoalText.trim(),
      avoided: false,
    };

    const updated = {
      ...antiGoals,
      [todayStr]: [...todayAntiGoals, newAg],
    };
    onUpdateAntiGoals(updated);
    setNewAntiGoalText('');
  };

  const handleToggleAntiGoal = (id: number) => {
    const updatedList = todayAntiGoals.map((ag) =>
      ag.id === id ? { ...ag, avoided: !ag.avoided } : ag
    );
    onUpdateAntiGoals({
      ...antiGoals,
      [todayStr]: updatedList,
    });
  };

  const handleRemoveAntiGoal = (id: number) => {
    const updatedList = todayAntiGoals.filter((ag) => ag.id !== id);
    onUpdateAntiGoals({
      ...antiGoals,
      [todayStr]: updatedList,
    });
  };

  // Mood & Reflection
  const handleSetMood = (mood: MoodType) => {
    const updatedReflections = {
      ...reflections,
      [currentGoalKey]: {
        ...(reflections[currentGoalKey] || {}),
        [todayStr]: {
          ...currentReflection,
          mood,
          updatedAt: new Date().toISOString(),
        },
      },
    };
    onUpdateReflections(updatedReflections);
  };

  const handleUpdateNote = (note: string) => {
    const updatedReflections = {
      ...reflections,
      [currentGoalKey]: {
        ...(reflections[currentGoalKey] || {}),
        [todayStr]: {
          ...currentReflection,
          note,
          updatedAt: new Date().toISOString(),
        },
      },
    };
    onUpdateReflections(updatedReflections);
  };

  // Filter steps to show
  let displaySteps = goal.steps || [];
  if (isMinMode) {
    displaySteps = displaySteps.filter((s) => s.date === todayStr);
    if (displaySteps.length === 0 && stats.nextPendingStep) {
      displaySteps = [stats.nextPendingStep];
    }
  } else {
    if (filterStep === 'today') {
      displaySteps = displaySteps.filter((s) => s.date === todayStr);
    } else if (filterStep === 'completed') {
      displaySteps = displaySteps.filter((s) => s.completed);
    } else if (filterStep === 'pending') {
      displaySteps = displaySteps.filter((s) => !s.completed);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </button>

          {/* Quick Goal Selector Dropdown */}
          <div className="relative">
            <select
              value={currentGoalKey}
              onChange={(e) => onSelectGoal(e.target.value)}
              aria-label="สลับเป้าหมาย"
              className="bg-zinc-50 dark:bg-zinc-800 text-xs pl-2.5 pr-7 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none cursor-pointer appearance-none max-w-[200px] truncate"
            >
              {Object.keys(goals).map((k) => (
                <option key={k} value={k}>
                  {goals[k].title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => exportToExcelFile(goal)}
            className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer border border-indigo-200/60 dark:border-indigo-800/40"
          >
            <Download className="w-3 h-3" />
            <span>ส่งออก Excel</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`คุณต้องการลบรายการ "${goal.title}" หรือไม่?`)) {
                onDeleteGoal(currentGoalKey);
              }
            }}
            className="flex items-center gap-1 text-xs bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer border border-rose-200/60 dark:border-rose-800/40"
          >
            <Trash2 className="w-3 h-3" />
            <span>ลบรายการ</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Psychology & Personal Discipline Engine */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Progress Card */}
          <div className="bg-zinc-900 text-white p-5 rounded-3xl shadow-md space-y-3.5 border border-zinc-800 relative overflow-hidden">
            <div className="flex justify-between items-center">
              {goal.category === 'work' ? (
                <span className="text-[11px] bg-blue-500/20 text-blue-300 font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> งานธุรกิจ / ร้าน
                </span>
              ) : (
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Target className="w-3 h-3" /> วินัย / ส่วนตัว
                </span>
              )}

              <span
                className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${
                  stats.percentage === 100
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {stats.percentage === 100 ? 'สำเร็จครบ 100%' : 'กำลังดำเนินการ'}
              </span>
            </div>

            <h2 className="text-base font-bold text-white tracking-tight leading-snug">
              {goal.title}
            </h2>

            <div className="flex justify-between items-baseline pt-1">
              <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
                <span>{stats.percentage}%</span>
                <span className="text-xs font-normal text-zinc-400">สำเร็จแล้ว</span>
              </div>
              <div className="text-sm font-semibold text-amber-400 flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.streak} วันติด</span>
              </div>
            </div>

            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.percentage === 100 ? 'bg-emerald-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">ทำเสร็จแล้ว</span>
                <span className="font-semibold text-indigo-300">
                  {stats.completed} / {stats.total} ข้อ
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">วันที่เริ่มต้น</span>
                <span className="font-semibold text-zinc-200">{goal.startDate}</span>
              </div>
            </div>
          </div>

          {/* Minimum Floor Mode (โหมดเพดานต่ำสุด) */}
          <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-3xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🌱</span> โหมดเพดานต่ำสุด (Min Floor)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMinMode}
                  onChange={(e) => setIsMinMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              แสดงเฉพาะภารกิจวันเดียวเพื่อลดความเครียดและหลีกเลี่ยงการผลัดวันประกันพรุ่ง
            </p>
          </div>

          {/* Anti-Goals (สิ่งที่จะไม่ทำวันนี้) */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                <span>🛑</span> Anti-Goals (สิ่งที่จะไม่ทำวันนี้)
              </h3>
              <span className="text-[10px] text-zinc-400">
                {todayAntiGoals.filter((ag) => ag.avoided).length}/{todayAntiGoals.length} ข้อ
              </span>
            </div>

            <form onSubmit={handleAddAntiGoal} className="flex gap-2">
              <input
                type="text"
                value={newAntiGoalText}
                onChange={(e) => setNewAntiGoalText(e.target.value)}
                placeholder="เช่น ห้ามไถฟีดขณะทำงาน..."
                className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition"
              >
                เพิ่ม
              </button>
            </form>

            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar text-xs">
              {todayAntiGoals.length === 0 ? (
                <p className="text-zinc-400 text-[11px] py-1 text-center">
                  ยังไม่ได้ตั้ง Anti-Goal สำหรับวันนี้
                </p>
              ) : (
                todayAntiGoals.map((ag) => (
                  <div
                    key={ag.id}
                    className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60"
                  >
                    <label className="flex items-center gap-2 cursor-pointer truncate flex-1">
                      <input
                        type="checkbox"
                        checked={ag.avoided}
                        onChange={() => handleToggleAntiGoal(ag.id)}
                        className="accent-rose-600 w-3.5 h-3.5 cursor-pointer shrink-0"
                      />
                      <span
                        className={`truncate text-xs ${
                          ag.avoided
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {ag.text}
                      </span>
                    </label>
                    <button
                      onClick={() => handleRemoveAntiGoal(ag.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Reflection & Mood */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📝</span> บันทึกพลังงาน & สภาพจิตใจ
            </h3>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { mood: '🔥', label: 'ไฟแรง' },
                { mood: '💪', label: 'สู้ชีวิต' },
                { mood: '🌱', label: 'เรื่อยๆ' },
                { mood: '⚡', label: 'เหนื่อย' },
              ].map((item) => (
                <button
                  key={item.mood}
                  type="button"
                  onClick={() => handleSetMood(item.mood as MoodType)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition cursor-pointer flex flex-col items-center gap-0.5 ${
                    currentReflection.mood === item.mood
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="text-base">{item.mood}</span>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={currentReflection.note}
              onChange={(e) => handleUpdateNote(e.target.value)}
              placeholder="บันทึกสั้นๆ: วันนี้ทำอะไรสำเร็จ หรือมีอะไรต้องปรับปรุง..."
              rows={2}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Focus Timer (Pomodoro 25m) */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>โหมดโฟกัส 25 นาที</span>
              </span>
              <span className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1 ${
                  isTimerRunning
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isTimerRunning ? 'พักชั่วคราว' : 'เริ่มโฟกัส'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs transition cursor-pointer"
                title="รีเซ็ตเวลา 25 นาที"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Execution & AI Coaching Hub */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Master Coach Widget */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white p-4.5 rounded-3xl shadow-md space-y-3 border border-zinc-800 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  AI Master Coach
                </h3>
                {adviceSource === 'gemini' && (
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
                    Gemini 3.8 Flash
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAdvice}
                  disabled={isLoadingAdvice}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg transition cursor-pointer disabled:opacity-50"
                  title="ขอคำแนะนำใหม่อีกครั้ง"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isLoadingAdvice ? 'animate-spin text-indigo-400' : ''}`}
                  />
                  <span>รีเฟรช</span>
                </button>

                <button
                  onClick={onOpenCoachHub}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-lg transition cursor-pointer font-medium"
                >
                  ปรึกษาแบบแชท →
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-200 leading-relaxed bg-zinc-800/70 p-3 rounded-2xl border border-zinc-700/60">
              {isLoadingAdvice ? (
                <div className="flex items-center gap-2 text-zinc-400 py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>กำลังวิเคราะห์บริบทเป้าหมายและวางคำแนะนำเฉพาะคุณ...</span>
                </div>
              ) : (
                aiAdvice
              )}
            </div>
          </div>

          {/* Sub-tasks and Checklist Section */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                เช็คลิสต์และงานย่อย ({displaySteps.length} รายการ)
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={filterStep}
                  onChange={(e: any) => setFilterStep(e.target.value)}
                  disabled={isMinMode}
                  aria-label="กรองเช็คลิสต์"
                  className="bg-zinc-50 dark:bg-zinc-800 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="today">⭐ โฟกัสเฉพาะวันนี้</option>
                  <option value="all">📋 แสดงทั้งหมด</option>
                  <option value="pending">⏳ ยังไม่ทำ</option>
                  <option value="completed">✅ ทำแล้ว</option>
                </select>
              </div>
            </div>

            {/* Add Custom Sub-Item Form */}
            <form onSubmit={handleAddSubStep} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={newSubText}
                onChange={(e) => setNewSubText(e.target.value)}
                placeholder="➕ พิมพ์เพิ่มเช็คลิสย่อยในงานนี้ด้วยตัวเอง..."
                className="flex-1 p-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-100"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newSubDate}
                  onChange={(e) => setNewSubDate(e.target.value)}
                  className="p-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-100 cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition shadow-xs"
                >
                  เพิ่ม
                </button>
              </div>
            </form>

            {/* Steps Container */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar pt-1">
              {displaySteps.length === 0 ? (
                <div className="text-center py-10 px-4 text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  {isMinMode
                    ? '🎉 ยอดเยี่ยม! เคลียร์งานของวันนี้เสร็จสิ้นแล้ว หรือไม่มีงานที่กำหนดในวันนี้'
                    : 'ยังไม่มีรายการเช็คลิสย่อยในตัวกรองนี้ คุณสามารถพิมพ์เพิ่มด้านบนได้เลยครับ'}
                </div>
              ) : (
                displaySteps.map((step) => {
                  const isToday = step.date === todayStr;
                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        step.completed
                          ? 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800/70 opacity-60'
                          : isToday
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/60 shadow-xs'
                          : 'bg-white dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => handleToggleStep(step.id)}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                        />
                        <div className="truncate flex-1">
                          <div
                            className={`text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate ${
                              step.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                            }`}
                          >
                            {step.text}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span>📅 {step.date}</span>
                            {isToday && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.2 rounded">
                                ⭐ วันนี้
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveStep(step.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 shrink-0 transition"
                        title="ลบข้อนี้"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
