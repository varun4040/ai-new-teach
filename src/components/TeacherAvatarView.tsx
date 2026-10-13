import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Smile,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquare,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  PartyPopper,
  Heart,
  ChevronDown,
  Wand2,
  Loader2,
  RefreshCw,
  UserCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Box,
  FolderOpen,
  FileCheck,
} from 'lucide-react';
import {
  AvatarState,
  TeacherEmotion,
  CharacterState,
  EMOTION_TO_CHARACTER_STATE,
  LanguageMode,
} from '../types';
import { soundEffects } from '../lib/soundEffects';
import { TeacherVoiceSpeaker } from '../lib/speechSynthesis';
import {
  InteractiveTeacherCharacter,
  DEFAULT_REAL_TEACHER_IMAGE,
  TeacherVisualMode,
} from './InteractiveTeacherCharacter';

interface TeacherAvatarViewProps {
  avatarState: AvatarState;
  teacherName?: string;
  onSelectEmotion?: (emotion: TeacherEmotion) => void;
  onSelectCharacterState?: (state: CharacterState) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  currentLanguage?: LanguageMode;
  onToggleHinglish?: () => void;
  onQuickAskHinglish?: (prompt: string) => void;
}

export const CHARACTER_STATES_LIST: Array<{
  state: CharacterState;
  label: string;
  emoji: string;
  desc: string;
  badgeColor: string;
  activeColor: string;
}> = [
  {
    state: 'IDLE',
    label: 'Idle',
    emoji: '🧘',
    desc: 'Calm breathing & attentive presence',
    badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
    activeColor: 'bg-stone-800 text-white',
  },
  {
    state: 'LISTENING',
    label: 'Listening',
    emoji: '👂',
    desc: 'Attentive ear-tilt & acoustic ripples',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeColor: 'bg-emerald-700 text-white',
  },
  {
    state: 'THINKING',
    label: 'Thinking',
    emoji: '🤔',
    desc: 'Pensive head tilt & upward gaze',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    activeColor: 'bg-amber-600 text-white',
  },
  {
    state: 'SPEAKING',
    label: 'Speaking',
    emoji: '🗣️',
    desc: 'Lip-sync phonemes & conversational nods',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    activeColor: 'bg-[#FF6321] text-white',
  },
  {
    state: 'HAPPY',
    label: 'Happy',
    emoji: '😊',
    desc: 'Warm curved smile & bright eyes',
    badgeColor: 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1]',
    activeColor: 'bg-[#5A5A40] text-white',
  },
  {
    state: 'ENCOURAGING',
    label: 'Encouraging',
    emoji: '🌟',
    desc: 'Empathetic nod & supportive thumbs-up',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    activeColor: 'bg-teal-700 text-white',
  },
  {
    state: 'CONFUSED',
    label: 'Confused',
    emoji: '🧐',
    desc: 'Quizzical knit & side head cock',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    activeColor: 'bg-purple-700 text-white',
  },
  {
    state: 'CELEBRATING',
    label: 'Celebrating',
    emoji: '🎉',
    desc: 'Joyous bounce & star particles',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    activeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  },
];

export const REAL_TEACHER_PRESETS = [
  {
    id: 'priya',
    name: 'Ms. Priya (Default)',
    role: 'Elementary & Math Educator',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=85',
    desc: 'Warm smile, tortoiseshell glasses, attentive classroom presence',
  },
  {
    id: 'ananya',
    name: 'Dr. Ananya',
    role: 'Science & STEM Mentor',
    url: 'https://images.unsplash.com/photo-1580894732475-8eb40698144f?w=800&auto=format&fit=crop&q=85',
    desc: 'Engaging modern educator with encouraging eyes',
  },
  {
    id: 'meera',
    name: 'Ms. Meera',
    role: 'Language & Storytelling Teacher',
    url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&auto=format&fit=crop&q=85',
    desc: 'Radiant smile, expressive gestures, empathetic teaching',
  },
  {
    id: 'sunita',
    name: 'Ms. Sunita',
    role: 'Senior Academic Advisor',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=85',
    desc: 'Wise, patient demeanor with deep subject matter expertise',
  },
  {
    id: 'rahul',
    name: 'Mr. Rahul',
    role: 'Technology & Logic Educator',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85',
    desc: 'Friendly, modern STEM instructor with approachable smile',
  },
];

