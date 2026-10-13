/**
 * AI Live Teacher - Core Types & Data Interfaces
 */

export type LanguageMode =
  | 'english'
  | 'hindi'
  | 'hinglish'
  | 'spanish'
  | 'french'
  | 'german'
  | 'tamil'
  | 'telugu'
  | 'bengali'
  | 'marathi'
  | 'gujarati'
  | 'kannada'
  | 'arabic'
  | 'japanese';

export type TeachingStrategy =
  | 'DIRECT_EXPLANATION'
  | 'VISUAL_EXAMPLE'
  | 'STORY'
  | 'REAL_WORLD_EXAMPLE'
  | 'GUIDED_DISCOVERY'
  | 'SOCRATIC_QUESTION'
  | 'PRACTICE'
  | 'RETEACH_SIMPLER'
  | 'QUIZ'
  | 'REVISION';

export interface StudentProfile {
  name: string;
  age: number;
  gradeClass: number; // e.g. 2 for Class 2
  preferredLanguage: LanguageMode;
}

export interface ClassroomState {
  student: StudentProfile;
  subject: string; // e.g., "Mathematics"
  chapter: string; // e.g., "Addition up to 20"
  currentConcept: string; // e.g., "Combining two groups of numbers"
  lessonObjective: string; // e.g., "Understand that addition means putting groups together"
  language: LanguageMode;
  difficulty: 'easy' | 'medium' | 'challenging';
  understandingEstimate: number; // 0 - 100
  confidenceLevel: number; // 0 - 100
  recentQuestions: string[];
  recentMistakes: string[];
  misconceptions: string[];
  conceptsMastered: string[];
  conceptsNeedingRevision: string[];
  conceptMastery: Record<string, number>; // e.g. { 'Counting': 90, 'Addition': 75 }
  completedLessons: string[];
  badges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    subject: string;
  }>;
  learningHistory: Array<{
    timestamp: string;
    concept: string;
    action: string;
    understanding: number;
    strategy: string;
  }>;
  recommendedNextConcept: string;
  currentStrategy?: TeachingStrategy;
  currentAiActivity?: string; // e.g. "Assessing answer", "Choosing visual explanation"
}

export type WhiteboardObjectType =
  | 'apple'
  | 'star'
  | 'pencil'
  | 'ball'
  | 'cookie'
  | 'balloon'
  | 'block';

export interface ShowTextPayload {
  text: string;
  title?: string;
  highlight?: string;
}

export interface DrawNumberLinePayload {
  min: number;
  max: number;
  highlightNumber?: number;
  marks?: number[];
  label?: string;
}

export interface ShowObjectsPayload {
  object: WhiteboardObjectType;
  count: number;
  label?: string;
  group1?: number;
  group2?: number;
  symbol?: string; // e.g. '+'
}

export interface ShowEquationPayload {
  equation: string;
  steps?: string[];
  highlightPart?: string;
}

export interface ShowImagePayload {
  url?: string;
  preset?: 'fractions' | 'shapes' | 'clock' | 'solar_system' | 'plant' | 'coins';
  prompt?: string;
  caption?: string;
  generatedByImagen?: boolean;
}

export interface ShowDiagramPayload {
  title: string;
  nodes: Array<{ id: string; label: string; type?: string }>;
  links?: Array<{ from: string; to: string; label?: string }>;
}

export interface ShowTimelinePayload {
  title: string;
  events: Array<{ date: string; title: string; description: string }>;
}

