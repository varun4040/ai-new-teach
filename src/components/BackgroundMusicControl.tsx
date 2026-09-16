import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Volume1, Sparkles, ChevronDown, Check } from 'lucide-react';
import { backgroundMusic, MUSIC_STYLES, MusicStyle } from '../lib/backgroundMusic';

export const BackgroundMusicControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(backgroundMusic.getIsPlaying());
  const [volume, setVolume] = useState<number>(backgroundMusic.getVolume());
  const [style, setStyle] = useState<MusicStyle>(backgroundMusic.getStyle());
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync state with backgroundMusic engine updates
  useEffect(() => {
    const unsubscribe = backgroundMusic.subscribe(() => {
      setIsPlaying(backgroundMusic.getIsPlaying());
      setVolume(backgroundMusic.getVolume());
      setStyle(backgroundMusic.getStyle());
    });
    return unsubscribe;
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggle = () => {
    backgroundMusic.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value) / 100;
    backgroundMusic.setVolume(newVol);
    // If user moves slider up while paused, auto-start music smoothly
    if (!isPlaying && newVol > 0) {
      backgroundMusic.play();
    }
  };

  const handleSelectStyle = (newStyle: MusicStyle) => {
    backgroundMusic.setStyle(newStyle);
    if (!isPlaying) {
      backgroundMusic.play();
    }
  };

  const currentTrack = MUSIC_STYLES.find((s) => s.id === style) || MUSIC_STYLES[0];
  const volumePercent = Math.round(volume * 100);

  return (
    <div id="bg-music-control-container" className="relative inline-flex items-center" ref={menuRef}>
      {/* Grouped Music Toggle & Slider Pill */}
      <div
        className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all ${
          isPlaying
            ? 'bg-[#F2F7F4] border-[#4A7C59]/40 shadow-xs'
            : 'bg-[#F9F9F6] border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Play / Pause Toggle Button */}
        <button
          id="toggle-bg-music-btn"
          type="button"
          onClick={handleToggle}
          title={isPlaying ? 'Pause Lesson Music' : 'Play Soft Instrumental Background Music'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            isPlaying
              ? 'bg-[#4A7C59] text-white shadow-xs'
              : 'text-[#5A5A40] hover:bg-gray-200/60'
          }`}
        >
          <Music className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">
            {isPlaying ? 'Music ON' : 'Music'}
          </span>
          {/* Animated Equalizer Wavelets when playing */}
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-3 ml-0.5" aria-hidden="true">
              <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.45s]" />
            </span>
          )}
        </button>

        {/* Inline Volume Slider & Popover Trigger (visible on sm+ screens, or always compact) */}
        <div className="flex items-center gap-1 px-1">
          <button
            id="bg-music-quick-mute-btn"
            type="button"
            onClick={() => {
              if (volume > 0) {
                backgroundMusic.setVolume(0);
              } else {
                backgroundMusic.setVolume(0.28);
                if (!isPlaying) backgroundMusic.play();
              }
            }}
            title={volume === 0 ? 'Unmute music' : 'Mute music'}
            className="p-1 text-gray-500 hover:text-[#4A7C59] cursor-pointer rounded-md transition-colors"
          >
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-gray-400" />
            ) : volume < 0.4 ? (
              <Volume1 className="w-3.5 h-3.5 text-[#4A7C59]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#4A7C59]" />
            )}
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-1.5">
            <input
              id="bg-music-volume-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercent}
              onChange={handleVolumeChange}
              title={`Music Volume: ${volumePercent}%`}
              className="w-14 sm:w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A7C59]"
            />
            <span
              id="bg-music-volume-label"
              className="text-[10px] font-mono text-gray-500 w-6 text-right select-none"
            >
              {volumePercent}%
            </span>
          </div>

          {/* Dropdown Options Trigger */}
          <button
            id="bg-music-menu-btn"
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            title="Music Style & Presets"
            className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer rounded-md transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Floating Settings Popover */}
      {isMenuOpen && (
        <div
          id="bg-music-settings-popover"
          className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 text-gray-800 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#4A7C59]" />
              <span className="text-xs font-bold text-gray-800">Classroom Ambient Music</span>
            </div>
            <span className="text-[10px] bg-[#EAF2ED] text-[#4A7C59] font-semibold px-2 py-0.5 rounded-full">
              Web Audio
            </span>
          </div>

          {/* Style Selector */}
          <div className="space-y-1.5 mb-3">
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider px-1">
              Instrument Style
            </div>
            {MUSIC_STYLES.map((t) => {
              const isSelected = t.id === style;
              return (
                <button
                  key={t.id}
                  id={`bg-music-style-${t.id}`}
                  type="button"
                  onClick={() => handleSelectStyle(t.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2F7F4] text-[#4A7C59] font-bold border border-[#4A7C59]/30'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{t.description}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#4A7C59] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Popover Volume Quick Slider */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1">
              <span>Volume Level</span>
              <span className="font-mono font-bold text-[#4A7C59]">{volumePercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume1 className="w-3.5 h-3.5 text-gray-400" />
              <input
                id="bg-music-popover-volume"
                type="range"
                min="0"
                max="100"
                value={volumePercent}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A7C59]"
              />
              <Volume2 className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              Soft instrumental tones designed for young child focus & calm
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
