import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Search, ChevronDown } from 'lucide-react';
import { LanguageMode } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageDefinition } from '../lib/languages';

interface LanguageSelectorProps {
  currentLanguage: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  variant?: 'compact' | 'full';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  variant = 'compact',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang = getLanguageDefinition(currentLanguage);

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

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.id.toLowerCase().includes(query)
    );
  });

  const categories = [
    { id: 'primary', label: 'Common & Bilingual' },
    { id: 'indian_regional', label: 'Indian Regional Languages' },
    { id: 'international', label: 'Global Languages' },
  ];

  return (
    <div className="relative inline-block" ref={containerRef} id="language-selector-root">
      {/* Trigger Button */}
      <button
        id="language-selector-trigger"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F3F7F5] hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-[#333333] rounded-xl transition-all cursor-pointer shadow-2xs"
        title="Select Lesson Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#5A5A40]" />
        <span className="text-sm leading-none" aria-hidden="true">
          {activeLang.flag}
        </span>
        <span className="font-bold text-[#5A5A40] max-w-[85px] sm:max-w-none truncate">
          {activeLang.nativeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          id="language-selector-dropdown"
          className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 max-h-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-gray-100 bg-[#FBFBF9]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#5A5A40]" />
                <span className="text-xs font-bold text-gray-800">Choose Teaching Language</span>
              </div>
              <span className="text-[10px] bg-[#E8F3EF] text-[#5A5A40] font-semibold px-2 py-0.5 rounded-full">
                {SUPPORTED_LANGUAGES.length} Languages
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="language-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language (e.g. Hindi, Spanish, Tamil)..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                autoFocus
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto p-2 space-y-3 max-h-[300px] scrollbar-thin">
            {!searchQuery && (
              <div className="p-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">🇮🇳</span>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-orange-950 flex items-center gap-1.5">
                      <span>Hinglish Mode</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-orange-200/80 text-orange-800 rounded font-bold">Popular</span>
                    </div>
                    <div className="text-[9px] text-orange-700">Conversational Hindi + English blend</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLanguageChange('hinglish');
                    setIsOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0 ${
                    currentLanguage === 'hinglish'
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-white text-orange-800 border border-orange-300 hover:bg-orange-100'
                  }`}
                >
                  {currentLanguage === 'hinglish' ? 'Active ✓' : 'Switch'}
                </button>
              </div>
            )}

            {categories.map((cat) => {
              const langsInCat = filteredLanguages.filter((l) => l.category === cat.id);
              if (langsInCat.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-2 pt-1">
                    {cat.label}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {langsInCat.map((lang) => {
                      const isSelected = lang.id === currentLanguage;
                      return (
                        <button
                          key={lang.id}
                          id={`lang-option-${lang.id}`}
                          type="button"
                          onClick={() => {
                            onLanguageChange(lang.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#E8F3EF] text-[#5A5A40] font-bold border border-[#5A5A40]/30 shadow-xs'
                              : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{lang.flag}</span>
                            <div className="text-left">
                              <span className="font-semibold">{lang.nativeName}</span>
                              {lang.name !== lang.nativeName && (
                                <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                                  ({lang.name})
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#5A5A40] shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400">
                No languages found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer notice */}
          <div className="p-2 border-t border-gray-100 bg-[#FBFBF9] text-center text-[10px] text-gray-400">
            Ms. Priya speaks and understands all selected languages naturally
          </div>
        </div>
      )}
    </div>
  );
};
