/**
 * AvatarAdapter interface for decoupling the Teacher Brain from visual rendering implementations
 * (PlaceholderTeacherAdapter now, HeyGenAdapter / DIDAdapter in the future).
 */

import { TeacherEmotion, TeacherGesture, AvatarState } from '../types';

export interface AvatarAdapterListener {
  onStateChange?: (state: AvatarState) => void;
  onSpeechEnd?: () => void;
}

export interface AvatarAdapter {
  id: string;
  name: string;
  
  /** Initialize or reset avatar */
  initialize(containerElement?: HTMLElement): Promise<void>;

  /** Speak text or play audio buffer */
  speak(audioData?: ArrayBuffer | string, text?: string): Promise<void>;

  /** Immediately interrupt ongoing speech and animation */
  interrupt(): void;

  /** Update emotional facial expression */
  setEmotion(emotion: TeacherEmotion): void;

  /** Trigger body gesture */
  setGesture(gesture: TeacherGesture): void;

  /** Direct focus gaze to the digital whiteboard */
  lookAtBoard(): void;

  /** Direct focus gaze to student / camera */
  lookAtStudent(): void;

  /** Get current snapshot state */
  getState(): AvatarState;

  /** Subscribe to state updates */
  addListener(listener: AvatarAdapterListener): () => void;

  /** Cleanup resources */
  destroy(): void;
}
