import React, { useState, useEffect, useRef } from 'react';
import { Flame, CheckCircle2, Trophy, Calendar, Sparkles, X, ChevronRight } from 'lucide-react';
import {
  StreakData,
  loadStreakData,
  recordLessonAttendance,
  getWeeklyStreakDays,
  STREAK_UPDATED_EVENT,
} from '../lib/streakTracker';
import { soundEffects } from '../lib/soundEffects';

interface StreakTrackerBadgeProps {
  studentName?: string;
  className?: string;
}

export const StreakTrackerBadge: React.FC<StreakTrackerBadgeProps> = ({
  studentName = 'Niyati',
  className = '',
}) => {
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load
    setStreakData(loadStreakData());

    // Listen for global streak update events
    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StreakData>;
      if (customEvent.detail) {
        setStreakData(customEvent.detail);
      } else {
        setStreakData(loadStreakData());
      }
    };

    window.addEventListener(STREAK_UPDATED_EVENT, handleStreakUpdate);
    return () => {
      window.removeEventListener(STREAK_UPDATED_EVENT, handleStreakUpdate);
    };
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleManualCheckIn = () => {
    soundEffects.playPop();
    const result = recordLessonAttendance();
    setStreakData(result.streak);
  };

  const weeklyDays = getWeeklyStreakDays(streakData.history);

  // Progress to next milestone
  const progressPercent = Math.min(
    100,
    Math.round((streakData.currentStreak / streakData.nextMilestone) * 100)
  );

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button / Badge */}
      <button
        id="learning-streak-badge-btn"
        type="button"
        onClick={() => {
          soundEffects.playClick();
          setIsOpen(!isOpen);
        }}
        className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer select-none border ${
          streakData.currentStreak > 0
            ? 'bg-amber-50 hover:bg-amber-100/90 text-amber-900 border-amber-300 ring-2 ring-amber-200/50 hover:shadow-amber-100'
            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
        }`}
        title={`Daily Learning Streak: ${streakData.currentStreak} days attended consecutive lessons`}
        aria-expanded={isOpen}
      >
        <span className="relative flex items-center justify-center">
          <Flame
            className={`w-4 h-4 text-orange-500 fill-orange-500 transition-transform group-hover:scale-110 ${
              streakData.currentStreak > 0 ? 'animate-bounce duration-1000' : ''
            }`}
          />
          {streakData.todayAttended && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          )}
        </span>

        <span className="font-extrabold tracking-tight text-amber-950">
          {streakData.currentStreak}
        </span>
        <span className="hidden sm:inline font-bold text-amber-900/90 text-[11px]">
          {streakData.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
        </span>

        {/* Small check indicator on mobile */}
        {streakData.todayAttended ? (
          <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black tracking-wider uppercase">
            ✓ Done
          </span>
        ) : (
          <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 bg-orange-200/80 text-orange-950 rounded-full text-[9px] font-black tracking-wider uppercase animate-pulse">
            Today
          </span>
        )}
      </button>

      {/* Expanded Streak Popover Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Daily Learning Streak Details"
          className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-[310px] sm:w-[340px] bg-white rounded-2xl shadow-2xl border border-amber-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#333333]"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#333333] leading-tight">
                  Daily Learning Streak
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Consistent lesson attendance
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Close streak view"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Streak Counter Hero Banner */}
          <div className="mt-3 p-3.5 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-xl text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-100 block">
                  Current Attendance Habit
                </span>
                <div className="text-2xl sm:text-3xl font-black flex items-baseline gap-1 mt-0.5">
                  {streakData.currentStreak}
                  <span className="text-sm font-bold text-orange-100">
                    {streakData.currentStreak === 1 ? 'consecutive day' : 'consecutive days'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
                🔥
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-semibold text-orange-50">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> {streakData.milestoneTitle}
              </span>
              <span>Next goal: {streakData.nextMilestone} days</span>
            </div>
          </div>

          {/* 7-Day Rolling Attendance Mini Calendar */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                This Week's Attendance
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Last 7 days</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weeklyDays.map((d) => (
                <div
                  key={d.date}
                  className={`flex flex-col items-center py-1.5 px-1 rounded-xl text-center transition-all ${
                    d.isToday
                      ? 'bg-orange-50 border-2 border-orange-400 ring-2 ring-orange-200/50'
                      : d.attended
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-gray-50 border border-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase text-gray-500">
                    {d.dayLabel}
                  </span>
                  <span
                    className={`text-xs font-black my-0.5 ${
                      d.isToday ? 'text-orange-600' : d.attended ? 'text-emerald-700' : 'text-gray-400'
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                    {d.attended ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : d.isToday ? (
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-3.5 grid grid-cols-3 gap-2 bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Streak</span>
              <span className="text-sm font-black text-[#333333]">{streakData.currentStreak}d</span>
            </div>
            <div className="border-x border-gray-200">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Record</span>
              <span className="text-sm font-black text-amber-600">{streakData.bestStreak}d</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Total</span>
              <span className="text-sm font-black text-emerald-700">
                {streakData.totalDaysAttended}d
              </span>
            </div>
          </div>

          {/* Milestone Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center text-[11px] font-semibold text-gray-600 mb-1">
              <span>Progress to {streakData.nextMilestone} Days</span>
              <span className="font-bold text-orange-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Attendance Action / Status Box */}
          <div className="mt-3.5 pt-2.5 border-t border-gray-100">
            {streakData.todayAttended ? (
              <div className="flex items-center gap-2 p-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-extrabold block">Lesson Attended Today!</span>
                  <span className="text-[10px] text-emerald-700 block">
                    {studentName}'s streak is safe and active. Keep it burning tomorrow!
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleManualCheckIn}
                className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>Mark Today's Lesson Attended</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
