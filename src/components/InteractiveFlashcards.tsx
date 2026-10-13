import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  Brain,
  Calculator,
  BookOpen,
  ArrowRight,
  Play,
  Pause,
  Award,
  Layers,
  Check,
  Plus,
  X,
  Flame,
} from 'lucide-react';
import { FlashcardItem, FlashcardPayload } from '../types';
import { soundEffects } from '../lib/soundEffects';
import { triggerHaptic } from './DigitalWhiteboard';
import { TeacherVoiceSpeaker } from '../lib/speechSynthesis';
import confetti from 'canvas-confetti';

interface InteractiveFlashcardsProps {
  payload?: FlashcardPayload;
  onClose?: () => void;
  onFlipChange?: (isFlipped: boolean, cardIndex: number) => void;
  className?: string;
}

// Built-in high quality educational vocabulary deck
const DEFAULT_VOCABULARY_DECK: FlashcardItem[] = [
  {
    id: 'vocab-1',
    front: 'Photosynthesis',
    back: 'The amazing biological process where green plants turn sunlight, water, and carbon dioxide into oxygen and nourishing glucose (food)!',
    category: 'vocabulary',
    pronunciation: '/ˌfoʊ.toʊˈsɪn.θə.sɪs/',
    partOfSpeech: 'Noun',
    hint: 'Think of how green leaves soak up morning sunshine like solar panels! 🌿☀️',
    exampleSentence: 'During photosynthesis, forests absorb huge amounts of carbon dioxide and breathe out fresh oxygen.',
    steps: [
      '1. Leaves capture sunlight with green chlorophyll',
      '2. Roots absorb water (H₂O) from the soil',
      '3. Leaves take in carbon dioxide (CO₂) from the air',
      '4. Output: Glucose sugar for plant energy + Oxygen for us!',
    ],
    visualClue: '🌱 ➔ ☀️ + 💧 + CO₂ = 🍎 Food + 🌬️ O₂',
  },
  {
    id: 'vocab-2',
    front: 'Metaphor',
    back: 'A figure of speech comparing two different things by stating that one thing IS another (without using "like" or "as").',
    category: 'vocabulary',
    pronunciation: '/ˈmɛt.ə.fɔːr/',
    partOfSpeech: 'Noun',
    hint: 'Unlike a simile (which uses "like" or "as"), a metaphor makes a direct comparison! 🎭',
    exampleSentence: '"The classroom was a buzzing beehive of busy learners!"',
    steps: [
      'Metaphor: "Time is a thief" (direct comparison)',
      'Simile: "Fast as a cheetah" (uses "as" or "like")',
      'Purpose: Paints a vivid, memorable picture in the reader\'s mind.',
    ],
    visualClue: '🎭 Direct picture comparison: A = B',
  },
  {
    id: 'vocab-3',
    front: 'Perpendicular',
    back: 'Two straight lines, planes, or surfaces meeting or intersecting at an exact 90° right angle (forming a perfect "T" or "+" shape).',
    category: 'vocabulary',
    pronunciation: '/ˌpɜːr.pənˈdɪk.jə.lər/',
    partOfSpeech: 'Adjective',
    hint: 'Look at the corner of a square room or the cross on a window frame! 📐',
    exampleSentence: 'The wall meets the classroom floor at a perpendicular 90-degree angle.',
    steps: [
      'Intersecting lines that create 90° angles',
      'Mathematical symbol: ⊥',
      'Opposite: Parallel lines (∥) never meet at all!',
    ],
    visualClue: '📐 Symbol: ⊥ (Exact 90° Right Angle)',
  },
  {
    id: 'vocab-4',
    front: 'Evaporation',
    back: 'The phase change when liquid water warms up, gains energy, and transforms into invisible water vapor (gas) rising into the sky.',
    category: 'vocabulary',
    pronunciation: '/ɪˌvæp.əˈreɪ.ʃən/',
    partOfSpeech: 'Noun',
    hint: 'What happens to shallow rain puddles on a hot sunny day? 💧☀️',
    exampleSentence: 'The afternoon sun caused swift evaporation of the morning dew on the grass.',
    steps: [
      'Liquid water absorbs heat energy',
      'Water molecules move faster and spread out',
      'Transforms into gas (water vapor) and ascends',
      'Key part of Earth\'s natural water cycle!',
    ],
    visualClue: '💧 Liquid ➔ 🔥 Heat ➔ ☁️ Water Vapor',
  },
  {
    id: 'vocab-5',
    front: 'Hypothesis',
    back: 'An educated, testable prediction or proposed explanation based on initial observations, ready to be proven or disproven by experiments!',
    category: 'vocabulary',
    pronunciation: '/haɪˈpɑː.θə.sɪs/',
    partOfSpeech: 'Noun',
    hint: 'An "If... then... because..." statement scientists make before experimenting! 🔬',
    exampleSentence: 'Her hypothesis was that plants given warm sunlight would grow two inches taller than plants in the dark.',
    steps: [
      '1. Make an observation',
      '2. Ask a question',
      '3. Formulate a testable hypothesis',
      '4. Design an experiment to test it!',
    ],
    visualClue: '🔬 Observation ➔ Hypothesis ➔ Experiment',
  },
];

