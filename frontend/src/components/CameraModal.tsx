import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  SwitchCamera, 
  RefreshCw, 
  X, 
  AlertCircle, 
  Upload, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUri: string) => void;
  lang: 'or' | 'en';
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  lang
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorType, setErrorType] = useState<'denied' | 'not_found' | 'busy' | 'insecure' | 'unsupported' | 'general' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  }, [stream]);

  // Query video devices for camera switching
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
    } catch {
      // Ignore device enumeration failure
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setErrorType(null);
    setErrorMessage('');

    // Check secure context
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost) {
        setIsInitializing(false);
        setErrorType('insecure');
        setErrorMessage(lang === 'or' 
          ? 'ଲାଇଭ୍ କ୍ୟାମେରା ବ୍ୟବହାର ପାଇଁ ଏକ ସୁରକ୍ଷିତ ସଂଯୋଗ (HTTPS) ଆବଶ୍ୟକ। ଦୟାକରି ତଳେ ଥିବା ଫାଇଲ୍ ଅପଲୋଡ୍ ବଟନ୍ ବ୍ୟବହାର କରନ୍ତୁ।' 
          : 'Live camera streaming requires a secure HTTPS context or localhost. Please use the file upload option below or access via HTTPS.');
        return;
      }
    }

    // Check API support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsInitializing(false);
      setErrorType('unsupported');
      setErrorMessage(lang === 'or'
        ? 'ଆପଣଙ୍କର ବ୍ରାଉଜର୍ ଲାଇଭ୍ କ୍ୟାମେରା API କୁ ସମର୍ଥନ କରୁନାହିଁ। ଦୟାକରି ଫାଇଲ୍ ଅପଲୋଡ୍ ବଟନ୍ ବ୍ୟବହାର କରନ୍ତୁ।'
        : 'Your browser does not support the WebRTC MediaDevices API. Please use the native file upload option.');
      return;
    }

    // Stop existing stream first to avoid dual-lock
    stopCameraStream();

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 }
            }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      setIsInitializing(false);
      await refreshDevices();
    } catch (err: any) {
      setIsInitializing(false);
      const name = err.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorType('denied');
        setErrorMessage(lang === 'or'
          ? 'କ୍ୟାମେରା ଅନୁମତି ଅସ୍ୱୀକାର କରାଯାଇଛି। ଦୟାକରି ଆପଣଙ୍କର ବ୍ରାଉଜର୍ ସାଇଟ୍ ସେଟିଙ୍ଗ୍‌ରେ କ୍ୟାମେରା ଅନୁମତି (Allow) ଦିଅନ୍ତୁ ଏବଂ "ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ" ରେ କ୍ଲିକ୍ କରନ୍ତୁ।'
          : 'Camera permission denied. Please allow camera access in your browser site permissions and click "Try Again", or use the native file picker.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorType('not_found');
        setErrorMessage(lang === 'or'
          ? 'ଏହି ଡିଭାଇସ୍‌ରେ କୌଣସି କ୍ୟାମେରା ମିଳିଲା ନାହିଁ। ଦୟାକରି ଗ୍ୟାଲେରୀରୁ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।'
          : 'No camera hardware found on this device. Please upload an image from your gallery.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setErrorType('busy');
        setErrorMessage(lang === 'or'
          ? 'କ୍ୟାମେରା ବର୍ତ୍ତମାନ ଅନ୍ୟ ଏକ ଆପ୍ ବା ବ୍ରାଉଜର୍ ଟ୍ୟାବ୍ ଦ୍ୱାରା ବ୍ୟବହୃତ ହେଉଛି। ଦୟାକରି ଅନ୍ୟ ଆପ୍ ବନ୍ଦ କରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।'
          : 'The camera is currently in use by another application or tab. Please close other camera apps and retry.');
      } else {
        setErrorType('general');
        setErrorMessage(lang === 'or'
          ? `କ୍ୟାମେରା ଖୋଲିବାରେ ତ୍ରୁଟି: ${err.message || 'ଅଜ୍ଞାତ ତ୍ରୁଟି'}`
          : `Failed to access camera: ${err.message || 'Unknown device error'}`);
      }
    }
  }, [facingMode, selectedDeviceId, lang, refreshDevices, stopCameraStream]);

  // Start camera on modal open
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  // Toggle between front and rear cameras
  const toggleFacingMode = () => {
    setSelectedDeviceId('');
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from active video stream
  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight || video.paused) {
      return;
    }

    setIsCapturing(true);

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCapturing(false);
        return;
      }

      // If user camera, mirror it horizontally so capture matches preview
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.90);

      // Clean up stream immediately
      stopCameraStream();
      setIsCapturing(false);

      // Deliver to parent
      onCapture(capturedDataUrl);
      onClose();
    } catch {
      setIsCapturing(false);
    }
  };

  // Fallback handler for native file input capture
  const handleNativeFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      stopCameraStream();
      onCapture(dataUrl);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700 text-white">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-lime-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              {lang === 'or' ? 'ଲାଇଭ୍ କ୍ୟାମେରା ସ୍କାନର' : 'Live Camera Viewfinder'}
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium hidden sm:inline-block">
              {facingMode === 'environment' 
                ? (lang === 'or' ? 'ପଛ କ୍ୟାମେରା (Rear)' : 'Rear Lens') 
                : (lang === 'or' ? 'ଆଗ କ୍ୟାମେରା (Front)' : 'Front Lens')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {videoDevices.length > 1 && !errorType && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors focus:ring-2 focus:ring-lime-400"
                title={lang === 'or' ? 'କ୍ୟାମେରା ବଦଳାନ୍ତୁ' : 'Flip Camera'}
                aria-label="Flip Camera"
              >
                <SwitchCamera className="w-4 h-4 text-lime-400" />
                <span className="hidden sm:inline">{lang === 'or' ? 'ବଦଳାନ୍ତୁ' : 'Flip'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors flex items-center justify-center focus:ring-2 focus:ring-lime-400"
              aria-label="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] sm:min-h-[420px] overflow-hidden">
          
          {/* Live Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full max-h-[60vh] object-contain transition-transform duration-200 ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />

          {/* Offscreen Canvas for Frame Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Framing Target Overlay (Aids farmer centering the insect) */}
          {!errorType && !isInitializing && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-lime-400/70 rounded-3xl flex flex-col justify-between p-3 animate-pulse">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-2 border-l-2 border-lime-400"></span>
                  <span className="w-4 h-4 border-t-2 border-r-2 border-lime-400"></span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-lime-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {lang === 'or' ? 'ପୋକକୁ ଏଠାରେ କେନ୍ଦ୍ରୀଭୂତ କରନ୍ତୁ' : 'Center insect inside frame'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-2 border-l-2 border-lime-400"></span>
                  <span className="w-4 h-4 border-b-2 border-r-2 border-lime-400"></span>
                </div>
              </div>
            </div>
          )}

          {/* Initializing Spinner */}
          {isInitializing && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center space-y-3 text-white p-6 text-center">
              <RefreshCw className="w-8 h-8 text-lime-400 animate-spin" />
              <p className="text-sm font-bold">
                {lang === 'or' ? 'କ୍ୟାମେରା ସଂଯୋଗ ହେଉଛି...' : 'Connecting to camera hardware...'}
              </p>
            </div>
          )}

          {/* Flash Effect on Snapshot */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white animate-fadeOut z-20 pointer-events-none" />
          )}

          {/* Error & Recovery Screen */}
          {errorType && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-4 text-white z-10">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                {errorType === 'denied' ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : (
                  <CameraOff className="w-8 h-8" />
                )}
              </div>

              <div className="max-w-md space-y-1.5">
                <h4 className="text-base font-extrabold text-rose-300">
                  {errorType === 'denied' && (lang === 'or' ? 'କ୍ୟାମେରା ଅନୁମତି ଆବଶ୍ୟକ' : 'Camera Permission Required')}
                  {errorType === 'not_found' && (lang === 'or' ? 'କୌଣସି କ୍ୟାମେରା ମିଳିଲା ନାହିଁ' : 'Camera Not Detected')}
                  {errorType === 'busy' && (lang === 'or' ? 'କ୍ୟାମେରା ବ୍ୟସ୍ତ ଅଛି' : 'Camera Device Busy')}
                  {errorType === 'insecure' && (lang === 'or' ? 'ସୁରକ୍ଷିତ ସଂଯୋଗ ଆବଶ୍ୟକ' : 'HTTPS Required')}
                  {(errorType === 'unsupported' || errorType === 'general') && (lang === 'or' ? 'କ୍ୟାମେରା ତ୍ରୁଟି' : 'Camera Access Error')}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              {/* Action Buttons in Error State */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-sm justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{lang === 'or' ? 'ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ' : 'Try Again'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-slate-600 transition-colors"
                >
                  <Upload className="w-4 h-4 text-lime-400" />
                  <span>{lang === 'or' ? 'ଫାଇଲ୍ / ଗ୍ୟାଲେରୀରୁ ନିଅନ୍ତୁ' : 'Use Native File Picker'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Capture Controls */}
        <div className="px-6 py-4 bg-slate-800/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <p className="font-medium">
              {lang === 'or' ? 'ହାତ ସ୍ଥିର ରଖନ୍ତୁ ଓ ସ୍ପଷ୍ଟ ଆଲୋକରେ ଫଟୋ ନିଅନ୍ତୁ' : 'Hold device steady with good natural illumination.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
            {/* Native OS camera fallback trigger */}
            <input 
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleNativeFileFallback}
              className="hidden"
            />

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-colors"
            >
              {lang === 'or' ? 'ବାତିଲ କରନ୍ତୁ' : 'Cancel'}
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              disabled={Boolean(errorType) || isInitializing}
              onClick={handleCaptureFrame}
              className={`min-h-[44px] min-w-[140px] px-6 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
                errorType || isInitializing
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  : 'bg-lime-500 hover:bg-lime-400 text-slate-950 active:scale-95 shadow-lime-500/30'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'or' ? 'ଫଟୋ ଉଠାନ୍ତୁ' : 'Take Photo'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
