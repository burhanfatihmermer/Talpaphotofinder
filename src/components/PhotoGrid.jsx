import React from 'react';
import { Download, Maximize2, ArrowLeft, RefreshCw, Eye } from 'lucide-react';

export default function PhotoGrid({ matches, searchSelfie, onReset, onSelectPhoto }) {
  const handleDownload = (photoUrl, photoName) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `Spotlight-${photoName || 'event-photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Search Result Summary Header */}
      <div className="glass p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Searched face preview thumbnail */}
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-primary)]">
            <img
              src={searchSelfie}
              alt="Searched Selfie"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">Arama Sonuçları</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {matches.length > 0
                ? `Yüzünüzle eşleşen ${matches.length} adet fotoğraf başarıyla bulundu.`
                : 'Yüzünüzle eşleşen herhangi bir fotoğraf bulunamadı.'}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="btn btn-outline flex items-center gap-2 py-2.5 text-xs shrink-0"
        >
          <ArrowLeft size={14} />
          Yeni Arama Yap
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)]">
            <Eye size={32} />
          </div>
          <h4 className="text-lg font-semibold text-[var(--text-primary)]">Eşleşen fotoğraf bulunamadı</h4>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Girdiğiniz yüz referansı ile albümdeki yüzler uyuşmadı. 
            Farklı veya daha net çekilmiş bir selfie ile tekrar aramayı deneyebilirsiniz.
          </p>
          <button
            onClick={onReset}
            className="btn btn-primary mt-6 text-xs"
          >
            <RefreshCw size={14} />
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {matches.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-solid)] shadow-[var(--shadow-lg)] transition duration-300 hover:border-[var(--color-primary-glow)]"
            >
              {/* Photo Thumbnail */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-black relative">
                <img
                  src={photo.dataUrl}
                  alt={photo.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                
                {/* Visual Glow Layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Match percentage score badge */}
                <div className="absolute left-4 top-4 rounded-full bg-black/65 backdrop-blur-md px-3 py-1.5 border border-white/10 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">%{photo.matchScore} Eşleşme</span>
                </div>

                {/* Open/Zoom details icon button overlay */}
                <button
                  onClick={() => onSelectPhoto(photo)}
                  className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--color-primary)] hover:scale-105"
                  title="Detaylı İncele"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Photo Description Bar */}
              <div className="p-4 flex items-center justify-between">
                <div className="max-w-[70%]">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]" title={photo.name}>
                    {photo.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    {new Date(photo.uploadedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(photo.dataUrl, photo.name)}
                  className="btn btn-secondary flex h-9 w-9 items-center justify-center p-0 rounded-xl"
                  title="Fotoğrafı İndir"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