// Built-in high quality educational math drill deck
const DEFAULT_MATH_DECK: FlashcardItem[] = [
  {
    id: 'math-1',
    front: '7 × 8 = ?',
    back: '56',
    category: 'math',
    hint: 'Count up by rhythm: 5, 6, 7, 8 ➔ 56 = 7 × 8! Or think: (7 × 7) + 7.',
    steps: [
      'Step 1: 7 × 7 = 49',
      'Step 2: Add one more 7 to get 7 × 8',
      'Step 3: 49 + 7 = 56!',
      'Mnemonic: "5, 6, 7, 8 ➔ 56 is seven times eight!"',
    ],
    visualClue: '🔢 7 rows of 8 dots = 56 total dots',
  },
  {
    id: 'math-2',
    front: '¾ + ²⁄₄ = ?',
    back: '5/4 (or 1 ¼)',
    category: 'math',
    hint: 'When denominators are identical (both 4), just add the top numerators together!',
    steps: [
      'Step 1: Check denominators ➔ both are 4.',
      'Step 2: Add numerators: 3 + 2 = 5.',
      'Step 3: Improper fraction: 5/4.',
      'Step 4: Mixed number: 4 goes into 5 once, remainder 1 ➔ 1 ¼ pizzas!',
    ],
    visualClue: '🍕 3 slices + 2 slices of a 4-slice pizza = 1 whole pizza + 1 slice',
  },
  {
    id: 'math-3',
    front: 'What is 15% of 80?',
    back: '12',
    category: 'math',
    hint: 'Break it into quick mental math: Find 10% first, then half of that for 5%!',
    steps: [
      'Step 1: 10% of 80 = 8 (just move decimal 1 spot)',
      'Step 2: 5% is half of 10% ➔ half of 8 is 4',
      'Step 3: Add them: 10% + 5% = 8 + 4 = 12!',
    ],
    visualClue: '💡 10% = 8  |  5% = 4  ➔  8 + 4 = 12',
  },
  {
    id: 'math-4',
    front: 'Area of Rectangle: Length = 9 cm, Width = 6 cm',
    back: '54 cm²',
    category: 'math',
    hint: 'Area of a rectangle = Length × Width. Don\'t forget square units (cm²)!',
    steps: [
      'Formula: Area = Length × Width',
      'Calculation: 9 cm × 6 cm = 54 cm²',
      'Tip: Perimeter would be 2×(9+6) = 30 cm, but Area measures the surface space!',
    ],
    visualClue: '📐 [ 9 cm ] × [ 6 cm ] = 54 square centimeters',
  },
  {
    id: 'math-5',
    front: 'Solve for x:  2x + 5 = 19',
    back: 'x = 7',
    category: 'math',
    hint: 'Inverse operations: Subtract 5 from both sides first, then divide by 2!',
    steps: [
      'Step 1: Subtract 5 from both sides: 2x = 19 - 5 ➔ 2x = 14',
      'Step 2: Divide both sides by 2: x = 14 ÷ 2 ➔ x = 7',
      'Check: 2(7) + 5 = 14 + 5 = 19! ✓ Perfect balance!',
    ],
    visualClue: '⚖️ 2x + 5 = 19  ➔  2x = 14  ➔  x = 7',
  },
  {
    id: 'math-6',
    front: '√144 = ?',
    back: '12',
    category: 'math',
    hint: 'What positive number multiplied by itself equals 144? Think of a 12-hour clock!',
    steps: [
      'Square root asks: "Which number squared equals 144?"',
      '10 × 10 = 100',
      '11 × 11 = 121',
      '12 × 12 = 144! Therefore, √144 = 12.',
    ],
    visualClue: '🔲 12 × 12 = 144',
  },
];

