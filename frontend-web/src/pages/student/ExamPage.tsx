import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import { setAnswer, setCurrentQuestion, incrementViolation, endExam } from '../../store/examSlice';
import { FaceVerification } from '../../components/exam/FaceVerification';
import { QuestionCard } from '../../components/exam/QuestionCard';
import { Timer } from '../../components/exam/Timer';
import { ViolationOverlay } from '../../components/exam/ViolationOverlay';
import { ExamNavigation } from '../../components/exam/ExamNavigation';
import apiClient from '../../api/client';
import { AlertTriangle, Eye } from 'lucide-react';

export const ExamPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentAssignment, currentSubmission, questions, currentQuestionIndex, answers, violationCount } = useSelector((s: RootState) => s.exam);
  const { user } = useSelector((s: RootState) => s.auth);

  const [phase, setPhase] = useState<'loading' | 'face_verify' | 'exam' | 'submitting'>('loading');
  const [showViolation, setShowViolation] = useState(false);
  const [violationMsg, setViolationMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const examRef = useRef<HTMLDivElement>(null);
  const MAX_VIOLATIONS = 3;

  // Security: disable copy-paste, right-click, devtools detection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); triggerViolation('devtools_open', 'Right-click disabled during exam'); };
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c','v','u','a'].includes(e.key.toLowerCase())) { e.preventDefault(); }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        triggerViolation('devtools_open', 'Developer tools access detected');
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) { triggerViolation('tab_switch', 'Tab switch detected'); }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && phase === 'exam') {
        triggerViolation('fullscreen_exit', 'Exam window minimized');
        requestFullscreen();
      }
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [phase, violationCount]);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (e) {}
  };

  const triggerViolation = useCallback(async (type: string, msg: string, screenshot?: string) => {
    if (!currentSubmission || phase !== 'exam') return;

    dispatch(incrementViolation());
    setViolationMsg(msg);
    setShowViolation(true);

    try {
      const res = await apiClient.post('/api/violations', {
        submission_id: currentSubmission.id,
        violation_type: type,
        description: msg,
        screenshot_base64: screenshot || null,
      });

      if (res.data.auto_submitted) {
        await submitExam('auto_submitted');
      }
    } catch (e) {}

    setTimeout(() => setShowViolation(false), 3000);
  }, [currentSubmission, phase, dispatch]);

  const handleFaceVerified = useCallback(async () => {
    await requestFullscreen();
    setPhase('exam');
  }, []);

  const handleAnswerChange = async (questionId: string, options: number[]) => {
    dispatch(setAnswer({ questionId, options }));
    if (currentSubmission) {
      try {
        await apiClient.put(`/api/submissions/${currentSubmission.id}/answer`, {
          question_id: questionId,
          selected_options: options,
          time_spent_seconds: 0,
        });
      } catch (e) {}
    }
  };

  const submitExam = async (reason = 'submitted') => {
    if (!currentSubmission) return;
    setPhase('submitting');
    try {
      await apiClient.post(`/api/submissions/${currentSubmission.id}/submit`, {
        submit_reason: reason,
      });
      dispatch(endExam());
      navigate(`/results/${currentSubmission.id}`);
    } catch (e) {
      navigate('/dashboard');
    }
  };

  const handleTimerEnd = () => submitExam('timed_out');

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (phase === 'face_verify') {
    return (
      <FaceVerification
        profilePhotoUrl={user?.profile_photo_url || ''}
        onVerified={handleFaceVerified}
        onFailed={(msg) => navigate('/dashboard', { state: { error: msg } })}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div ref={examRef} className="min-h-screen bg-slate-900 select-none">
      {/* Violation Overlay */}
      <AnimatePresence>
        {showViolation && (
          <ViolationOverlay
            message={violationMsg}
            violationNumber={violationCount}
            maxViolations={MAX_VIOLATIONS}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-semibold">{currentAssignment?.title}</span>
        </div>
        <div className="flex items-center gap-6">
          {violationCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">
                Warning {violationCount}/{MAX_VIOLATIONS}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>Monitored</span>
          </div>
          {currentAssignment && (
            <Timer
              durationMinutes={currentAssignment.duration_minutes}
              onTimeEnd={handleTimerEnd}
              startTime={currentSubmission?.started_at || new Date().toISOString()}
            />
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
        {/* Question Area */}
        <div className="flex-1">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedOptions={answers[currentQuestion.id] || []}
              onAnswerChange={(options) => handleAnswerChange(currentQuestion.id, options)}
            />
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => dispatch(setCurrentQuestion(Math.max(0, currentQuestionIndex - 1)))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2.5 bg-slate-700 text-white rounded-xl disabled:opacity-40 hover:bg-slate-600 transition-colors font-medium"
            >
              ← Previous
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => dispatch(setCurrentQuestion(currentQuestionIndex + 1))}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Next →
              </button>
            ) : (
              <motion.button
                onClick={() => submitExam()}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Exam
              </motion.button>
            )}
          </div>
        </div>

        {/* Navigation Panel */}
        <ExamNavigation
          questions={questions}
          answers={answers}
          currentIndex={currentQuestionIndex}
          onSelect={(i) => dispatch(setCurrentQuestion(i))}
          onSubmit={() => submitExam()}
        />
      </div>
    </div>
  );
};

export default ExamPage;
