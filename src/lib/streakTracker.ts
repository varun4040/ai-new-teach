/**
 * Daily Learning Streak Tracker Service
 * Tracks consecutive days the student has attended an interactive lesson.
 * Supports local persistence and reactive updates across components.
 */

import confetti from 'canvas-confetti';
import { soundEffects } from './soundEffects';

export interface StreakDay {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  dayNumber: number; // 1-31
  isToday: boolean;
  attended: boolean;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  totalDaysAttended: number;
  lastAttendedDate: string; // YYYY-MM-DD
  history: string[]; // List of unique YYYY-MM-DD attended dates
  todayAttended: boolean;
  milestoneTitle: string;
  nextMilestone: number;
}

const STORAGE_KEY = 'ai_live_teacher_daily_streak';
export const STREAK_UPDATED_EVENT = 'ai_teacher_streak_updated';

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayDifference(dateAStr: string, dateBStr: string): number {
  const [y1, m1, d1] = dateAStr.split('-').map(Number);
  const [y2, m2, d2] = dateBStr.split('-').map(Number);
  const dateA = new Date(y1, m1 - 1, d1);
  const dateB = new Date(y2, m2 - 1, d2);
  const diffMs = dateB.getTime() - dateA.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getStreakMilestone(streak: number): { title: string; next: number } {
  if (streak >= 30) return { title: 'Legendary Scholar 👑', next: 50 };
  if (streak >= 14) return { title: 'Fortnight Champion 🏆', next: 30 };
  if (streak >= 7) return { title: 'Week Warrior ⚡', next: 14 };
  if (streak >= 3) return { title: 'Spark Ignited 🔥', next: 7 };
  return { title: 'Eager Starter 🌟', next: 3 };
}

/**
 * Creates default starter data if the student has never logged in before.
 * Seeds a friendly 3-day active streak (2 days ago, yesterday, and today)
 * so the student immediately feels motivated and accomplished.
 */
function createInitialStreakData(): StreakData {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);
  const dayBeforeStr = getLocalDateString(dayBefore);

  const initialHistory = [dayBeforeStr, yesterdayStr, todayStr];
  const milestone = getStreakMilestone(3);

  return {
    currentStreak: 3,
    bestStreak: 5,
    totalDaysAttended: 8,
    lastAttendedDate: todayStr,
    history: initialHistory,
    todayAttended: true,
    milestoneTitle: milestone.title,
    nextMilestone: milestone.next,
  };
}

export function loadStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return createInitialStreakData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialStreakData();
      saveStreakData(initial);
      return initial;
    }

    const data = JSON.parse(raw) as Partial<StreakData>;
    const todayStr = getLocalDateString();
    const history = Array.isArray(data.history) ? Array.from(new Set(data.history)) : [];
    
    let currentStreak = typeof data.currentStreak === 'number' ? data.currentStreak : 1;
    let bestStreak = typeof data.bestStreak === 'number' ? data.bestStreak : currentStreak;
    const lastDate = data.lastAttendedDate || null;
    const todayAttended = history.includes(todayStr) || lastDate === todayStr;

    // Check if the streak was broken (more than 1 day since last attendance)
    if (lastDate && lastDate !== todayStr) {
      const daysDiff = getDayDifference(lastDate, todayStr);
      if (daysDiff > 1) {
        // Gap of 2+ days: streak resets to 0 until attended today
        currentStreak = 0;
      }
    }

    const milestone = getStreakMilestone(currentStreak);

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      totalDaysAttended: Math.max(history.length, data.totalDaysAttended || currentStreak),
      lastAttendedDate: lastDate || todayStr,
      history,
      todayAttended,
      milestoneTitle: milestone.title,
      nextMilestone: milestone.next,
    };
  } catch (err) {
    console.warn('Error loading streak data:', err);
    return createInitialStreakData();
  }
}

export function saveStreakData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT, { detail: data }));
  } catch (err) {
    console.warn('Error saving streak data:', err);
  }
}

/**
 * Records that the student has attended a lesson today.
 * If today wasn't recorded yet, advances streak, updates history, and celebrates.
 */
export function recordLessonAttendance(): { streak: StreakData; justAchieved: boolean } {
  const current = loadStreakData();
  const todayStr = getLocalDateString();

  if (current.todayAttended && current.history.includes(todayStr)) {
    return { streak: current, justAchieved: false };
  }

  const updatedHistory = Array.from(new Set([...current.history, todayStr]));
  let newStreak = current.currentStreak;

  if (!current.lastAttendedDate) {
    newStreak = 1;
  } else {
    const daysDiff = getDayDifference(current.lastAttendedDate, todayStr);
    if (daysDiff === 1) {
      // Attended yesterday, increment streak!
      newStreak += 1;
    } else if (daysDiff === 0) {
      // Already today
      newStreak = Math.max(1, newStreak);
    } else {
      // Missed one or more days, start fresh at 1
      newStreak = 1;
    }
  }

  const newBest = Math.max(current.bestStreak, newStreak);
  const milestone = getStreakMilestone(newStreak);

  const updatedStreak: StreakData = {
    currentStreak: newStreak,
    bestStreak: newBest,
    totalDaysAttended: updatedHistory.length,
    lastAttendedDate: todayStr,
    history: updatedHistory,
    todayAttended: true,
    milestoneTitle: milestone.title,
    nextMilestone: milestone.next,
  };

  saveStreakData(updatedStreak);

  // Play celebratory audio and confetti
  try {
    soundEffects.playHappy();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.15, x: 0.8 },
      colors: ['#FF6321', '#FF9F43', '#5A5A40', '#FFD166'],
    });
  } catch (e) {}

  return { streak: updatedStreak, justAchieved: true };
}

/**
 * Returns a 7-day rolling window of attendance (Mon-Sun or past 7 days ending today).
 */
export function getWeeklyStreakDays(history: string[]): StreakDay[] {
  const result: StreakDay[] = [];
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const historySet = new Set(history);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 7 days ending today: 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    result.push({
      date: dateStr,
      dayLabel: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      attended: historySet.has(dateStr),
    });
  }

  return result;
}
