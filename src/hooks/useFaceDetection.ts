import { useEffect, useRef, useState, useCallback } from "react";
import * as FaceMeshModule from "@mediapipe/face_mesh";
import * as CameraModule from "@mediapipe/camera_utils";

interface FaceDetectionResult {
  isFaceDetected: boolean;
  gazeDirection: string;
  focusScore: number;
  distractionType: string | null;
}

// Smoothing buffer for focus scores to reduce jitter
const SMOOTHING_BUFFER_SIZE = 5;

export const useFaceDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean
) => {
  const [result, setResult] = useState<FaceDetectionResult>({
    isFaceDetected: false,
    gazeDirection: "center",
    focusScore: 0,
    distractionType: null,
  });
  const faceMeshRef = useRef<FaceMeshModule.FaceMesh | null>(null);
  const cameraRef = useRef<CameraModule.Camera | null>(null);
  const scoreBuffer = useRef<number[]>([]);
  const lastGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stableFrameCount = useRef(0);

  // Smooth the score to reduce jitter
  const smoothScore = useCallback((newScore: number): number => {
    scoreBuffer.current.push(newScore);
    if (scoreBuffer.current.length > SMOOTHING_BUFFER_SIZE) {
      scoreBuffer.current.shift();
    }
    const avg = scoreBuffer.current.reduce((a, b) => a + b, 0) / scoreBuffer.current.length;
    return Math.round(avg);
  }, []);

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    // Reset buffer when session starts
    scoreBuffer.current = [];
    stableFrameCount.current = 0;

    const faceMesh = new FaceMeshModule.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Key facial landmarks for better tracking
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];
        const chin = landmarks[152];
        const foreheadCenter = landmarks[10];
        
        // Left eye iris landmarks for pupil tracking
        const leftIrisCenter = landmarks[468]; // Left iris center
        const rightIrisCenter = landmarks[473]; // Right iris center
        
        // Eye corner landmarks for calculating eye gaze
        const leftEyeInner = landmarks[133];
        const leftEyeOuter = landmarks[33];
        const rightEyeInner = landmarks[362];
        const rightEyeOuter = landmarks[263];
        
        // Calculate iris position relative to eye (for actual eye gaze)
        const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
        const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x);
        
        // Iris offset from eye center (normalized)
        const leftIrisOffset = (leftIrisCenter.x - (leftEyeInner.x + leftEyeOuter.x) / 2) / leftEyeWidth;
        const rightIrisOffset = (rightIrisCenter.x - (rightEyeInner.x + rightEyeOuter.x) / 2) / rightEyeWidth;
        const avgIrisOffset = (leftIrisOffset + rightIrisOffset) / 2;
        
        // Calculate face center and eye center for head pose
        const eyeCenter = {
          x: (leftEye.x + rightEye.x) / 2,
          y: (leftEye.y + rightEye.y) / 2,
        };

        // Calculate head pose angles (head movement)
        const headGazeX = noseTip.x - eyeCenter.x;
        const headGazeY = noseTip.y - eyeCenter.y;
        
        // Calculate face tilt (vertical alignment)
        const faceHeight = Math.abs(foreheadCenter.y - chin.y);
        const faceCenterX = (leftEye.x + rightEye.x + noseTip.x) / 3;
        const verticalAlignment = Math.abs(noseTip.x - faceCenterX);
        
        // Combine head pose and eye gaze for better accuracy
        const combinedGazeX = headGazeX + avgIrisOffset * 0.3; // Weight iris offset less than head pose
        
        // Apply smoothing to gaze detection to reduce jitter
        const smoothingFactor = 0.6;
        const smoothedGazeX = lastGazeRef.current.x * smoothingFactor + combinedGazeX * (1 - smoothingFactor);
        const smoothedGazeY = lastGazeRef.current.y * smoothingFactor + headGazeY * (1 - smoothingFactor);
        lastGazeRef.current = { x: smoothedGazeX, y: smoothedGazeY };
        
        // More balanced thresholds - not too sensitive, not too lenient
        // These thresholds account for natural micro-movements during studying
        const horizontalThreshold = 0.045; // Looking left/right - balanced
        const verticalThreshold = 0.055;   // Looking up/down - balanced
        const tiltThreshold = 0.06;        // Head tilt tolerance - balanced
        const phoneThreshold = 0.095;      // Looking down at phone (more obvious)
        const extremeThreshold = 0.12;     // Very obvious distraction
        
        let direction = "center";
        let rawScore = 100;
        let distraction: string | null = null;
        
        // Check for very obvious phone usage (looking down significantly)
        if (smoothedGazeY > phoneThreshold) {
          direction = "down";
          distraction = "looking_down_phone";
          const deviation = smoothedGazeY - phoneThreshold;
          rawScore = Math.max(15, 100 - (deviation * 600));
        }
        // Check for extreme horizontal gaze (clearly looking away)
        else if (Math.abs(smoothedGazeX) > extremeThreshold) {
          direction = smoothedGazeX > 0 ? "right" : "left";
          distraction = smoothedGazeX > 0 ? "looking_away_right" : "looking_away_left";
          const deviation = Math.abs(smoothedGazeX) - extremeThreshold;
          rawScore = Math.max(20, 100 - (deviation * 700));
        }
        // Check moderate horizontal gaze (might be looking at something)
        else if (Math.abs(smoothedGazeX) > horizontalThreshold) {
          direction = smoothedGazeX > 0 ? "right" : "left";
          // Only mark as distraction if significantly off-center
          if (Math.abs(smoothedGazeX) > horizontalThreshold * 1.5) {
            distraction = smoothedGazeX > 0 ? "looking_away_right" : "looking_away_left";
          }
          const deviation = Math.abs(smoothedGazeX) - horizontalThreshold;
          rawScore = Math.max(50, 100 - (deviation * 400));
        } 
        // Check vertical gaze (up/down)
        else if (Math.abs(smoothedGazeY) > verticalThreshold) {
          direction = smoothedGazeY > 0 ? "down" : "up";
          // Only mark as distraction if significantly off
          if (Math.abs(smoothedGazeY) > verticalThreshold * 1.4) {
            distraction = smoothedGazeY > 0 ? "looking_down" : "looking_up";
          }
          const deviation = Math.abs(smoothedGazeY) - verticalThreshold;
          rawScore = Math.max(55, 100 - (deviation * 350));
        }
        // Check head tilt (only if significant)
        else if (verticalAlignment > tiltThreshold) {
          direction = "tilted";
          if (verticalAlignment > tiltThreshold * 1.5) {
            distraction = "head_tilted";
          }
          rawScore = Math.max(65, 100 - (verticalAlignment * 400));
        }
        // Face is properly aligned - fully focused
        else {
          direction = "center";
          distraction = null;
          rawScore = 100;
          stableFrameCount.current++;
        }
        
        // Bonus for sustained focus (reward stability)
        if (direction === "center" && stableFrameCount.current > 10) {
          rawScore = Math.min(100, rawScore + 5);
        } else if (direction !== "center") {
          stableFrameCount.current = Math.max(0, stableFrameCount.current - 2);
        }
        
        // Bonus for good face positioning
        if (faceHeight > 0.25 && faceHeight < 0.65) {
          rawScore = Math.min(100, rawScore + 3);
        }

        // Apply smoothing to final score
        const smoothedScore = smoothScore(rawScore);

        setResult({
          isFaceDetected: true,
          gazeDirection: direction,
          focusScore: smoothedScore,
          distractionType: distraction,
        });

        // Draw face mesh with status color
        const meshColor = smoothedScore >= 70 ? "#22c55e" : smoothedScore >= 40 ? "#f59e0b" : "#ef4444";
        ctx.fillStyle = meshColor;
        ctx.strokeStyle = meshColor;
        ctx.lineWidth = 1;
        
        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            1.5,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      } else {
        // Face not detected - but don't immediately mark as distraction
        // Give a small grace period
        setResult({
          isFaceDetected: false,
          gazeDirection: "unknown",
          focusScore: smoothScore(0),
          distractionType: "face_not_detected",
        });
        stableFrameCount.current = 0;
      }

      ctx.restore();
    });

    const camera = new CameraModule.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    faceMeshRef.current = faceMesh;
    cameraRef.current = camera;

    camera.start();

    return () => {
      camera.stop();
      faceMesh.close();
      scoreBuffer.current = [];
      stableFrameCount.current = 0;
    };
  }, [isActive, videoRef, canvasRef, smoothScore]);

  return result;
};