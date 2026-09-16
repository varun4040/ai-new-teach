import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Trash2, X, BookOpen, AlertCircle } from 'lucide-react';
import { TextbookChapter } from '../types';

interface TextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTextbook?: TextbookChapter | null;
  onTextbookLoaded: (textbook: TextbookChapter) => void;
  onClearTextbook: () => void;
}

export const TextbookModal: React.FC<TextbookModalProps> = ({
  isOpen,
  onClose,
  activeTextbook,
  onTextbookLoaded,
  onClearTextbook,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/textbook/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process textbook file');
      }

      onTextbookLoaded(data.textbook);
      onClose();
    } catch (err: any) {
      console.error('Textbook upload error:', err);
      setError(err.message || 'Error processing textbook upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden p-6 text-[#333333]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 bg-[#F3F7F5] rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#E8F3EF] text-[#5A5A40] rounded-2xl border border-[#C8DCD1]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#333333]">Textbook Ingestion Mode</h3>
            <p className="text-xs text-gray-500">
              Upload a chapter (PDF, JPG, PNG) as Ms. Priya's primary source of truth.
            </p>
          </div>
        </div>

        {activeTextbook ? (
          <div className="bg-[#F3F7F5] border border-gray-200 rounded-2xl p-4 my-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#5A5A40] text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Textbook Mode Active</span>
              </div>
              <button
                onClick={() => {
                  onClearTextbook();
                  onClose();
                }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <div className="text-base font-bold text-[#333333]">{activeTextbook.chapterTitle}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{activeTextbook.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeTextbook.keyConcepts.map((concept, idx) => (
                  <span
                    key={`tc-${idx}`}
                    className="text-[11px] font-medium bg-white border border-gray-200 text-[#5A5A40] px-2.5 py-0.5 rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 hover:border-[#5A5A40] rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-[#FAFAFA] my-4">
            <Upload className="w-10 h-10 text-[#5A5A40] mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-[#333333] mb-1">
              Select or Drop Textbook Chapter File
            </h4>
            <p className="text-xs text-gray-400 mb-4">Supports PDF, JPG, PNG up to 15MB</p>

            <label className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A34] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{isUploading ? 'Extracting Chapter...' : 'Browse Files'}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F3F7F5] hover:bg-gray-100 text-[#333333] border border-gray-200 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
