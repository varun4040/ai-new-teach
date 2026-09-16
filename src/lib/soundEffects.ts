import { TeacherEmotion } from '../types';

/**
 * Educational Sound Effects Library (Web Audio API Synthesizer)
 * 
 * Provides soft, context-aware acoustic sound effects designed specifically for young learners:
 * - Gentle harmonic chimes for success and correct answers
 * - Airy soft 'whoosh' / page-turn sound for chapter transitions
 * - Contemplative warm marimba/sine pulse for 'thinking' state
 * - Bright clarity cue for 'explaining' state
 * - Warm receptive ascending chime for 'listening' state
 * - Reassuring soft tones for retries (warm and supportive, never punitive)
 * 
 * Zero external audio files or network requests; works offline and instantly with the browser's Web Audio API.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private masterVolume: number = 0.22; // Gentle, child-friendly volume level
  private lastSoundTime: number = 0;
  private minIntervalMs: number = 220; // Prevent overlapping sound clutter

  constructor() {
    // Check if muted state was previously persisted in localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai_teacher_sound_muted');
        if (saved !== null) {
          this.muted = saved === 'true';
        }
      } catch (e) {
        // ignore localStorage access errors
      }
    }
  }

  /**
   * Lazily initialize or resume the Web Audio context on user interaction.
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      return this.ctx;
    } catch (err) {
      console.warn('[SoundEffects] Web Audio initialization notice:', err);
      return null;
    }
  }

  /**
   * Check if sound should be skipped (muted or too rapid)
   */
  private shouldPlay(): boolean {
    if (this.muted) return false;
    const now = Date.now();
    if (now - this.lastSoundTime < this.minIntervalMs) {
      return false;
    }
    this.lastSoundTime = now;
    return true;
  }

  /**
   * Toggles sound on/off
   */
  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai_teacher_sound_muted', String(this.muted));
      } catch (e) {}
    }
    // If unmuting, play a tiny confirmation click
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai_teacher_sound_muted', String(this.muted));
      } catch (e) {}
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Helper to play a soft, filtered sine/triangle tone with exponential envelope
   */
  private playTone(
    freq: number,
    duration: number = 0.35,
    type: OscillatorType = 'sine',
    gainMult: number = 1,
    filterFreq: number = 1600,
    startTimeOffset: number = 0
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime + startTimeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Mellow acoustic lowpass filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      // Smooth attack and exponential decay to prevent clicking
      const baseGain = this.masterVolume * gainMult;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(baseGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // ignore playback errors
    }
  }

  /**
   * 1. THINKING STATE SOUND:
   * A gentle, contemplative warm two-tone marimba chime (E4 -> B4)
   * Signals the teacher is processing thoughtfully without rushing.
   */
  public playThinking(): void {
    if (!this.shouldPlay()) return;

    // Warm E4 (329.63 Hz)
    this.playTone(329.63, 0.4, 'triangle', 0.8, 1200, 0);
    // Reflective B4 (493.88 Hz)
    this.playTone(493.88, 0.5, 'sine', 0.65, 1400, 0.09);
  }

  /**
   * 2. EXPLAINING STATE SOUND:
   * A bright, clear focus chime (G5 -> C6)
   * Illuminates key concepts with positive clarity.
   */
  public playExplaining(): void {
    if (!this.shouldPlay()) return;

    // Crisp G5 (783.99 Hz)
    this.playTone(783.99, 0.3, 'sine', 0.7, 2400, 0);
    // Bright C6 (1046.5 Hz)
    this.playTone(1046.5, 0.45, 'sine', 0.85, 2600, 0.08);
  }

  /**
   * 3. LISTENING STATE SOUND:
   * A soft, attentive ascending ping (C5 -> E5)
   * Warmly invites the student to speak or answer.
   */
  public playListening(): void {
    if (!this.shouldPlay()) return;

    // Warm C5 (523.25 Hz)
    this.playTone(523.25, 0.28, 'sine', 0.7, 1800, 0);
    // Attentive E5 (659.25 Hz)
    this.playTone(659.25, 0.35, 'triangle', 0.75, 2000, 0.07);
  }

  /**
   * 4. HAPPY / CELEBRATION CHIME:
   * Cheerful, uplifting major arpeggio
   */
  public playHappy(): void {
    if (!this.shouldPlay()) return;

    this.playTone(523.25, 0.25, 'sine', 0.7, 2000, 0); // C5
    this.playTone(659.25, 0.28, 'sine', 0.75, 2200, 0.06); // E5
    this.playTone(783.99, 0.35, 'sine', 0.8, 2400, 0.12); // G5
  }

  /**
   * 5. ENCOURAGING STATE SOUND:
   * Reassuring harmonious double-tone
   */
  public playEncouraging(): void {
    if (!this.shouldPlay()) return;

    this.playTone(440, 0.35, 'triangle', 0.7, 1600, 0); // A4
    this.playTone(554.37, 0.45, 'sine', 0.75, 1800, 0.08); // C#5
    this.playTone(659.25, 0.5, 'sine', 0.8, 2000, 0.14); // E5
  }

  /**
   * 6. SURPRISED / DELIGHTED STATE SOUND:
   * High, playful rising twinkle
   */
  public playSurprised(): void {
    if (!this.shouldPlay()) return;

    this.playTone(783.99, 0.2, 'sine', 0.65, 2800, 0);
    this.playTone(987.77, 0.2, 'sine', 0.7, 3000, 0.06);
    this.playTone(1318.51, 0.35, 'sine', 0.8, 3200, 0.12);
  }

  /**
   * Context-Aware Emotion Audio Dispatcher:
   * Triggers the corresponding gentle sound effect based on the teacher's current emotional state.
   */
  public playEmotion(emotion: TeacherEmotion): void {
    switch (emotion) {
      case 'thinking':
        this.playThinking();
        break;
      case 'explaining':
        this.playExplaining();
        break;
      case 'listening':
        this.playListening();
        break;
      case 'happy':
        this.playHappy();
        break;
      case 'encouraging':
        this.playEncouraging();
        break;
      case 'surprised':
        this.playSurprised();
        break;
    }
  }

  /**
   * 7. SUCCESS CHIME (e.g. Correct quiz answer, milestone solved):
   * A gentle, sparkling four-note victory arpeggio
   * (C5 -> E5 -> G5 -> C6) with rich crystalline resonance.
   */
  public playSuccess(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(
        freq,
        0.5 + idx * 0.1,
        'sine',
        0.85 + (idx === 3 ? 0.25 : 0),
        2800,
        idx * 0.09
      );
    });
  }

  /**
   * 8. WHOOSH EFFECT (e.g. Switching chapters, turning textbook page):
   * An airy, organic swept-filter noise burst.
   * Simulates a gentle breeze turning a textbook page.
   */
  public playWhoosh(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.35;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft pink-ish noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.25;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Swept bandpass filter creating whoosh sweep
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(450, now + duration);

      // Gain envelope
      const gain = ctx.createGain();
      const peakGain = this.masterVolume * 0.9;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + duration * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.05);
    } catch (e) {
      // Fallback whoosh using frequency-modulated triangle wave
      this.playTone(380, 0.25, 'triangle', 0.5, 1200);
    }
  }

  /**
   * 9. TRY AGAIN / ENCOURAGING RE-ATTEMPT:
   * Warm, soothing, non-punitive two-tone cadence (G4 -> E4)
   * Reassures the child that making mistakes is part of learning.
   */
  public playTryAgain(): void {
    if (this.muted) return;

    // Soothing G4 (392 Hz)
    this.playTone(392.0, 0.32, 'triangle', 0.65, 1200, 0);
    // Gentle E4 (329.63 Hz)
    this.playTone(329.63, 0.45, 'sine', 0.7, 1000, 0.12);
  }

  /**
   * 10. SOFT UI CLICK / TAP:
   * Tiny acoustic droplet tick
   */
  public playClick(): void {
    if (this.muted) return;
    this.playTone(800, 0.05, 'sine', 0.4, 1800);
  }

  /**
   * 11. BUBBLY POP / STAMP SOUND:
   * Playful short bubbly acoustic pop for stickers and stamps
   */
  public playPop(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);

      const baseGain = this.masterVolume * 0.85;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(baseGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      this.playTone(650, 0.06, 'sine', 0.5, 2000);
    }
  }
}

// Global singleton instance for easy access anywhere in the app
export const soundEffects = new SoundEffectsEngine();
