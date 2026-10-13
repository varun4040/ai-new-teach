import { AvatarAdapter, AvatarAdapterListener } from './AvatarAdapter';
import {
  TeacherEmotion,
  CharacterState,
  TeacherGesture,
  AvatarState,
  MotionKinematics,
  EMOTION_TO_CHARACTER_STATE,
  CHARACTER_STATE_TO_EMOTION,
} from '../types';
import { soundEffects } from './soundEffects';
import { TeacherVoiceSpeaker } from './speechSynthesis';

/**
 * State-specific kinematic physics presets for Framer Motion animation.
 * Defines 3D head rotation, torso expansion, ocular gaze vectors,
 * eyebrow curvatures, and spring physics coefficients.
 */
export const STATE_MOTION_KINEMATICS: Record<CharacterState, MotionKinematics> = {
  IDLE: {
    headYaw: 0,
    headPitch: 0,
    headRoll: 0,
    headY: 0,
    torsoScaleY: 1.02,
    torsoScaleX: 1.008,
    torsoY: -1.5,
    eyeGazeX: 0,
    eyeGazeY: 0,
    eyebrowLeftY: 0,
    eyebrowRightY: 0,
    eyebrowLeftArch: 5,
    eyebrowRightArch: 5,
    mouthOpen: 0.1,
    mouthWidth: 1.0,
    auraColor: 'rgba(200, 220, 209, 0.35)',
    springStiffness: 120,
    springDamping: 16,
    springMass: 1.0,
    transitionCurve: [0.45, 0.05, 0.55, 0.95],
    containerScaleMin: 1.0,
    containerScaleMax: 1.018, // Subtle, continuous avatar container breathing scale in IDLE
    breathingDurationSec: 3.8, // Natural human resting respiration cycle (3.8s)
    breathingCurve: [0.45, 0.05, 0.55, 0.95],
  },
  LISTENING: {
    headYaw: 3.5,
    headPitch: -2.0, // Head leaning forward attentively toward student
    headRoll: 4.2, // Curious attentive ear tilt
    headY: 2.0,
    torsoScaleY: 1.015,
    torsoScaleX: 1.005,
    torsoY: -0.8,
    eyeGazeX: 0.2,
    eyeGazeY: 0.5,
    eyebrowLeftY: -4.0, // Receptive raised eyebrows
    eyebrowRightY: -4.0,
    eyebrowLeftArch: 7,
    eyebrowRightArch: 7,
    mouthOpen: 0.15,
    mouthWidth: 1.02,
    auraColor: 'rgba(16, 185, 129, 0.35)', // Emerald active listening glow
    springStiffness: 160,
    springDamping: 14,
    springMass: 0.9,
    transitionCurve: [0.25, 1.0, 0.5, 1.0], // Non-linear deceleration curve
    containerScaleMin: 1.0,
    containerScaleMax: 1.014,
    breathingDurationSec: 3.2, // Attentive respiration
    breathingCurve: [0.4, 0.05, 0.5, 0.95],
  },
  THINKING: {
    headYaw: -4.5,
    headPitch: -3.5, // Chin raised slightly in contemplation
    headRoll: -5.5, // Pensive side tilt
    headY: -1.5,
    torsoScaleY: 1.01,
    torsoScaleX: 1.0,
    torsoY: 0,
    eyeGazeX: 3.8, // Looking up and to the right
    eyeGazeY: -3.6,
    eyebrowLeftY: -5.5, // Asymmetrical quizzical arch
    eyebrowRightY: 1.5,
    eyebrowLeftArch: 9,
    eyebrowRightArch: 3,
    mouthOpen: 0.2, // Pursed lips
    mouthWidth: 0.85,
    auraColor: 'rgba(245, 158, 11, 0.35)', // Amber contemplation glow
    springStiffness: 95,
    springDamping: 18,
    springMass: 1.1,
    transitionCurve: [0.25, 0.1, 0.25, 1.0], // Slow contemplative ease
    containerScaleMin: 1.0,
    containerScaleMax: 1.015,
    breathingDurationSec: 4.2, // Deep contemplative slow breath
    breathingCurve: [0.35, 0.05, 0.45, 0.95],
  },
  SPEAKING: {
    headYaw: 0.5,
    headPitch: 1.0,
    headRoll: 1.0,
    headY: 1.2,
    torsoScaleY: 1.025,
    torsoScaleX: 1.01,
    torsoY: -2.0,
    eyeGazeX: 0,
    eyeGazeY: 0,
    eyebrowLeftY: -2.5,
    eyebrowRightY: -2.5,
    eyebrowLeftArch: 6,
    eyebrowRightArch: 6,
    mouthOpen: 0.7, // Dynamic active speaking viseme
    mouthWidth: 1.1,
    auraColor: 'rgba(255, 99, 33, 0.3)',
    springStiffness: 180,
    springDamping: 12,
    springMass: 0.8,
    transitionCurve: [0.22, 1.0, 0.36, 1.0],
    containerScaleMin: 1.0,
    containerScaleMax: 1.02,
    breathingDurationSec: 3.4,
    breathingCurve: [0.45, 0.05, 0.55, 0.95],
  },
  HAPPY: {
    headYaw: 0,
    headPitch: 0.5,
    headRoll: 1.8,
    headY: 0.5,
    torsoScaleY: 1.02,
    torsoScaleX: 1.008,
    torsoY: -1.5,
    eyeGazeX: 0,
    eyeGazeY: 0,
    eyebrowLeftY: -2.0,
    eyebrowRightY: -2.0,
    eyebrowLeftArch: 6,
    eyebrowRightArch: 6,
    mouthOpen: 0.35, // Warm friendly smile
    mouthWidth: 1.15,
    auraColor: 'rgba(254, 215, 170, 0.4)',
    springStiffness: 140,
    springDamping: 15,
    springMass: 1.0,
    transitionCurve: [0.34, 1.3, 0.64, 1.0], // Gentle spring bounce
    containerScaleMin: 1.0,
    containerScaleMax: 1.018,
    breathingDurationSec: 3.6,
    breathingCurve: [0.45, 0.05, 0.55, 0.95],
  },
  ENCOURAGING: {
    headYaw: 1.0,
    headPitch: 2.0, // Empathetic supportive forward nod
    headRoll: 2.5,
    headY: 1.0,
    torsoScaleY: 1.022,
    torsoScaleX: 1.01,
    torsoY: -1.8,
    eyeGazeX: 0,
    eyeGazeY: 0.3,
    eyebrowLeftY: -3.0,
    eyebrowRightY: -3.0,
    eyebrowLeftArch: 7,
    eyebrowRightArch: 7,
    mouthOpen: 0.3,
    mouthWidth: 1.12,
    auraColor: 'rgba(20, 184, 166, 0.35)', // Teal supportive glow
    springStiffness: 150,
    springDamping: 14,
    springMass: 0.95,
    transitionCurve: [0.34, 1.2, 0.64, 1.0],
    containerScaleMin: 1.0,
    containerScaleMax: 1.018,
    breathingDurationSec: 3.6,
    breathingCurve: [0.45, 0.05, 0.55, 0.95],
  },
  CONFUSED: {
    headYaw: 2.5,
    headPitch: -1.0,
    headRoll: 6.8, // Inquisitive side head cock
    headY: -0.5,
    torsoScaleY: 1.01,
    torsoScaleX: 1.0,
    torsoY: 0,
    eyeGazeX: 1.8,
    eyeGazeY: -1.5,
    eyebrowLeftY: -4.5, // Puzzled knit brows
    eyebrowRightY: 2.5,
    eyebrowLeftArch: 8,
    eyebrowRightArch: 3,
    mouthOpen: 0.18,
    mouthWidth: 0.92,
    auraColor: 'rgba(168, 85, 247, 0.3)', // Purple inquisitive glow
    springStiffness: 130,
    springDamping: 16,
    springMass: 1.05,
    transitionCurve: [0.34, 1.4, 0.64, 1.0],
    containerScaleMin: 1.0,
    containerScaleMax: 1.014,
    breathingDurationSec: 3.8,
    breathingCurve: [0.45, 0.05, 0.55, 0.95],
  },
  CELEBRATING: {
    headYaw: 0,
    headPitch: -1.5,
    headRoll: 2.5,
    headY: -4.0, // Joyful upward bounce
    torsoScaleY: 1.035,
    torsoScaleX: 1.015,
    torsoY: -4.5,
    eyeGazeX: 0,
    eyeGazeY: -1.0,
    eyebrowLeftY: -6.0, // High exuberant celebration arches
    eyebrowRightY: -6.0,
    eyebrowLeftArch: 9,
    eyebrowRightArch: 9,
    mouthOpen: 0.8, // Wide joyful celebratory grin
    mouthWidth: 1.25,
    auraColor: 'rgba(251, 191, 36, 0.45)', // Radiant golden victory burst
    springStiffness: 260, // High energetic spring physics
    springDamping: 11,
    springMass: 0.75,
    transitionCurve: [0.34, 1.56, 0.64, 1.0], // Exuberant overshoot
    containerScaleMin: 1.0,
    containerScaleMax: 1.025,
    breathingDurationSec: 2.6,
    breathingCurve: [0.34, 1.4, 0.64, 1.0],
  },
};

