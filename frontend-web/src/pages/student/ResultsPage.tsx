import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { QuestionCard } from '../../components/exam/QuestionCard';
import apiClient from '../../api/client';
import { ExamResult, Question } from '../../types';
import { Trophy, X, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';

export const ResultsPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [gptExplanations, setGptExplanations] = useState<Record<string, string>>({});
  const [loadingGpt, setLoadingGpt] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const { user } = useSelector((s: RootState) => s.auth);
  const confettiFired = useRef(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!submissionId) return;
      const [resultRes, reviewRes] = await Promise.all([
        apiClient.get(`/api/submissions/${submissionId}/result`),
        apiClient.get(`/api/submissions/${submissionId}/review`),
      ]);
      setResult(resultRes.data);
      setQuestions(reviewRes.data.questions || []);
      setAnswers(reviewRes.data.answers || {});

      // Confetti for high scores
      if (resultRes.data.percentage >= 85 && !confettiFired.current) {
        confettiFired.current = true;
        const end = Date.now() + 3000;
        const frame = () => {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#3b82f6', '#8b5cf6', '#10b981'] });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f59e0b', '#ef4444', '#06b6d4'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    };
    fetchResult();
  }, [submissionId]);

  const handleExplain = async (questionId: string) => {
    if (gptExplanations[questionId]) { setShowModal(questionId); return; }
    setLoadingGpt(questionId);
    try {
      const res = await apiClient.post('/api/gpt/explain', {
        question_id: questionId,
        language: user?.language_preference || 'en',
      });
      setGptExplanations(prev => ({ ...prev, [questionId]: res.data.explanation }));
      setShowModal(questionId);
    } catch (e) {}
    setLoadingGpt(null);
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPassed = result.passed;
  const isExcellent = result.percentage >= 85;
  const isWeak = result.percentage < 40;

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      {/* GPT Explanation Modal */}
      {showModal && gptExplanations[showModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span>🤖</span> AI Explanation
              </h3>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{gptExplanations[showModal]}</ReactMarkdown>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Score Card */}
        <motion.div
          className={`rounded-2xl p-8 mb-8 text-center border-2 ${
            isExcellent ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/50' :
            isWeak ? 'bg-gradient-to-br from-red-900/50 to-rose-900/50 border-red-500/50' :
            'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-500/50'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isExcellent ? 'bg-green-500/30' : isWeak ? 'bg-red-500/30' : 'bg-blue-500/30'
          }`}>
            <Trophy className={`w-10 h-10 ${isExcellent ? 'text-green-400' : isWeak ? 'text-red-400' : 'text-blue-400'}`} />
          </div>

          <h1 className="text-4xl font-bold text-white mb-1">
            {result.percentage.toFixed(1)}%
          </h1>
          <p className="text-slate-300 mb-2">
            Score: {result.total_score} / {result.total_marks}
          </p>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
            isPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPassed ? '✓ PASSED' : '✗ FAILED'}
          </span>

          {isWeak && (
            <p className="text-slate-300 mt-4 text-sm">
              💪 Don't give up! Review the explanations and practice more. You've got this!
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { icon: CheckCircle, label: 'Correct', value: result.correct_count, color: 'text-green-400' },
              { icon: X, label: 'Wrong', value: result.wrong_count, color: 'text-red-400' },
              { icon: AlertCircle, label: 'Skipped', value: result.skipped_count, color: 'text-yellow-400' },
              { icon: Clock, label: 'Time', value: `${Math.floor(result.time_taken_seconds / 60)}m ${result.time_taken_seconds % 60}s`, color: 'text-blue-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-slate-400 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Question Review */}
        <h2 className="text-white text-xl font-bold mb-4">Review Answers</h2>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <QuestionCard
                question={q}
                questionNumber={i + 1}
                totalQuestions={questions.length}
                selectedOptions={answers[q.id] || []}
                onAnswerChange={() => {}}
                readonly
                showAnswers
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleExplain(q.id)}
                  disabled={loadingGpt === q.id}
                  className="flex items-center gap-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loadingGpt === q.id ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Loading...</>
                  ) : (
                    <><span>🤖</span> Explain Answer</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
