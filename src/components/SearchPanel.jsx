import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertCircle, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import FaceScanner from './FaceScanner';
import KvkkModal from './KvkkModal';

export default function SearchPanel({ onSearch, faceApi, photos }) {
  const [step, setStep] = useState(1); // 1: Selfie, 2: KVKK Onayı
  const [selfie, setSelfie] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [shutterFlash, setShutterFlash] = useState(false);
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef(null);

  // Initialize camera in Step 1, stop in other steps
  useEffect(() => {
    if (step === 1) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    setCameraError('');
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user'
        },
        audio: false
      });
      setCameraStream(stream);
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Kameraya erişilemedi. Lütfen tarayıcınızın adres çubuğundaki kilit simgesinden kamera izni verdiğinizden emin olun.');
    }
  };

  // Bind camera stream to video element when it mounts/remounts (e.g. after step changes)
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      try {
        videoRef.current.srcObject = cameraStream;
        // Explicitly play video to ensure playback starts on all devices
        videoRef.current.play().catch(e => console.error("Webcam play failed:", e));
      } catch (err) {
        console.error("Failed to bind stream to video element:", err);
      }
    }
  }, [cameraStream, step]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setVideoReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      console.warn("capturePhoto called but videoRef.current is null");
      return;
    }
    
    try {
      const video = videoRef.current;
      
      // Check readyState
      if (video.readyState < 2) {
        console.warn("Video readyState is not ready:", video.readyState);
      }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Fallback width/height if dimensions are 0 (e.g. metadata not fully loaded but video is streaming)
      const canvasWidth = videoWidth || 640;
      const canvasHeight = videoHeight || 480;

      // Shutter flash visual feedback
      setShutterFlash(true);
      setTimeout(() => setShutterFlash(false), 300);

      const canvas = document.createElement('canvas');
      // We crop the center square to match the visual preview
      const size = Math.min(canvasWidth, canvasHeight);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Horizontal mirror is NOT applied to canvas drawing so that the captured selfie matches
      // the real orientation (un-mirrored) of the event photos for proper face recognition matching.
      
      // Calculate center crop start coordinates
      const sx = (canvasWidth - size) / 2;
      const sy = (canvasHeight - size) / 2;
      
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      stopCamera();
      setSelfie(dataUrl);
      setStep(2); // Proceed to step 2 KVKK consent
    } catch (err) {
      console.error("Fotoğraf çekilirken hata oluştu:", err);
      alert("Fotoğraf çekilirken bir hata oluştu. Lütfen kameranın tamamen yüklendiğinden emin olup tekrar deneyin. Detay: " + err.message);
    }
  };

  const handleKvkkAccept = () => {
    setStep(3); // Start scanning
  };

  const handleScanComplete = () => {
    onSearch(selfie);
  };

  const resetToStep1 = () => {
    setSelfie(null);
    setVideoReady(false);
    setStep(1);
  };

  return (
    <div className="mx-auto max-w-xs space-y-3 animate-slide-up">
      {/* Search Header Card */}
      {step === 1 && (
        <div className="glass p-4 text-center relative overflow-hidden">
          <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-[var(--color-secondary-glow)] blur-3xl" />
          <span className="badge badge-glow-purple mb-1 text-[10px]">Adım 1</span>
          <h2 className="text-base font-extrabold text-white">Fotoğrafınızı Çekin</h2>
          <p className="mx-auto mt-1 max-w-xs text-[var(--text-secondary)] text-[10px]">
            Kameranıza bakarak yüzünüzün net çıktığı bir selfie çekin.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="glass p-4 text-center relative overflow-hidden">
          <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <span className="badge badge-glow-cyan mb-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Adım 2</span>
          <h2 className="text-base font-extrabold text-white">KVKK Açık Rıza</h2>
          <p className="mx-auto mt-1 max-w-xs text-[var(--text-secondary)] text-[10px]">
            Taramaya başlamadan önce KVKK koşullarını onaylayın.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="glass p-4 text-center relative overflow-hidden">
          <span className="badge badge-glow-purple mb-1 text-[10px]">Analiz</span>
          <h2 className="text-base font-extrabold text-white">Biyometrik Tarama</h2>
          <p className="mx-auto mt-1 max-w-xs text-[var(--text-secondary)] text-[10px]">
            Fotoğrafınız modeller tarafından karşılaştırılıyor.
          </p>
        </div>
      )}

      {/* Main Container Card */}
      <div className="glass-card overflow-hidden p-4 relative">
        
        {/* STEP 1: CAM CAPTURE */}
        {step === 1 && (
          <div className="min-h-[180px] flex flex-col justify-center animate-slide-up">
            <div className="flex flex-col items-center justify-center space-y-3">
              {cameraError ? (
                <div className="text-center p-3 space-y-2">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] max-w-xs leading-normal">
                    {cameraError}
                  </p>
                  <button onClick={startCamera} className="btn btn-outline py-1 px-3 text-[10px]">
                    Tekrar Dene
                  </button>
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  {/* Shutter Flash Animation Overlay */}
                  {shutterFlash && <div className="shutter-flash rounded-2xl" />}
                  
                  {/* Camera viewport (SQUARE & CENTERED - VERY COMPACT) */}
                  <div className="relative h-36 w-36 overflow-hidden rounded-2xl border-4 border-white/10 bg-black shadow-inner md:h-40 md:w-40">
                    {cameraStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover scale-x-[-1]"
                        onLoadedMetadata={() => {
                          setVideoReady(true);
                          if (videoRef.current) {
                            videoRef.current.play().catch(e => console.error("Webcam play in onLoadedMetadata failed:", e));
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                        <div className="spinner h-5 w-5" />
                      </div>
                    )}
                    {/* Square Target guides */}
                    <div className="absolute inset-3 rounded-xl border border-dashed border-white/25 pointer-events-none" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={capturePhoto}
                      disabled={!cameraStream || !videoReady}
                      className={`btn btn-primary mt-4 px-5 py-2 rounded-xl text-xs ${
                        (!cameraStream || !videoReady) ? 'btn-disabled' : ''
                      }`}
                    >
                      <Camera size={14} />
                      Fotoğraf Çek
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: KVKK INLINE DISCLOSURE AND CHECKBOX */}
        {step === 2 && (
          <div className="min-h-[180px] flex flex-col justify-center animate-slide-up">
            <div className="flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto text-center">
              
              {/* Thumbnail of captured selfie */}
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-[var(--color-primary)]">
                <img src={selfie} alt="Selfie" className="h-full w-full object-cover" />
                <div className="absolute right-0.5 bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={8} />
                </div>
              </div>

              {/* Inline mini disclosure text for readability */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-left text-[10px] space-y-1.5 text-[var(--text-secondary)]">
                <p className="font-semibold text-white">Biyometrik Veri Aydınlatması:</p>
                <p className="leading-relaxed">
                  Çektiğiniz fotoğraf tamamen yerel olarak işlenir, sunucuya aktarılmaz. Arama için onayınız gereklidir.
                </p>
                <button
                  type="button"
                  onClick={() => setIsKvkkModalOpen(true)}
                  className="font-bold text-[var(--color-primary)] hover:underline inline-block mt-0.5 bg-transparent border-none p-0 cursor-pointer text-[10px]"
                >
                  Detaylı Aydınlatma Metni &raquo;
                </button>
              </div>

              {/* Action trigger buttons */}
              <div className="flex w-full gap-2 mt-1">
                <button
                  onClick={resetToStep1}
                  className="btn btn-outline flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                >
                  Yeniden Çek
                </button>
                <button
                  onClick={handleKvkkAccept}
                  className="btn btn-primary flex-1 py-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/15"
                >
                  Onayla ve Bul
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RUNNING SCANNER PIPELINE */}
        {step === 3 && (
          <FaceScanner imageSrc={selfie} onScanComplete={handleScanComplete} />
        )}

      </div>

      {/* KVKK Legal Disclosure Popup Modal */}
      <KvkkModal
        isOpen={isKvkkModalOpen}
        onAccept={handleKvkkAccept}
        onReject={resetToStep1}
      />
    </div>
  );
}
