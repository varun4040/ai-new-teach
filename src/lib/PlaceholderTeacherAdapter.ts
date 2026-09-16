import { AvatarAdapter, AvatarAdapterListener } from './AvatarAdapter';
import { TeacherEmotion, TeacherGesture, AvatarState } from '../types';
import { soundEffects } from './soundEffects';

/**
 * CSS stylesheet definition containing customized cubic-bezier easing curves
 * and fluid transitions for 'thinking', 'explaining', and 'listening' teacher states.
 */
const TEACHER_TRANSITIONS_STYLE_ID = 'placeholder-teacher-css-transitions';

const TEACHER_CSS_RULES = `
/* Teacher Avatar Lifelike Transitions & Micro-Motion Curves */
:root {
  --teacher-ease-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
  --teacher-ease-thinking: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --teacher-ease-explaining: cubic-bezier(0.22, 1, 0.36, 1);
  --teacher-ease-listening: cubic-bezier(0.25, 1, 0.5, 1);
  --teacher-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --teacher-ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
  --teacher-ease-blink: cubic-bezier(0.4, 0, 0.2, 1);
}

.teacher-character-stage {
  perspective: 1000px;
}

.teacher-character-root {
  transition: transform 0.7s var(--teacher-ease-soft), filter 0.5s ease;
  will-change: transform;
}

/* Looking at Board vs Student Micro-Animation */
.teacher-character-root[data-looking-at="board"] {
  transform: rotateY(-14deg) translateX(-8px) scale(1.015);
}
.teacher-character-root[data-looking-at="board"] .teacher-avatar-head {
  transform: rotate(-4.5deg) translateX(-4px);
}
.teacher-character-root[data-looking-at="board"] .teacher-avatar-eyes {
  transform: translate(-3.5px, 0.5px);
}

.teacher-character-root[data-looking-at="student"] {
  transform: rotateY(0deg) translateX(0px) scale(1);
}

/* Head & Body Transitions with Spring Easing */
.teacher-avatar-head {
  transition: transform 0.65s var(--teacher-ease-soft), filter 0.5s ease;
  transform-origin: center bottom;
  will-change: transform;
}

.teacher-avatar-face {
  transition: transform 0.6s var(--teacher-ease-smooth), box-shadow 0.6s var(--teacher-ease-smooth), border-color 0.4s ease;
}

.teacher-avatar-glasses {
  transition: transform 0.65s var(--teacher-ease-spring);
}

.teacher-avatar-eyebrows {
  transition: transform 0.5s var(--teacher-ease-spring), opacity 0.4s ease;
}

.teacher-avatar-eyebrow-left,
.teacher-avatar-eyebrow-right {
  transition: transform 0.5s var(--teacher-ease-spring);
  transform-origin: center;
}

.teacher-avatar-eyes {
  transition: transform 0.5s var(--teacher-ease-smooth);
}

.teacher-avatar-eye {
  transition: transform 0.45s var(--teacher-ease-smooth), height 0.12s var(--teacher-ease-blink), border-radius 0.12s ease;
}

.teacher-avatar-mouth {
  transition: transform 0.4s var(--teacher-ease-spring), width 0.4s var(--teacher-ease-spring), height 0.4s var(--teacher-ease-spring), border-radius 0.4s ease, background-color 0.4s ease;
}

.teacher-avatar-torso {
  transition: transform 0.7s var(--teacher-ease-soft);
  transform-origin: center bottom;
}

.teacher-avatar-aura {
  transition: opacity 0.65s var(--teacher-ease-smooth), transform 0.75s var(--teacher-ease-spring), background 0.6s ease, box-shadow 0.6s ease;
  will-change: transform, opacity;
}

/* Natural idle breathing micro-motion */
@keyframes teacher-natural-breathing {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.008);
  }
}

.teacher-character-root:not(.teacher-state-thinking):not(.teacher-state-explaining):not(.teacher-state-listening) .teacher-avatar-head {
  animation: teacher-natural-breathing 4.5s var(--teacher-ease-smooth) infinite;
}

/* -------------------------------------------------------------
 * 1. 'THINKING' STATE:
 * Subtle contemplative head tilt, upward reflective gaze,
 * inquisitively raised eyebrow, pursed thoughtful mouth,
 * and warm amber thought pulse.
 * ------------------------------------------------------------- */
@keyframes teacher-thinking-sway {
  0% {
    transform: rotate(-3.5deg) translateY(-2px);
  }
  50% {
    transform: rotate(-1.5deg) translateY(-5px);
  }
  100% {
    transform: rotate(-3.5deg) translateY(-2px);
  }
}

@keyframes teacher-thinking-aura-pulse {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.35;
    box-shadow: 0 0 28px rgba(245, 158, 11, 0.25);
  }
  50% {
    transform: scale(1.12);
    opacity: 0.65;
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.45);
  }
}

.teacher-state-thinking .teacher-avatar-head {
  animation: teacher-thinking-sway 3.2s var(--teacher-ease-thinking) infinite;
}

.teacher-state-thinking .teacher-avatar-eyes {
  transform: translate(2.5px, -3.5px) scale(0.96);
}

.teacher-state-thinking .teacher-avatar-eyebrow-left {
  transform: translateY(-4px) rotate(7deg);
}

.teacher-state-thinking .teacher-avatar-eyebrow-right {
  transform: translateY(-1px) rotate(-3deg);
}

.teacher-state-thinking .teacher-avatar-mouth {
  transform: scaleX(0.72) scaleY(0.85);
  border-radius: 9999px;
}

.teacher-state-thinking .teacher-avatar-aura {
  opacity: 0.55;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.08) 65%, transparent 100%);
  animation: teacher-thinking-aura-pulse 2.8s var(--teacher-ease-thinking) infinite;
}

/* -------------------------------------------------------------
 * 2. 'EXPLAINING' STATE:
 * Forward engaging posture, lively communicative head nodding cadence,
 * bright attentive eyes, elevated expressive eyebrows,
 * and energized classroom radiance.
 * ------------------------------------------------------------- */
@keyframes teacher-explaining-nod {
  0% {
    transform: translateY(-4px) scale(1.025);
  }
  30% {
    transform: translateY(1px) scale(1.015) rotate(0.8deg);
  }
  65% {
    transform: translateY(-2.5px) scale(1.022) rotate(-0.6deg);
  }
  100% {
    transform: translateY(-4px) scale(1.025);
  }
}

@keyframes teacher-explaining-aura-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.35;
    box-shadow: 0 0 25px rgba(90, 90, 64, 0.25);
  }
  50% {
    transform: scale(1.15);
    opacity: 0.65;
    box-shadow: 0 0 38px rgba(255, 99, 33, 0.35);
  }
}

.teacher-state-explaining .teacher-avatar-head {
  animation: teacher-explaining-nod 2.2s var(--teacher-ease-explaining) infinite;
}

.teacher-state-explaining .teacher-avatar-eyes {
  transform: translate(0, 0) scale(1.08);
}

.teacher-state-explaining .teacher-avatar-eyebrow-left,
.teacher-state-explaining .teacher-avatar-eyebrow-right {
  transform: translateY(-3px);
}

.teacher-state-explaining .teacher-avatar-aura {
  opacity: 0.5;
  background: radial-gradient(circle, rgba(200, 220, 209, 0.45) 0%, rgba(90, 90, 64, 0.1) 65%, transparent 100%);
  animation: teacher-explaining-aura-pulse 2.4s var(--teacher-ease-explaining) infinite;
}

/* -------------------------------------------------------------
 * 3. 'LISTENING' STATE:
 * Attentive ear-leaning head tilt towards the student,
 * enlarged compassionate eyes, raised listening brow,
 * and acoustic emerald wave ripples.
 * ------------------------------------------------------------- */
@keyframes teacher-listening-tilt {
  0% {
    transform: rotate(3deg) translateY(0px) scale(1.02);
  }
  50% {
    transform: rotate(1.8deg) translateY(2px) scale(1.01);
  }
  100% {
    transform: rotate(3deg) translateY(0px) scale(1.02);
  }
}

@keyframes teacher-listening-ripple {
  0% {
    transform: scale(0.92);
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
  }
  70% {
    transform: scale(1.2);
    opacity: 0.15;
    box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}

.teacher-state-listening .teacher-avatar-head {
  animation: teacher-listening-tilt 3s var(--teacher-ease-listening) infinite;
}

.teacher-state-listening .teacher-avatar-eyes {
  transform: translate(-1px, 0.5px) scale(1.16);
}

.teacher-state-listening .teacher-avatar-eyebrow-left,
.teacher-state-listening .teacher-avatar-eyebrow-right {
  transform: translateY(-3.5px);
}

.teacher-state-listening .teacher-avatar-mouth {
  transform: scaleX(1.15);
}

.teacher-state-listening .teacher-avatar-aura {
  opacity: 0.55;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.08) 65%, transparent 100%);
  animation: teacher-listening-ripple 2.2s var(--teacher-ease-listening) infinite;
}

/* -------------------------------------------------------------
 * 4. NATURAL HUMAN BLINKING & IDLE BREATHING:
 * Real ocular compression curve driven by adapter life-loop.
 * ------------------------------------------------------------- */
.teacher-blinking .teacher-avatar-eye {
  transform: scaleY(0.08) !important;
  transition: transform 0.08s var(--teacher-ease-blink) !important;
}

/* Custom Photo / Imagen Avatar State Styling */
.teacher-custom-photo {
  transition: transform 0.65s var(--teacher-ease-spring), box-shadow 0.6s var(--teacher-ease-smooth), border-color 0.4s ease;
  will-change: transform;
}

.teacher-state-thinking .teacher-custom-photo {
  transform: rotate(-3.5deg) translateY(-3px);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.35);
  border-color: #F59E0B !important;
}

.teacher-state-explaining .teacher-custom-photo {
  transform: translateY(-4px) scale(1.035);
  box-shadow: 0 8px 30px rgba(255, 99, 33, 0.32);
  border-color: #FF6321 !important;
}

.teacher-state-listening .teacher-custom-photo {
  transform: rotate(3deg) translateY(1px) scale(1.025);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.38);
  border-color: #10B981 !important;
}
`;

