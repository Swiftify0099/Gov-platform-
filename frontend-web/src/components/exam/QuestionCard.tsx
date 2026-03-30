import React from 'react';
import { motion } from 'framer-motion';
import { Question } from '../../types';
import { CheckCircle, Circle } from 'lucide-react';

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOptions: number[];
  onAnswerChange: (options: number[]) => void;
  readonly?: boolean;
  showAnswers?: boolean;
}

export const QuestionCard: React.FC<Props> = ({
  question, questionNumber, totalQuestions,
  selectedOptions, onAnswerChange, readonly = false, showAnswers = false,
}) => {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const isMultiple = question.correct_answers.length > 1;

  const handleSelect = (index: number) => {
    if (readonly) return;
    if (isMultiple) {
      const newSel = selectedOptions.includes(index)
        ? selectedOptions.filter(o => o !== index)
        : [...selectedOptions, index];
      onAnswerChange(newSel);
    } else {
      onAnswerChange(selectedOptions[0] === index ? [] : [index]);
    }
  };

  const getOptionStyle = (index: number): string => {
    const isSelected = selectedOptions.includes(index);
    const isCorrect = question.correct_answers.includes(index);

    if (showAnswers) {
      if (isCorrect) return 'bg-green-500/20 border-green-500 text-green-300';
      if (isSelected && !isCorrect) return 'bg-red-500/20 border-red-500 text-red-300';
      return 'bg-slate-800 border-slate-700 text-slate-400';
    }
    if (isSelected) return 'bg-blue-500/20 border-blue-500 text-blue-200';
    return 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50';
  };

  return (
    <motion.div
      className="bg-slate-800 rounded-2xl border border-slate-700 p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      key={question.id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
            question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {question.difficulty}
          </span>
          {question.topic && (
            <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
              {question.topic}
            </span>
          )}
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">
            {question.marks} mark{question.marks !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-white text-lg font-medium leading-relaxed mb-6">
        {question.text}
      </p>

      {isMultiple && (
        <p className="text-yellow-400 text-xs mb-3 font-medium">
          ⚡ Select all correct answers
        </p>
      )}

      {/* Options */}
      <div className="grid gap-3">
        {options.map((opt, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${getOptionStyle(index)}`}
            whileHover={!readonly ? { scale: 1.005 } : {}}
            whileTap={!readonly ? { scale: 0.995 } : {}}
          >
            <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
              selectedOptions.includes(index) ? 'border-current bg-current/20' : 'border-current/50'
            }`}>
              {String.fromCharCode(65 + index)}
            </div>
            <span className="flex-1 text-sm leading-relaxed">{opt}</span>
            {selectedOptions.includes(index) && (
              <CheckCircle className="w-5 h-5 shrink-0 text-current" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Marks info */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700">
        <span className="text-xs text-green-400">✓ +{question.marks} for correct</span>
        {question.negative_marks > 0 && (
          <span className="text-xs text-red-400">✗ -{question.negative_marks} for wrong</span>
        )}
      </div>
    </motion.div>
  );
};