export const InteractiveFlashcards: React.FC<InteractiveFlashcardsProps> = ({
  payload,
  onClose,
  onFlipChange,
  className = '',
}) => {
  // Determine active category / deck
  const [activeDeckType, setActiveDeckType] = useState<'vocabulary' | 'math' | 'custom'>(() => {
    if (payload?.category === 'math') return 'math';
    if (payload?.category === 'vocabulary') return 'vocabulary';
    if (payload?.cards && payload.cards.length > 0) return 'custom';
    if (payload?.front) return 'custom';
    return 'vocabulary';
  });

  // Assemble active deck
  const [deck, setDeck] = useState<FlashcardItem[]>(() => {
    if (payload?.cards && payload.cards.length > 0) {
      return payload.cards;
    }
    if (payload?.front && payload?.back) {
      return [
        {
          id: 'payload-card-1',
          front: payload.front,
          back: payload.back,
          hint: payload.hint,
          category: payload.category || 'vocabulary',
          pronunciation: payload.pronunciation,
          partOfSpeech: payload.partOfSpeech,
          exampleSentence: payload.exampleSentence,
          steps: payload.steps,
          visualClue: payload.visualClue,
          isFlipped: payload.isFlipped,
        },
      ];
    }
    return DEFAULT_VOCABULARY_DECK;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(payload?.currentIndex || 0);
  const [isFlipped, setIsFlipped] = useState<boolean>(payload?.isFlipped || false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAiFlipping, setIsAiFlipping] = useState<boolean>(false);
  const [autoFlipCountdown, setAutoFlipCountdown] = useState<number | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [studiedCards, setStudiedCards] = useState<Record<number, 'known' | 'review'>>({});
  const [streakCount, setStreakCount] = useState<number>(0);
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);

  // New card form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newCategory, setNewCategory] = useState<'vocabulary' | 'math'>('vocabulary');

  const cardRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync payload updates from AI tool calls
  useEffect(() => {
    if (payload?.cards && payload.cards.length > 0) {
      setDeck(payload.cards);
      setActiveDeckType('custom');
      if (typeof payload.currentIndex === 'number') {
        setCurrentIndex(Math.min(payload.currentIndex, payload.cards.length - 1));
      }
    } else if (payload?.front && payload?.back) {
      setDeck([
        {
          id: 'ai-card-active',
          front: payload.front,
          back: payload.back,
          hint: payload.hint,
          category: payload.category || 'vocabulary',
          pronunciation: payload.pronunciation,
          partOfSpeech: payload.partOfSpeech,
          exampleSentence: payload.exampleSentence,
          steps: payload.steps,
          visualClue: payload.visualClue,
          isFlipped: payload.isFlipped,
        },
      ]);
      setActiveDeckType('custom');
      setCurrentIndex(0);
    }

    if (payload?.isFlipped !== undefined) {
      setIsFlipped(payload.isFlipped);
      soundEffects.playWhoosh();
    }
  }, [payload]);

  // Handle deck type switches
  const handleSwitchDeck = (type: 'vocabulary' | 'math') => {
    triggerHaptic('medium');
    soundEffects.playClick();
    setActiveDeckType(type);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setAutoFlipCountdown(null);
    if (type === 'vocabulary') {
      setDeck(DEFAULT_VOCABULARY_DECK);
    } else {
      setDeck(DEFAULT_MATH_DECK);
    }
  };

  const currentCard = deck[currentIndex] || deck[0];

  // Flip card function
  const handleFlip = useCallback(() => {
    triggerHaptic('medium');
    soundEffects.playWhoosh();
    setIsFlipped((prev) => {
      const next = !prev;
      onFlipChange?.(next, currentIndex);
      return next;
    });
  }, [currentIndex, onFlipChange]);

  // AI-controlled flip simulation
  const handleAiFlip = () => {
    triggerHaptic('heavy');
    setIsAiFlipping(true);
    soundEffects.playThinking();

    // Teacher voice chime and gentle prompt
    const message = isFlipped
      ? `Turning back to check the question: ${currentCard?.front}`
      : `Let's flip to reveal the answer! It is: ${currentCard?.back}`;

    TeacherVoiceSpeaker.speak(message);

    setTimeout(() => {
      handleFlip();
      setIsAiFlipping(false);
    }, 600);
  };

  // Auto flip timer
  useEffect(() => {
    if (autoFlipCountdown === null) return;

    if (autoFlipCountdown > 0) {
      timerRef.current = setTimeout(() => {
        setAutoFlipCountdown(autoFlipCountdown - 1);
      }, 1000);
    } else if (autoFlipCountdown === 0) {
      // Countdown finished: flip the card!
      handleFlip();
      setAutoFlipCountdown(null);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoFlipCountdown, handleFlip]);

  const startAutoFlipTimer = (seconds: number = 3) => {
    triggerHaptic('light');
    soundEffects.playClick();
    setAutoFlipCountdown(seconds);
  };

  const cancelAutoFlipTimer = () => {
    setAutoFlipCountdown(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Navigation
  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      triggerHaptic('light');
      soundEffects.playClick();
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
      cancelAutoFlipTimer();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      triggerHaptic('light');
      soundEffects.playClick();
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
      cancelAutoFlipTimer();
    }
  };

  const handleShuffle = () => {
    triggerHaptic('medium');
    soundEffects.playPop();
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    cancelAutoFlipTimer();
  };

  // Speak aloud via TTS
  const handleSpeakCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    if (!currentCard) return;

    const textToSpeak = isFlipped
      ? `The answer is: ${currentCard.back}. ${currentCard.steps ? currentCard.steps.join('. ') : ''}`
      : `Card question: ${currentCard.front}. ${currentCard.hint ? `Hint: ${currentCard.hint}` : ''}`;

    TeacherVoiceSpeaker.speak(textToSpeak);
  };

  // Self assessment
  const handleMarkCard = (status: 'known' | 'review') => {
    triggerHaptic(status === 'known' ? 'success' : 'medium');
    setStudiedCards((prev) => ({ ...prev, [currentIndex]: status }));

    if (status === 'known') {
      soundEffects.playSuccess();
      setStreakCount((s) => s + 1);
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else {
      soundEffects.playTryAgain();
      setStreakCount(0);
    }

    // Auto advance to next card after a brief moment
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        handleNext();
      }
    }, 700);
  };

  // Add custom card
  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: FlashcardItem = {
      id: `custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      category: newCategory,
    };

    setDeck((prev) => [...prev, newCard]);
    setCurrentIndex(deck.length);
    setIsFlipped(false);
    setShowHint(false);
    setIsAddCardOpen(false);
    setNewFront('');
    setNewBack('');
    setNewHint('');
    soundEffects.playSuccess();
    triggerHaptic('success');
  };

  // Keyboard shortcut listener (Space to flip, Left/Right arrow to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, currentIndex, deck.length]);

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto flex flex-col items-center select-none ${className}`}
      id="interactive-flashcards-container"
    >
      {/* Top Header & Deck Switcher */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#333333] flex items-center gap-2">
              <span>{payload?.title || 'Interactive Flashcards'}</span>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                AI Interactive Tool
              </span>
            </h3>
            <p className="text-xs text-[#5A5A40]">
              Click card or ask AI teacher to flip & test memory!
            </p>
          </div>
        </div>

        {/* Deck Selector Pills */}
        <div className="flex items-center gap-1.5 bg-[#F5F5F0] p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => handleSwitchDeck('vocabulary')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeDeckType === 'vocabulary'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vocabulary Word Cards"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vocabulary</span>
          </button>

          <button
            onClick={() => handleSwitchDeck('math')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeDeckType === 'math'
                ? 'bg-[#FF6321] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Math Problem Flashcards"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Math Drills</span>
          </button>

          {activeDeckType === 'custom' && (
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI Deck</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress & Deck Controls Bar */}
      <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-2 px-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-[#5A5A40] font-bold">
            Card {currentIndex + 1} of {deck.length}
          </span>
          {streakCount > 1 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] animate-pulse border border-amber-300">
              <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
              {streakCount} in a row!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            title="Shuffle deck cards"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Add custom card button */}
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[11px] font-bold shadow-2xs cursor-pointer"
            title="Create your own flashcard"
          >
            <Plus className="w-3 h-3" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Mini Progress Dots Bar */}
      <div className="w-full flex items-center gap-1.5 mb-4 px-2">
        {deck.map((_, idx) => {
          const status = studiedCards[idx];
          return (
            <button
              key={`dot-${idx}`}
              onClick={() => {
                triggerHaptic('light');
                setCurrentIndex(idx);
                setIsFlipped(false);
                setShowHint(false);
              }}
              className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-[#FF6321] ring-2 ring-orange-200'
                  : status === 'known'
                  ? 'bg-emerald-500'
                  : status === 'review'
                  ? 'bg-amber-400'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title={`Jump to card ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* 3D VIRTUAL CARD CONTAINER */}
      <div
        style={{ perspective: '1200px' }}
        className="w-full h-80 sm:h-96 relative cursor-pointer"
        onClick={handleFlip}
      >
        <motion.div
          ref={cardRef}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.34, 1.35, 0.64, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative rounded-3xl"
        >
          {/* FRONT OF CARD (Question / Problem / Vocabulary Term) */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={`absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md border-2 transition-all ${
              currentCard?.category === 'math'
                ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50/60 border-amber-200/90'
                : 'bg-gradient-to-br from-[#E8F3EF] via-white to-[#F3F7F5] border-[#C8DCD1]'
            }`}
          >
            {/* Front Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    currentCard?.category === 'math'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {currentCard?.category === 'math' ? '➗ Math Challenge' : '📖 Vocabulary Term'}
                </span>

                {currentCard?.partOfSpeech && (
                  <span className="text-[11px] font-bold text-gray-500 px-2 py-0.5 rounded-md bg-gray-100">
                    {currentCard.partOfSpeech}
                  </span>
                )}
              </div>

              {/* Speaker / Pronounce Button */}
              <button
                onClick={handleSpeakCard}
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-[#5A5A40] border border-gray-200 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                title="Pronounce / Read Card Aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Front Center Content */}
            <div className="flex flex-col items-center justify-center text-center my-auto px-2">
              {currentCard?.pronunciation && (
                <span className="text-xs font-mono text-gray-500 mb-2">
                  {currentCard.pronunciation}
                </span>
              )}

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight leading-snug">
                {currentCard?.front || 'Flashcard Question'}
              </h2>

              {currentCard?.visualClue && (
                <div className="mt-3 px-3 py-1.5 rounded-xl bg-white/80 border border-gray-200/80 text-xs font-semibold text-[#5A5A40]">
                  {currentCard.visualClue}
                </div>
              )}

              {/* Hint Bubble if toggled */}
              {showHint && currentCard?.hint && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium max-w-md shadow-xs"
                >
                  <span className="font-bold text-amber-800 block mb-0.5">💡 Teacher's Hint:</span>
                  {currentCard.hint}
                </motion.div>
              )}
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 text-xs">
              {/* Hint Toggle */}
              {currentCard?.hint && !showHint ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    setShowHint(true);
                    soundEffects.playThinking();
                  }}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Show Hint</span>
                </button>
              ) : (
                <span className="text-gray-400 italic">Spacebar to flip</span>
              )}

              {/* Flip Action Indicator */}
              <div className="flex items-center gap-1.5 text-[#FF6321] font-bold group">
                <span>Click to Flip Card</span>
                <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
              </div>
            </div>
          </div>

          {/* BACK OF CARD (Answer / Definition / Solution Steps) */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className={`absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md border-2 transition-all ${
              currentCard?.category === 'math'
                ? 'bg-gradient-to-br from-white via-orange-50/40 to-amber-100/60 border-orange-300'
                : 'bg-gradient-to-br from-white via-[#E8F3EF]/60 to-[#D5E8DE] border-[#A8C7B8]'
            }`}
          >
            {/* Back Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                ✓ Answer & Solution
              </span>

              {/* Speaker Button */}
              <button
                onClick={handleSpeakCard}
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-[#5A5A40] border border-gray-200 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                title="Read Explanation Aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Back Center Content */}
            <div className="flex flex-col items-center justify-center text-center my-auto px-2 overflow-y-auto max-h-[190px] scrollbar-thin">
              <span className="text-xs font-bold text-[#FF6321] uppercase tracking-wider mb-1">
                {currentCard?.category === 'math' ? 'Solution:' : 'Definition:'}
              </span>

              <p className="text-xl sm:text-2xl font-black text-[#333333] mb-2 leading-tight">
                {currentCard?.back}
              </p>

              {currentCard?.exampleSentence && (
                <div className="mt-2 p-2.5 rounded-xl bg-white/90 border border-gray-200 text-xs text-gray-700 italic max-w-md">
                  "{currentCard.exampleSentence}"
                </div>
              )}

              {/* Step-by-Step Breakdown */}
              {currentCard?.steps && currentCard.steps.length > 0 && (
                <div className="mt-3 w-full max-w-md text-left bg-white/95 p-3 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-[#5A5A40] uppercase tracking-wider block mb-1">
                    Step-by-Step Breakdown:
                  </span>
                  <ul className="text-xs text-gray-800 space-y-1">
                    {currentCard.steps.map((st, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-[#FF6321] font-bold">▪</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Back Self-Assessment Rating Footer */}
            <div
              className="flex items-center justify-between pt-3 border-t border-gray-200/60"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleMarkCard('review')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                title="Need more practice on this card"
              >
                <span>🤔 Review Later</span>
              </button>

              <button
                onClick={handleFlip}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Flip Back</span>
              </button>

              <button
                onClick={() => handleMarkCard('known')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                title="I knew this answer!"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>I Knew It!</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM CONTROLS & AI FLIP INTERACTION */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-4 px-2">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              currentIndex > 0
                ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
                : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
            }`}
            title="Previous Flashcard"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === deck.length - 1}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              currentIndex < deck.length - 1
                ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
                : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
            }`}
            title="Next Flashcard"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Flip & AI Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Manual / AI Flip Button */}
          <button
            id="flashcard-flip-btn"
            onClick={handleFlip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6321] hover:bg-[#e0561a] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Flip to Front' : 'Flip to Reveal'}</span>
          </button>

          {/* AI Teacher Flip (Teacher Voice & Turn) */}
          <button
            id="ai-teacher-flip-btn"
            onClick={handleAiFlip}
            disabled={isAiFlipping}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition-transform active:scale-95 cursor-pointer border border-purple-400"
            title="Ask AI Teacher Ms. Priya to flip this card and explain!"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Flip</span>
          </button>
        </div>

        {/* Auto Reveal Timer / Challenge */}
        <div className="flex items-center gap-1.5">
          {autoFlipCountdown !== null ? (
            <button
              onClick={cancelAutoFlipTimer}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 cursor-pointer animate-pulse"
              title="Cancel countdown timer"
            >
              <span>Revealing in {autoFlipCountdown}s...</span>
              <X className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => startAutoFlipTimer(3)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition-colors cursor-pointer"
              title="3-Second Guess Challenge before auto-flip"
            >
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span>3s Guess</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL: ADD CUSTOM CARD */}
      <AnimatePresence>
        {isAddCardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6321] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Create Custom Card</h4>
                </div>
                <button
                  onClick={() => setIsAddCardOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomCard} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Card Category
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCategory('vocabulary')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl border cursor-pointer ${
                        newCategory === 'vocabulary'
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      Vocabulary Word
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategory('math')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl border cursor-pointer ${
                        newCategory === 'math'
                          ? 'bg-[#FF6321] text-white border-[#FF6321]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      Math Problem
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Front Side (Word or Math Equation)
                  </label>
                  <input
                    type="text"
                    required
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder={
                      newCategory === 'math' ? 'e.g. 12 × 12 = ?' : 'e.g. Ecosystem'
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#FF6321]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Back Side (Answer, Definition, or Solution)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder={
                      newCategory === 'math'
                        ? '144 (12 squared equals 144)'
                        : 'A biological community of interacting organisms and their physical environment.'
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#FF6321]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Optional Hint for Student
                  </label>
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="e.g. Think of a tropical rainforest or pond habitat!"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#FF6321]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCardOpen(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#FF6321] hover:bg-[#e0561a] text-white shadow-xs cursor-pointer"
                  >
                    Add to Deck
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default InteractiveFlashcards;
