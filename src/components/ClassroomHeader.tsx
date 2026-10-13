import React, { useState } from 'react';
import { Sparkles, Globe, PlayCircle, BookOpen, Wifi, WifiOff, Cloud, LogIn, LogOut, User, Menu, X, SlidersHorizontal } from 'lucide-react';
import { ClassroomState, LanguageMode } from '../types';
import { loginWithGoogle, logoutFirebase } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { LanguageSelector } from './LanguageSelector';
import { getLanguageDefinition } from '../lib/languages';
import { StreakTrackerBadge } from './StreakTrackerBadge';

interface ClassroomHeaderProps {
  classroomState: ClassroomState;
  onLanguageChange: (lang: LanguageMode) => void;
  onStartDemoLesson: () => void;
  onOpenTextbookModal: () => void;
  onOpenDashboard: () => void;
  onOpenAskAnything: () => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'dev_offline';
  connectionNotice?: string;
  currentUser?: FirebaseUser | null;
  onSaveFirebaseSession?: () => void;
  onToggleStateDrawer?: () => void;
  onResetClass?: () => void;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  classroomState,
  onLanguageChange,
  onStartDemoLesson,
  onOpenTextbookModal,
  onOpenDashboard,
  onOpenAskAnything,
  connectionStatus,
  currentUser,
  onSaveFirebaseSession,
  onToggleStateDrawer,
  onResetClass,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeLang = getLanguageDefinition(classroomState.language);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-[56px] sm:h-[64px] bg-white border-b border-gray-100 text-[#333333] shadow-xs z-20 shrink-0">
      {/* Left: Brand / Teacher Name & LIVE indicator */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-xs shrink-0">
          A
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-[#333333]">
              Ms. Priya <span className="hidden sm:inline font-normal text-xs text-gray-400">| AI Live Teacher</span>
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 animate-pulse">
              LIVE
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 truncate max-w-[200px] sm:max-w-none">
            Class {classroomState.student.gradeClass}: {classroomState.subject} • {classroomState.student.name}
          </p>
        </div>
      </div>

      {/* Right: Desktop Controls & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Learning Streak Tracker */}
        <StreakTrackerBadge studentName={classroomState.student.name} />

        {/* 1-Click English / Hinglish Toggle Button */}
        <button
          id="quick-language-toggle-btn"
          type="button"
          onClick={() =>
            onLanguageChange(classroomState.language === 'english' ? 'hinglish' : 'english')
          }
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
            classroomState.language === 'english'
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 ring-2 ring-blue-200'
              : classroomState.language === 'hinglish'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-2 ring-orange-300 shadow-orange-200'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200'
          }`}
          title="Quick switch between English and Hinglish"
        >
          {classroomState.language === 'english' ? (
            <>
              <span className="text-sm leading-none" aria-hidden="true">🇬🇧</span>
              <span>English Mode</span>
              <span className="px-1.5 py-0.2 bg-blue-200/80 text-blue-900 rounded-full text-[9px] font-black tracking-wider uppercase">
                ON
              </span>
            </>
          ) : (
            <>
              <span className="text-sm leading-none" aria-hidden="true">🇮🇳</span>
              <span className="hidden sm:inline">Hinglish Mode</span>
              <span className="sm:hidden font-extrabold">Hinglish</span>
              {classroomState.language === 'hinglish' && (
                <span className="px-1.5 py-0.2 bg-white/25 rounded-full text-[9px] font-black tracking-wider uppercase">
                  ON
                </span>
              )}
            </>
          )}
        </button>

        {/* Multilingual Selector */}
        <LanguageSelector
          currentLanguage={classroomState.language}
          onLanguageChange={onLanguageChange}
        />

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {/* Firebase Cloud Sync */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#E8F3EF] border border-[#C8DCD1] px-2.5 py-1 rounded-xl text-xs font-semibold text-[#5A5A40]">
              <span className="truncate max-w-[80px]">{currentUser.displayName || 'Parent'}</span>
              <button onClick={onSaveFirebaseSession} className="p-0.5 hover:bg-[#C8DCD1] rounded cursor-pointer" title="Sync with Firebase">
                <Cloud className="w-3.5 h-3.5 text-[#5A5A40]" />
              </button>
              <button onClick={() => logoutFirebase()} className="p-0.5 hover:bg-red-100 rounded text-red-500 cursor-pointer" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (err: any) {
                  console.warn('Google Sign-In handled:', err);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#F3F7F5] hover:bg-gray-100 border border-gray-200 text-[#5A5A40] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sync</span>
            </button>
          )}

          {/* Teacher Console */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#E8F3EF] hover:bg-[#C8DCD1] text-[#5A5A40] border border-[#C8DCD1] font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF6321]" />
            <span>{activeLang.ui.console}</span>
          </button>

          {/* Ask Anything */}
          <button
            onClick={onOpenAskAnything}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-[#FF6321] hover:bg-[#e0551c] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>{activeLang.ui.askAnything}</span>
          </button>

          {/* Demo Lesson */}
          <button
            onClick={onStartDemoLesson}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-white" />
            <span>{activeLang.ui.demoLesson}</span>
          </button>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-[#F3F7F5] text-[#5A5A40] border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Open Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown Modal */}
      {mobileMenuOpen && (
        <div className="absolute top-[56px] left-0 right-0 bg-white border-b border-gray-200 shadow-xl p-4 flex flex-col gap-3 md:hidden z-50">
          {/* Mobile Streak Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs font-semibold text-gray-700">
            <span>Daily Streak:</span>
            <StreakTrackerBadge studentName={classroomState.student.name} />
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs font-semibold text-gray-500">
            <span>Language:</span>
            <LanguageSelector
              currentLanguage={classroomState.language}
              onLanguageChange={(lang) => {
                onLanguageChange(lang);
                setMobileMenuOpen(false);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenAskAnything();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-[#FF6321] text-white rounded-xl text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" /> {activeLang.ui.askAnything}
            </button>
            <button
              onClick={() => {
                onOpenDashboard();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-[#E8F3EF] text-[#5A5A40] border border-[#C8DCD1] rounded-xl text-xs font-bold"
            >
              {activeLang.ui.console}
            </button>
            <button
              onClick={() => {
                onOpenTextbookModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-[#333333] rounded-xl text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4 text-[#5A5A40]" /> {activeLang.ui.textbook}
            </button>
            <button
              onClick={() => {
                onStartDemoLesson();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-[#5A5A40] text-white rounded-xl text-xs font-semibold"
            >
              <PlayCircle className="w-4 h-4" /> {activeLang.ui.demoLesson}
            </button>
            {onToggleStateDrawer && (
              <button
                onClick={() => {
                  onToggleStateDrawer();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-[#333333] rounded-xl text-xs font-semibold"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#5A5A40]" /> {activeLang.ui.progressState}
              </button>
            )}
            {onResetClass && (
              <button
                onClick={() => {
                  onResetClass();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold"
              >
                {activeLang.ui.resetClass}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


