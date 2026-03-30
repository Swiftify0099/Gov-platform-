import { useState, useRef, useCallback, useEffect } from 'react';

interface UseFaceDetectionOptions {
  profilePhotoUrl: string;
  onMatch?: () => void;
  onMismatch?: (reason: string) => void;
  threshold?: number;
}

export const useFaceDetection = ({
  profilePhotoUrl,
  onMatch,
  onMismatch,
  threshold = 0.6,
}: UseFaceDetectionOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadModels = useCallback(async () => {
    try {
      const faceapi = await import('@vladmandic/face-api');
      const MODEL_URL = '/models'; // face-api models in public/models/
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (e) {
      setError('Failed to load face detection models');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError('Camera access denied. Please allow camera access.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const verifyFace = useCallback(async () => {
    if (!modelsLoaded || !videoRef.current) {
      setError('Models not ready or camera not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const faceapi = await import('@vladmandic/face-api');

      // Detect face in live video
      const liveDetection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!liveDetection) {
        setError('No face detected in camera. Please look at the camera.');
        onMismatch?.('no_face');
        return;
      }

      // Load profile photo and detect face
      const profileImg = await faceapi.fetchImage(profilePhotoUrl);
      const profileDetection = await faceapi
        .detectSingleFace(profileImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!profileDetection) {
        setError('Could not detect face in your profile photo. Please update your profile photo.');
        return;
      }

      // Compare descriptors
      const distance = faceapi.euclideanDistance(
        liveDetection.descriptor,
        profileDetection.descriptor
      );
      const similarity = 1 - distance;

      if (similarity >= threshold) {
        setIsVerified(true);
        onMatch?.();
      } else {
        setError(`Face does not match your profile photo. Similarity: ${(similarity * 100).toFixed(0)}%`);
        onMismatch?.('face_mismatch');
      }
    } catch (e) {
      setError('Face verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [modelsLoaded, profilePhotoUrl, threshold, onMatch, onMismatch]);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  return {
    videoRef,
    isLoading,
    isVerified,
    error,
    modelsLoaded,
    startCamera,
    stopCamera,
    verifyFace,
  };
};
