/**
 * Speech Synthesis Helper for Ms. Priya (AI Live Teacher)
 * Provides browser Web Speech API voice synthesis with support for Indian English (en-IN),
 * Hindi (hi-IN), and Hinglish accent modulation.
 */

export class TeacherVoiceSpeaker {
  private static isMuted: boolean = typeof window !== 'undefined'
    ? localStorage.getItem('teacher_voice_muted') === 'true'
    : false;

  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static listeners: Set<(isMuted: boolean) => void> = new Set();

  static getIsMuted(): boolean {
    return this.isMuted;
  }

  static setIsMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('teacher_voice_muted', String(muted));
      }
    } catch (e) {}

    if (muted) {
      this.cancel();
    }
    this.notifyListeners();
  }

  static toggleMute(): boolean {
    this.setIsMuted(!this.isMuted);
    return this.isMuted;
  }

  static addMuteListener(listener: (isMuted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.isMuted));
  }

  static cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.currentUtterance = null;
  }

  /**
   * Cleans text of markdown symbols, JSON-like tokens, or emojis so the voice speaks naturally
   */
  private static cleanTextForSpeech(rawText: string): string {
    return rawText
      .replace(/\[Ask Anything[^\]]*\]:?/gi, '')
      .replace(/\[Ask Anything Mode\]:?/gi, '')
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // strip emojis
      .replace(/\s+/g, ' ')
      .trim();
  }

  static speak(
    text: string,
    languageMode: string = 'english',
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (this.isMuted) {
      onEnd?.();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    let cleanText = this.cleanTextForSpeech(text);
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);

    // If text contains Devanagari, it is Hindi regardless of incoming languageMode flag
    const effectiveLanguage = (hasDevanagari || languageMode === 'hindi') ? 'hindi' : languageMode;

    if (!cleanText) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      const rawVoices = window.speechSynthesis.getVoices();
      const voices = Array.isArray(rawVoices) ? rawVoices : [];
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (effectiveLanguage === 'hindi') {
        // PURE HINDI: Matches Google हिन्दी, Google Hindi, Microsoft Swara/Madhur/Kalpana, Apple Lekha, or any hi-* voice
        if (voices.length > 0) {
          matchedVoice =
            voices.find((v) => {
              const lang = (v.lang || '').toLowerCase().replace('_', '-');
              const name = (v.name || '').toLowerCase();
              return (
                lang.startsWith('hi') ||
                name.includes('hindi') ||
                v.name.includes('हिन्दी') ||
                v.name.includes('हिंदी') ||
                name.includes('swara') ||
                name.includes('madhur') ||
                name.includes('kalpana') ||
                name.includes('lekha') ||
                name.includes('veena') ||
                name.includes('heera')
              );
            }) ||
            // Fallback to Indian English voice which understands Indian phonemes if pure Hindi voice is not installed
            voices.find((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith('en-in')) ||
            voices.find((v) => (v.name || '').toLowerCase().includes('india'));
        }
        utterance.lang = matchedVoice?.lang || 'hi-IN';
      } else if (effectiveLanguage === 'english') {
        // STRICT ENGLISH: Prioritize clear natural English voices
        if (voices.length > 0) {
          matchedVoice =
            voices.find((v) => v.lang === 'en-US' && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('jenny') || v.name.toLowerCase().includes('google'))) ||
            voices.find((v) => v.lang === 'en-US') ||
            voices.find((v) => v.lang === 'en-GB') ||
            voices.find((v) => v.lang.startsWith('en') && !v.lang.toLowerCase().replace('_', '-').startsWith('en-in')) ||
            voices.find((v) => v.lang.startsWith('en'));
        }
        utterance.lang = matchedVoice?.lang || 'en-US';
      } else {
        // HINGLISH: Prioritize Indian English (en-IN) so both English terms and Roman Hindi sound authentic
        if (voices.length > 0) {
          matchedVoice =
            voices.find((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith('en-in')) ||
            voices.find((v) => (v.name || '').toLowerCase().includes('india') || (v.name || '').toLowerCase().includes('veena')) ||
            voices.find((v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural'))) ||
            voices.find((v) => v.lang.startsWith('en'));
        }
        utterance.lang = matchedVoice?.lang || 'en-IN';
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Friendly warm cadence for elementary teacher
      utterance.pitch = 1.05;
      utterance.rate = 0.95;

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('[TeacherVoice] Speech synthesis notice:', e.error);
        this.currentUtterance = null;
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TeacherVoice] Error playing speech:', err);
      onEnd?.();
    }
  }
}
