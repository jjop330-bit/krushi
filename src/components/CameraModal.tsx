import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ZapOff,
  Maximize2,
  Minimize2,
  HelpCircle,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';

export type CameraLifecycleState = 
  | 'INITIALIZING' 
  | 'READY' 
  | 'CAPTURING' 
  | 'ERROR';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  lang: 'or' | 'en';
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  lang
}) => {
  const [lifecycleState, setLifecycleState] = useState<CameraLifecycleState>('INITIALIZING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const isCapturingRef = useRef<boolean>(false);

  const t = ODIA_TRANSLATIONS[lang];

  // Completely stop all active stream tracks and release hardware
  const stopCameraTracks = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  // Initialize WebRTC stream with mobile-friendly constraints
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setLifecycleState('INITIALIZING');
    setErrorMessage(null);

    stopCameraTracks();

    // Mobile-optimized constraints: 720p ideal, 24-30fps capped to eliminate lag & memory bloat
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: mode },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 24, max: 30 }
      },
      audio: false
    };

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback constraint if strict resolution rejected by hardware
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false
        });
      }

      activeStreamRef.current = stream;

      // Inspect track capabilities (Torch / Flash support)
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track as any).getCapabilities ? (track as any).getCapabilities() : {};
          setHasTorch(Boolean(capabilities.torch));
        } catch {
          setHasTorch(false);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setLifecycleState('READY');
            }).catch((err) => {
              console.warn('Auto-play blocked, retrying:', err);
              setLifecycleState('READY');
            });
          }
        };
      } else {
        setLifecycleState('READY');
      }

      // Check if device has multiple cameras (front + rear)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        setHasMultipleCameras(true);
      }

    } catch (err: any) {
      console.error('Camera access error:', err);
      setLifecycleState('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          lang === 'or'
            ? 'କ୍ୟାମେରା ଅନୁମତି ମିଳିଲା ନାହିଁ। ଦୟାକରି ବ୍ରାଉଜର୍ ସେଟିଂସରୁ କ୍ୟାମେରା ଅନୁମତି ଦିଅନ୍ତୁ।'
            : 'Camera permission denied. Please allow camera access in your browser site permissions.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage(
          lang === 'or'
            ? 'ଡିଭାଇସ୍‌ରେ କୌଣସି କ୍ୟାମେରା ମିଳିଲା ନାହିଁ।'
            : 'No camera hardware found on this device.'
        );
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage(
          lang === 'or'
            ? 'କ୍ୟାମେରା ବର୍ତ୍ତମାନ ଅନ୍ୟ ଏକ ଆପ୍ ଦ୍ୱାରା ବ୍ୟବହୃତ ହେଉଛି। ଦୟାକରି ଅନ୍ୟ ଆପ୍ ବନ୍ଦ କରନ୍ତୁ।'
            : 'Camera is currently locked or in use by another application. Please close other camera apps.'
        );
      } else {
        setErrorMessage(
          err.message || (lang === 'or' ? 'କ୍ୟାମେରା ଖୋଲିବାରେ ତ୍ରୁଟି।' : 'Failed to initialize camera viewfinder.')
        );
      }
    }
  }, [lang, stopCameraTracks]);

  // Launch camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCameraTracks();
      setLifecycleState('INITIALIZING');
      setErrorMessage(null);
    }

    return () => {
      stopCameraTracks();
    };
  }, [isOpen, facingMode, startCamera, stopCameraTracks]);

  // Flip camera (Rear <-> Front)
  const handleToggleLens = () => {
    if (lifecycleState === 'CAPTURING') return;
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Toggle Torch/Flash
  const handleToggleTorch = async () => {
    if (!activeStreamRef.current || !hasTorch) return;
    const track = activeStreamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch control failed:', err);
    }
  };

  // High-performance single-shot capture
  const handleCaptureSnapshot = () => {
    if (isCapturingRef.current || !videoRef.current || lifecycleState !== 'READY') {
      return;
    }

    isCapturingRef.current = true;
    setIsCapturing(true);
    setLifecycleState('CAPTURING');

    // Haptic feedback for tactile shutter sensation
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }

    const video = videoRef.current;
    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;

    // Dimension capping (max 1280px) to prevent memory spikes
    const maxDim = 1280;
    let targetWidth = videoWidth;
    let targetHeight = videoHeight;

    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
        targetHeight = maxDim;
      }
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      isCapturingRef.current = false;
      setIsCapturing(false);
      setLifecycleState('READY');
      return;
    }

    // Unmirrored natural capture for rear camera; mirror only front selfie lens
    if (facingMode === 'user') {
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // High quality JPEG (0.88) preserving microscopic insect hairs and venation
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    // Stop tracks immediately to free hardware
    stopCameraTracks();

    // Deliver image
    onCapture(dataUrl);
    isCapturingRef.current = false;
    setIsCapturing(false);
    onClose();
  };

  // Fallback native mobile file capture (environment lens)
  const handleFallbackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        stopCameraTracks();
        onCapture(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none">
      {/* Top App Bar */}
      <div className="flex items-center justify-between text-white z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-lime-300">
            {lang === 'or' ? 'ଲାଇଭ୍ କୀଟ ସ୍କାନର' : 'Live Camera Viewfinder'}
          </span>
          <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-white/10 font-mono">
            {facingMode === 'environment' ? 'Rear Lens (1x)' : 'Front Lens'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {hasTorch && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-colors flex items-center justify-center ${
                isTorchOn ? 'bg-amber-400 text-black' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={lang === 'or' ? 'ଫ୍ଲାସ୍‌ଲାଇଟ୍' : 'Toggle Torch'}
            >
              {isTorchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          {hasMultipleCameras && (
            <button
              type="button"
              onClick={handleToggleLens}
              disabled={lifecycleState === 'CAPTURING'}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center"
              title={lang === 'or' ? 'କ୍ୟାମେରା ବଦଳାନ୍ତୁ' : 'Switch Camera'}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              stopCameraTracks();
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/15 hover:bg-rose-600 text-white transition-colors flex items-center justify-center"
            title={lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Close Camera'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="relative flex-1 my-3 rounded-3xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-2xl">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
          }}
        />

        {/* Framing Guide Reticle */}
        {lifecycleState === 'READY' && (
          <div className="absolute inset-8 sm:inset-16 pointer-events-none border-2 border-dashed border-lime-400/60 rounded-3xl flex flex-col justify-between p-4">
            <div className="flex justify-between items-start">
              <span className="w-4 h-4 border-t-2 border-l-2 border-lime-400" />
              <span className="w-4 h-4 border-t-2 border-r-2 border-lime-400" />
            </div>
            <div className="text-center">
              <span className="bg-black/60 text-lime-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                {lang === 'or' ? 'ପୋକ ବା ଆକ୍ରାନ୍ତ ପତ୍ରକୁ ମଝିରେ ରଖନ୍ତୁ' : 'Center insect or damaged leaf inside box'}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="w-4 h-4 border-b-2 border-l-2 border-lime-400" />
              <span className="w-4 h-4 border-b-2 border-r-2 border-lime-400" />
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {lifecycleState === 'INITIALIZING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 text-white">
            <div className="w-12 h-12 rounded-full border-4 border-lime-400 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-lime-300">
              {lang === 'or' ? 'କ୍ୟାମେରା ଆରମ୍ଭ ହେଉଛି...' : 'Initializing camera stream...'}
            </p>
          </div>
        )}

        {/* Error State with Native Fallback */}
        {lifecycleState === 'ERROR' && (
          <div className="absolute inset-4 sm:inset-12 bg-slate-900/95 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 text-white border border-rose-500/30">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <div className="max-w-md space-y-1">
              <h4 className="font-extrabold text-base text-rose-300">
                {lang === 'or' ? 'କ୍ୟାମେରା ତ୍ରୁଟି' : 'Camera Access Alert'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'or' ? 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ' : 'Retry Camera'}</span>
              </button>

              <label className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>{lang === 'or' ? 'ମୋବାଇଲ୍ ସିଷ୍ଟମ୍ କ୍ୟାମେରା' : 'Use System Camera'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFallbackFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter Action Bar */}
      <div className="flex items-center justify-around py-3 px-4 z-20">
        {/* Native gallery button fallback */}
        <label className="min-h-[44px] min-w-[44px] p-3 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors" title={lang === 'or' ? 'ଗ୍ୟାଲେରୀ' : 'Gallery'}>
          <Upload className="w-5 h-5" />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFallbackFileSelect}
            className="hidden"
          />
        </label>

        {/* Primary Shutter Trigger */}
        <button
          type="button"
          onClick={handleCaptureSnapshot}
          disabled={lifecycleState !== 'READY' || isCapturing}
          className={`min-h-[72px] min-w-[72px] rounded-full p-1.5 border-4 transition-all flex items-center justify-center shadow-xl ${
            lifecycleState === 'READY'
              ? 'border-lime-400 bg-white/20 hover:scale-105 active:scale-95 cursor-pointer'
              : 'border-slate-600 bg-transparent opacity-50 cursor-not-allowed'
          }`}
          title={lang === 'or' ? 'ଫଟୋ ଉଠାନ୍ତୁ' : 'Capture Photograph'}
        >
          <div className="w-full h-full rounded-full bg-lime-400 flex items-center justify-center shadow-inner">
            <Camera className="w-7 h-7 text-agri-950" />
          </div>
        </button>

        {/* Lens switch shortcut */}
        <button
          type="button"
          onClick={handleToggleLens}
          disabled={lifecycleState === 'CAPTURING'}
          className="min-h-[44px] min-w-[44px] p-3 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          title={lang === 'or' ? 'କ୍ୟାମେରା ବଦଳାନ୍ତୁ' : 'Switch Camera'}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden off-screen canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
