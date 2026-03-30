import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { incrementViolation, addViolationLog } from '../store/examSlice';

export type ViolationType = 'multiple_faces' | 'no_face' | 'phone_detected' | 'book_detected' | 'tab_switch' | 'devtools' | 'fullscreen_exit';

interface UseViolationOptions {
  onAutoSubmit?: () => void;
  maxViolations?: number;
}

export const useViolation = ({ onAutoSubmit, maxViolations = 3 }: UseViolationOptions = {}) => {
  const dispatch = useDispatch();
  const { violationCount } = useSelector((s: RootState) => s.exam);
  const observerRef = useRef<MutationObserver | null>(null);

  const reportViolation = useCallback(
    (type: ViolationType, screenshot?: string) => {
      const log = {
        type,
        timestamp: new Date().toISOString(),
        screenshot,
      };
      dispatch(addViolationLog(log));
      dispatch(incrementViolation());
    },
    [dispatch]
  );

  // Tab switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        reportViolation('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [reportViolation]);

  // Fullscreen exit detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportViolation('fullscreen_exit');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [reportViolation]);

  // DevTools detection (window resize heuristic)
  useEffect(() => {
    let devToolsOpen = false;
    const threshold = 160;

    const detectDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if ((widthDiff > threshold || heightDiff > threshold) && !devToolsOpen) {
        devToolsOpen = true;
        reportViolation('devtools');
      } else if (widthDiff < threshold && heightDiff < threshold) {
        devToolsOpen = false;
      }
    };

    const interval = setInterval(detectDevTools, 2000);
    return () => clearInterval(interval);
  }, [reportViolation]);

  // Right-click and copy-paste disable
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('cut', prevent);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('cut', prevent);
    };
  }, []);

  // Auto-submit when max violations reached
  useEffect(() => {
    if (violationCount >= maxViolations) {
      onAutoSubmit?.();
    }
  }, [violationCount, maxViolations, onAutoSubmit]);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  return {
    violationCount,
    reportViolation,
    enterFullscreen,
    isMaxViolations: violationCount >= maxViolations,
  };
};
