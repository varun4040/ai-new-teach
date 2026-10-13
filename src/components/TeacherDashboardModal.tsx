import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Brain,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Activity,
  Compass,
  Clock,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { ClassroomState } from '../types';
import { loadStreakData } from '../lib/streakTracker';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomState: ClassroomState;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  onClose,
  classroomState,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#F9FBF9]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#E8F3EF] text-[#5A5A40]">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#333333]">
                  AI Classroom & Teacher Console
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Universal Adaptive Teaching Engine • Live Student Analytics
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-200/60 text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Stat Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Understanding */}
              <div className="p-4 rounded-2xl bg-[#F3F7F5] border border-gray-200/80 flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Understanding
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#5A5A40]">
                    {classroomState.understandingEstimate}%
                  </span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Live
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#5A5A40] h-full transition-all duration-500"
                    style={{ width: `${classroomState.understandingEstimate}%` }}
                  />
                </div>
              </div>

              {/* Confidence */}
              <div className="p-4 rounded-2xl bg-[#F3F7F5] border border-gray-200/80 flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Confidence
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#FF6321]">
                    {classroomState.confidenceLevel}%
                  </span>
                  <span className="text-xs text-amber-600 font-bold">High</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#FF6321] h-full transition-all duration-500"
                    style={{ width: `${classroomState.confidenceLevel}%` }}
                  />
                </div>
              </div>

              {/* Teaching Strategy */}
              <div className="p-4 rounded-2xl bg-[#F3F7F5] border border-gray-200/80 flex flex-col justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Active Strategy
                </span>
                <span className="text-sm font-extrabold text-[#333333] my-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 self-start">
                  {classroomState.currentStrategy || 'VISUAL_EXAMPLE'}
                </span>
                <span className="text-xs text-gray-400 font-mono">Adaptive Pedagogy</span>
              </div>

              {/* AI Activity State */}
              <div className="p-4 rounded-2xl bg-[#E8F3EF] border border-[#C8DCD1] flex flex-col justify-between">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> AI Activity
                </span>
                <span className="text-xs font-bold text-[#333333] bg-white/80 px-2.5 py-1.5 rounded-lg border border-[#C8DCD1]">
                  {classroomState.currentAiActivity || 'Checking understanding'}
                </span>
                <span className="text-xs text-[#5A5A40] font-mono">Live Multimodal Loop</span>
              </div>
            </div>

            {/* Student & Lesson Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#FF6321]" /> Student & Lesson Context
                </h3>
                <div className="space-y-3 text-sm text-[#333333]">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">Student Name:</span>
                    <span className="font-bold">{classroomState.student.name} (Age {classroomState.student.age})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">Class / Grade:</span>
                    <span className="font-bold">Class {classroomState.student.gradeClass}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">Subject / Chapter:</span>
                    <span className="font-bold">{classroomState.subject} — {classroomState.chapter}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Daily Learning Streak:
                    </span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {loadStreakData().currentStreak} Days
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-500">Current Concept:</span>
                    <span className="font-bold text-[#FF6321]">{classroomState.currentConcept}</span>
                  </div>
                </div>
              </div>

              {/* Misconceptions & AI Recommendations */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Misconception Diagnostics
                  </h3>
                  {classroomState.misconceptions.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 text-sm font-medium">
                      <ShieldCheck className="w-5 h-5" /> No active misconceptions detected. Student is on track!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {classroomState.misconceptions.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6321]" /> AI Recommended Next Concept:
                  </span>
                  <p className="text-sm font-extrabold text-[#333333] mt-1">
                    {classroomState.recommendedNextConcept}
                  </p>
                </div>
              </div>
            </div>

            {/* Concept Mastery Map */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#5A5A40]" /> Concept Mastery Map
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(classroomState.conceptMastery || {}).map(([concept, val]) => {
                  const score = Number(val) || 0;
                  return (
                  <div key={concept} className="p-3.5 rounded-xl bg-[#F9FBF9] border border-gray-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-[#333333]">{concept}</span>
                      <span className={`text-xs font-mono font-bold ${score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {score}% Mastered
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : 'bg-[#FF6321]'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );})}
              </div>
            </div>

            {/* Virtual Rewards & Earned Badges Showcase */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/60 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 animate-bounce" /> Virtual Badges & Trophies ({classroomState.badges?.length || 0} Earned)
                </h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                  ⭐ Niyati's Reward Showcase
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(classroomState.badges || []).map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-start gap-3 transition-transform hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#333333] mb-0.5">{badge.title}</h4>
                      <p className="text-xs text-gray-600 leading-snug mb-1">{badge.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span>{badge.subject}</span>
                        <span>•</span>
                        <span>{badge.earnedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning History Log */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" /> Recent Learning Activity Log
              </h3>
              <div className="space-y-2.5">
                {(classroomState.learningHistory || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#F3F7F5] border border-gray-200 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-400">{item.timestamp}</span>
                      <span className="font-bold text-[#333333]">{item.concept}</span>
                      <span className="text-gray-600">{item.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white text-[#5A5A40] font-semibold border border-gray-200">
                        {item.strategy}
                      </span>
                      <span className="font-bold text-emerald-700">{item.understanding}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F9FBF9] border-t border-gray-100">
            <span className="text-xs text-gray-400 font-mono">
              AI Live Teacher Engine v3.5 • Secured by Firebase Firestore
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#5A5A40] hover:bg-[#484832] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Close Console
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
