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

export type TeacherGesture =
  | 'pointing_left'
  | 'pointing_right'
  | 'waving'
  | 'clapping'
  | 'thumbs_up'
  | 'idle';

export interface AvatarState {
  isSpeaking: boolean;
  emotion: TeacherEmotion;
  gesture: TeacherGesture;
  lookingAt: 'student' | 'board' | 'desk';
  transcriptText?: string;
  isBlinking?: boolean;
  cssTransitionClass?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'teacher' | 'student' | 'system';
  text: string;
  timestamp: number;
  toolCall?: WhiteboardToolEvent;
}