export interface ShowTablePayload {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ShowFlashcardsPayload {
  title: string;
  front: string;
  back: string;
  hint?: string;
}

export interface FlashcardItem {
  id?: string;
  front: string; // Vocabulary word or math problem
  back: string;  // Definition, answer, or solution steps
  category?: 'vocabulary' | 'math' | 'science' | 'general' | string;
  hint?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  steps?: string[];
  visualClue?: string;
  isFlipped?: boolean;
}

export interface FlashcardPayload {
  title: string;
  category?: 'vocabulary' | 'math' | 'science' | 'general' | string;
  front?: string;
  back?: string;
  hint?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  steps?: string[];
  visualClue?: string;
  cards?: FlashcardItem[];
  currentIndex?: number;
  isFlipped?: boolean; // When true, the AI flips the card to reveal the back
  flippedSide?: 'front' | 'back';
  action?: 'show' | 'flip' | 'next' | 'prev' | 'shuffle';
}

export interface HighlightItemPayload {
  itemId: string;
  color?: string;
}

export interface PointToElementPayload {
  target?: string;
  x?: number; // 0 to 100%
  y?: number; // 0 to 100%
  label?: string;
  pointerType?: 'hand' | 'laser' | 'magic_wand' | 'spotlight';
  color?: string;
  durationMs?: number;
}

export interface ShowMultipleChoicePayload {
  question: string;
  options: string[];
  answerIndex?: number;
  explanation?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface StartQuizPayload {
  title: string;
  questions: QuizQuestion[];
}

export interface CheckAnswerPayload {
  isCorrect: boolean;
  feedback: string;
  nextStepPrompt?: string;
}

export type WhiteboardToolEvent =
  | { type: 'show_text'; payload: ShowTextPayload }
  | { type: 'draw_number_line'; payload: DrawNumberLinePayload }
  | { type: 'show_objects'; payload: ShowObjectsPayload }
  | { type: 'show_equation'; payload: ShowEquationPayload }
  | { type: 'show_image'; payload: ShowImagePayload }
  | { type: 'show_diagram'; payload: ShowDiagramPayload }
  | { type: 'show_timeline'; payload: ShowTimelinePayload }
  | { type: 'show_table'; payload: ShowTablePayload }
  | { type: 'show_flashcards'; payload: ShowFlashcardsPayload }
  | { type: 'flashcard'; payload: FlashcardPayload }
  | { type: 'highlight_item'; payload: HighlightItemPayload }
  | { type: 'point_to_element'; payload: PointToElementPayload }
  | { type: 'clear_board' }
  | { type: 'show_multiple_choice'; payload: ShowMultipleChoicePayload }
  | { type: 'start_quiz'; payload: StartQuizPayload }
  | { type: 'check_answer'; payload: CheckAnswerPayload };

export interface WhiteboardState {
  currentTool?: WhiteboardToolEvent;
  history: WhiteboardToolEvent[];
}

export interface TextbookChapter {
  fileName: string;
  subject: string;
  gradeClass: number;
  chapterTitle: string;
  chapterNumber?: number;
  summary: string;
  keyConcepts: string[];
  rawText: string;
}

export type TeacherEmotion =
  | 'happy'
  | 'encouraging'
  | 'thinking'
  | 'explaining'
  | 'listening'
  | 'surprised';

export type CharacterState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'HAPPY'
  | 'ENCOURAGING'
  | 'CONFUSED'
  | 'CELEBRATING';

export const EMOTION_TO_CHARACTER_STATE: Record<TeacherEmotion, CharacterState> = {
  happy: 'HAPPY',
  encouraging: 'ENCOURAGING',
  thinking: 'THINKING',
  explaining: 'SPEAKING',
  listening: 'LISTENING',
  surprised: 'CELEBRATING',
};

export const CHARACTER_STATE_TO_EMOTION: Record<CharacterState, TeacherEmotion> = {
  IDLE: 'happy',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'explaining',
  HAPPY: 'happy',
  ENCOURAGING: 'encouraging',
  CONFUSED: 'thinking',
  CELEBRATING: 'surprised',
};

export type TeacherGesture =
  | 'pointing_left'
  | 'pointing_right'
  | 'waving'
  | 'clapping'
  | 'thumbs_up'
  | 'idle';

export interface MotionKinematics {
  headYaw: number; // -15 to +15 deg
  headPitch: number; // -10 to +10 deg
  headRoll: number; // -10 to +10 deg
  headY: number; // vertical float px
  torsoScaleY: number; // breathing expansion 1.0 - 1.035
  torsoScaleX: number; // 0.99 - 1.01
  torsoY: number; // breathing translation px
  eyeGazeX: number; // -5 to +5 px
  eyeGazeY: number; // -4 to +4 px
  eyebrowLeftY: number; // -6 to +6 px
  eyebrowRightY: number; // -6 to +6 px
  eyebrowLeftArch: number; // 0 (flat) to 10 (high)
  eyebrowRightArch: number;
  mouthOpen: number; // 0 (closed) to 1 (wide)
  mouthWidth: number; // 0.8 to 1.2
  auraColor: string;
  springStiffness: number;
  springDamping: number;
  springMass: number;
  transitionCurve: [number, number, number, number]; // non-linear cubic bezier curve
  containerScaleMin?: number; // Subtle breathing minimum scale (e.g. 1.0)
  containerScaleMax?: number; // Subtle breathing maximum scale (e.g. 1.018)
  breathingDurationSec?: number; // Continuous respiration period in seconds (e.g. 3.8s)
  breathingCurve?: [number, number, number, number]; // Non-linear breathing cubic bezier
}

export interface AvatarState {
  isSpeaking: boolean;
  emotion: TeacherEmotion;
  characterState?: CharacterState;
  gesture: TeacherGesture;
  lookingAt: 'student' | 'board' | 'desk';
  transcriptText?: string;
  isBlinking?: boolean;
  cssTransitionClass?: string;
  motionKinematics?: MotionKinematics;
  springConfig?: { stiffness: number; damping: number; mass: number };
  transitionCurve?: [number, number, number, number];
  containerBreathingScale?: [number, number, number];
  breathingDurationSec?: number;
  speechCadence?: number;
  viseme?: 'rest' | 'open' | 'wide' | 'round' | 'smile';
}

export interface ChatMessage {
  id: string;
  sender: 'teacher' | 'student' | 'system';
  text: string;
  timestamp: number;
  toolCall?: WhiteboardToolEvent;
}
