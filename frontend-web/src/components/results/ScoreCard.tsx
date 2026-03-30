import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MinusCircle, Clock, BarChart2, Award } from 'lucide-react';
import { ProgressBar } from '../exam/ProgressBar';

interface ScoreCardProps {
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeTaken: string;
  passingMarks: number;
  isPassed: boolean;
  rank?: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  totalMarks,
  percentage,
  correct,
  wrong,
  skipped,
  timeTaken,
  passingMarks,
  isPassed,
  rank,
}) => {
  const scoreColor =
    percentage >= 85 ? 'text-emerald-400' : percentage >= 40 ? 'text-amber-400' : 'text-red-400';

  const progressColor =
    percentage >= 85 ? 'emerald' : percentage >= 40 ? 'amber' : ('red' as const);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-8 text-center"
    >
      {/* Score */}
      <div className={`text-7xl font-black mb-2 ${scoreColor}`}>
        {score}
        <span className="text-3xl text-slate-500">/{totalMarks}</span>
      </div>

      {/* Status */}
      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm mb-6 ${
        isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}>
        {isPassed ? <Award className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {isPassed ? 'PASSED' : 'FAILED'}
        <span className="opacity-60">• {percentage.toFixed(1)}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar value={percentage} color={progressColor} size="lg" showLabel />
        <p className="text-xs text-slate-500 mt-1">Passing: {passingMarks} marks ({((passingMarks / totalMarks) * 100).toFixed(0)}%)</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} label="Correct" value={correct} color="text-emerald-400" />
        <StatItem icon={<XCircle className="w-5 h-5 text-red-400" />} label="Wrong" value={wrong} color="text-red-400" />
        <StatItem icon={<MinusCircle className="w-5 h-5 text-slate-400" />} label="Skipped" value={skipped} color="text-slate-400" />
        <StatItem icon={<Clock className="w-5 h-5 text-blue-400" />} label="Time" value={timeTaken} isText color="text-blue-400" />
      </div>

      {rank && (
        <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <BarChart2 className="w-4 h-4" />
          <span>Rank: <span className="text-white font-bold">#{rank}</span></span>
        </div>
      )}
    </motion.div>
  );
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; isText?: boolean }> = ({
  icon, label, value, color, isText = false,
}) => (
  <div className="bg-slate-900/50 rounded-xl p-3 text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className={`font-bold ${color} ${isText ? 'text-sm' : 'text-2xl'}`}>{value}</div>
    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
  </div>
);