/**
 * Advanced MotionTeacherAdapter
 * A physics-driven character animation system built for Framer Motion.
 * Computes non-linear transitions, spring dynamics, autonomous micro-saccades,
 * breathing cycles, and real-time speech visemes.
 */
export class MotionTeacherAdapter implements AvatarAdapter {
  id = 'framer-motion-teacher-adapter';
  name = 'Ms. Priya (Motion Engine)';

  private state: AvatarState = {
    isSpeaking: false,
    emotion: 'happy',
    characterState: 'HAPPY',
    gesture: 'idle',
    lookingAt: 'student',
    transcriptText: 'Namaste! Ready for our class today?',
    isBlinking: false,
    motionKinematics: STATE_MOTION_KINEMATICS.HAPPY,
    springConfig: { stiffness: 140, damping: 15, mass: 1.0 },
    transitionCurve: [0.34, 1.3, 0.64, 1.0],
    speechCadence: 130,
    viseme: 'smile',
  };

  private listeners: AvatarAdapterListener[] = [];
  private blinkTimer: ReturnType<typeof setTimeout> | null = null;
  private blinkTimeouts: ReturnType<typeof setTimeout>[] = [];
  private lastBlinkTimestamp: number = Date.now();
  private saccadeTimer: ReturnType<typeof setInterval> | null = null;
  private speechTimeout: ReturnType<typeof setTimeout> | null = null;
  private speechVisemeInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    this.startAutonomousLifeLoops();
    this.updateMotionKinematics('HAPPY');
  }

  getState(): AvatarState {
    return { ...this.state };
  }

  addListener(listener: AvatarAdapterListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const snapshot = this.getState();
    this.listeners.forEach((l) => l.onStateChange?.(snapshot));
  }

  private updateState(partial: Partial<AvatarState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.notifyListeners();
  }

  /**
   * Updates state kinematics using spring physics and non-linear transition curves
   */
  private updateMotionKinematics(charState: CharacterState, overrideLookingAt?: 'student' | 'board' | 'desk'): void {
    const baseKinematics = STATE_MOTION_KINEMATICS[charState] || STATE_MOTION_KINEMATICS.IDLE;
    const looking = overrideLookingAt || this.state.lookingAt;

    let targetKinematics: MotionKinematics = { ...baseKinematics };

    // Dynamic Board Gaze Override: rotates head and shifts gaze toward whiteboard
    if (looking === 'board') {
      targetKinematics = {
        ...targetKinematics,
        headYaw: -12.0,
        headPitch: 0.5,
        headRoll: -3.0,
        eyeGazeX: 4.2,
        eyeGazeY: -0.2,
        transitionCurve: [0.34, 1.2, 0.64, 1.0],
      };
    } else if (looking === 'desk') {
      targetKinematics = {
        ...targetKinematics,
        headPitch: 7.0,
        eyeGazeY: 3.5,
      };
    }

    const maxScale = targetKinematics.containerScaleMax || 1.018;
    const breathingDuration = targetKinematics.breathingDurationSec || 3.8;

    this.updateState({
      characterState: charState,
      emotion: CHARACTER_STATE_TO_EMOTION[charState] || this.state.emotion,
      motionKinematics: targetKinematics,
      springConfig: {
        stiffness: targetKinematics.springStiffness,
        damping: targetKinematics.springDamping,
        mass: targetKinematics.springMass,
      },
      transitionCurve: targetKinematics.transitionCurve,
      containerBreathingScale: [1.0, maxScale, 1.0],
      breathingDurationSec: breathingDuration,
      cssTransitionClass: `teacher-state-${charState.toLowerCase()}`,
    });
  }

  /**
   * Returns Framer Motion animation configuration for continuous avatar container breathing.
   * Provides subtle, organic vertical scaling and translation anchored at bottom center,
   * keeping the avatar alive even in IDLE state.
   */
  getContainerBreathingAnimation(): {
    animate: { scaleY: number[]; scaleX: number[]; y: number[] };
    transition: { repeat: typeof Infinity; duration: number; ease: [number, number, number, number] };
  } {
    const kinematics = this.state.motionKinematics || STATE_MOTION_KINEMATICS.IDLE;
    const maxScale = kinematics.containerScaleMax || 1.018;
    const duration = kinematics.breathingDurationSec || 3.8;
    const ease = kinematics.breathingCurve || [0.45, 0.05, 0.55, 0.95];
    return {
      animate: {
        scaleY: [1.0, maxScale, 1.0],
        scaleX: [1.0, 1 + (maxScale - 1) * 0.35, 1.0],
        y: [0, -1.8, 0],
      },
      transition: {
        repeat: Infinity,
        duration,
        ease,
      },
    };
  }

  /**
   * Clears any active blink timeouts currently in progress
   */
  private clearActiveBlinkTimeouts(): void {
    if (this.blinkTimeouts.length > 0) {
      this.blinkTimeouts.forEach((t) => clearTimeout(t));
      this.blinkTimeouts = [];
    }
  }

  /**
   * Randomly or manually triggers an organic eye-blink animation.
   * Simulates natural human ocular kinematics with randomized closing/reopening speed
   * and an optional rapid double-blink flutter.
   */
  triggerBlink(options?: { doubleBlink?: boolean; durationMs?: number }): void {
    this.clearActiveBlinkTimeouts();
    this.lastBlinkTimestamp = Date.now();

    const duration = options?.durationMs ?? (120 + Math.random() * 35);
    const isDouble = options?.doubleBlink ?? false;

    // Phase 1: Close eyelids
    this.updateState({ isBlinking: true });

    // Phase 2: Open eyelids after primary blink duration
    const openTimer = setTimeout(() => {
      this.updateState({ isBlinking: false });

      // Phase 3: Rapid natural double-blink flutter (if requested or triggered)
      if (isDouble) {
        const pauseTimer = setTimeout(() => {
          this.updateState({ isBlinking: true });

          const secondDuration = 95 + Math.random() * 25;
          const secondOpenTimer = setTimeout(() => {
            this.updateState({ isBlinking: false });
          }, secondDuration);

          this.blinkTimeouts.push(secondOpenTimer);
        }, 75 + Math.random() * 20);

        this.blinkTimeouts.push(pauseTimer);
      }
    }, duration);

    this.blinkTimeouts.push(openTimer);
  }

  /**
   * Autonomous Micro-Animations:
   * 1. Natural non-linear randomized eye blinking (Poisson-like 1.8s - 4.8s interval, 18% double-blink chance)
   * 2. Micro-saccades (subtle gaze shifts so eyes never feel frozen)
   */
  private startAutonomousLifeLoops(): void {
    // 1. Organic Random Blink Loop with non-linear intervals & double-blink flutter
    const scheduleNextRandomBlink = () => {
      // Randomized human blink interval: 1800ms to 4800ms
      const delay = 1800 + Math.random() * 3000;

      this.blinkTimer = setTimeout(() => {
        // ~18% probability of an organic double-blink flutter
        const isDoubleBlink = Math.random() < 0.18;
        this.triggerBlink({ doubleBlink: isDoubleBlink });

        // Reschedule next autonomous random blink
        scheduleNextRandomBlink();
      }, delay);
    };

    scheduleNextRandomBlink();

    // 2. Micro-Saccade Glance Shift Loop (every 2.4s when idle)
    this.saccadeTimer = setInterval(() => {
      const charState = this.state.characterState || 'IDLE';
      if (charState === 'IDLE' && this.state.lookingAt === 'student' && !this.state.isSpeaking) {
        const jitterX = (Math.random() - 0.5) * 1.8;
        const jitterY = (Math.random() - 0.5) * 1.2;
        if (this.state.motionKinematics) {
          this.updateState({
            motionKinematics: {
              ...this.state.motionKinematics,
              eyeGazeX: jitterX,
              eyeGazeY: jitterY,
            },
          });
        }
      }
    }, 2400);
  }

  /**
   * Set Character State with smooth Framer Motion spring parameters & context sound.
   * Naturally triggers a brief cognitive refocus blink when attention shifts.
   */
  setCharacterState(charState: CharacterState, playSound: boolean = true): void {
    this.updateMotionKinematics(charState);

    // Natural cognitive refocus blink on emotion/state shift if >1.4s since last blink
    if (Date.now() - this.lastBlinkTimestamp > 1400) {
      this.triggerBlink({ durationMs: 115 });
    }

    if (playSound) {
      if (charState === 'CELEBRATING') {
        soundEffects.playSuccess();
      } else if (charState === 'CONFUSED') {
        soundEffects.playTryAgain();
      } else if (charState === 'ENCOURAGING') {
        soundEffects.playEncouraging();
      } else {
        const emotion = CHARACTER_STATE_TO_EMOTION[charState];
        if (emotion) soundEffects.playEmotion(emotion);
      }
    }
  }

  setEmotion(emotion: TeacherEmotion): void {
    const charState = EMOTION_TO_CHARACTER_STATE[emotion] || 'HAPPY';
    this.setCharacterState(charState, false);
  }

  setGesture(gesture: TeacherGesture): void {
    this.updateState({ gesture });
    if (gesture !== 'idle') {
      setTimeout(() => {
        if (this.state.gesture === gesture) {
          this.updateState({ gesture: 'idle' });
        }
      }, 4000);
    }
  }

  lookAtBoard(): void {
    this.updateState({ lookingAt: 'board' });
    const curr = this.state.characterState || 'IDLE';
    this.updateMotionKinematics(curr, 'board');
  }

  lookAtStudent(): void {
    this.updateState({ lookingAt: 'student' });
    const curr = this.state.characterState || 'IDLE';
    this.updateMotionKinematics(curr, 'student');
  }

  lookAtDesk(): void {
    this.updateState({ lookingAt: 'desk' });
    const curr = this.state.characterState || 'IDLE';
    this.updateMotionKinematics(curr, 'desk');
  }

  private currentLanguageMode: string = 'english';

  setLanguage(lang: string): void {
    this.currentLanguageMode = lang;
  }

  /**
   * Multimodal Speech Viseme Loop:
   * Cycles dynamically through speaking visemes with head nod cadence
   */
  async speak(audioData?: ArrayBuffer | string, text?: string, languageMode?: string): Promise<void> {
    this.interrupt();

    const activeLanguage = languageMode || this.currentLanguageMode || 'english';
    const textSnippet = text || (typeof audioData === 'string' ? audioData : 'Speaking...');
    const duration = Math.max(2200, (textSnippet.length / 14) * 1000);

    this.updateState({
      isSpeaking: true,
      transcriptText: textSnippet,
      lookingAt: 'student',
    });

    this.setCharacterState('SPEAKING', false);

    // Speak aloud using Web Speech API with matched voice for active language mode if not raw PCM buffer
    if (typeof audioData !== 'object' || !(audioData instanceof ArrayBuffer)) {
      TeacherVoiceSpeaker.speak(textSnippet, activeLanguage);
    }

    // Viseme phoneme sequence: open -> round -> smile -> wide
    const visemes: Array<'open' | 'round' | 'smile' | 'wide'> = ['open', 'round', 'smile', 'wide'];
    let vIdx = 0;

    this.speechVisemeInterval = setInterval(() => {
      vIdx = (vIdx + 1) % visemes.length;
      this.updateState({ viseme: visemes[vIdx] });
    }, 135);

    this.speechTimeout = setTimeout(() => {
      this.interrupt();
      this.setCharacterState('IDLE', false);
      this.listeners.forEach((l) => l.onSpeechEnd?.());
    }, duration);
  }

  interrupt(): void {
    TeacherVoiceSpeaker.cancel();

    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    if (this.speechVisemeInterval) {
      clearInterval(this.speechVisemeInterval);
      this.speechVisemeInterval = null;
    }

    this.updateState({
      isSpeaking: false,
      viseme: 'rest',
    });
  }

  destroy(): void {
    this.interrupt();
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
    this.clearActiveBlinkTimeouts();
    if (this.saccadeTimer) {
      clearInterval(this.saccadeTimer);
      this.saccadeTimer = null;
    }
    this.listeners = [];
  }
}