export class PlaceholderTeacherAdapter implements AvatarAdapter {
  id = 'placeholder_teacher_v1';
  name = 'Friendly Teacher Ms. Priya';

  private state: AvatarState = {
    isSpeaking: false,
    emotion: 'happy',
    gesture: 'idle',
    lookingAt: 'student',
    transcriptText: '',
    isBlinking: false,
    cssTransitionClass: 'teacher-state-happy',
  };

  private listeners: Set<AvatarAdapterListener> = new Set();
  private speechTimeout: any = null;
  private blinkTimeout: any = null;
  private containerElement: HTMLElement | null = null;

  /**
   * Automatically ensures that the CSS stylesheet with custom cubic-bezier
   * easing functions and keyframe transitions is injected into the DOM.
   */
  static injectStyles(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById(TEACHER_TRANSITIONS_STYLE_ID)) return;

    const styleEl = document.createElement('style');
    styleEl.id = TEACHER_TRANSITIONS_STYLE_ID;
    styleEl.innerHTML = TEACHER_CSS_RULES;
    document.head.appendChild(styleEl);
  }

  async initialize(containerElement?: HTMLElement): Promise<void> {
    // 1. Inject smooth CSS transitions and easing definitions
    PlaceholderTeacherAdapter.injectStyles();

    if (containerElement) {
      this.containerElement = containerElement;
    }

    // 2. Set initial welcoming state
    this.updateState({
      isSpeaking: false,
      emotion: 'happy',
      gesture: 'waving',
      lookingAt: 'student',
      transcriptText: 'Namaste! Ready for our class today?',
      isBlinking: false,
      cssTransitionClass: 'teacher-state-happy',
    });

    // 3. Start life-like human blinking loop
    this.startBlinkLoop();

    // Reset initial waving gesture after 3 seconds
    setTimeout(() => {
      this.setGesture('idle');
    }, 3000);
  }

  /**
   * Autonomous organic eye blinking cycle (every 3.2 to 5.8 seconds, 130ms duration)
   * to keep the teacher feeling continuously alive and present.
   */
  private startBlinkLoop(): void {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }

    const nextBlinkDelay = 3200 + Math.random() * 2600;

    this.blinkTimeout = setTimeout(() => {
      // Trigger short blink
      this.updateState({ isBlinking: true });

      setTimeout(() => {
        this.updateState({ isBlinking: false });
        this.startBlinkLoop();
      }, 130);
    }, nextBlinkDelay);
  }

  async speak(audioData?: ArrayBuffer | string, text?: string): Promise<void> {
    this.interrupt();

    const textSnippet = text || (typeof audioData === 'string' ? audioData : 'Speaking...');
    
    // When beginning to speak, smoothly transition to explaining if not already specified
    const targetEmotion: TeacherEmotion =
      this.state.emotion === 'thinking' || this.state.emotion === 'listening'
        ? 'explaining'
        : this.state.emotion;

    this.updateState({
      isSpeaking: true,
      emotion: targetEmotion,
      cssTransitionClass: `teacher-state-${targetEmotion}`,
      transcriptText: textSnippet,
      lookingAt: 'student',
    });

    // Estimate speaking duration based on text length (~15 chars/sec, min 2s)
    const duration = Math.max(2000, (textSnippet.length / 15) * 1000);

    this.speechTimeout = setTimeout(() => {
      this.updateState({
        isSpeaking: false,
      });
      this.listeners.forEach((l) => l.onSpeechEnd?.());
    }, duration);
  }

  interrupt(): void {
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    this.updateState({
      isSpeaking: false,
      gesture: 'idle',
    });
  }

  /**
   * Sets teacher emotion with fluid CSS-based transition class updates,
   * DOM attribute synchronization, and context-aware sound effects for
   * 'thinking', 'explaining', 'listening', etc.
   */
  setEmotion(emotion: TeacherEmotion, playSound: boolean = true): void {
    const cssClass = `teacher-state-${emotion}`;
    this.updateState({
      emotion,
      cssTransitionClass: cssClass,
    });

    if (playSound) {
      soundEffects.playEmotion(emotion);
    }
  }

  setGesture(gesture: TeacherGesture): void {
    this.updateState({ gesture });
    // Reset gesture back to idle after 4 seconds if non-idle
    if (gesture !== 'idle') {
      setTimeout(() => {
        if (this.state.gesture === gesture) {
          this.updateState({ gesture: 'idle' });
        }
      }, 4000);
    }
  }

  lookAtBoard(): void {
    this.updateState({ lookingAt: 'board', gesture: 'pointing_right' });
  }

  lookAtStudent(): void {
    this.updateState({ lookingAt: 'student' });
  }

  getState(): AvatarState {
    return { ...this.state };
  }

  addListener(listener: AvatarAdapterListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Updates state, synchronizes DOM attributes if attached, and notifies listeners.
   */
  private updateState(partial: Partial<AvatarState>): void {
    this.state = { ...this.state, ...partial };

    // Synchronize DOM attributes on container if attached
    if (this.containerElement) {
      this.containerElement.setAttribute('data-teacher-emotion', this.state.emotion);
      this.containerElement.setAttribute('data-is-speaking', String(this.state.isSpeaking));
      this.containerElement.setAttribute('data-is-blinking', String(!!this.state.isBlinking));
      this.containerElement.setAttribute('data-looking-at', this.state.lookingAt);

      // Clean old state classes and apply active one
      const currentClasses = Array.from(this.containerElement.classList).filter((c) =>
        c.startsWith('teacher-state-')
      );
      currentClasses.forEach((c) => this.containerElement!.classList.remove(c));
      if (this.state.cssTransitionClass) {
        this.containerElement.classList.add(this.state.cssTransitionClass);
      }
      if (this.state.isBlinking) {
        this.containerElement.classList.add('teacher-blinking');
      } else {
        this.containerElement.classList.remove('teacher-blinking');
      }
    }

    this.listeners.forEach((l) => l.onStateChange?.(this.state));
  }

  destroy(): void {
    this.interrupt();
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
      this.blinkTimeout = null;
    }
    this.listeners.clear();
    this.containerElement = null;
  }
}

// Ensure style definitions are immediately injected into document head
if (typeof document !== 'undefined') {
  PlaceholderTeacherAdapter.injectStyles();
}


