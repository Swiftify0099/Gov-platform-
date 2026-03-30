// Exam security utilities for browser-based proctoring

/**
 * Request fullscreen mode for the exam
 */
export const requestFullscreen = (): Promise<void> => {
  const el = document.documentElement;
  if (el.requestFullscreen) return el.requestFullscreen();
  return Promise.reject('Fullscreen not supported');
};

/**
 * Exit fullscreen mode
 */
export const exitFullscreen = (): Promise<void> => {
  if (document.exitFullscreen) return document.exitFullscreen();
  return Promise.reject('Fullscreen not supported');
};

/**
 * Check if currently in fullscreen
 */
export const isFullscreen = (): boolean => !!document.fullscreenElement;

/**
 * Disable right-click on a specific element
 */
export const disableRightClick = (element: HTMLElement): () => void => {
  const handler = (e: MouseEvent) => e.preventDefault();
  element.addEventListener('contextmenu', handler);
  return () => element.removeEventListener('contextmenu', handler);
};

/**
 * Disable copy/paste/cut on a specific element
 */
export const disableClipboard = (element: HTMLElement): () => void => {
  const prevent = (e: Event) => e.preventDefault();
  element.addEventListener('copy', prevent);
  element.addEventListener('paste', prevent);
  element.addEventListener('cut', prevent);
  return () => {
    element.removeEventListener('copy', prevent);
    element.removeEventListener('paste', prevent);
    element.removeEventListener('cut', prevent);
  };
};

/**
 * Detect devtools using window size heuristics
 */
export const createDevToolsDetector = (onDetect: () => void, threshold = 160): () => void => {
  let triggered = false;
  const check = () => {
    const diff = window.outerWidth - window.innerWidth || window.outerHeight - window.innerHeight;
    if (diff > threshold && !triggered) {
      triggered = true;
      onDetect();
    } else if (diff <= threshold) {
      triggered = false;
    }
  };
  const interval = setInterval(check, 2000);
  return () => clearInterval(interval);
};

/**
 * Capture webcam screenshot as base64
 */
export const captureWebcamFrame = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 320;
  canvas.height = videoElement.videoHeight || 240;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.7);
};
