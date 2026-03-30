import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MinusCircle, Sparkles } from 'lucide-react';
import { GPTExplanation } from './GPTExplanation';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface ReviewQuestionProps {
  index: number;
  question: {
    id: string;
    text: string;
    options: string[];
    correct_answers: number[];
    marks: number;
    negative_marks: number;
    difficulty: string;
    topic: string;
    language: string;
  };
  selectedOptions: number[];
  language: string;
}

export const ReviewQuestion: React.FC<ReviewQuestionProps> = ({
  index,
  question,
  selectedOptions,
  language,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const isSkipped = selectedOptions.length === 0;
  const isCorrect =
    !isSkipped &&
    selectedOptions.length === question.correct_answers.length &&
    selectedOptions.every((o) => question.correct_answers.includes(o));
  const isWrong = !isSkipped && !isCorrect;

  const correctAnswerText = question.correct_answers
    .map((i) => `${String.fromCharCode(65 + i)}. ${question.options[i]}`)
    .join(', ');

  const statusIcon = isSkipped ? (
    <MinusCircle className="w-5 h-5 text-slate-400" />
  ) : isCorrect ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
  ) : (
    <XCircle className="w-5 h-5 text-red-400" />
  );

  const statusBorder = isSkipped
    ? 'border-slate-700'
    : isCorrect
    ? 'border-emerald-500/40'
    : 'border-red-500/40';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`bg-slate-800/60 border ${statusBorder} rounded-2xl p-5`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            {statusIcon}
            <div>
              <p className="text-xs text-slate-500 mb-1">Q{index + 1}</p>
              <p className="text-slate-200 text-sm leading-relaxed">{question.text}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge variant={isCorrect ? 'success' : isWrong ? 'error' : 'neutral'}>
              {isCorrect ? `+${question.marks}` : isWrong ? `-${question.negative_marks}` : '0'}
            </Badge>
            <Badge variant="neutral" size="sm">{question.difficulty}</Badge>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {question.options.map((option, i) => {
            const isSelected = selectedOptions.includes(i);
            const isCorrectOpt = question.correct_answers.includes(i);
            let optClass = 'bg-slate-800/40 border-slate-700/60 text-slate-400';
            if (isCorrectOpt) optClass = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
            else if (isSelected && !isCorrectOpt) optClass = 'bg-red-500/15 border-red-500/40 text-red-300';

            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optClass}`}
              >
                <span className="font-bold text-xs">{String.fromCharCode(65 + i)}.</span>
                <span>{option}</span>
                {isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                {isSelected && !isCorrectOpt && <XCircle className="w-3.5 h-3.5 ml-auto" />}
              </div>
            );
          })}
        </div>

        {/* Meta + Explain */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-xs text-slate-500">
            {question.topic && <span>📚 {question.topic}</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => setShowExplanation(true)}
          >
            Explain
          </Button>
        </div>
      </motion.div>

      <GPTExplanation
        questionId={question.id}
        questionText={question.text}
        options={question.options}
        correctAnswer={correctAnswerText}
        language={language}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </>
  );
};