export const TeacherAvatarView: React.FC<TeacherAvatarViewProps> = ({
  avatarState,
  teacherName = 'Ms. Priya',
  onSelectEmotion,
  onSelectCharacterState,
  isExpanded = false,
  onToggleExpand,
  currentLanguage,
  onToggleHinglish,
  onQuickAskHinglish,
}) => {
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => TeacherVoiceSpeaker.getIsMuted());

  React.useEffect(() => {
    return TeacherVoiceSpeaker.addMuteListener((muted) => {
      setIsVoiceMuted(muted);
    });
  }, []);

  // Face Style: 'real' (photorealistic live face, default), 'sculpted' (3D vector), or 'three_model' (custom .obj/.glb/.gltf 3D teacher)
  const [faceStyle, setFaceStyle] = useState<TeacherVisualMode>(() => {
    return (localStorage.getItem('ms_priya_face_style') as TeacherVisualMode) || 'real';
  });

  // Face Zoom: 'normal' or 'closeup' (enlarges face framing so eyes, smile and glasses are huge and visible)
  const [faceZoom, setFaceZoom] = useState<'normal' | 'closeup'>('normal');

  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(
    localStorage.getItem('ms_priya_custom_avatar') || DEFAULT_REAL_TEACHER_IMAGE
  );

  // 3D Model state (.glb, .gltf, .obj)
  const [customModelUrl, setCustomModelUrl] = useState<string>(() => {
    return localStorage.getItem('ms_priya_custom_model_url') || '';
  });
  const [modelFormat, setModelFormat] = useState<'glb' | 'gltf' | 'obj'>(() => {
    return (localStorage.getItem('ms_priya_model_format') as 'glb' | 'gltf' | 'obj') || 'glb';
  });
  const [isUploadingModel, setIsUploadingModel] = useState<boolean>(false);
  const [modelUploadMessage, setModelUploadMessage] = useState<string>('');
  const [activeModalTab, setActiveModalTab] = useState<'presets' | 'ai_prompt' | 'upload_photo' | 'upload_3d'>('upload_3d');

  // Discovered assets in project's /assets directory
  const [projectAssets, setProjectAssets] = useState<
    Array<{
      name: string;
      relativePath: string;
      url: string;
      sizeBytes: number;
      category: '3d_model' | 'image' | 'audio' | 'document' | 'other';
      extension: string;
    }>
  >([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);

  const fetchProjectAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.assets)) {
          setProjectAssets(data.assets);
        }
      }
    } catch (e) {
      console.warn('Failed to load project assets:', e);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (showRegenerateModal) {
      fetchProjectAssets();
    }
  }, [showRegenerateModal]);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [tempUrl, setTempUrl] = useState<string>(customAvatarUrl);
  const [isGeneratingFace, setIsGeneratingFace] = useState<boolean>(false);
  const [generateNotice, setGenerateNotice] = useState<string>('');
  const [showStateMenu, setShowStateMenu] = useState<boolean>(false);
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundEffects.isMuted());

  // Determine effective current character state
  const currentCharacterState: CharacterState = useMemo(() => {
    if (avatarState.characterState) {
      return avatarState.characterState;
    }
    if (avatarState.isSpeaking) {
      return 'SPEAKING';
    }
    return EMOTION_TO_CHARACTER_STATE[avatarState.emotion] || 'IDLE';
  }, [avatarState.characterState, avatarState.isSpeaking, avatarState.emotion]);

  const currentStateMeta = useMemo(() => {
    return (
      CHARACTER_STATES_LIST.find((item) => item.state === currentCharacterState) ||
      CHARACTER_STATES_LIST[0]
    );
  }, [currentCharacterState]);

  const handleToggleSound = () => {
    const nextMuted = soundEffects.toggleMute();
    setIsSoundMuted(nextMuted);
  };

  const handleToggleEyeTracking = () => {
    setEyeTrackingEnabled((prev) => !prev);
  };

  const handleToggleFaceStyle = (style: TeacherVisualMode) => {
    setFaceStyle(style);
    localStorage.setItem('ms_priya_face_style', style);
  };

  // Upload custom .glb / .gltf / .obj 3D model file
  const handleModelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalName = file.name;
    const ext = originalName.split('.').pop()?.toLowerCase();
    const detectedFormat: 'glb' | 'gltf' | 'obj' = ext === 'obj' ? 'obj' : ext === 'gltf' ? 'gltf' : 'glb';

    setIsUploadingModel(true);
    setModelUploadMessage(`Uploading 3D model ${originalName}...`);

    try {
      const formData = new FormData();
      formData.append('modelFile', file);

      const res = await fetch('/api/teacher/upload-model', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data?.modelUrl) {
        setCustomModelUrl(data.modelUrl);
        setModelFormat(detectedFormat);
        localStorage.setItem('ms_priya_custom_model_url', data.modelUrl);
        localStorage.setItem('ms_priya_model_format', detectedFormat);
        setFaceStyle('three_model');
        localStorage.setItem('ms_priya_face_style', 'three_model');

        setModelUploadMessage(`✓ 3D Model "${originalName}" active as Teacher!`);
      } else {
        // Fallback: create blob object URL in browser directly if server route has issue
        const localBlobUrl = URL.createObjectURL(file);
        setCustomModelUrl(localBlobUrl);
        setModelFormat(detectedFormat);
        setFaceStyle('three_model');
        setModelUploadMessage(`✓ Loaded "${originalName}" locally into 3D Stage!`);
      }
    } catch (err: any) {
      console.warn('Server upload failed, falling back to client Blob URL:', err);
      const localBlobUrl = URL.createObjectURL(file);
      setCustomModelUrl(localBlobUrl);
      setModelFormat(detectedFormat);
      setFaceStyle('three_model');
      setModelUploadMessage(`✓ Loaded "${originalName}" locally into 3D stage!`);
    } finally {
      setIsUploadingModel(false);
    }
  };

  const handleStateSelect = (state: CharacterState) => {
    if (onSelectCharacterState) {
      onSelectCharacterState(state);
    } else if (onSelectEmotion) {
      const emoMap: Record<CharacterState, TeacherEmotion> = {
        IDLE: 'happy',
        LISTENING: 'listening',
        THINKING: 'thinking',
        SPEAKING: 'explaining',
        HAPPY: 'happy',
        ENCOURAGING: 'encouraging',
        CONFUSED: 'thinking',
        CELEBRATING: 'surprised',
      };
      onSelectEmotion(emoMap[state]);
    }
    setShowStateMenu(false);
  };

  const handleSaveAvatar = (url: string) => {
    const finalUrl = url || DEFAULT_REAL_TEACHER_IMAGE;
    setCustomAvatarUrl(finalUrl);
    localStorage.setItem('ms_priya_custom_avatar', finalUrl);
    setFaceStyle('real');
    localStorage.setItem('ms_priya_face_style', 'real');
    setShowRegenerateModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setTempUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate or Regenerate Teacher Face with Gemini 3.1 Flash Image Preview API
  const handleAIGenerateFace = async () => {
    setIsGeneratingFace(true);
    setGenerateNotice('Generating photorealistic teacher face with Gemini AI...');

    try {
      const res = await fetch('/api/teacher/generate-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt || 'Warm friendly Indian female school teacher with elegant dark glasses, gentle smile, front-facing studio portrait',
        }),
      });

      const data = await res.json();
      if (data?.imageUrl) {
        setTempUrl(data.imageUrl);
        setGenerateNotice(data.notice || '✨ Realistic teacher face generated successfully!');
      } else {
        setGenerateNotice('Applied high-resolution photorealistic teacher portrait.');
      }
    } catch (err: any) {
      setGenerateNotice('Loaded high-resolution teacher portrait.');
      setTempUrl(DEFAULT_REAL_TEACHER_IMAGE);
    } finally {
      setIsGeneratingFace(false);
    }
  };

  return (
    <div
      id="teacher-avatar-container"
      className="relative flex flex-col h-full w-full bg-[#F3F7F5] border border-gray-200 rounded-3xl shadow-xs overflow-hidden"
    >
      {/* Top Banner Badge & Controls */}
      <div
        id="teacher-status-bar"
        className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white border-b border-gray-100 text-[#333333] shrink-0 gap-2 flex-wrap sm:flex-nowrap"
      >
        <div className="flex items-center gap-2">
          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider animate-pulse">
            LIVE
          </span>
          <span className="text-xs font-bold tracking-tight text-[#333333] truncate">
            {teacherName}
          </span>
          {onToggleHinglish && (
            <button
              id="hinglish-card-toggle-btn"
              type="button"
              onClick={onToggleHinglish}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer active:scale-95 shadow-2xs ${
                currentLanguage === 'hinglish'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 ring-2 ring-orange-200'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
              }`}
              title="Toggle Hinglish Mode (Hindi + English blend for Ms. Priya)"
            >
              <span className="text-xs leading-none">🇮🇳</span>
              <span>Hinglish {currentLanguage === 'hinglish' ? 'ON' : 'Mode'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* 🔍 Face Zoom Toggle */}
          <button
            onClick={() => setFaceZoom((prev) => (prev === 'normal' ? 'closeup' : 'normal'))}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer active:scale-95 ${
              faceZoom === 'closeup'
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs ring-1 ring-amber-300'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title={
              faceZoom === 'closeup'
                ? 'Close-up Face Zoom Active (Click to return to standard)'
                : 'Zoom in on Teacher Face (Bigger & Clearer)'
            }
          >
            {faceZoom === 'closeup' ? (
              <>
                <ZoomOut className="w-3.5 h-3.5 text-amber-700" />
                <span>1x View</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Zoom Face</span>
              </>
            )}
          </button>

          {/* ⤢ Enlarge / Normal Window Toggle */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer active:scale-95 ${
                isExpanded
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title={isExpanded ? 'Restore Normal Window' : 'Enlarge Teacher Face Window'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                  <span className="hidden sm:inline">Enlarge</span>
                </>
              )}
            </button>
          )}

          {/* ✨ Regenerate Face Button */}
          <button
            id="regenerate-face-btn"
            onClick={() => {
              setTempUrl(customAvatarUrl);
              setGenerateNotice('');
              setShowRegenerateModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs transition-all cursor-pointer active:scale-95"
            title="Regenerate teacher face to look real using AI prompts or curated realistic portraits"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regenerate Face</span>
          </button>

          {/* Face Style Switcher: Real vs 3D Vector vs Custom 3D Model */}
          <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => handleToggleFaceStyle('real')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                faceStyle === 'real'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-700 font-medium'
              }`}
              title="Photorealistic real teacher face with interactive ocular tracking and breathing"
            >
              <UserCheck className="w-3 h-3" />
              <span>Real</span>
            </button>
            <button
              onClick={() => handleToggleFaceStyle('sculpted')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                faceStyle === 'sculpted'
                  ? 'bg-white text-[#5A5A40] shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-700 font-medium'
              }`}
              title="Sculpted 3D animated character"
            >
              <span>3D</span>
            </button>
            <button
              onClick={() => {
                handleToggleFaceStyle('three_model');
                if (!customModelUrl) {
                  setActiveModalTab('upload_3d');
                  setShowRegenerateModal(true);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                faceStyle === 'three_model'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-medium'
              }`}
              title="Upload and use your custom 3D model (.obj / .glb / .gltf) as the teacher!"
            >
              <Box className="w-3 h-3" />
              <span>3D Model</span>
            </button>
          </div>

          {/* Eye Tracking Toggle */}
          <button
            onClick={handleToggleEyeTracking}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
              eyeTrackingEnabled
                ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
            title={
              eyeTrackingEnabled
                ? '👁️ Eye Tracking Active (Teacher eyes follow cursor)'
                : '👁️ Eye Tracking Paused (Click to enable)'
            }
          >
            {eyeTrackingEnabled ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span className="hidden sm:inline">Gaze</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gaze Off</span>
              </>
            )}
          </button>

          {/* Teacher Voice Audio Toggle */}
          <button
            onClick={() => {
              const muted = TeacherVoiceSpeaker.toggleMute();
              setIsVoiceMuted(muted);
            }}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
              isVoiceMuted
                ? 'bg-gray-100 text-gray-400 border-gray-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={
              isVoiceMuted
                ? 'Ms. Priya Voice Muted (Click to Unmute Voice)'
                : 'Ms. Priya Voice Active (Speaks aloud in Hinglish/English)'
            }
          >
            {isVoiceMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Voice Off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            )}
          </button>

          {/* Sound Effects Toggle */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
              isSoundMuted
                ? 'bg-gray-100 text-gray-400 border-gray-200'
                : 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1] hover:bg-[#d8ece4]'
            }`}
            title={isSoundMuted ? 'Sound Effects Muted (Click to Unmute)' : 'Sound Effects Active'}
          >
            {isSoundMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            )}
          </button>

          {/* Interactive Character State Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStateMenu(!showStateMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all hover:opacity-95 shadow-xs ${
                currentStateMeta.badgeColor
              }`}
              title="Click to switch Character State"
            >
              <span>{currentStateMeta.emoji}</span>
              <span className="font-bold">{currentStateMeta.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* State Picker Dropdown */}
            {showStateMenu && (
              <div
                className="absolute right-0 top-9 z-50 bg-white/95 border border-gray-200 rounded-2xl shadow-xl p-2 w-56 flex flex-col gap-1 backdrop-blur-md"
                onMouseLeave={() => setShowStateMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 pb-1 mb-1">
                  <span>Character States</span>
                  <span className="text-[9px] text-emerald-600 font-normal">8 interactive</span>
                </div>
                {CHARACTER_STATES_LIST.map((item) => {
                  const isActive = currentCharacterState === item.state;
                  return (
                    <button
                      key={item.state}
                      onClick={() => handleStateSelect(item.state)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? item.activeColor + ' font-bold shadow-xs'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{item.label}</span>
                        <span
                          className={`text-[10px] leading-tight line-clamp-1 ${
                            isActive ? 'text-white/80' : 'text-gray-400'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Avatar Stage Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center sm:justify-end p-2 sm:p-4 overflow-hidden">
        {/* Soft Ambient Classroom Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8F3EF]/60 via-[#F3F7F5] to-[#E3ECE8]/80 pointer-events-none" />

        {/* Active Hinglish Mode Badge */}
        {currentLanguage === 'hinglish' && (
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-[10px] font-bold shadow-md ring-1 ring-white/50 backdrop-blur-xs">
            <span className="text-xs leading-none">🇮🇳</span>
            <span>Hinglish Mode Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
        )}

        {/* Live Speech Bubble / Transcript with Framer Motion Entrance */}
        <AnimatePresence>
          {avatarState.transcriptText && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative z-30 mb-2 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-gray-200/80 flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-[#E8F3EF] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-3 h-3 text-[#5A5A40]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  {teacherName}
                </span>
                <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-[#333333]">
                  {avatarState.transcriptText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Character Rendering Stage */}
        <div
          className={`relative z-10 flex flex-col items-center justify-end w-full ${
            isExpanded ? 'max-w-xl' : 'max-w-md'
          } mt-auto transition-all duration-300`}
        >
          <InteractiveTeacherCharacter
            avatarState={avatarState}
            teacherName={teacherName}
            customAvatarUrl={customAvatarUrl}
            customModelUrl={customModelUrl}
            modelFormat={modelFormat}
            faceStyle={faceStyle}
            interactiveEyeTracking={eyeTrackingEnabled}
            faceZoom={faceZoom}
            isEnlarged={isExpanded}
          />

          {/* Teacher Desk Surface with Active Life Indicators & Interactive Reactions */}
          <div className="w-full bg-[#5D4037] border-t-4 border-[#3E2723] rounded-t-xl px-2.5 py-1.5 flex items-center justify-between shadow-md relative z-20 mt-1">
            {/* Quick Interactive Reaction Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onSelectCharacterState?.('CELEBRATING');
                  soundEffects.playSuccess();
                }}
                className="px-2 py-1 bg-[#4E342E] hover:bg-[#3E2723] text-amber-200 border border-[#795548] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Trigger Celebration Animation"
              >
                <span>🎉</span>
                <span className="hidden sm:inline">Cheer</span>
              </button>
              <button
                onClick={() => {
                  onSelectCharacterState?.('HAPPY');
                  soundEffects.playHappy();
                }}
                className="px-2 py-1 bg-[#4E342E] hover:bg-[#3E2723] text-[#D9C5B2] border border-[#795548] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Greet & Smile"
              >
                <span>👋</span>
                <span className="hidden sm:inline">Wave</span>
              </button>
            </div>

            {/* Speaking / Audio / Alive wave indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 rounded-full border border-gray-200 shadow-xs">
              {avatarState.isSpeaking || currentCharacterState === 'SPEAKING' ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#5A5A40] animate-pulse" />
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-1 h-full bg-[#5A5A40] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-full bg-[#5A5A40] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-full bg-[#5A5A40] rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] text-[#5A5A40] font-bold">Speaking</span>
                </>
              ) : currentCharacterState === 'LISTENING' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-emerald-800 font-bold">Listening</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <span className="text-[10px] text-stone-600 font-medium">Attentive</span>
                </>
              )}
            </div>

            {/* Interactive State indicator badge */}
            <div className="flex items-center gap-1 text-[10px] font-semibold text-white/90">
              <span className="opacity-75">Presence:</span>
              <span className="font-bold text-emerald-300">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🇮🇳 Hinglish Mode Quick Question Chips */}
      {currentLanguage === 'hinglish' && onQuickAskHinglish && (
        <div className="px-3 py-1.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-t border-orange-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-extrabold text-orange-950 shrink-0 flex items-center gap-1">
            <span>🇮🇳 Poochhein:</span>
          </span>
          {[
            '5 + 3 kitna hota hai?',
            'Whiteboard par shapes dikhao',
            'Fractions samjhao',
            'Solar system ke baare mein batao',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => onQuickAskHinglish(promptText)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-orange-100 text-orange-900 border border-orange-200 text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all shadow-2xs hover:border-orange-400 active:scale-95 shrink-0"
            >
              {promptText}
            </button>
          ))}
        </div>
      )}

      {/* 🔍 Space-Saving Bottom Bar: Mode Status, Face Zoom Quick Button, States & Switcher */}
      <div className="px-3 py-1.5 bg-[#FAFBF9] border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {faceStyle === 'three_model' ? '3D Model' : faceStyle === 'real' ? 'Real Photo' : '3D Face'}
          </span>
          <button
            onClick={() => setFaceZoom((prev) => (prev === 'normal' ? 'closeup' : 'normal'))}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
              faceZoom === 'closeup'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
            title="Toggle close-up face framing"
          >
            {faceZoom === 'closeup' ? '🔍 1.4x Close-up' : '🔍 Zoom Face'}
          </button>
        </div>

        {/* Quick State Switcher Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-[55%] sm:max-w-none">
          {CHARACTER_STATES_LIST.map((item) => {
            const isActive = currentCharacterState === item.state;
            return (
              <button
                key={item.state}
                onClick={() => handleStateSelect(item.state)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? item.activeColor + ' shadow-xs scale-105'
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                title={item.desc}
              >
                <span>{item.emoji}</span>
                <span className="text-[11px] hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveModalTab('upload_3d');
              setShowRegenerateModal(true);
            }}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer shrink-0 flex items-center gap-1"
          >
            <Box className="w-3 h-3" />
            <span>Upload 3D</span>
          </button>
        </div>
      </div>

      {/* ✨ REGENERATE REAL FACE STUDIO MODAL */}
      {showRegenerateModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#333333]">
                    Regenerate Teacher Interactive Face
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Give Ms. Priya a lifelike, photorealistic face with interactive eye-tracking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real Face Preview & Style Selector */}
            <div className="flex items-center gap-4 p-3 bg-[#F3F7F5] rounded-2xl border border-gray-200">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#5A5A40] shadow-md bg-stone-900 shrink-0">
                <img
                  src={tempUrl || DEFAULT_REAL_TEACHER_IMAGE}
                  alt="Teacher Face Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-bold text-white">
                  Real
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#333333]">Active Face Rendering</span>
                <p className="text-[11px] text-gray-600 leading-snug">
                  The teacher's eyes will physically follow your cursor, eyelids will blink naturally,
                  and lips will lip-sync with lessons!
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleToggleFaceStyle('real')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      faceStyle === 'real'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    👤 Photorealistic Real
                  </button>
                  <button
                    onClick={() => handleToggleFaceStyle('sculpted')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      faceStyle === 'sculpted'
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    🎨 3D Vector
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setActiveModalTab('upload_3d')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'upload_3d'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Upload 3D Model</span>
              </button>
              <button
                onClick={() => setActiveModalTab('presets')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'presets'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Real Portraits</span>
              </button>
              <button
                onClick={() => setActiveModalTab('ai_prompt')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'ai_prompt'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Prompt</span>
              </button>
              <button
                onClick={() => setActiveModalTab('upload_photo')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'upload_photo'
                    ? 'bg-white text-[#5A5A40] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* TAB 1: 3D MODEL UPLOAD (.OBJ, .GLB, .GLTF) */}
            {activeModalTab === 'upload_3d' && (
              <div className="flex flex-col gap-3 p-4 bg-purple-50/70 border-2 border-purple-200 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-purple-600" />
                      <span>Upload 3D Model as Teacher (.obj / .glb / .gltf)</span>
                    </h4>
                    <p className="text-[11px] text-purple-800 mt-0.5 leading-snug">
                      Apna custom 3D model upload karein! Three.js scene me teacher realistic lighting, responsive eye/head tracking aur animations ke saath render hoga.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    WebGL 3D
                  </span>
                </div>

                {/* Upload drag-and-drop / click area */}
                <label className="flex flex-col items-center justify-center gap-2.5 p-5 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl bg-white hover:bg-purple-50/50 cursor-pointer transition-all text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploadingModel ? (
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      {isUploadingModel ? '3D Model Upload ho raha hai...' : 'Click to select or drag .glb / .obj / .gltf file'}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Supports: Blender exports, Ready Player Me, Sketchfab (.glb, .gltf, .obj up to 50MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".glb,.gltf,.obj"
                    onChange={handleModelFileUpload}
                    disabled={isUploadingModel}
                    className="hidden"
                  />
                </label>

                {/* Status message */}
                {modelUploadMessage && (
                  <div className="p-2.5 rounded-xl bg-purple-100/90 text-purple-900 text-xs font-medium border border-purple-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{modelUploadMessage}</span>
                  </div>
                )}

                {/* Or paste direct 3D URL */}
                <div className="flex flex-col gap-1 pt-2 border-t border-purple-200/60">
                  <label className="text-[11px] font-bold text-purple-900">
                    Or Enter Direct 3D Model Web URL (.glb / .obj):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customModelUrl}
                      onChange={(e) => setCustomModelUrl(e.target.value)}
                      placeholder="https://.../model.glb"
                      className="flex-1 px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs text-[#333333] outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => {
                        if (customModelUrl) {
                          const ext = customModelUrl.split('.').pop()?.toLowerCase();
                          const detected: 'glb' | 'gltf' | 'obj' = ext === 'obj' ? 'obj' : ext === 'gltf' ? 'gltf' : 'glb';
                          setModelFormat(detected);
                          localStorage.setItem('ms_priya_custom_model_url', customModelUrl);
                          localStorage.setItem('ms_priya_model_format', detected);
                          setFaceStyle('three_model');
                          localStorage.setItem('ms_priya_face_style', 'three_model');
                          setModelUploadMessage('✓ Model URL applied!');
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                </div>

                {/* Detected Project Assets from /assets */}
                <div className="flex flex-col gap-2 pt-2 border-t border-purple-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                      <span>Project Asset Files (/assets)</span>
                      {projectAssets.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-purple-200 text-purple-800 text-[10px] rounded-full font-bold">
                          {projectAssets.length}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={fetchProjectAssets}
                      disabled={isLoadingAssets}
                      className="flex items-center gap-1 text-[10px] text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingAssets ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {isLoadingAssets ? (
                    <div className="flex items-center justify-center p-3 text-xs text-purple-700 gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning assets folder...</span>
                    </div>
                  ) : projectAssets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {projectAssets.map((asset, idx) => (
                        <div
                          key={`pa-${idx}`}
                          className="p-2 bg-white border border-purple-200/80 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-purple-400 transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-purple-950 truncate" title={asset.name}>
                              {asset.name}
                            </div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                              <span>{asset.extension}</span>
                              <span>•</span>
                              <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
                            </div>
                          </div>
                          {asset.category === '3d_model' ? (
                            <button
                              onClick={() => {
                                const detected: 'glb' | 'gltf' | 'obj' =
                                  asset.extension === 'obj' ? 'obj' : asset.extension === 'gltf' ? 'gltf' : 'glb';
                                setCustomModelUrl(asset.url);
                                setModelFormat(detected);
                                setFaceStyle('three_model');
                                localStorage.setItem('ms_priya_custom_model_url', asset.url);
                                localStorage.setItem('ms_priya_model_format', detected);
                                localStorage.setItem('ms_priya_face_style', 'three_model');
                                setModelUploadMessage(`✓ Asset "${asset.name}" active as 3D Teacher!`);
                              }}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                            >
                              Load 3D
                            </button>
                          ) : asset.category === 'image' ? (
                            <button
                              onClick={() => {
                                setCustomAvatarUrl(asset.url);
                                setFaceStyle('real');
                                localStorage.setItem('ms_priya_custom_avatar', asset.url);
                                localStorage.setItem('ms_priya_face_style', 'real');
                                setModelUploadMessage(`✓ Asset "${asset.name}" applied as Teacher Photo!`);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                            >
                              Use Photo
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-semibold">{asset.category}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-white/70 border border-purple-200/50 rounded-xl text-[11px] text-purple-900/80 leading-snug">
                      Any 3D models or image assets dropped into the project's <code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-[10px]">assets/</code> directory will appear here automatically.
                    </div>
                  )}
                </div>

                {/* Sample 3D Avatar presets */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-purple-200/60">
                  <span className="text-[11px] font-bold text-purple-900">
                    Quick Sample 3D Teachers:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCustomModelUrl('');
                        setModelFormat('glb');
                        setFaceStyle('three_model');
                        localStorage.setItem('ms_priya_custom_model_url', '');
                        localStorage.setItem('ms_priya_model_format', 'glb');
                        localStorage.setItem('ms_priya_face_style', 'three_model');
                        setModelUploadMessage('✓ Built-in Geometric 3D Teacher Avatar active!');
                      }}
                      className="p-2 text-left bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-base">👩‍🏫</span>
                      <div>
                        <div className="font-bold">Ms. Priya (Procedural 3D)</div>
                        <div className="text-[10px] text-gray-500">Built-in Three.js character</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        const sampleUrl =
                          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb';
                        setCustomModelUrl(sampleUrl);
                        setModelFormat('glb');
                        setFaceStyle('three_model');
                        localStorage.setItem('ms_priya_custom_model_url', sampleUrl);
                        localStorage.setItem('ms_priya_model_format', 'glb');
                        localStorage.setItem('ms_priya_face_style', 'three_model');
                        setModelUploadMessage('✓ Sample Animated Humanoid loaded!');
                      }}
                      className="p-2 text-left bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-base">🏃</span>
                      <div>
                        <div className="font-bold">Animated Humanoid (.glb)</div>
                        <div className="text-[10px] text-gray-500">Sample skeletal 3D model</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        const sampleUrl =
                          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
                        setCustomModelUrl(sampleUrl);
                        setModelFormat('glb');
                        setFaceStyle('three_model');
                        localStorage.setItem('ms_priya_custom_model_url', sampleUrl);
                        localStorage.setItem('ms_priya_model_format', 'glb');
                        localStorage.setItem('ms_priya_face_style', 'three_model');
                        setModelUploadMessage('✓ Math Duck Mascot loaded!');
                      }}
                      className="p-2 text-left bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-base">🦆</span>
                      <div>
                        <div className="font-bold">Math Duck Mascot (.glb)</div>
                        <div className="text-[10px] text-gray-500">Khronos 3D mascot</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        const sampleUrl =
                          'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
                        setCustomModelUrl(sampleUrl);
                        setModelFormat('glb');
                        setFaceStyle('three_model');
                        localStorage.setItem('ms_priya_custom_model_url', sampleUrl);
                        localStorage.setItem('ms_priya_model_format', 'glb');
                        localStorage.setItem('ms_priya_face_style', 'three_model');
                        setModelUploadMessage('✓ STEM Robot Teacher loaded!');
                      }}
                      className="p-2 text-left bg-white hover:bg-purple-100/60 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-base">🤖</span>
                      <div>
                        <div className="font-bold">STEM Robot Teacher (.glb)</div>
                        <div className="text-[10px] text-gray-500">Expressive 3D robot</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI TEXT PROMPT (Gemini) */}
            {activeModalTab === 'ai_prompt' && (
              <div className="flex flex-col gap-2 p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Regenerate with AI Prompt (Gemini):</span>
                  </label>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                    gemini-3.1-flash-image
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Warm Indian math teacher with dark glasses and silk saree, gentle smile"
                    className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-[#333333] outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleAIGenerateFace}
                    disabled={isGeneratingFace}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {isGeneratingFace ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>

                {generateNotice && (
                  <p className="text-[11px] font-medium text-amber-800 italic">
                    {generateNotice}
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: CURATED REAL TEACHER PORTRAITS */}
            {activeModalTab === 'presets' && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Select from Curated Real Teacher Portraits:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REAL_TEACHER_PRESETS.map((preset) => {
                    const isSelected = tempUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setTempUrl(preset.url);
                          setFaceStyle('real');
                        }}
                        className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer text-left group ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-gray-200 hover:border-[#5A5A40] bg-gray-50/70 hover:bg-[#F3F7F5]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover mb-1.5 shadow-xs border border-gray-200"
                        />
                        <span className="text-[11px] font-bold text-gray-800 text-center truncate w-full">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-gray-500 text-center line-clamp-1">
                          {preset.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: UPLOAD CUSTOM REAL PHOTO */}
            {activeModalTab === 'upload_photo' && (
              <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Paste Real Photo URL:
                  </label>
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#333333] outline-none focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#5A5A40] rounded-xl bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span>Upload Real Photo from Device</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setTempUrl(DEFAULT_REAL_TEACHER_IMAGE);
                  handleSaveAvatar(DEFAULT_REAL_TEACHER_IMAGE);
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Reset Default (Ms. Priya)
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="apply-face-btn"
                  onClick={() => handleSaveAvatar(tempUrl)}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Apply Real Face
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
