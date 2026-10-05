import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', name: 'ก้าวแรก', description: 'ทำภารกิจสำเร็จ 1 ข้อ', icon: '🚀', threshold: 1 },
  { id: 'consistent', name: 'สม่ำเสมอ', description: 'ทำภารกิจสำเร็จ 10 ข้อ', icon: '🔥', threshold: 10 },
  { id: 'pro', name: 'มืออาชีพ', description: 'ทำภารกิจสำเร็จ 50 ข้อ', icon: '🏆', threshold: 50 },
  { id: 'ultra', name: 'ระดับอัลตรา', description: 'ทำภารกิจสำเร็จ 100 ข้อ', icon: '⚡', threshold: 100 },
];

export function getUnlockedAchievements(totalCompleted: number): Achievement[] {
  return ACHIEVEMENTS.filter((a) => totalCompleted >= a.threshold);
}
