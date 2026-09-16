/**
 * Soft Instrumental Background Music Engine
 * Built purely with the Web Audio API.
 * 
 * Features:
 * - 100% offline, zero external audio files, no network latency or broken links.
 * - Gentle, child-friendly acoustics (low-pass filtered acoustic chime & warm Rhodes electric piano tones).
 * - Calming chord progressions (Cmaj9, Am9, Fmaj7, Gsus4) with soft arpeggiated melodies.
 * - Built-in soft stereo delay/reverb space for an organic, relaxing classroom atmosphere.
 * - Smooth master gain fading (prevents clicks or pops during toggle/volume adjustment).
 * - Precise lookahead Web Audio scheduling for seamless continuous looping.
 */

export type MusicStyle = 'gentle_piano' | 'music_box' | 'ambient_study';

export interface MusicTrackInfo {
  id: MusicStyle;
  label: string;
  description: string;
  tempo: number; // BPM
}

export const MUSIC_STYLES: MusicTrackInfo[] = [
  {
    id: 'gentle_piano',
    label: 'Gentle Piano',
    description: 'Warm chords & relaxing study arpeggios',
    tempo: 72,
  },
  {
    id: 'music_box',
    label: 'Peaceful Kalimba',
    description: 'Soft crystalline music-box notes for focus',
    tempo: 66,
  },
  {
    id: 'ambient_study',
    label: 'Warm Ambient Pad',
    description: 'Soothing floating harmonies & deep comfort',
    tempo: 60,
  },
];

type Chord = {
  rootFreq: number;
  frequencies: number[];
  bassFreq: number;
};

// Standard scientific pitch frequencies
const NOTE = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
};

// Peaceful chord progressions for calm focus
const CHORDS_PROGRESSION: Chord[] = [
  // Cmaj9: C3, G3, B3, E4, D5 (Bass C2)
  {
    rootFreq: NOTE.C3,
    bassFreq: NOTE.C2,
    frequencies: [NOTE.C3, NOTE.G3, NOTE.B3, NOTE.E4, NOTE.D5],
  },
  // Am9: A2, E3, G3, C4, B4 (Bass A2)
  {
    rootFreq: NOTE.A2,
    bassFreq: NOTE.A2,
    frequencies: [NOTE.A2, NOTE.E3, NOTE.G3, NOTE.C4, NOTE.B4],
  },
  // Fmaj7: F2, C3, E3, A3, G4 (Bass F2)
  {
    rootFreq: NOTE.F2,
    bassFreq: NOTE.F2,
    frequencies: [NOTE.F2, NOTE.C3, NOTE.E3, NOTE.A3, NOTE.G4],
  },
  // Gsus4 / G6: G2, D3, G3, C4, E4 (Bass G2)
  {
    rootFreq: NOTE.G2,
    bassFreq: NOTE.G2,
    frequencies: [NOTE.G2, NOTE.D3, NOTE.G3, NOTE.C4, NOTE.E4],
  },
];

class BackgroundMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;

  private isPlaying: boolean = false;
  private volume: number = 0.28; // default soft volume (0.0 to 1.0)
  private currentStyle: MusicStyle = 'gentle_piano';

  private timerId: number | null = null;
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private readonly lookaheadMs: number = 30;
  private readonly scheduleAheadSeconds: number = 0.25;

  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('ai_teacher_bgm_volume');
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
        const savedStyle = localStorage.getItem('ai_teacher_bgm_style') as MusicStyle;
        if (savedStyle && MUSIC_STYLES.some((s) => s.id === savedStyle)) {
          this.currentStyle = savedStyle;
        }
      } catch {
        // ignore localStorage errors
      }
    }
  }

  /**
   * Subscribe to state changes (playing state, volume, style)
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getStyle(): MusicStyle {
    return this.currentStyle;
  }

  /**
   * Initialize or resume the Web Audio Context and audio graph
   */
  private initAudioGraph(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        this.ctx = new AudioContextClass();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Low-pass warm acoustic filter so music never overpowers speech
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(1100, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);

        // Gentle ambient delay / spatial depth
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);

        this.delayFeedbackGain = this.ctx.createGain();
        this.delayFeedbackGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        // Routing: source -> filter -> masterGain -> destination
        // Filter also routes to delay -> feedback -> delay & masterGain
        this.filterNode.connect(this.masterGain);
        this.filterNode.connect(this.delayNode);
        this.delayNode.connect(this.delayFeedbackGain);
        this.delayFeedbackGain.connect(this.delayNode);
        this.delayNode.connect(this.masterGain);

        this.masterGain.connect(this.ctx.destination);
      }

      return this.ctx;
    } catch (err) {
      console.warn('[BackgroundMusic] Error setting up AudioContext:', err);
      return null;
    }
  }

  /**
   * Adjust master playback volume with smooth exponential curve
   */
  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai_teacher_bgm_volume', String(clamped));
      } catch {}
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.volume, now, 0.05);
    }

    this.notify();
  }

  /**
   * Change music style
   */
  public setStyle(style: MusicStyle): void {
    if (this.currentStyle === style) return;
    this.currentStyle = style;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai_teacher_bgm_style', style);
      } catch {}
    }

    // Update filter cutoff based on style
    if (this.filterNode && this.ctx) {
      const cutoff = style === 'music_box' ? 2200 : style === 'ambient_study' ? 850 : 1200;
      this.filterNode.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.1);
    }

    this.notify();
  }

  /**
   * Toggle play / pause
   */
  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  /**
   * Start playing background music
   */
  public play(): void {
    const ctx = this.initAudioGraph();
    if (!ctx) return;

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Smooth fade in
    const now = ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume), now + 0.8);
    }

    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.1;
    this.startScheduler();
    this.notify();
  }

  /**
   * Stop / pause background music with smooth fade out
   */
  public stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    }

    this.notify();
  }

  /**
   * Web Audio Lookahead Scheduler
   */
  private startScheduler(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }

    this.timerId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;

      while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadSeconds) {
        this.scheduleStep(this.currentStep, this.nextNoteTime);
        this.advanceStep();
      }
    }, this.lookaheadMs);
  }

  /**
   * Calculate timing for next step
   */
  private advanceStep(): void {
    const trackInfo = MUSIC_STYLES.find((s) => s.id === this.currentStyle) || MUSIC_STYLES[0];
    // Each step is an eighth note (0.5 beats)
    const secondsPerBeat = 60.0 / trackInfo.tempo;
    const stepDuration = secondsPerBeat * 0.5;

    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 32; // 4 bars of 8 eighth-notes = 32 steps
  }

  /**
   * Schedules notes for a given step in the 32-step loop
   */
  private scheduleStep(step: number, time: number): void {
    if (!this.ctx || !this.filterNode) return;

    // Determine current bar (0 to 3) and chord
    const barIndex = Math.floor(step / 8) % CHORDS_PROGRESSION.length;
    const stepInBar = step % 8;
    const chord = CHORDS_PROGRESSION[barIndex];

    // 1. Play warm bass on step 0 and gentle harmonic pulse on step 4
    if (stepInBar === 0) {
      this.playBassNote(chord.bassFreq, time, 1.8);
      // Play warm chord root & fifth
      this.playChordPads(chord.frequencies, time, 2.2);
    }

    // 2. Play gentle melodic / arpeggiated movement based on style
    if (this.currentStyle === 'gentle_piano') {
      // Arpeggiated gentle piano pattern
      const arpeggioMap: { [key: number]: number } = {
        0: chord.frequencies[0],
        2: chord.frequencies[1],
        3: chord.frequencies[2],
        4: chord.frequencies[3] || chord.frequencies[1],
        6: chord.frequencies[4] || chord.frequencies[2],
        7: chord.frequencies[1],
      };

      if (arpeggioMap[stepInBar]) {
        const freq = arpeggioMap[stepInBar];
        this.playPianoNote(freq, time, 0.7, 0.45);
      }
    } else if (this.currentStyle === 'music_box') {
      // Peaceful crystalline bell notes
      const bellMap: { [key: number]: number } = {
        0: chord.frequencies[1] * 1.5,
        2: chord.frequencies[2] * 1.5,
        4: chord.frequencies[3] ? chord.frequencies[3] * 1.5 : chord.frequencies[0] * 2,
        6: chord.frequencies[4] ? chord.frequencies[4] * 1.5 : chord.frequencies[2] * 2,
      };

      if (bellMap[stepInBar]) {
        this.playKalimbaNote(bellMap[stepInBar], time, 0.6, 0.55);
      }
    } else if (this.currentStyle === 'ambient_study') {
      // Warm continuous harmonic pad
      if (stepInBar === 2 || stepInBar === 5) {
        const note = chord.frequencies[stepInBar % chord.frequencies.length];
        this.playAmbientSwell(note, time, 1.4, 0.35);
      }
    }
  }

  /**
   * Synthesize soft Rhodes/Acoustic Piano Note
   */
  private playPianoNote(freq: number, startTime: number, duration: number, gainLevel: number): void {
    if (!this.ctx || !this.filterNode) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Fundamental sine + soft warm triangle harmonic
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      // Envelope: gentle soft attack, warm acoustic decay
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(gainLevel * 0.55, startTime + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(gainLevel * 0.35, startTime + 0.2);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(this.filterNode);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.05);
      osc2.stop(startTime + duration + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Synthesize peaceful Kalimba / Music Box chime note
   */
  private playKalimbaNote(freq: number, startTime: number, duration: number, gainLevel: number): void {
    if (!this.ctx || !this.filterNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // High crystalline attack with smooth exponential ring
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(gainLevel * 0.45, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.filterNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Synthesize warm ambient swelling tone
   */
  private playAmbientSwell(freq: number, startTime: number, duration: number, gainLevel: number): void {
    if (!this.ctx || !this.filterNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Slow gentle swell
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(gainLevel * 0.4, startTime + duration * 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.filterNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Warm, deep, non-muddy bass tone on chord roots
   */
  private playBassNote(freq: number, startTime: number, duration: number): void {
    if (!this.ctx || !this.filterNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.32, startTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.filterNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Warm harmony pad bed for the chord
   */
  private playChordPads(frequencies: number[], startTime: number, duration: number): void {
    if (!this.ctx || !this.filterNode) return;

    // Play upper 3 notes as a soft sustained harmony
    const notesToPlay = frequencies.slice(1, 4);

    notesToPlay.forEach((freq, idx) => {
      try {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        // Subtle detune for lush chorus warmth
        osc.frequency.setValueAtTime(freq, startTime);
        osc.detune.setValueAtTime((idx - 1) * 4, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.filterNode!);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      } catch {
        // ignore
      }
    });
  }
}

export const backgroundMusic = new BackgroundMusicEngine();
