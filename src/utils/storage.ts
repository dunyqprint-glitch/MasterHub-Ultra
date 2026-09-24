import * as XLSX from 'xlsx';
import { GoalItem, StepItem, AntiGoalItem, DailyReflection } from '../types';

const STORAGE_KEYS = {
  GOALS: 'masterhub_ultra_goals_v1',
  CURRENT_GOAL: 'masterhub_ultra_current_goal_v1',
  REFLECTIONS: 'masterhub_ultra_reflections_v1',
  ANTI_GOALS: 'masterhub_ultra_antigoals_v1',
  THEME: 'masterhub_ultra_theme_v1',
};

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateHabitDays(name: string, totalDays: number, startDateObj: Date): StepItem[] {
  const steps: StepItem[] = [];
  const currentDate = new Date(startDateObj);
  for (let i = 1; i <= totalDays; i++) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    steps.push({
      id: Date.now() + i * 17,
      text: `วันที่ ${i}: ${name}`,
      date: dateString,
      completed: false,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return steps;
}

export function getInitialGoals(): Record<string, GoalItem> {
  const today = new Date();
  // Start slightly in past so some days can be checked or today is active
  const workStartDate = new Date(today);
  workStartDate.setDate(workStartDate.getDate() - 3);

  const personalStartDate = new Date(today);
  personalStartDate.setDate(personalStartDate.getDate() - 5);

  const workSteps = generateHabitDays('เช็คยอดขาย สต็อกวัตถุดิบ และออเดอร์ร้าน', 30, workStartDate);
  // Mark past 3 days completed for realistic feel
  if (workSteps[0]) workSteps[0].completed = true;
  if (workSteps[1]) workSteps[1].completed = true;
  if (workSteps[2]) workSteps[2].completed = true;

  const personalSteps = generateHabitDays('เข้านอนก่อน 23:00 และงดเล่นมือก่อนนอน', 30, personalStartDate);
  if (personalSteps[0]) personalSteps[0].completed = true;
  if (personalSteps[1]) personalSteps[1].completed = true;
  if (personalSteps[2]) personalSteps[2].completed = true;
  if (personalSteps[3]) personalSteps[3].completed = true;

  const marketingGoal: GoalItem = {
    id: 'goal-business-marketing-14',
    title: 'กลยุทธ์ยิงแอดและเพิ่มรีวิว 5 ดาว 14 วัน',
    category: 'work',
    type: 'habit',
    totalDays: 14,
    startDate: getTodayString(),
    steps: generateHabitDays('ส่งมอบของแถมพิเศษ & เชิญลูกค้าเขียนรีวิว 5 ดาว', 14, new Date()),
    createdAt: new Date().toISOString(),
    description: 'เร่งยอดขายและสร้างฐานลูกค้าประจำของร้าน',
  };

  return {
    'เช็คออเดอร์และวัตถุดิบร้าน (30 วัน)': {
      id: 'goal-work-1',
      title: 'เช็คออเดอร์และวัตถุดิบร้าน (30 วัน)',
      category: 'work',
      type: 'habit',
      totalDays: 30,
      startDate: workStartDate.toISOString().split('T')[0],
      steps: workSteps,
      createdAt: new Date().toISOString(),
      description: 'ระบบตรวจเช็คประจำวันเพื่อป้องกันของขาดสต็อกและออเดอร์ตกหล่น',
    },
    'นอนก่อน 23:00 ทุกวัน (30 วัน)': {
      id: 'goal-personal-1',
      title: 'นอนก่อน 23:00 ทุกวัน (30 วัน)',
      category: 'personal',
      type: 'habit',
      totalDays: 30,
      startDate: personalStartDate.toISOString().split('T')[0],
      steps: personalSteps,
      createdAt: new Date().toISOString(),
      description: 'ฟื้นฟูพลังงานและสมาธิสำหรับบริหารธุรกิจในทุกๆ วัน',
    },
    'กลยุทธ์ยิงแอดและเพิ่มรีวิว 5 ดาว (14 วัน)': marketingGoal,
  };
}

export function loadGoals(): Record<string, GoalItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      // Check if user had v8 from the original prototype
      const oldV8 = localStorage.getItem('discipline_goals_data_v8');
      if (oldV8) {
        const parsedOld = JSON.parse(oldV8);
        const converted: Record<string, GoalItem> = {};
        for (const [key, val] of Object.entries<any>(parsedOld)) {
          converted[key] = {
            id: 'imported-' + Math.random().toString(36).substring(2, 9),
            title: key,
            category: val.category || 'work',
            type: val.type || 'habit',
            totalDays: val.steps?.length || 30,
            startDate: val.steps?.[0]?.date || getTodayString(),
            steps: val.steps || [],
            createdAt: new Date().toISOString(),
          };
        }
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(converted));
        return converted;
      }
      const initial = getInitialGoals();
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load goals:', err);
    return getInitialGoals();
  }
}

export function saveGoals(goals: Record<string, GoalItem>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to save goals:', err);
  }
}

export function loadReflections(): Record<string, Record<string, DailyReflection>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveReflections(reflections: Record<string, Record<string, DailyReflection>>): void {
  localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
}

export function loadAntiGoals(): Record<string, AntiGoalItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANTI_GOALS);
    if (!raw) {
      const today = getTodayString();
      return {
        [today]: [
          { id: 1, text: 'ห้ามไถฟีดโซเชียลไร้สาระเกิน 15 นาที', avoided: true },
          { id: 2, text: 'ห้ามผลัดวันประกันพรุ่งกับงานสต็อกสำคัญ', avoided: false },
        ],
      };
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAntiGoals(antiGoals: Record<string, AntiGoalItem[]>): void {
  localStorage.setItem(STORAGE_KEYS.ANTI_GOALS, JSON.stringify(antiGoals));
}

export function exportToExcelFile(goal: GoalItem): void {
  const steps = goal.steps || [];
  if (steps.length === 0) {
    alert('ไม่มีข้อมูลขั้นตอนในรายการนี้');
    return;
  }

  const sheetData: (string | number)[][] = [
    ['MasterHub Ultra Report - รายงานความก้าวหน้าและการปฏิบัติตามวินัย'],
    ['ชื่องาน / เป้าหมาย', goal.title],
    ['หมวดหมู่', goal.category === 'work' ? 'งานธุรกิจ / ร้านค้า' : 'วินัย / ส่วนตัว'],
    ['วันที่สร้าง', goal.createdAt],
    ['จำนวนวันรวม', `${steps.length} วัน`],
    ['สำเร็จแล้ว', `${steps.filter((s) => s.completed).length} ข้อ (${Math.round((steps.filter((s) => s.completed).length / steps.length) * 100)}%)`],
    [],
    ['ลำดับ', 'รายการภารกิจ / เช็คลิสต์', 'วันที่กำหนด', 'สถานะ'],
  ];

  steps.forEach((s, i) => {
    sheetData.push([i + 1, s.text, s.date, s.completed ? 'สำเร็จแล้ว ✅' : 'ยังไม่ทำ ⏳']);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Progress_Report');

  const cleanTitle = goal.title.replace(/[/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(workbook, `MasterHub_Ultra_${cleanTitle}.xlsx`);
}

export function exportFullBackupJSON(
  goals: Record<string, GoalItem>,
  reflections: Record<string, Record<string, DailyReflection>>,
  antiGoals: Record<string, AntiGoalItem[]>
): void {
  const data = {
    version: 'ultra-1.0',
    exportedAt: new Date().toISOString(),
    goals,
    reflections,
    antiGoals,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MasterHub_Ultra_Backup_${getTodayString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
