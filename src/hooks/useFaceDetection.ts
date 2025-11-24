import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

interface FaceDetectionResult {
  isFaceDetected: boolean;
  gazeDirection: string;
  focusScore: number;
}

export const useFaceDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean
) => {
  const [result, setResult] = useState<FaceDetectionResult>({
    isFaceDetected: false,
    gazeDirection: "center",
    focusScore: 0,
  });
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const faceMesh = new FaceMesh({
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
        
        // Eye landmarks for precise eyeball tracking
        const leftEyeInner = landmarks[133];
        const leftEyeOuter = landmarks[33];
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const leftPupil = landmarks[468]; // Left iris center
        
        const rightEyeInner = landmarks[362];
        const rightEyeOuter = landmarks[263];
        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];
        const rightPupil = landmarks[473]; // Right iris center
        
        // Calculate eye centers (eye socket centers, not pupil)
        const leftEyeCenter = {
          x: (leftEyeInner.x + leftEyeOuter.x) / 2,
          y: (leftEyeTop.y + leftEyeBottom.y) / 2,
        };
        
        const rightEyeCenter = {
          x: (rightEyeInner.x + rightEyeOuter.x) / 2,
          y: (rightEyeTop.y + rightEyeBottom.y) / 2,
        };
        
        // Calculate pupil deviation from eye center (this is the actual gaze!)
        const leftGazeX = leftPupil.x - leftEyeCenter.x;
        const leftGazeY = leftPupil.y - leftEyeCenter.y;
        
        const rightGazeX = rightPupil.x - rightEyeCenter.x;
        const rightGazeY = rightPupil.y - rightEyeCenter.y;
        
        // Average both eyes for more stable gaze tracking
        const avgGazeX = (leftGazeX + rightGazeX) / 2;
        const avgGazeY = (leftGazeY + rightGazeY) / 2;
        
        // Calculate eye width for normalization
        const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
        const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x);
        const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
        
        // Normalize gaze by eye width (independent of face size/distance)
        const normalizedGazeX = avgGazeX / avgEyeWidth;
        const normalizedGazeY = avgGazeY / avgEyeWidth;
        
        // Eyeball tracking thresholds (much more sensitive than head tracking)
        const horizontalThreshold = 0.15; // Eyeball looking left/right
        const verticalThreshold = 0.15;   // Eyeball looking up/down
        
        let direction = "center";
        let score = 100;
        
        // Check horizontal eyeball gaze (left/right)
        if (Math.abs(normalizedGazeX) > horizontalThreshold) {
          direction = normalizedGazeX > 0 ? "right" : "left";
          const deviation = Math.abs(normalizedGazeX) - horizontalThreshold;
          score = Math.max(20, 100 - (deviation * 250));
        } 
        // Check vertical eyeball gaze (up/down)
        else if (Math.abs(normalizedGazeY) > verticalThreshold) {
          direction = normalizedGazeY > 0 ? "down" : "up";
          const deviation = Math.abs(normalizedGazeY) - verticalThreshold;
          score = Math.max(20, 100 - (deviation * 200));
        }
        // Eyes are centered - maximum focus
        else {
          direction = "center";
          score = 100;
        }
        
        // Additional stability bonus for consistent eye tracking
        const gazeStability = 1 - (Math.abs(normalizedGazeX) + Math.abs(normalizedGazeY)) / 2;
        if (gazeStability > 0.8) {
          score = Math.min(100, score + 5);
        }

        setResult({
          isFaceDetected: true,
          gazeDirection: direction,
          focusScore: Math.round(score),
        });

        // Draw face mesh
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 1;
        
        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            1,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      } else {
        setResult({
          isFaceDetected: false,
          gazeDirection: "unknown",
          focusScore: 0,
        });
      }

      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
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
    };
  }, [isActive, videoRef, canvasRef]);

  return result;
};