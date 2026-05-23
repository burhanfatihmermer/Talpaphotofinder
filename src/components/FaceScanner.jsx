import React, { useState, useEffect } from 'react';

const SCANNING_PHASES = [
  'Yüz geometrisi analiz ediliyor...',
  'Biyometrik referans noktaları çıkartılıyor (68 Landmark)...',
  '128-boyutlu yüz vektörü oluşturuluyor...',
  'Etkinlik fotoğrafları ile karşılaştırılıyor...',
  'Eşleşen fotoğraflar filtreleniyor...'
];

export default function FaceScanner({ imageSrc, onScanComplete }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    // Cycle through scanning phase text strings for realism
    const interval = setInterval(() => {
      setPhaseIndex((prev) => {
        if (prev < SCANNING_PHASES.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 900);

    // Let the scan animation play for 4.5 seconds before calling the search matcher
    const timeout = setTimeout(() => {
      onScanComplete();
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onScanComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-[var(--color-secondary)] bg-black shadow-[var(--shadow-glow-cyan)]">
        {/* The captured selfie being scanned */}
        <img
          src={imageSrc}
          alt="Selfie"
          className="h-36 w-36 object-cover md:h-40 md:w-40 opacity-90"
        />
        
        {/* Animated Scanning Laser Line */}
        <div className="scan-line" />
        
        {/* Radial Matrix Glowing Vignette */}
        <div className="scanner-overlay" />
        
        {/* Square Face Guideline HUD */}
        <div className="absolute inset-8 rounded-xl border border-dashed border-[var(--color-primary)]/30" />
        <div className="absolute inset-14 rounded-2xl border border-dashed border-[var(--color-primary)]/20 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-bold text-[var(--text-primary)] flex items-center justify-center gap-2">
          <span className="spinner spinner-cyan h-4 w-4 border-2" />
          Yapay Zeka Taraması Aktif
        </h4>
        <p className="h-6 text-sm text-[var(--color-secondary)] font-medium transition duration-300">
          {SCANNING_PHASES[phaseIndex]}
        </p>
      </div>
    </div>
  );
}
