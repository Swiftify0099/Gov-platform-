import React from 'react';
import { Question } from '../../types';

interface Props {
  questions: Question[];
  answers: Record<string, number[]>;
  currentIndex: number;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

export const ExamNavigation: React.FC<Props> = ({ questions, answers, currentIndex, onSelect, onSubmit }) => {
  const answered = Object.keys(answers).filter(k => answers[k].length > 0).length;

  return (
    <div className="w-64 shrink-0">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sticky top-20">
        <h3 className="text-white font-semibold mb-3 text-sm">Question Navigator</h3>
        <div className="flex gap-3 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <div className="w-3 h-3 rounded-sm bg-blue-500" /> Answered ({answered})
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <div className="w-3 h-3 rounded-sm bg-slate-700" /> Skipped
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id]?.length > 0;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => onSelect(i)}
                className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                  isCurrent ? 'bg-yellow-500 text-black ring-2 ring-yellow-300' :
                  isAnswered ? 'bg-blue-600 text-white hover:bg-blue-500' :
                  'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
        >
          Submit Exam
        </button>
        <p className="text-slate-500 text-xs text-center mt-2">
          {answered}/{questions.length} answered
        </p>
      </div>
    </div>
  );
};
