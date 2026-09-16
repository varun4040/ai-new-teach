import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ClassroomHeader } from './components/ClassroomHeader';
import { TeacherAvatarView } from './components/TeacherAvatarView';
import { DigitalWhiteboard } from './components/DigitalWhiteboard';
import { ControlBar } from './components/ControlBar';
import { TextbookModal } from './components/TextbookModal';
import { StateDrawer } from './components/StateDrawer';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { AskAnythingModal } from './components/AskAnythingModal';
import { GeminiLiveClient } from './lib/GeminiLiveClient';
import { PlaceholderTeacherAdapter } from './lib/PlaceholderTeacherAdapter';
import { AvatarAdapter } from './lib/AvatarAdapter';
import { auth, saveSessionToFirestore } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Home, BookOpen, Edit3, BarChart2, MoreHorizontal } from 'lucide-react';
import {
  ClassroomState,
  WhiteboardToolEvent,
  TextbookChapter,
  AvatarState,
  LanguageMode,
} from './types';
import {
  DEFAULT_CLASSROOM_STATE,
  DEMO_MATH_LESSON_STATE,
  NCERT_CLASS_2_SUBJECTS,
  MATH_CLASS_2_CHAPTERS,
  HINDI_CLASS_2_CHAPTERS,
  EVS_CLASS_2_CHAPTERS,
  GK_CLASS_2_CHAPTERS,
  updateStateFromTool,
} from './lib/LessonState';
import { soundEffects } from './lib/soundEffects';
import { backgroundMusic } from './lib/backgroundMusic';
import { getLanguageDefinition } from './lib/languages';

