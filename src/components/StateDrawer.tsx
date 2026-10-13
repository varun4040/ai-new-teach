import React, { useState } from 'react';
import {
  X,
  User,
  BookOpen,
  Target,
  Award,
  AlertTriangle,
  Layers,
  Download,
  FileText,
  MessageSquare,
  CheckCircle,
  Flame,
} from 'lucide-react';
import { ClassroomState } from '../types';
import { loadStreakData } from '../lib/streakTracker';

interface StateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  classroomState: ClassroomState;
  transcriptHistory?: Array<{ sender: 'Teacher' | 'Student'; text: string; timestamp: string }>;
}

export const StateDrawer: React.FC<StateDrawerProps> = ({
  isOpen,
  onClose,
  classroomState,
  transcriptHistory = [],
}) => {
  const [activeTab, setActiveTab] = useState<'state' | 'transcript'>('state');
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      student: classroomState.student,
      language: classroomState.language,
      curriculum: {
        subject: classroomState.subject,
        chapter: classroomState.chapter,
        currentConcept: classroomState.currentConcept,
        lessonObjective: classroomState.lessonObjective,
      },
      learningProgress: {
        understandingEstimate: `${classroomState.understandingEstimate}%`,
        activeStrategy: classroomState.currentStrategy || 'VISUAL_EXAMPLE',
        conceptsMastered: classroomState.conceptsMastered || [],
        misconceptionsIdentified: classroomState.misconceptions || [],
      },
      transcripts: transcriptHistory,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `classroom-state-${classroomState.student.name.toLowerCase()}-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportParentReport = () => {
    const reportText = `=====================================================
AI VIRTUAL CLASSROOM - PARENT LESSON PROGRESS REPORT
=====================================================
Exported On: ${new Date().toLocaleString()}

STUDENT PROFILE
-----------------------------------------------------
Name: ${classroomState.student.name}
Age: ${classroomState.student.age} years
Grade/Class: Class ${classroomState.student.gradeClass}
Language Preference: ${classroomState.language.toUpperCase()}

LESSON OVERVIEW
-----------------------------------------------------
Subject: ${classroomState.subject}
Chapter: ${classroomState.chapter}
Current Concept: ${classroomState.currentConcept}
Lesson Objective: ${classroomState.lessonObjective}

PROGRESS & PERFORMANCE
-----------------------------------------------------
Understanding Estimate: ${classroomState.understandingEstimate}%
Active Teaching Method: ${classroomState.currentStrategy || 'VISUAL_EXAMPLE'}

CONCEPTS MASTERED:
${
  classroomState.conceptsMastered && classroomState.conceptsMastered.length > 0
    ? classroomState.conceptsMastered.map((c, i) => `  ${i + 1}. ${c}`).join('\n')
    : '  - None marked yet.'
}

MISCONCEPTIONS IDENTIFIED / REINFORCEMENTS NEEDED:
${
  classroomState.misconceptions && classroomState.misconceptions.length > 0
    ? classroomState.misconceptions.map((m, i) => `  ${i + 1}. ${m}`).join('\n')
    : '  - None identified.'
}

CLASSROOM TRANSCRIPT HIGHLIGHTS (${transcriptHistory.length} messages):
-----------------------------------------------------
${
  transcriptHistory.length > 0
    ? transcriptHistory.map((t) => `[${t.timestamp}] ${t.sender}: ${t.text}`).join('\n')
    : '  - No transcript entries recorded yet.'
}

=====================================================
Thank you for supporting ${classroomState.student.name}'s learning journey!
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `parent-report-${classroomState.student.name.toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col text-[#333333]">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#5A5A40]" />
          <h3 className="text-base font-bold text-[#333333]">Classroom State & Parent Review</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-gray-800 bg-[#F3F7F5] rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        <button
          onClick={() => setActiveTab('state')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'state'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Lesson State & Analytics
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'transcript'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Transcript Log ({transcriptHistory.length})
        </button>
      </div>

      {/* State Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FDFCF8]">
        {/* Quick Export Actions Bar */}
        <div className="p-3 bg-[#E8F3EF] border border-[#C8DCD1] rounded-2xl flex flex-col gap-2">
          <span className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export Progress & Parent Review:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#333333] shadow-xs cursor-pointer transition-colors"
              title="Download structured JSON file"
            >
              <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportParentReport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              title="Download Parent Summary Text Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Parent Summary</span>
            </button>
          </div>
          {copiedNotice && (
            <p className="text-[11px] font-medium text-[#5A5A40] flex items-center gap-1 mt-1">
              <CheckCircle className="w-3.5 h-3.5" /> Parent report downloaded successfully!
            </p>
          )}
        </div>

        {activeTab === 'state' ? (
          <>
            {/* Student Profile Card */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-[#5A5A40] text-xs font-bold uppercase tracking-wider mb-2">
                <User className="w-4 h-4" />
                Student Profile
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Name:</span>{' '}
                  <span className="font-bold text-[#333333]">{classroomState.student.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Age:</span>{' '}
                  <span className="font-bold text-[#333333]">{classroomState.student.age} years</span>
                </div>
                <div>
                  <span className="text-gray-500">Class:</span>{' '}
                  <span className="font-bold text-[#333333]">Class {classroomState.student.gradeClass}</span>
                </div>
                <div>
                  <span className="text-gray-500">Language:</span>{' '}
                  <span className="font-bold text-[#FF6321] capitalize">{classroomState.language}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Daily Attendance Streak:
                  </span>
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    {loadStreakData().currentStreak} Days
                  </span>
                </div>
              </div>
            </div>

            {/* Current Lesson Context */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-[#5A5A40] text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                Curriculum Context
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">Subject:</span>{' '}
                  <span className="font-semibold text-[#333333]">{classroomState.subject}</span>
                </div>
                <div>
                  <span className="text-gray-500">Chapter:</span>{' '}
                  <span className="font-semibold text-[#FF6321]">{classroomState.chapter}</span>
                </div>
                <div>
                  <span className="text-gray-500">Current Concept:</span>{' '}
                  <p className="font-medium text-[#333333] mt-0.5">{classroomState.currentConcept}</p>
                </div>
                <div>
                  <span className="text-gray-500">Lesson Objective:</span>{' '}
                  <p className="font-medium text-gray-700 mt-0.5">{classroomState.lessonObjective}</p>
                </div>
              </div>
            </div>

            {/* Understanding & Teaching Strategy */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-[#5A5A40] text-xs font-bold uppercase tracking-wider mb-2">
                <Target className="w-4 h-4" />
                Pedagogy Strategy & Mastery
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Understanding Estimate:</span>
                    <span className="font-bold text-[#5A5A40]">
                      {classroomState.understandingEstimate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5A5A40]"
                      style={{ width: `${classroomState.understandingEstimate}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-gray-500">Active Teaching Strategy:</span>{' '}
                  <span className="font-mono text-xs font-bold bg-[#E8F3EF] text-[#5A5A40] px-2 py-0.5 rounded-full border border-[#C8DCD1]">
                    {classroomState.currentStrategy || 'VISUAL_EXAMPLE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Concepts Mastered */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-[#5A5A40] text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                Concepts Mastered ({(classroomState.conceptsMastered || []).length})
              </div>
              {(classroomState.conceptsMastered || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No concepts marked as mastered yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(classroomState.conceptsMastered || []).map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 bg-[#E8F3EF] text-[#5A5A40] border border-[#C8DCD1] text-xs rounded-full font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Misconceptions Identified */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                Misconceptions Identified ({(classroomState.misconceptions || []).length})
              </div>
              {(classroomState.misconceptions || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No misconceptions flagged.</p>
              ) : (
                <div className="space-y-1">
                  {(classroomState.misconceptions || []).map((m, i) => (
                    <div
                      key={i}
                      className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {transcriptHistory.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-8">
                No transcript logs recorded yet during this lesson session.
              </p>
            ) : (
              transcriptHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs border ${
                    item.sender === 'Teacher'
                      ? 'bg-white border-gray-200 text-[#333333]'
                      : 'bg-[#F3F7F5] border-gray-200 text-[#5A5A40] font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{item.sender === 'Teacher' ? '👩‍🏫 Ms. Priya' : '👧 Student'}</span>
                    <span className="text-[10px] font-mono text-gray-400">{item.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{item.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
