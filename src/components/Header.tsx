import React from 'react';
import { Target, Home, BarChart3, Bot, Plus, Download, Moon, Sun, Database } from 'lucide-react';
import { ActiveView } from '../types';

interface HeaderProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onOpenCreateModal: () => void;
  onOpenBackupModal: () => void;
  onExportExcel: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  totalGoalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  onOpenBackupModal,
  onExportExcel,
  isDarkMode,
  onToggleTheme,
  totalGoalsCount,
}) => {
  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 py-2.5 px-4 sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Logo & Navigation */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div
            onClick={() => onViewChange('dashboard')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                  MasterHub
                </span>
                <span className="text-[10px] bg-indigo-600 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Ultra
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                ระบบจัดการธุรกิจ วินัย & โค้ช AI
              </p>
            </div>
          </div>

          {/* Navigation Tabs on Mobile & Desktop */}
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>ภาพรวม</span>
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'analytics'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>วิเคราะห์</span>
            </button>
            <button
              onClick={() => onViewChange('coach')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'coach'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span>โค้ช AI</span>
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างรายการใหม่</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs px-3 py-2 rounded-xl font-medium transition cursor-pointer border border-indigo-200/50 dark:border-indigo-800/40"
            title="ส่งออกรายงานเป็นไฟล์ Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs p-2 rounded-xl font-medium transition cursor-pointer border border-zinc-200/50 dark:border-zinc-700/50"
            title="สำรอง & นำเข้าข้อมูล"
          >
            <Database className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleTheme}
            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs p-2 rounded-xl transition cursor-pointer border border-zinc-200/50 dark:border-zinc-700/50"
            title="สลับโหมดสว่าง / มืด"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