export default function App() {
  const [classroomState, setClassroomState] = useState<ClassroomState>(() => {
    try {
      const savedLang = localStorage.getItem('ai_live_teacher_lang') as LanguageMode | null;
      if (savedLang) {
        return {
          ...DEFAULT_CLASSROOM_STATE,
          language: savedLang,
          student: { ...DEFAULT_CLASSROOM_STATE.student, preferredLanguage: savedLang },
        };
      }
    } catch (e) {}
    return DEFAULT_CLASSROOM_STATE;
  });
  const [activeToolEvent, setActiveToolEvent] = useState<WhiteboardToolEvent | null>(null);
  const [textbook, setTextbook] = useState<TextbookChapter | null>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTextbookModalOpen, setIsTextbookModalOpen] = useState(false);
  const [isStateDrawerOpen, setIsStateDrawerOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isAskAnythingModalOpen, setIsAskAnythingModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'lesson' | 'whiteboard' | 'progress' | 'more'>('home');
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'dev_offline'
  >('connecting');
  const [connectionNotice, setConnectionNotice] = useState<string | undefined>();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [saveSyncNotice, setSaveSyncNotice] = useState<string | null>(null);

  // Subject Switcher for Niyati (Class 2 NCERT)
  const handleSelectSubject = (subjObj: (typeof NCERT_CLASS_2_SUBJECTS)[0]) => {
    soundEffects.playWhoosh();
    let initialChapter = subjObj.chapter;
    let initialConcept = subjObj.concept;
    let initialObjective = subjObj.objective;

    if (subjObj.subject === 'Mathematics' && MATH_CLASS_2_CHAPTERS.length > 0) {
      initialChapter = MATH_CLASS_2_CHAPTERS[0].chapter;
      initialConcept = MATH_CLASS_2_CHAPTERS[0].concept;
      initialObjective = MATH_CLASS_2_CHAPTERS[0].objective;
    } else if (subjObj.subject === 'Hindi' && HINDI_CLASS_2_CHAPTERS.length > 0) {
      initialChapter = HINDI_CLASS_2_CHAPTERS[0].chapter;
      initialConcept = HINDI_CLASS_2_CHAPTERS[0].concept;
      initialObjective = HINDI_CLASS_2_CHAPTERS[0].objective;
    } else if (subjObj.subject === 'EVS' && EVS_CLASS_2_CHAPTERS.length > 0) {
      initialChapter = EVS_CLASS_2_CHAPTERS[0].chapter;
      initialConcept = EVS_CLASS_2_CHAPTERS[0].concept;
      initialObjective = EVS_CLASS_2_CHAPTERS[0].objective;
    } else if (subjObj.subject === 'GK' && GK_CLASS_2_CHAPTERS.length > 0) {
      initialChapter = GK_CLASS_2_CHAPTERS[0].chapter;
      initialConcept = GK_CLASS_2_CHAPTERS[0].concept;
      initialObjective = GK_CLASS_2_CHAPTERS[0].objective;
    }

    setClassroomState((prev) => ({
      ...prev,
      subject: subjObj.subject,
      chapter: initialChapter,
      currentConcept: initialConcept,
      lessonObjective: initialObjective,
    }));
    setActiveToolEvent({
      type: 'show_text',
      payload: {
        title: `Class 2 • ${subjObj.subject} (${subjObj.hindiName})`,
        text: `Welcome to ${subjObj.subject}! Chapter: ${initialChapter}. Let's learn together, Niyati!`,
        highlight: initialChapter,
      },
    });
    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.speak(undefined, `Welcome to Class 2 ${subjObj.subject}, Niyati! Let's explore ${initialChapter}.`);
    }
    setTranscriptHistory((prev) => [
      ...prev,
      {
        sender: 'Teacher',
        text: `Welcome to Class 2 ${subjObj.subject}! Let's explore ${initialChapter}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Chapter Switcher for any subject
  const handleSelectChapter = (ch: { chapter: string; hindiName: string; concept: string; objective: string }) => {
    soundEffects.playWhoosh();
    setClassroomState((prev) => ({
      ...prev,
      chapter: ch.chapter,
      currentConcept: ch.concept,
      lessonObjective: ch.objective,
    }));
    setActiveToolEvent({
      type: 'show_text',
      payload: {
        title: `${classroomState.subject} • ${ch.chapter} (${ch.hindiName})`,
        text: `Now studying ${ch.chapter}: ${ch.concept}. Let's dive in, Niyati!`,
        highlight: ch.chapter,
      },
    });
    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.speak(undefined, `Let's study ${ch.chapter}, Niyati! ${ch.objective}`);
    }
    setTranscriptHistory((prev) => [
      ...prev,
      {
        sender: 'Teacher',
        text: `Switched to ${classroomState.subject} Chapter: ${ch.chapter} (${ch.hindiName}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveFirebaseSession = async () => {
    if (!currentUser) return;
    try {
      setSaveSyncNotice('Syncing session with Firebase Cloud...');
      const id = await saveSessionToFirestore(currentUser.uid, classroomState);
      if (id) {
        setSaveSyncNotice('Session saved to Firebase Firestore successfully!');
        setTimeout(() => setSaveSyncNotice(null), 3000);
      }
    } catch (err) {
      console.error('Save session error:', err);
      setSaveSyncNotice('Failed to save session to Firebase');
      setTimeout(() => setSaveSyncNotice(null), 3000);
    }
  };

  // Transcript History for Parent Export
  const [transcriptHistory, setTranscriptHistory] = useState<
    Array<{ sender: 'Teacher' | 'Student'; text: string; timestamp: string }>
  >([
    {
      sender: 'Teacher',
      text: 'Namaste! Ready for our class today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Avatar Adapter
  const avatarAdapterRef = useRef<AvatarAdapter | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>({
    isSpeaking: false,
    emotion: 'happy',
    gesture: 'idle',
    lookingAt: 'student',
    transcriptText: 'Namaste! Ready for our class today?',
  });

  // Gemini Live Client
  const geminiLiveClientRef = useRef<GeminiLiveClient | null>(null);

  // Initialize Avatar Adapter and Gemini Live Client on Mount
  useEffect(() => {
    // 1. Instantiate Pluggable Avatar Adapter
    const adapter = new PlaceholderTeacherAdapter();
    avatarAdapterRef.current = adapter;

    adapter.initialize().then(() => {
      setAvatarState(adapter.getState());
    });

    const unsubscribeAvatar = adapter.addListener({
      onStateChange: (newState) => {
        setAvatarState(newState);
      },
    });

    // 2. Instantiate Gemini Live WebSocket Client
    const liveClient = new GeminiLiveClient({
      onConnectionStatus: (status, notice) => {
        setConnectionStatus(status);
        setConnectionNotice(notice);
      },
      onTranscript: (text) => {
        adapter.speak(undefined, text);
        setTranscriptHistory((prev) => [
          ...prev,
          {
            sender: 'Teacher',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      },
      onInterrupted: () => {
        adapter.interrupt();
      },
      onToolCall: (toolCall) => {
        setActiveToolEvent(toolCall);
        adapter.lookAtBoard();

        // Update classroom state estimate
        if (toolCall.type === 'check_answer') {
          const isCorrect = (toolCall as any).payload?.isCorrect;
          setClassroomState((prev) =>
            updateStateFromTool(prev, isCorrect ? undefined : 'Addition grouping confusion', undefined, isCorrect ? 10 : -5)
          );
        } else if (toolCall.type === 'show_objects') {
          setClassroomState((prev) =>
            updateStateFromTool(prev, undefined, 'Counting objects in groups', 5)
          );
        }
      },
      onError: (err) => {
        setConnectionNotice(err);
      },
    });

    geminiLiveClientRef.current = liveClient;
    liveClient.connect();

    return () => {
      unsubscribeAvatar();
      adapter.destroy();
      liveClient.disconnect();
    };
  }, []);

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (!geminiLiveClientRef.current) return;

    if (isMicActive) {
      geminiLiveClientRef.current.stopMicrophone();
      setIsMicActive(false);
    } else {
      const success = await geminiLiveClientRef.current.startMicrophone();
      if (success) {
        setIsMicActive(true);
        if (avatarAdapterRef.current) {
          avatarAdapterRef.current.setEmotion('listening');
          avatarAdapterRef.current.lookAtStudent();
        }
      } else {
        setIsMicActive(false);
        setConnectionNotice('Microphone permission denied or blocked in this browser frame. You can use text chat below!');
      }
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    setIsCameraActive((prev) => !prev);
  };

  // Camera Frame Capture Handler
  const handleFrameCaptured = (base64Image: string) => {
    if (geminiLiveClientRef.current) {
      geminiLiveClientRef.current.sendVideoFrame(base64Image);
    }
  };

  // Send Text Message to Teacher
  const handleSendTextMessage = async (text: string) => {
    setTranscriptHistory((prev) => [
      ...prev,
      {
        sender: 'Student',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.setEmotion('thinking');
    }

    const isWsActive =
      geminiLiveClientRef.current &&
      connectionStatus === 'connected' &&
      geminiLiveClientRef.current.isConnected();

    if (isWsActive) {
      geminiLiveClientRef.current!.sendTextMessage(text, classroomState);
      return;
    }

    // Call REST endpoint if WS not active
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          classroomState,
          textbook,
        }),
      });

      const data = await res.json();
      if (data.text && avatarAdapterRef.current) {
        avatarAdapterRef.current.setEmotion('explaining');
        avatarAdapterRef.current.speak(undefined, data.text);
        setTranscriptHistory((prev) => [
          ...prev,
          {
            sender: 'Teacher',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      if (data.toolCall) {
        setActiveToolEvent(data.toolCall);
        if (avatarAdapterRef.current) {
          avatarAdapterRef.current.lookAtBoard();
        }
      }
    } catch (err) {
      console.error('Error in handleSendTextMessage REST fallback:', err);
    }
  };

  // Start Built-In Demo Lesson ("Class 2 Mathematics: Addition up to 20")
  const handleStartDemoLesson = () => {
    setClassroomState(DEMO_MATH_LESSON_STATE);

    const demoSpeech =
      "Welcome Ananya! Let's try something fun. Look at the whiteboard! I put 5 red apples on top, and 3 green apples underneath. How many apples do we have altogether?";

    setTranscriptHistory((prev) => [
      ...prev,
      {
        sender: 'Teacher',
        text: demoSpeech,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Initial demo whiteboard event: 5 apples + 3 apples
    const demoToolEvent: WhiteboardToolEvent = {
      type: 'show_objects',
      payload: {
        object: 'apple',
        count: 8,
        group1: 5,
        group2: 3,
        symbol: '+',
        label: 'Ananya’s Apples: 5 Red Apples + 3 Green Apples = 8 Total',
      },
    };

    setActiveToolEvent(demoToolEvent);

    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.setEmotion('encouraging');
      avatarAdapterRef.current.setGesture('pointing_right');
      avatarAdapterRef.current.lookAtBoard();
      avatarAdapterRef.current.speak(undefined, demoSpeech);
    }
  };

  // Handle Answer Submit on Interactive Whiteboard
  const handleAnswerSubmit = (answerIndex: number, isCorrect: boolean) => {
    if (isCorrect) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF6321', '#16A34A', '#2563EB', '#FACC15', '#9333EA', '#EC4899'],
        });
      } catch (err) {
        console.error('Confetti trigger error:', err);
      }
    } else {
      soundEffects.playTryAgain();
    }

    const feedbackText = isCorrect
      ? 'Super star! That is completely correct! 8 apples altogether.'
      : 'Good try! Let us count them together on the whiteboard step by step.';

    const feedbackToolCall: WhiteboardToolEvent = {
      type: 'check_answer',
      payload: {
        isCorrect,
        feedback: feedbackText,
      },
    };

    setActiveToolEvent(feedbackToolCall);

    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.setEmotion(isCorrect ? 'happy' : 'encouraging');
      avatarAdapterRef.current.setGesture(isCorrect ? 'clapping' : 'idle');
      avatarAdapterRef.current.speak(undefined, feedbackText);
    }

    setClassroomState((prev) =>
      updateStateFromTool(
        prev,
        isCorrect ? undefined : 'Addition counting error',
        isCorrect ? 'Class 2 Visual Addition' : undefined,
        isCorrect ? 10 : -5
      )
    );
  };

  // Language Mode Change
  const handleLanguageChange = (lang: LanguageMode) => {
    setClassroomState((prev) => ({
      ...prev,
      language: lang,
      student: { ...prev.student, preferredLanguage: lang },
    }));
    try {
      localStorage.setItem('ai_live_teacher_lang', lang);
    } catch (e) {}

    const langDef = getLanguageDefinition(lang);
    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.speak(undefined, langDef.greeting);
    }
  };

  // Ask Anything Mode handler
  const handleAskAnythingQuestion = async (question: string) => {
    setTranscriptHistory((prev) => [
      ...prev,
      { sender: 'Student', text: `[Ask Anything]: ${question}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.setEmotion('thinking');
    }

    const isWsActive =
      geminiLiveClientRef.current &&
      connectionStatus === 'connected' &&
      geminiLiveClientRef.current.isConnected();

    if (isWsActive) {
      geminiLiveClientRef.current!.sendTextMessage(`[Ask Anything Mode]: ${question}`, classroomState);
      return;
    }

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `[Ask Anything Mode]: ${question}`, classroomState, textbook }),
      });
      const data = await res.json();
      if (data.text) {
        if (avatarAdapterRef.current) {
          avatarAdapterRef.current.setEmotion('explaining');
          avatarAdapterRef.current.speak(undefined, data.text);
        }
        if (data.toolCall) {
          setActiveToolEvent(data.toolCall);
          if (avatarAdapterRef.current) {
            avatarAdapterRef.current.lookAtBoard();
          }
        }
        setTranscriptHistory((prev) => [
          ...prev,
          { sender: 'Teacher', text: data.text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
      }
    } catch (err) {
      console.warn('Ask Anything error:', err);
    }
  };

  // Reset Session
  const handleResetClass = () => {
    setActiveToolEvent(null);
    setClassroomState(DEFAULT_CLASSROOM_STATE);
    setTextbook(null);
    backgroundMusic.stop();
    if (avatarAdapterRef.current) {
      avatarAdapterRef.current.initialize();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FDFCF8] font-sans text-[#333333] overflow-hidden select-none relative">
      {saveSyncNotice && (
        <div className="absolute top-16 right-6 z-50 bg-[#5A5A40] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg animate-bounce">
          {saveSyncNotice}
        </div>
      )}

      {/* Top Classroom Header */}
      <ClassroomHeader
        classroomState={classroomState}
        onLanguageChange={handleLanguageChange}
        onStartDemoLesson={handleStartDemoLesson}
        onOpenTextbookModal={() => setIsTextbookModalOpen(true)}
        onOpenDashboard={() => setIsDashboardModalOpen(true)}
        onOpenAskAnything={() => setIsAskAnythingModalOpen(true)}
        connectionStatus={connectionStatus}
        connectionNotice={connectionNotice}
        currentUser={currentUser}
        onSaveFirebaseSession={handleSaveFirebaseSession}
      />

      {/* NCERT Class 2 Subject Selector Bar for Niyati */}
      <div className="bg-[#F8F9F6] border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A5A40] whitespace-nowrap">
            NCERT Class 2 ({classroomState.student.name}'s Subjects):
          </span>
          <div className="flex items-center gap-1.5">
            {NCERT_CLASS_2_SUBJECTS.map((s) => {
              const isSelected = classroomState.subject === s.subject;
              return (
                <button
                  key={s.subject}
                  onClick={() => handleSelectSubject(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-[#FF6321] text-white shadow-sm scale-105 ring-2 ring-orange-200'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {s.subject} <span className="opacity-80 text-[10px]">({s.hindiName})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mathematics Chapters Sub-Bar (When Mathematics is selected) */}
      {classroomState.subject === 'Mathematics' && (
        <div className="bg-orange-50/70 border-b border-orange-200 px-4 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wide whitespace-nowrap flex items-center gap-1">
            🔢 Math Chapters:
          </span>
          <div className="flex items-center gap-1.5">
            {MATH_CLASS_2_CHAPTERS.map((ch) => {
              const isChapterSelected = classroomState.chapter === ch.chapter;
              return (
                <button
                  key={ch.chapter}
                  onClick={() => handleSelectChapter(ch)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isChapterSelected
                      ? 'bg-orange-700 text-white shadow-xs ring-2 ring-orange-300'
                      : 'bg-white text-orange-900 hover:bg-orange-100 border border-orange-200'
                  }`}
                >
                  {ch.chapter} <span className="text-[10px] opacity-75">({ch.hindiName})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hindi Chapters Sub-Bar (When Hindi is selected) */}
      {classroomState.subject === 'Hindi' && (
        <div className="bg-purple-50/70 border-b border-purple-200 px-4 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide whitespace-nowrap flex items-center gap-1">
            📖 Hindi Chapters:
          </span>
          <div className="flex items-center gap-1.5">
            {HINDI_CLASS_2_CHAPTERS.map((ch) => {
              const isChapterSelected = classroomState.chapter === ch.chapter;
              return (
                <button
                  key={ch.chapter}
                  onClick={() => handleSelectChapter(ch)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isChapterSelected
                      ? 'bg-purple-700 text-white shadow-xs ring-2 ring-purple-300'
                      : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  {ch.chapter} <span className="text-[10px] opacity-75">({ch.hindiName})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* EVS Chapters Sub-Bar (When EVS is selected) */}
      {classroomState.subject === 'EVS' && (
        <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide whitespace-nowrap flex items-center gap-1">
            🌱 EVS Chapters:
          </span>
          <div className="flex items-center gap-1.5">
            {EVS_CLASS_2_CHAPTERS.map((ch) => {
              const isChapterSelected = classroomState.chapter === ch.chapter;
              return (
                <button
                  key={ch.chapter}
                  onClick={() => handleSelectChapter(ch)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isChapterSelected
                      ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {ch.chapter} <span className="text-[10px] opacity-75">({ch.hindiName})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GK Chapters Sub-Bar (When GK is selected) */}
      {classroomState.subject === 'GK' && (
        <div className="bg-amber-50/70 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide whitespace-nowrap flex items-center gap-1">
            🧠 GK Chapters:
          </span>
          <div className="flex items-center gap-1.5">
            {GK_CLASS_2_CHAPTERS.map((ch) => {
              const isChapterSelected = classroomState.chapter === ch.chapter;
              return (
                <button
                  key={ch.chapter}
                  onClick={() => handleSelectChapter(ch)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isChapterSelected
                      ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  {ch.chapter} <span className="text-[10px] opacity-75">({ch.hindiName})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area: Responsive Mobile vs Desktop Layout */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-4 p-2 sm:p-4 overflow-hidden">
        {/* MOBILE VIEW */}
        <div className="flex-1 flex flex-col md:hidden overflow-hidden gap-2">
          {mobileTab === 'home' && (
            <>
              {/* Teacher Area (Compact 32-38vh on mobile) */}
              <div className="h-[32vh] min-h-[200px] max-h-[260px] w-full shrink-0">
                <TeacherAvatarView
                  avatarState={avatarState}
                  teacherName="Ms. Priya"
                  onSelectEmotion={(emo) => avatarAdapterRef.current?.setEmotion(emo)}
                />
              </div>

              {/* Lesson Context Card immediately below teacher */}
              <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-xs flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-4 h-4 text-[#5A5A40] shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-[#333333] block truncate">{classroomState.chapter || 'Active Lesson'}</span>
                    <span className="text-gray-500 text-[10px]">Class {classroomState.student.gradeClass} • {classroomState.subject}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsTextbookModalOpen(true)}
                  className="text-[11px] font-bold text-[#FF6321] px-2 py-1 bg-orange-50 rounded-lg shrink-0 cursor-pointer"
                >
                  View
                </button>
              </div>

              {/* Whiteboard Area */}
              <div className="flex-1 w-full h-[42vh] min-h-[260px] overflow-hidden">
                <DigitalWhiteboard
                  toolEvent={activeToolEvent}
                  onClear={() => setActiveToolEvent(null)}
                  onAnswerSubmit={handleAnswerSubmit}
                />
              </div>
            </>
          )}

          {mobileTab === 'whiteboard' && (
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
              <div className="flex-1 w-full h-full overflow-hidden">
                <DigitalWhiteboard
                  toolEvent={activeToolEvent}
                  onClear={() => setActiveToolEvent(null)}
                  onAnswerSubmit={handleAnswerSubmit}
                />
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP / TABLET VIEW */}
        <section className="hidden md:block md:col-span-5 lg:col-span-4 h-full min-h-[300px]">
          <TeacherAvatarView
            avatarState={avatarState}
            teacherName="Ms. Priya"
            onSelectEmotion={(emo) => avatarAdapterRef.current?.setEmotion(emo)}
          />
        </section>

        <section className="hidden md:block md:col-span-7 lg:col-span-8 h-full min-h-[350px]">
          <DigitalWhiteboard
            toolEvent={activeToolEvent}
            onClear={() => setActiveToolEvent(null)}
            onAnswerSubmit={handleAnswerSubmit}
          />
        </section>
      </main>

      {/* Bottom Sticky Control Dock */}
      <ControlBar
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        onSendTextMessage={handleSendTextMessage}
        onOpenTextbookModal={() => setIsTextbookModalOpen(true)}
        onToggleStateDrawer={() => setIsStateDrawerOpen(true)}
        onFrameCaptured={handleFrameCaptured}
        onResetClass={handleResetClass}
        isTextbookActive={!!textbook}
        currentLanguage={classroomState.language}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden flex items-center justify-around bg-white border-t border-gray-200 h-14 px-2 shrink-0 z-30">
        <button
          onClick={() => setMobileTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer ${
            mobileTab === 'home' ? 'text-[#FF6321]' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('lesson');
            setIsTextbookModalOpen(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer ${
            isTextbookModalOpen ? 'text-[#FF6321]' : 'text-gray-500'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Lesson</span>
        </button>

        <button
          onClick={() => setMobileTab('whiteboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer ${
            mobileTab === 'whiteboard' ? 'text-[#FF6321]' : 'text-gray-500'
          }`}
        >
          <Edit3 className="w-5 h-5 mb-0.5" />
          <span>Whiteboard</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('progress');
            setIsDashboardModalOpen(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer ${
            isDashboardModalOpen ? 'text-[#FF6321]' : 'text-gray-500'
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span>Progress</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('more');
            setIsAskAnythingModalOpen(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold cursor-pointer ${
            isAskAnythingModalOpen ? 'text-[#FF6321]' : 'text-gray-500'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Modals & Slideouts */}
      <TextbookModal
        isOpen={isTextbookModalOpen}
        onClose={() => setIsTextbookModalOpen(false)}
        activeTextbook={textbook}
        onTextbookLoaded={(tb) => {
          soundEffects.playWhoosh();
          setTextbook(tb);
          setClassroomState((prev) => ({
            ...prev,
            chapter: tb.chapterTitle,
            currentConcept: tb.keyConcepts[0] || prev.currentConcept,
          }));
          if (avatarAdapterRef.current) {
            avatarAdapterRef.current.speak(
              undefined,
              `I have opened our textbook chapter: ${tb.chapterTitle}! We will follow this textbook carefully.`
            );
          }
        }}
        onClearTextbook={() => {
          setTextbook(null);
        }}
      />

      <StateDrawer
        isOpen={isStateDrawerOpen}
        onClose={() => setIsStateDrawerOpen(false)}
        classroomState={classroomState}
        transcriptHistory={transcriptHistory}
      />

      <TeacherDashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        classroomState={classroomState}
      />

      <AskAnythingModal
        isOpen={isAskAnythingModalOpen}
        onClose={() => setIsAskAnythingModalOpen(false)}
        classroomState={classroomState}
        onAskQuestion={handleAskAnythingQuestion}
      />
    </div>
  );
}
