import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  Send,
  BookOpen,
  Power,
  SlidersHorizontal,
} from 'lucide-react';
import { CameraVisionControl } from './CameraVisionControl';
import { BackgroundMusicControl } from './BackgroundMusicControl';
import { LanguageMode } from '../types';
import { getLanguageDefinition } from '../lib/languages';

interface ControlBarProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onSendTextMessage: (text: string) => void;
  onOpenTextbookModal: () => void;
  onToggleStateDrawer: () => void;
  onFrameCaptured?: (base64Image: string) => void;
  onResetClass: () => void;
  isTextbookActive?: boolean;
  currentLanguage?: LanguageMode;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMicActive,
  onToggleMic,
  isCameraActive,
  onToggleCamera,
  onSendTextMessage,
  onOpenTextbookModal,
  onToggleStateDrawer,
  onFrameCaptured,
  onResetClass,
  isTextbookActive = false,
  currentLanguage = 'english' as LanguageMode,
}) => {
  const [inputText, setInputText] = useState('');
  const activeLang = getLanguageDefinition(currentLanguage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendTextMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div
      id="classroom-control-bar"
      className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-6 py-3 bg-white border-t border-gray-100 text-[#333333] shadow-xs shrink-0 z-20"
    >
      {/* Mobile Row 1 / Desktop Left: Mic, Camera & Background Music Controls */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Microphone Button with Interruption Barge-in Indicator */}
        <button
          id="toggle-mic-btn"
          onClick={onToggleMic}
          className={`flex-1 md:flex-none relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs border ${
            isMicActive
              ? 'bg-[#5A5A40] text-white border-[#5A5A40] ring-4 ring-[#5A5A40]/20'
              : 'bg-[#F3F7F5] text-[#5A5A40] border-gray-200 hover:border-[#5A5A40]'
          }`}
        >
          {isMicActive ? (
            <>
              <Mic className="w-4 h-4 animate-bounce text-white" />
              <span>{activeLang.ui.micOn}</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 text-[#5A5A40]" />
              <span>{activeLang.ui.startSpeaking}</span>
            </>
          )}
        </button>

        {/* Camera Control */}
        <CameraVisionControl
          isCameraActive={isCameraActive}
          onToggleCamera={onToggleCamera}
          onFrameCaptured={onFrameCaptured}
        />

        {/* Soft Instrumental Background Music Toggle with Volume Slider */}
        <BackgroundMusicControl />
      </div>

      {/* Text Message Input Bar (Row 2 on mobile, centered on desktop) */}
      <form onSubmit={handleSubmit} className="w-full md:flex-1 md:max-w-xl flex items-center gap-2">
        <input
          id="student-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeLang.ui.askPlaceholder}
          className="w-full px-4 py-2.5 bg-[#F5F5F0] border-none focus:ring-2 focus:ring-[#5A5A40] text-[#333333] text-xs sm:text-sm rounded-xl placeholder-gray-400 outline-none transition-all"
        />
        <button
          id="send-message-btn"
          type="submit"
          className="p-2.5 sm:p-3 bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
          title={activeLang.ui.sendMessage}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Secondary Tools: Textbook, Classroom State, Reset (Desktop or hidden on mobile bottom dock if using mobile nav) */}
      <div className="hidden md:flex items-center gap-2">
        {/* Upload Textbook Button */}
        <button
          id="upload-textbook-btn"
          onClick={onOpenTextbookModal}
          className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isTextbookActive
              ? 'bg-[#E8F3EF] border-[#5A5A40] text-[#5A5A40]'
              : 'bg-[#F3F7F5] hover:bg-gray-100 border-gray-200 text-gray-700'
          }`}
          title="Upload or manage textbook source of truth"
        >
          <BookOpen className="w-4 h-4 text-[#5A5A40]" />
          <span className="hidden sm:inline">{activeLang.ui.textbook}</span>
        </button>

        {/* Classroom State Drawer Toggle */}
        <button
          onClick={onToggleStateDrawer}
          className="p-2.5 bg-[#F3F7F5] hover:bg-gray-100 border border-gray-200 text-[#5A5A40] rounded-xl transition-all cursor-pointer"
          title="Inspect Classroom State"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* End / Reset Class */}
        <button
          onClick={onResetClass}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6321] hover:bg-[#E55A1E] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          title="End Class Session"
        >
          <Power className="w-4 h-4 text-white" />
          <span className="hidden md:inline">{activeLang.ui.endClass}</span>
        </button>
      </div>
    </div>
  );
};

