import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Smile,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquare,
  BookOpen,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  Check,
} from 'lucide-react';
import { AvatarState, TeacherEmotion } from '../types';
import { soundEffects } from '../lib/soundEffects';

interface TeacherAvatarViewProps {
  avatarState: AvatarState;
  teacherName?: string;
  onSelectEmotion?: (emotion: TeacherEmotion) => void;
}

const EMOTION_ICONS: Record<TeacherEmotion, { icon: React.FC<any>; label: string; color: string; desc: string }> = {
  happy: { icon: Smile, label: 'Friendly', color: 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1]', desc: 'Warm & welcoming' },
  encouraging: { icon: Sparkles, label: 'Praising', color: 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1]', desc: 'Cheering student on' },
  thinking: { icon: HelpCircle, label: 'Thinking', color: 'bg-amber-50 text-amber-800 border-amber-300', desc: 'Processing student question' },
  explaining: { icon: GraduationCap, label: 'Teaching', color: 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1]', desc: 'Explaining key concepts' },
  listening: { icon: Eye, label: 'Listening', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', desc: 'Attentively hearing student' },
  surprised: { icon: Sparkles, label: 'Delighted', color: 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1]', desc: 'Thrilled with progress' },
};

const PRESET_AVATARS = [
  { name: 'Professional Teacher', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { name: 'Friendly Tutor', url: 'https://images.unsplash.com/photo-1580894732475-8eb40698144f?w=400&auto=format&fit=crop&q=80' },
  { name: 'Warm Educator', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80' },
];

export const TeacherAvatarView: React.FC<TeacherAvatarViewProps> = ({
  avatarState,
  teacherName = 'Ms. Priya',
  onSelectEmotion,
}) => {
  const EmotionIcon = EMOTION_ICONS[avatarState.emotion]?.icon || Smile;
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(
    localStorage.getItem('ms_priya_custom_avatar') || ''
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tempUrl, setTempUrl] = useState<string>(customAvatarUrl);
  const [showEmotionMenu, setShowEmotionMenu] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundEffects.isMuted());

  const handleToggleSound = () => {
    const nextMuted = soundEffects.toggleMute();
    setIsSoundMuted(nextMuted);
  };

  const handleSaveAvatar = (url: string) => {
    setCustomAvatarUrl(url);
    localStorage.setItem('ms_priya_custom_avatar', url);
    setShowModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          handleSaveAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      id="teacher-avatar-container"
      className="relative flex flex-col h-full w-full bg-[#F3F7F5] border border-gray-200 rounded-3xl shadow-xs overflow-hidden"
    >
      {/* Top Banner Badge */}
      <div
        id="teacher-status-bar"
        className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 text-[#333333]"
      >
        <div className="flex items-center gap-2">
          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider animate-pulse">
            LIVE
          </span>
          <span className="text-xs font-bold tracking-tight text-[#333333]">
            {teacherName} • Virtual Classroom
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle Audio Sound Effects Toggle */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
              isSoundMuted
                ? 'bg-gray-100 text-gray-400 border-gray-200'
                : 'bg-[#E8F3EF] text-[#5A5A40] border-[#C8DCD1] hover:bg-[#d8ece4]'
            }`}
            title={isSoundMuted ? 'Sound Effects Muted (Click to Unmute)' : 'Sound Effects Active (Click to Mute)'}
          >
            {isSoundMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden sm:inline">Sound FX</span>
              </>
            )}
          </button>

          {/* Custom Avatar Button */}
          <button
            onClick={() => {
              setTempUrl(customAvatarUrl);
              setShowModal(true);
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-[#F3F7F5] hover:bg-gray-100 text-[#5A5A40] border border-gray-200 rounded-lg transition-colors cursor-pointer"
            title="Use Custom AI Avatar / Photo"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Avatar</span>
          </button>

          {/* Emotion Pill & Interactive Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowEmotionMenu(!showEmotionMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-95 ${
                EMOTION_ICONS[avatarState.emotion]?.color
              }`}
              title="Click to switch teacher emotion (Thinking, Explaining, Listening, Friendly)"
            >
              <EmotionIcon className="w-3.5 h-3.5" />
              <span>{EMOTION_ICONS[avatarState.emotion]?.label}</span>
            </button>

            {/* Quick Emotion Picker Dropdown */}
            {showEmotionMenu && (
              <div
                className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-1.5 w-48 flex flex-col gap-1 backdrop-blur-md"
                onMouseLeave={() => setShowEmotionMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Teacher Emotion FX</span>
                  {!isSoundMuted && <span className="text-[9px] text-emerald-600 font-normal">Audio on</span>}
                </div>
                {(['thinking', 'explaining', 'listening', 'happy', 'encouraging'] as TeacherEmotion[]).map((emo) => {
                  const item = EMOTION_ICONS[emo];
                  const Icon = item.icon;
                  const isActive = avatarState.emotion === emo;
                  return (
                    <button
                      key={emo}
                      onClick={() => {
                        onSelectEmotion?.(emo);
                        soundEffects.playEmotion(emo);
                        setShowEmotionMenu(false);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#E8F3EF] text-[#5A5A40]'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <div className="flex flex-col leading-tight">
                        <span>{item.label}</span>
                        <span className="text-[9px] text-gray-400 font-normal">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classroom Backdrop and Teacher Desk Scene */}
      <div
        id="classroom-virtual-scene"
        className="relative flex-1 flex flex-col items-center justify-end overflow-hidden bg-[#F3F7F5] p-6"
      >
        {/* Soft Ambient Glow Circle */}
        <div className="w-80 h-80 bg-[#C8DCD1] rounded-full absolute bottom-[-40px] opacity-25 pointer-events-none" />

        {/* Live Speech Bubble overlay */}
        <AnimatePresence>
          {avatarState.transcriptText && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-6 z-20 max-w-sm w-11/12 bg-white/95 border border-gray-200/80 rounded-2xl p-4 shadow-sm text-[#333333] backdrop-blur-sm"
            >
              <div className="flex items-start gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-gray-800">
                  "{avatarState.transcriptText}"
                </p>
              </div>

              {/* Speech bubble arrow pointer */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200/80" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teacher Character Container */}
        <div className="teacher-character-stage relative z-10 flex flex-col items-center justify-end w-full max-w-sm mt-8 mb-2">
          {/* Ambient Emotional Aura & Ripple Glow */}
          <div className="teacher-avatar-aura absolute w-60 h-60 rounded-full pointer-events-none -top-8" />

          {/* Teacher Avatar Root with CSS Transition Classes */}
          <div
            className={`teacher-character-root relative flex flex-col items-center ${
              avatarState.cssTransitionClass || `teacher-state-${avatarState.emotion}`
            } ${avatarState.isBlinking ? 'teacher-blinking' : ''}`}
            data-teacher-emotion={avatarState.emotion}
            data-is-speaking={String(avatarState.isSpeaking)}
            data-is-blinking={String(!!avatarState.isBlinking)}
            data-looking-at={avatarState.lookingAt}
          >
            {/* Lifelike Emotion Badges */}
            {avatarState.emotion === 'thinking' && (
              <div className="absolute -top-10 right-0 pointer-events-none flex items-center gap-1.5 bg-amber-50/95 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-xs z-30 animate-pulse">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 animate-spin [animation-duration:5s]" />
                <span>Thinking...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </div>
            )}

            {avatarState.emotion === 'listening' && (
              <div className="absolute -top-10 left-0 pointer-events-none flex items-center gap-1.5 bg-emerald-50/95 border border-emerald-300 text-emerald-900 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-xs z-30">
                <Eye className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Listening actively</span>
                <span className="flex items-center gap-0.5 ml-0.5">
                  <span className="w-1 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1 h-3 bg-emerald-600 rounded-full animate-bounce" />
                  <span className="w-1 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                </span>
              </div>
            )}

            {avatarState.emotion === 'explaining' && (
              <div className="absolute -top-10 right-0 pointer-events-none flex items-center gap-1.5 bg-[#E8F3EF]/95 border border-[#C8DCD1] text-[#333333] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-xs z-30">
                <GraduationCap className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Teaching lesson</span>
              </div>
            )}

            {customAvatarUrl ? (
              <div className="relative flex flex-col items-center">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#5A5A40] shadow-md bg-white teacher-custom-photo">
                  <img
                    src={customAvatarUrl}
                    alt={teacherName}
                    className="w-full h-full object-cover"
                    onError={() => setCustomAvatarUrl('')}
                  />
                </div>
                {/* Speaking mouth indicator overlay if speaking */}
                {avatarState.isSpeaking && (
                  <div className="absolute bottom-2 bg-[#FF6321] text-white text-[10px] font-bold px-3 py-0.5 rounded-full animate-bounce shadow-xs">
                    Speaking... 🎙️
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Hair and Head */}
                <div className="teacher-avatar-head relative flex items-center justify-center">
                  {/* Hair */}
                  <div className="w-32 h-28 bg-[#3E2723] rounded-t-full -mb-12 shadow-md" />

                  {/* Face */}
                  <div className="teacher-avatar-face relative w-24 h-24 bg-[#D9C5B2] rounded-full border-2 border-[#C8B29E] shadow-sm flex flex-col items-center justify-center">
                    {/* Eyebrows */}
                    <div className="teacher-avatar-eyebrows absolute top-4 flex items-center justify-between w-14 z-10 px-1">
                      <div className="teacher-avatar-eyebrow-left w-3.5 h-1 bg-[#3E2723] rounded-full" />
                      <div className="teacher-avatar-eyebrow-right w-3.5 h-1 bg-[#3E2723] rounded-full" />
                    </div>

                    {/* Glasses */}
                    <div className="teacher-avatar-glasses absolute top-7 flex items-center gap-1.5 z-10">
                      <div className="w-7 h-7 rounded-full border-2 border-[#333333] bg-white/30" />
                      <div className="w-2 h-0.5 bg-[#333333]" />
                      <div className="w-7 h-7 rounded-full border-2 border-[#333333] bg-white/30" />
                    </div>

                    {/* Eyes */}
                    <div className="teacher-avatar-eyes flex items-center gap-5 mt-1 z-10">
                      <div className="teacher-avatar-eye teacher-avatar-eye-left w-2.5 h-2.5 rounded-full bg-[#333333]" />
                      <div className="teacher-avatar-eye teacher-avatar-eye-right w-2.5 h-2.5 rounded-full bg-[#333333]" />
                    </div>

                    {/* Cute Cheeks */}
                    <div className="absolute top-13 flex items-center justify-between w-16 px-1 opacity-35 pointer-events-none">
                      <div className="w-2 h-1 bg-[#FF8A80] rounded-full" />
                      <div className="w-2 h-1 bg-[#FF8A80] rounded-full" />
                    </div>

                    {/* Mouth / Lip Sync */}
                    <div className="mt-4 z-10 flex items-center justify-center">
                      {avatarState.isSpeaking ? (
                        <div className="teacher-avatar-mouth w-5 h-3 bg-[#FF6321] rounded-full animate-pulse" />
                      ) : avatarState.emotion === 'thinking' ? (
                        <div className="teacher-avatar-mouth w-3.5 h-1.5 bg-[#333333] rounded-full" />
                      ) : avatarState.emotion === 'listening' ? (
                        <div className="teacher-avatar-mouth w-5 h-2 border-b-2 border-[#FF6321] rounded-b-full" />
                      ) : (
                        <div className="teacher-avatar-mouth w-5 h-2 border-b-2 border-[#FF6321] rounded-full" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Torso & Teacher Outfit in Natural Olive #5A5A40 */}
                <div className="teacher-avatar-torso w-36 h-28 bg-[#5A5A40] rounded-t-3xl border-t-4 border-[#4A4A34] flex flex-col items-center shadow-md relative">
                  {/* Collar & Badge */}
                  <div className="w-8 h-4 bg-white rounded-b-lg border-b border-gray-200" />
                  <div className="mt-2 text-[10px] font-bold text-white uppercase tracking-widest bg-[#3E2723]/60 px-2.5 py-0.5 rounded-full">
                    MS. PRIYA
                  </div>

                  {/* Gesturing Hand / Arm */}
                  {avatarState.gesture === 'waving' && (
                    <div className="absolute -right-6 top-4 text-2xl animate-bounce">
                      👋
                    </div>
                  )}
                  {avatarState.gesture === 'pointing_right' && (
                    <div className="absolute -right-8 top-6 text-2xl">👉</div>
                  )}
                  {avatarState.gesture === 'thumbs_up' && (
                    <div className="absolute -right-6 top-4 text-2xl">👍</div>
                  )}
                  {avatarState.gesture === 'clapping' && (
                    <div className="absolute -right-6 top-4 text-2xl animate-pulse">
                      👏
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Teacher Desk Surface */}
          <div className="w-full bg-[#5D4037] border-t-8 border-[#3E2723] rounded-t-xl p-3 flex items-center justify-between shadow-lg relative z-20 mt-1">
            {/* Desk props */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5 bg-[#3E2723] p-1 rounded border border-[#5D4037]">
                <div className="w-10 h-1.5 bg-red-400 rounded-xs" />
                <div className="w-10 h-1.5 bg-blue-400 rounded-xs" />
                <div className="w-10 h-1.5 bg-emerald-400 rounded-xs" />
              </div>
              <span className="text-xs font-semibold text-[#D9C5B2]">Textbooks</span>
            </div>

            {/* Speaking audio wave indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full border border-gray-200">
              {avatarState.isSpeaking ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#5A5A40] animate-pulse" />
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-1 h-full bg-[#5A5A40] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-full bg-[#5A5A40] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-full bg-[#5A5A40] rounded-full animate-bounce" />
                  </div>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] text-gray-500 font-medium">Listening</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="h-2 w-full bg-[#E8F3EF] rounded-full mt-2" />
      </div>

      {/* Custom Avatar Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="text-base font-bold text-[#333333]">Custom AI Avatar (Google Imagen / Image)</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              You can paste an image URL from Google Imagen, Midjourney, or upload any photo/avatar to represent Ms. Priya in the virtual classroom!
            </p>

            {/* Presets */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Preset Teacher Portraits:</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTempUrl(preset.url)}
                    className="flex flex-col items-center p-2 rounded-xl border border-gray-200 hover:border-[#5A5A40] bg-gray-50 hover:bg-[#F3F7F5] transition-all cursor-pointer group"
                  >
                    <img src={preset.url} alt={preset.name} className="w-12 h-12 rounded-full object-cover mb-1" />
                    <span className="text-[10px] font-medium text-gray-700 text-center truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Image URL:</label>
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://example.com/teacher-avatar.jpg"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#333333] outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Or Upload Image File:</label>
              <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-[#5A5A40] rounded-xl bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-gray-500" />
                <span>Browse Image from Device</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              {customAvatarUrl && (
                <button
                  onClick={() => handleSaveAvatar('')}
                  className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer mr-auto"
                >
                  Reset to Default Illustration
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveAvatar(tempUrl)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                Apply Avatar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
