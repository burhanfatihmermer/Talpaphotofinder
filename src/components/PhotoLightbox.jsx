import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ShieldCheck } from 'lucide-react';

export default function PhotoLightbox({ photo, onClose }) {
  const [boxStyle, setBoxStyle] = useState({ display: 'none' });
  const imageRef = useRef(null);

  // Recalculate face box dimensions based on the rendered image scale
  const updateBoxScale = () => {
    if (!imageRef.current || !photo || !photo.matchedBox) return;

    const img = imageRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const renderedWidth = img.clientWidth;
    const renderedHeight = img.clientHeight;

    const scaleX = renderedWidth / naturalWidth;
    const scaleY = renderedHeight / naturalHeight;

    const { x, y, width, height } = photo.matchedBox;

    setBoxStyle({
      display: 'block',
      left: `${x * scaleX}px`,
      top: `${y * scaleY}px`,
      width: `${width * scaleX}px`,
      height: `${height * scaleY}px`,
    });
  };

  // Run on image load and handle window resizes
  useEffect(() => {
    window.addEventListener('resize', updateBoxScale);
    return () => {
      window.removeEventListener('resize', updateBoxScale);
    };
  }, [photo]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `Spotlight-${photo.name || 'event-photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-all duration-300">
      {/* Click Outside to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Lightbox Card */}
      <div className="glass-card relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden bg-[var(--bg-surface-solid)] border-white/10 md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition"
        >
          <X size={20} />
        </button>

        {/* Left Side: Photo Frame with Overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <img
              ref={imageRef}
              src={photo.dataUrl}
              alt={photo.name}
              onLoad={updateBoxScale}
              className="max-h-[60vh] max-w-full object-contain md:max-h-[80vh]"
            />
            
            {/* Dynamic Bounding Box Overlay for the Matched Face */}
            {photo.matchedBox && (
              <div
                style={boxStyle}
                className="absolute border-2 border-dashed border-[var(--color-secondary)] pointer-events-none rounded shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse"
              >
                {/* Micro Label for matching score */}
                <div className="absolute -top-6 left-0 rounded bg-[var(--color-secondary)] px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow">
                  %{photo.matchScore} Eşleşme
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Photo Info details */}
        <div className="w-full border-t border-white/5 p-6 md:w-80 md:border-l md:border-t-0 flex flex-col justify-between bg-black/30">
          <div className="space-y-6">
            <div>
              <span className="badge badge-glow-cyan">Eşleşen Görsel</span>
              <h3 className="text-xl font-bold mt-2 text-white truncate" title={photo.name}>
                {photo.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Yapay zeka bu fotoğrafta yüzünüzü tespit etti ve eşleştirdi.
              </p>
            </div>

            <div className="space-y-3 rounded-xl bg-white/5 p-4 text-xs border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Eşleşme Oranı</span>
                <span className="font-bold text-emerald-400">%{photo.matchScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Tespit Edilen Yüzler</span>
                <span className="font-semibold text-white">{photo.faces?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Yüklenme Tarihi</span>
                <span className="font-semibold text-white">
                  {new Date(photo.uploadedAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <p>
                Güvenli İndirme: Fotoğraf doğrudan sunucusuz olarak tarayıcınızdan indirilir.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleDownload}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <Download size={18} />
              Görseli İndir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
