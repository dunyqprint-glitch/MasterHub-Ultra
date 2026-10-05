import React, { useState } from 'react';
import { Briefcase, Target, Sparkles, X, Bot, Calendar, Loader2 } from 'lucide-react';
import { GoalCategory, GoalType, GoalItem, StepItem } from '../types';
import { getTodayString, generateHabitDays } from '../utils/storage';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (newGoal: GoalItem) => void;
  defaultCategory?: GoalCategory;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  defaultCategory = 'work',
}) => {
  const [category, setCategory] = useState<GoalCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('habit');
  const [days, setDays] = useState<number>(30);
  const [startDate, setStartDate] = useState(getTodayString());
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiPreviewSteps, setAiPreviewSteps] = useState<StepItem[] | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerateAIPlan = async () => {
    if (!title.trim()) {
      alert('กรุณากรอกชื่องานหรือเป้าหมายก่อนให้ AI ช่วยวางแผนครับ');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/coach/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          days,
          startDate,
        }),
      });
      const data = await res.json();
      setAiPreviewSteps(data.steps || []);
      setAiSummary(data.executiveSummary || '');
    } catch {
      alert('ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้ ระบบจะสร้างแบบอัตโนมัติให้แทนครับ');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณาระบุชื่องานหรือเป้าหมาย');
      return;
    }

    let steps: StepItem[] = [];
    const baseDate = new Date(startDate || getTodayString());

    if (aiPreviewSteps && aiPreviewSteps.length > 0) {
      steps = aiPreviewSteps;
    } else if (type === 'habit') {
      steps = generateHabitDays(title.trim(), days, baseDate);
    } else {
      steps = [
        {
          id: Date.now(),
          text: `ภารกิจเริ่มต้น: ${title.trim()}`,
          date: startDate,
          completed: false,
        },
      ];
    }

    const goalKey = type === 'habit' && !title.includes('วัน') ? `${title.trim()} (${days} วัน)` : title.trim();

    const newGoal: GoalItem = {
      id: 'goal-' + Date.now(),
      title: goalKey,
      category,
      type,
      totalDays: steps.length,
      startDate,
      steps,
      createdAt: new Date().toISOString(),
      description: aiSummary || undefined,
    };

    onSaveGoal(newGoal);
    // Reset state
    setTitle('');
    setAiPreviewSteps(null);
    setAiSummary('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg p-6 rounded-3xl space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                สร้างเป้าหมายหรืองานใหม่ (ระดับอัลตรา)
              </h3>
              <p className="text-[11px] text-zinc-400">ระบบบริหารธุรกิจและสร้างวินัยอัตโนมัติ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Chooser */}
          <div className="space-y-1.5">
            <label className="text-zinc-500 dark:text-zinc-400 font-semibold block">หมวดหมู่หลัก:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('work')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  category === 'work'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs">💼 งานธุรกิจ / ร้าน</div>
                  <div className="text-[10px] opacity-70">สต็อก, บัญชี, การตลาด</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('personal')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  category === 'personal'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-xs">🎯 วินัย / ส่วนตัว</div>
                  <div className="text-[10px] opacity-70">สุขภาพ, นิสัย, การนอน</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-zinc-500 dark:text-zinc-400 font-semibold block">
              ชื่องาน / เป้าหมายสำคัญ:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'work'
                  ? 'เช่น เช็คสต็อกวัตถุดิบและยอดขาย, ยิงแอด Facebook ประจำวัน'
                  : 'เช่น นอนก่อน 23:00, ออกกำลังกาย 30 นาที, อ่านหนังสือ 10 หน้า'
              }
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          {/* System Type */}
          <div className="space-y-1.5">
            <label className="text-zinc-500 dark:text-zinc-400 font-semibold block">
              รูปแบบการดำเนินการ:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('habit')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  type === 'habit'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold border-transparent'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                🔄 เช็คลิสต์รายวันต่อเนื่อง
              </button>
              <button
                type="button"
                onClick={() => setType('custom')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  type === 'custom'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold border-transparent'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                📌 งานโปรเจกต์ (กำหนดเอง)
              </button>
            </div>
          </div>

          {/* Days Presets (If Habit) */}
          {type === 'habit' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-zinc-500 dark:text-zinc-400 font-semibold">จำนวนวัน:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={365}
                    className="w-16 p-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold text-xs"
                  />
                  <span className="text-zinc-400">วัน</span>
                </div>
              </div>

              {/* Day presets */}
              <div className="flex flex-wrap gap-1.5">
                {[7, 14, 21, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      days === d
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {d} วัน
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>วันที่เริ่มต้น:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* AI Plan Generation Option */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Master Planner</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAIPlan}
                disabled={isGeneratingAI || !title.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>กำลังคิดแผน...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3" />
                    <span>ให้ AI วางแผนย่อยให้ ✨</span>
                  </>
                )}
              </button>
            </div>

            {aiSummary && (
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 p-2 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40">
                💡 <strong>บทสรุปกลยุทธ์:</strong> {aiSummary}
              </p>
            )}

            {aiPreviewSteps && (
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                ✅ AI สร้างแผนเรียบร้อย ({aiPreviewSteps.length} ขั้นตอน) พร้อมบันทึกทันที!
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 rounded-2xl text-xs font-semibold transition hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-2xl text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-md"
            >
              สร้างรายการทันที 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
