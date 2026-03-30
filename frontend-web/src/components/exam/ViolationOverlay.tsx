import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  message: string;
  violationNumber: number;
  maxViolations: number;
}

export const ViolationOverlay: React.FC<Props> = ({ message, violationNumber, maxViolations }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-slate-900 border-2 border-red-500 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl shadow-red-500/20"
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 20 }}
    >
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">⚠ Violation Detected</h3>
      <p className="text-slate-300 mb-4">{message}</p>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: maxViolations }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i < violationNumber ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <p className="text-red-400 text-sm mt-3 font-semibold">
        Warning {violationNumber} of {maxViolations}
        {violationNumber === maxViolations && ' — Exam Auto-Submitted!'}
      </p>
    </motion.div>
  </motion.div>
);
