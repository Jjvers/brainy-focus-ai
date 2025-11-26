import { useRef, useState, useCallback, useEffect } from "react";
import * as faceapi from "face-api.js";

interface FaceAuthResult {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  isFaceDetected: boolean;
  descriptor: Float32Array | null;
}

export const useFaceAuth = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [result, setResult] = useState<FaceAuthResult>({
    isReady: false,
    isLoading: true,
    error: null,
    isFaceDetected: false,
    descriptor: null,
  });
  
  const modelsLoaded = useRef(false);

  // Load face-api models
  const loadModels = useCallback(async () => {
    if (modelsLoaded.current) return;
    
    try {
      setResult(prev => ({ ...prev, isLoading: true, error: null }));
      
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      
      modelsLoaded.current = true;
      setResult(prev => ({ ...prev, isReady: true, isLoading: false }));
    } catch (error) {
      console.error("Error loading face-api models:", error);
      setResult(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to load face detection models" 
      }));
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Capture face descriptor from video
  const captureFaceDescriptor = useCallback(async (): Promise<Float32Array | null> => {
    if (!videoRef.current || !modelsLoaded.current) return null;
    
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        setResult(prev => ({ 
          ...prev, 
          isFaceDetected: true, 
          descriptor: detection.descriptor 
        }));
        return detection.descriptor;
      } else {
        setResult(prev => ({ ...prev, isFaceDetected: false, descriptor: null }));
        return null;
      }
    } catch (error) {
      console.error("Error capturing face descriptor:", error);
      return null;
    }
  }, [videoRef]);

  // Compare two face descriptors
  const compareFaces = useCallback((
    descriptor1: Float32Array, 
    descriptor2: Float32Array,
    threshold: number = 0.5
  ): boolean => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < threshold;
  }, []);

  // Find matching face from array of descriptors
  const findMatchingFace = useCallback((
    descriptor: Float32Array,
    storedDescriptors: { descriptor: number[]; label: string }[],
    threshold: number = 0.5
  ): { matched: boolean; label: string | null; distance: number } => {
    let bestMatch = { matched: false, label: null as string | null, distance: Infinity };
    
    for (const stored of storedDescriptors) {
      const storedArray = new Float32Array(stored.descriptor);
      const distance = faceapi.euclideanDistance(descriptor, storedArray);
      
      if (distance < threshold && distance < bestMatch.distance) {
        bestMatch = { matched: true, label: stored.label, distance };
      }
    }
    
    return bestMatch;
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      return true;
    } catch (error) {
      console.error("Error starting camera:", error);
      setResult(prev => ({ ...prev, error: "Failed to access camera" }));
      return false;
    }
  }, [videoRef]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
  }, [videoRef]);

  return {
    ...result,
    loadModels,
    captureFaceDescriptor,
    compareFaces,
    findMatchingFace,
    startCamera,
    stopCamera,
  };
};
