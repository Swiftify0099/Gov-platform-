import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';

interface Props {
  profilePhotoUrl: string;
  onVerified: () => void;
  onFailed: (msg: string) => void;
}

export const FaceVerification: React.FC<Props> = ({ profilePhotoUrl, onVerified, onFailed }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'matched' | 'failed'>('loading');
  const [message, setMessage] = useState('Loading face detection models...');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import('@vladmandic/face-api');
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('ready');
        setMessage('Models loaded. Please position your face in the camera.');
        await startCamera();
      } catch (err) {
        setMessage('Failed to load face detection. Please refresh.');
        setStatus('failed');
      }
    };
    loadModels();
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setMessage('Camera access denied. Please allow camera access.');
      setStatus('failed');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const performVerification = useCallback(async () => {
    if (!modelsLoaded || !videoRef.current) return;
    const faceapi = await import('@vladmandic/face-api');

    setStatus('scanning');
    setMessage('Scanning your face...');

    try {
      // Detect face in live video
      const liveDetection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!liveDetection) {
        setMessage('No face detected. Please position your face clearly.');
        setStatus('ready');
        return;
      }

      // Load profile image for comparison
      const profileImg = await faceapi.fetchImage(profilePhotoUrl);
      const profileDetection = await faceapi
        .detectSingleFace(profileImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!profileDetection) {
        setMessage('Could not detect face in profile photo. Contact support.');
        setStatus('ready');
        return;
      }

      // Compare descriptors
      const distance = faceapi.euclideanDistance(
        liveDetection.descriptor,
        profileDetection.descriptor
      );
      const THRESHOLD = 0.6;
      const similarity = 1 - distance;

      if (similarity >= THRESHOLD) {
        setStatus('matched');
        setMessage(`Identity verified! (${Math.round(similarity * 100)}% match)`);
        setTimeout(() => { stopCamera(); onVerified(); }, 1500);
      } else {
        setMessage(`Face mismatch (${Math.round(similarity * 100)}%). Please try again.`);
        setStatus('ready');
      }
    } catch (err) {
      setMessage('Verification error. Please try again.');
      setStatus('ready');
    }
  }, [modelsLoaded, profilePhotoUrl, onVerified]);

  const statusColors: Record<string, string> = {
    loading: 'border-slate-500',
    ready: 'border-blue-500',
    scanning: 'border-yellow-500',
    matched: 'border-green-500',
    failed: 'border-red-500',
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/40">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
          <p className="text-slate-400 mt-1">Required before starting the exam</p>
        </div>

        {/* Camera Feed */}
        <div className={`relative rounded-2xl overflow-hidden border-4 ${statusColors[status]} transition-colors mb-6 bg-slate-800`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-64" />

          {/* Face guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-56 border-4 border-white/30 rounded-full" />
          </div>

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {status === 'scanning' && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                SCANNING
              </span>
            )}
            {status === 'matched' && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                MATCHED ✓
              </span>
            )}
          </div>
        </div>

        {/* Status Message */}
        <motion.div
          className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
            status === 'matched' ? 'bg-green-500/20 border border-green-500/30' :
            status === 'failed' ? 'bg-red-500/20 border border-red-500/30' :
            status === 'scanning' ? 'bg-yellow-500/20 border border-yellow-500/30' :
            'bg-slate-800 border border-slate-700'
          }`}
          key={message}
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
        >
          {status === 'matched' ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> :
           status === 'failed' ? <XCircle className="w-5 h-5 text-red-400 shrink-0" /> :
           <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />}
          <p className={`text-sm font-medium ${
            status === 'matched' ? 'text-green-300' :
            status === 'failed' ? 'text-red-300' :
            'text-slate-300'
          }`}>{message}</p>
        </motion.div>

        <motion.button
          onClick={performVerification}
          disabled={status === 'loading' || status === 'scanning' || status === 'matched'}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Camera className="w-5 h-5" />
          {status === 'scanning' ? 'Verifying...' : 'Verify My Identity'}
        </motion.button>

        <p className="text-slate-500 text-xs text-center mt-4">
          Your face data is processed locally and never stored or transmitted.
        </p>
      </motion.div>
    </div>
  );
};
