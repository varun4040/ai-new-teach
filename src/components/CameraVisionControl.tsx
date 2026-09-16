import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Eye, ShieldCheck, RefreshCw } from 'lucide-react';

interface CameraVisionControlProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onFrameCaptured?: (base64Image: string) => void;
}

export const CameraVisionControl: React.FC<CameraVisionControlProps> = ({
  isCameraActive,
  onToggleCamera,
  onFrameCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: any = null;

    if (isCameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setError(null);

          // Stream video frames at ~1 frame per second to Gemini Live
          intervalId = setInterval(() => {
            captureAndSendFrame();
          }, 1000);
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setError('Camera permission denied or camera unavailable.');
          onToggleCamera();
        });
    } else {
      stopCamera();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      stopCamera();
    };
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !streamRef.current || !onFrameCaptured) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64Data = dataUrl.split(',')[1];
        if (base64Data) {
          onFrameCaptured(base64Data);
        }
      }
    } catch (e) {
      console.error('Frame capture error:', e);
    }
  };

  return (
    <div className="relative">
      {isCameraActive ? (
        <div className="relative flex flex-col items-center bg-white border border-gray-200 rounded-2xl overflow-hidden p-2 shadow-xs">
          <div className="relative w-44 h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute top-1 left-1 flex items-center gap-1 bg-[#FF6321] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              LIVE VISION
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 w-full">
            <button
              onClick={captureAndSendFrame}
              className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              Show Notebook
            </button>
            <button
              onClick={onToggleCamera}
              className="p-1.5 text-gray-500 hover:text-gray-800 bg-[#F3F7F5] rounded-xl border border-gray-200"
              title="Turn Camera Off"
            >
              <CameraOff className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            id="toggle-camera-btn"
            onClick={onToggleCamera}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FDF2F2] hover:bg-red-50 border border-red-100 text-[#E53E3E] text-xs font-semibold rounded-2xl transition-all cursor-pointer shadow-xs"
          >
            <Camera className="w-4 h-4 text-[#E53E3E]" />
            <span>Enable Camera</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#5A5A40] bg-[#E8F3EF] px-2.5 py-1 rounded-xl border border-[#C8DCD1]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Off by default</span>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};
