import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, HelpCircle, Compass, Bot } from 'lucide-react';
import { ClassroomState } from '../types';

interface AskAnythingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomState: ClassroomState;
  onAskQuestion: (question: string) => void;
}

const SAMPLE_QUESTIONS = [
  'Why is the sky blue?',
  'How do dinosaurs fly?',
  'What makes a rainbow?',
  'Why do plants need sunlight?',
  'How do fish breathe underwater?',
  'What is gravity?',
];

export const AskAnythingModal: React.FC<AskAnythingModalProps> = ({
  isOpen,
  onClose,
  classroomState,
  onAskQuestion,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    onAskQuestion(customQuestion.trim());
    setCustomQuestion('');
    onClose();
  };

  const handleSelectSample = (q: string) => {
    onAskQuestion(q);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FFF7F3]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FFEDD5] text-[#FF6321]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#333333]">
                  Ask Anything Mode
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Universal Knowledge Router • Age-Appropriate Explanations for Class {classroomState.student.gradeClass}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-200/60 text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-[#F3F7F5] border border-gray-200 text-sm text-[#333333] leading-relaxed">
              Have a curious question about science, space, nature, or anything at all? Ask Ms. Priya! She will explain it simply using our digital whiteboard and exciting examples.
            </div>

            {/* Custom Question Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask any question (e.g., Why do stars twinkle?)..."
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6321]"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#FF6321] hover:bg-[#e0551c] text-white font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Ask
              </button>
            </form>

            {/* Sample Prompts */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                Or pick a curious question:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSelectSample(q)}
                    className="p-3 text-left rounded-xl bg-[#F9FBF9] hover:bg-[#E8F3EF] border border-gray-200 hover:border-[#5A5A40] text-xs font-bold text-[#333333] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#FF6321] shrink-0" />
                    <span className="truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-mono">
            <span>Universal AI Question Router</span>
            <span>Gemini Multimodal Grounding</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
