import React, { useState, useEffect } from 'react';
import { ActiveView, ActiveTab, GoalItem, AntiGoalItem, DailyReflection } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { GoalDetailView } from './components/GoalDetailView';
import { AnalyticsView } from './components/AnalyticsView';
import { AICoachHubView } from './components/AICoachHubView';
import { CreateGoalModal } from './components/CreateGoalModal';
import { DataBackupModal } from './components/DataBackupModal';
import {
  loadGoals,
  saveGoals,
  loadReflections,
  saveReflections,
  loadAntiGoals,
  saveAntiGoals,
  exportToExcelFile,
} from './utils/storage';
import * as XLSX from 'xlsx';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('masterhub_ultra_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark for premium modern look
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('masterhub_ultra_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('masterhub_ultra_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Core Data States
  const [goals, setGoals] = useState<Record<string, GoalItem>>(loadGoals);
  const [reflections, setReflections] = useState<Record<string, Record<string, DailyReflection>>>(
    loadReflections
  );
  const [antiGoals, setAntiGoals] = useState<Record<string, AntiGoalItem[]>>(loadAntiGoals);

  // Navigation & Selection States
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [currentTab, setCurrentTab] = useState<ActiveTab>('work');
  const [selectedGoalKey, setSelectedGoalKey] = useState<string>(() => {
    const keys = Object.keys(goals);
    return keys[0] || '';
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveReflections(reflections);
  }, [reflections]);

  useEffect(() => {
    saveAntiGoals(antiGoals);
  }, [antiGoals]);

  // Goal Operations
  const handleSelectGoal = (goalKey: string) => {
    setSelectedGoalKey(goalKey);
    setCurrentView('detail');
  };

  const handleSaveNewGoal = (newGoal: GoalItem) => {
    setGoals((prev) => ({
      ...prev,
      [newGoal.title]: newGoal,
    }));
    setSelectedGoalKey(newGoal.title);
    setCurrentTab(newGoal.category);
    setCurrentView('detail');
  };

  const handleUpdateGoal = (updatedGoal: GoalItem) => {
    setGoals((prev) => ({
      ...prev,
      [updatedGoal.title]: updatedGoal,
    }));
  };

  const handleDeleteGoal = (goalKey: string) => {
    const keys = Object.keys(goals);
    if (keys.length <= 1) {
      alert('ต้องมีเป้าหมายอย่างน้อย 1 รายการในระบบครับ');
      return;
    }
    const nextGoals = { ...goals };
    delete nextGoals[goalKey];
    setGoals(nextGoals);

    const remainingKeys = Object.keys(nextGoals);
    setSelectedGoalKey(remainingKeys[0] || '');
    setCurrentView('dashboard');
  };

  const handleDuplicateGoal = (goalKey: string) => {
    const original = goals[goalKey];
    if (!original) return;

    const dupTitle = `${original.title} (สำเนา)`;
    const duplicated: GoalItem = {
      ...original,
      id: 'goal-dup-' + Date.now(),
      title: dupTitle,
      createdAt: new Date().toISOString(),
      steps: (original.steps || []).map((s, idx) => ({
        ...s,
        id: Date.now() + idx + 1,
        completed: false,
      })),
    };

    setGoals((prev) => ({
      ...prev,
      [dupTitle]: duplicated,
    }));
    setSelectedGoalKey(dupTitle);
  };

  // Restore Data Handler
  const handleRestoreData = (
    newGoals: Record<string, GoalItem>,
    newReflections: Record<string, Record<string, DailyReflection>>,
    newAntiGoals: Record<string, AntiGoalItem[]>
  ) => {
    setGoals(newGoals);
    setReflections(newReflections);
    setAntiGoals(newAntiGoals);
    const keys = Object.keys(newGoals);
    if (keys.length > 0) {
      setSelectedGoalKey(keys[0]);
    }
  };

  // Export Active Goal or All Goals to Excel
  const handleExportActiveExcel = () => {
    const active = goals[selectedGoalKey] || Object.values(goals)[0];
    if (active) {
      exportToExcelFile(active);
    } else {
      alert('ไม่มีข้อมูลรายการสำหรับส่งออก');
    }
  };

  const handleExportAllExcel = () => {
    const allGoalList = Object.values(goals);
    if (allGoalList.length === 0) {
      alert('ไม่มีข้อมูลรายการ');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData: (string | number)[][] = [
      ['MasterHub Ultra - รายงานสรุปภาพรวมทุกเป้าหมายธุรกิจและวินัย'],
      ['วันที่สร้างรายงาน', new Date().toLocaleDateString('th-TH')],
      ['จำนวนเป้าหมายทั้งหมด', allGoalList.length],
      [],
      ['ชื่องาน / เป้าหมาย', 'หมวดหมู่', 'ประเภท', 'จำนวนงานย่อย', 'เสร็จแล้ว', 'ความสำเร็จ (%)'],
    ];

    allGoalList.forEach((g) => {
      const steps = g.steps || [];
      const completed = steps.filter((s) => s.completed).length;
      const pct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
      summaryData.push([
        g.title,
        g.category === 'work' ? 'งานธุรกิจ/ร้าน' : 'วินัยส่วนตัว',
        g.type === 'habit' ? 'นิสัยรายวัน' : 'งานทั่วไป',
        steps.length,
        completed,
        `${pct}%`,
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Overview_Summary');

    // Individual Goal Sheets (up to 5 to keep clean)
    allGoalList.slice(0, 10).forEach((g, idx) => {
      const sheetData: (string | number)[][] = [
        [g.title],
        ['ลำดับ', 'ภารกิจย่อย', 'วันที่กำหนด', 'สถานะ'],
      ];
      (g.steps || []).forEach((s, sIdx) => {
        sheetData.push([sIdx + 1, s.text, s.date, s.completed ? 'สำเร็จแล้ว ✅' : 'ยังไม่ทำ ⏳']);
      });
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      const safeSheetName = `Goal_${idx + 1}`.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName);
    });

    XLSX.writeFile(workbook, `MasterHub_Ultra_All_Goals_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
      {/* Top Universal Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onExportExcel={handleExportActiveExcel}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        totalGoalsCount={Object.keys(goals).length}
      />

      {/* Main Content View Switcher */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            goals={goals}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onSelectGoal={handleSelectGoal}
            onDeleteGoal={handleDeleteGoal}
            onDuplicateGoal={handleDuplicateGoal}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {currentView === 'detail' && (
          <GoalDetailView
            currentGoalKey={selectedGoalKey}
            goals={goals}
            onSelectGoal={setSelectedGoalKey}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            antiGoals={antiGoals}
            onUpdateAntiGoals={setAntiGoals}
            reflections={reflections}
            onUpdateReflections={setReflections}
            onOpenCoachHub={() => setCurrentView('coach')}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            goals={goals}
            reflections={reflections}
            antiGoals={antiGoals}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onSelectGoal={handleSelectGoal}
          />
        )}

        {currentView === 'coach' && (
          <AICoachHubView
            goals={goals}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveGoal={handleSaveNewGoal}
        defaultCategory={currentTab === 'personal' ? 'personal' : 'work'}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        goals={goals}
        reflections={reflections}
        antiGoals={antiGoals}
        onRestoreData={handleRestoreData}
        onExportAllExcel={handleExportAllExcel}
      />
    </div>
  );
}
