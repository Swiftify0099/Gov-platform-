import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { gptApi } from '../../api/gpt';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { Sparkles } from 'lucide-react';

interface GPTExplanationProps {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  language: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GPTExplanation: React.FC<GPTExplanationProps> = ({
  questionId,
  questionText,
  options,
  correctAnswer,
  language,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchExplanation();
    }
    if (!isOpen) {
      fetchedRef.current = false;
    }
  }, [isOpen]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gptApi.explain({
        question_id: questionId,
        question_text: questionText,
        options,
        correct_answer: correctAnswer,
        language,
      });
      setExplanation(res.explanation);
    } catch {
      setError('Failed to load explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Explanation" size="lg">
      <div className="space-y-4">
        {/* Question preview */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Question</p>
          <p className="text-white text-sm">{questionText}</p>
          <p className="text-emerald-400 text-sm mt-2">
            ✓ Correct: {correctAnswer}
          </p>
        </div>

        {/* Explanation */}
        <div className="min-h-[120px]">
          {loading && (
            <div className="flex items-center gap-3 text-indigo-400">
              <Loader size="sm" />
              <span className="text-sm animate-pulse">{t('results.loading_explanation')}</span>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
              <Button variant="ghost" size="sm" onClick={fetchExplanation} className="mt-2">
                Retry
              </Button>
            </div>
          )}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20"
            >
              <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">AI Explanation</span>
              </div>
              {explanation}
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
};
