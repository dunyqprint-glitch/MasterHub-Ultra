import React, { useRef } from 'react';
import { Database, Download, Upload, RotateCcw, X, FileSpreadsheet, Shield } from 'lucide-react';
import { GoalItem, DailyReflection, AntiGoalItem } from '../types';
import { exportFullBackupJSON, getInitialGoals } from '../utils/storage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Record<string, GoalItem>;
  reflections: Record<string, Record<string, DailyReflection>>;
  antiGoals: Record<string, AntiGoalItem[]>;
  onRestoreData: (
    goals: Record<string, GoalItem>,
    reflections: Record<string, Record<string, DailyReflection>>,
    antiGoals: Record<string, AntiGoalItem[]>
  ) => void;
  onExportAllExcel: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  goals,
  reflections,
  antiGoals,
  onRestoreData,
  onExportAllExcel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportFullBackupJSON(goals, reflections, antiGoals);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.goals) {
          onRestoreData(parsed.goals, parsed.reflections || {}, parsed.antiGoals || {});
          alert('นำเข้าข้อมูลสำเร็จเรียบร้อยแล้ว!');
          onClose();
        } else {
          alert('รูปแบบไฟล์สำรองไม่ถูกต้อง');
        }
      } catch {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้น (ธุรกิจและวินัย) หรือไม่?')) {
      const initial = getInitialGoals();
      onRestoreData(initial, {}, {});
      alert('รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                จัดการและสำรองข้อมูล (Data Hub)
              </h3>
              <p className="text-[11px] text-zinc-400">เก็บรักษาข้อมูลปลอดภัยบนเบราว์เซอร์ของคุณ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Export JSON */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                ดาวน์โหลดไฟล์สำรอง (JSON)
              </div>
              <div className="text-[11px] text-zinc-400">บันทึกทั้งเป้าหมาย บันทึกรายวัน และ Anti-Goals</div>
            </div>
            <button
              onClick={handleExportJSON}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-medium cursor-pointer transition flex items-center gap-1 shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                นำเข้าข้อมูลสำรอง (Restore)
              </div>
              <div className="text-[11px] text-zinc-400">เลือกไฟล์ .json ที่เคยสำรองไว้</div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1.5 rounded-xl font-medium cursor-pointer transition flex items-center gap-1 shadow-xs shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>เลือกไฟล์</span>
            </button>
          </div>

          {/* Export Excel */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                ส่งออก Excel (.xlsx)
              </div>
              <div className="text-[11px] text-zinc-400">สร้างสเปรดชีตสรุปภารกิจสำหรับเปิดใน Excel</div>
            </div>
            <button
              onClick={onExportAllExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-medium cursor-pointer transition flex items-center gap-1 shadow-xs shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ส่งออก</span>
            </button>
          </div>

          {/* Reset Defaults */}
          <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-rose-700 dark:text-rose-400">
                รีเซ็ตเป็นตัวอย่างเริ่มต้น
              </div>
              <div className="text-[11px] text-zinc-400">โหลดข้อมูลตัวอย่างธุรกิจ & วินัย</div>
            </div>
            <button
              onClick={handleResetSampleData}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-medium cursor-pointer transition flex items-center gap-1 shadow-xs shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
