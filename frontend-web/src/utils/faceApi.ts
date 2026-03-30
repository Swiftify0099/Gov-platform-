// Face API utilities using face-api.js

export interface FaceMatchResult {
  matched: boolean;
  similarity: number;
  reason?: string;
}

/**
 * Load face-api.js models from /models directory
 */
export const loadFaceApiModels = async (): Promise<void> => {
  const faceapi = await import('@vladmandic/face-api');
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
  ]);
};

/**
 * Detect faces in a video element and return count
 */
export const detectFaceCount = async (videoElement: HTMLVideoElement): Promise<number> => {
  const faceapi = await import('@vladmandic/face-api');
  const detections = await faceapi.detectAllFaces(
    videoElement,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
  );
  return detections.length;
};

/**
 * Compare faces between live video and reference image
 */
export const compareFaces = async (
  videoElement: HTMLVideoElement,
  referenceImageUrl: string,
  threshold = 0.6
): Promise<FaceMatchResult> => {
  const faceapi = await import('@vladmandic/face-api');

  const liveDetection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!liveDetection) {
    return { matched: false, similarity: 0, reason: 'no_face' };
  }

  const refImg = await faceapi.fetchImage(referenceImageUrl);
  const refDetection = await faceapi
    .detectSingleFace(refImg, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!refDetection) {
    return { matched: false, similarity: 0, reason: 'no_reference_face' };
  }

  const distance = faceapi.euclideanDistance(liveDetection.descriptor, refDetection.descriptor);
  const similarity = 1 - distance;

  return {
    matched: similarity >= threshold,
    similarity,
    reason: similarity < threshold ? 'face_mismatch' : undefined,
  };
};
