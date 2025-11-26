import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFaceAuth } from "@/hooks/useFaceAuth";
import { Camera, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface FaceRegistrationProps {
  onComplete: (descriptors: Float32Array[]) => void;
  onCancel: () => void;
  requiredCaptures?: number;
}

const FaceRegistration = ({ 
  onComplete, 
  onCancel, 
  requiredCaptures = 5 
}: FaceRegistrationProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<"idle" | "capturing" | "success" | "error">("idle");
  const [message, setMessage] = useState("Position your face in the frame");
  
  const { 
    isReady, 
    isLoading, 
    error, 
    captureFaceDescriptor, 
    startCamera, 
    stopCamera 
  } = useFaceAuth(videoRef);

  useEffect(() => {
    if (isReady) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isReady, startCamera, stopCamera]);

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setStatus("capturing");
    setMessage("Stay still... capturing face");
    
    const descriptor = await captureFaceDescriptor();
    
    if (descriptor) {
      const newDescriptors = [...capturedDescriptors, descriptor];
      setCapturedDescriptors(newDescriptors);
      
      if (newDescriptors.length >= requiredCaptures) {
        setStatus("success");
        setMessage("Face registration complete!");
        setTimeout(() => {
          onComplete(newDescriptors);
        }, 1000);
      } else {
        setStatus("idle");
        setMessage(`Captured ${newDescriptors.length}/${requiredCaptures}. Move your head slightly and capture again.`);
      }
    } else {
      setStatus("error");
      setMessage("Face not detected. Please position your face clearly in the frame.");
      setTimeout(() => setStatus("idle"), 2000);
    }
    
    setIsCapturing(false);
  };

  const handleReset = () => {
    setCapturedDescriptors([]);
    setStatus("idle");
    setMessage("Position your face in the frame");
  };

  const progress = (capturedDescriptors.length / requiredCaptures) * 100;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading face detection models...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button onClick={onCancel} variant="outline">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Face Registration
        </CardTitle>
        <CardDescription>
          Capture {requiredCaptures} photos of your face to enable face login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Feed */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover mirror"
            autoPlay
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
          />
          
          {/* Face Guide Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-48 h-56 border-4 rounded-full transition-colors duration-300 ${
              status === "capturing" ? "border-accent animate-pulse" :
              status === "success" ? "border-success" :
              status === "error" ? "border-destructive" :
              "border-primary/50"
            }`} />
          </div>
          
          {/* Status Badge */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium ${
            status === "success" ? "bg-success text-white" :
            status === "error" ? "bg-destructive text-white" :
            status === "capturing" ? "bg-accent text-white" :
            "bg-background/80 text-foreground"
          }`}>
            {status === "capturing" && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
            {status === "success" && <CheckCircle className="w-4 h-4 inline mr-2" />}
            {status === "error" && <AlertCircle className="w-4 h-4 inline mr-2" />}
            {message}
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{capturedDescriptors.length}/{requiredCaptures}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleCapture} 
            disabled={isCapturing || status === "success"}
            className="flex-1"
            size="lg"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Capture ({capturedDescriptors.length}/{requiredCaptures})
              </>
            )}
          </Button>
          
          {capturedDescriptors.length > 0 && status !== "success" && (
            <Button onClick={handleReset} variant="outline" size="lg">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <Button onClick={onCancel} variant="ghost" className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
};

export default FaceRegistration;
