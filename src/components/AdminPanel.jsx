import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminPanel({ photos, onAddPhoto, onDeletePhoto, onClearAll, faceApi, onLoadDemo }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentName: '', status: '' });
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Resize helper to keep image memory footprint low
  const resizeImage = (file, maxDimension = 1200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85)); // Compress as JPEG
        };
        img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Dosya okunamadı.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files) => {
    if (!faceApi.ready) {
      alert('Yapay zeka modelleri yükleniyor, lütfen bekleyin...');
      return;
    }

    if (files.length === 0) return;

    setUploading(true);
    setProgress({ current: 0, total: files.length, currentName: '', status: 'Başlatılıyor...' });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress((prev) => ({
        ...prev,
        current: i + 1,
        currentName: file.name,
        status: 'Fotoğraf boyutlandırılıyor...'
      }));

      try {
        // 1. Resize the image client-side
        const resizedDataUrl = await resizeImage(file);

        // 2. Scan face descriptors
        setProgress((prev) => ({
          ...prev,
          status: 'Yapay zeka ile yüzler taranıyor...'
        }));
        
        const faces = await faceApi.extractFaces(resizedDataUrl);

        // 3. Save to database
        const photoItem = {
          name: file.name,
          dataUrl: resizedDataUrl,
          faces: faces,
          uploadedAt: new Date().toISOString()
        };

        await onAddPhoto(photoItem);
      } catch (err) {
        console.error('Error processing file:', file.name, err);
        // Continue processing other files
      }
    }

    setUploading(false);
    setProgress({ current: 0, total: 0, currentName: '', status: '' });
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="animate-slide-up space-y-8">
      {/* Top Header Card */}
      <div className="glass p-8 text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-[var(--color-primary-glow)] blur-3xl" />
        <h2 className="text-2xl font-bold md:text-3xl">Etkinlik Fotoğrafları Yönetimi</h2>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--text-secondary)] text-sm md:text-base">
          Etkinlik sırasında çektiğiniz toplu fotoğrafları buraya yükleyin. Sistemimiz her bir fotoğraftaki 
          yüzleri otomatik olarak çıkaracak, konumlarını belirleyecek ve arama için indeksleyecektir.
        </p>

        {/* Warning if models aren't ready */}
        {!faceApi.ready && (
          <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-left text-amber-300">
            <div className="spinner spinner-cyan h-5 w-5 border-[2px]" />
            <div className="text-xs">
              <span className="font-bold">Modeller Yükleniyor:</span> Yapay zeka yüz tanıma kütüphanesi başlatılıyor. Lütfen yükleme yapmadan önce bekleyin.
            </div>
          </div>
        )}
      </div>

      {/* Main Action Section: Upload and Info */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload Zone (Left Column) */}
        <div className="md:col-span-2">
          <div
            className={`dropzone relative flex flex-col items-center justify-center min-h-[300px] ${
              dragActive ? 'active' : ''
            } ${!faceApi.ready || uploading ? 'pointer-events-none opacity-60' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-4 text-center w-full max-w-md px-6">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-glow)]">
                  <div className="spinner h-10 w-10 border-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Fotoğraflar İşleniyor ({progress.current} / {progress.total})
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {progress.currentName}
                  </p>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-[var(--color-secondary)] animate-pulse">
                  {progress.status}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[var(--color-primary)]">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    Fotoğrafları sürükleyip bırakın veya seçin
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    PNG, JPEG veya WebP formatında çoklu görsel yükleyebilirsiniz.
                  </p>
                </div>
                <button
                  className={`btn btn-primary px-6 py-2.5 text-xs ${
                    !faceApi.ready ? 'btn-disabled' : ''
                  }`}
                  type="button"
                >
                  Dosya Seç
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Database Stats card (Right Column) */}
        <div className="glass p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Veritabanı Durumu</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-primary)]">
                  {photos.length}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Toplam Fotoğraf</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-secondary)]">
                  {photos.reduce((acc, p) => acc + (p.faces?.length || 0), 0)}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Taranan Yüz</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Yapay Zeka Motoru</span>
                <span className="font-semibold text-emerald-400">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Depolama Tipi</span>
                <span className="font-semibold text-[var(--text-primary)]">IndexedDB (Tarayıcı)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Maks. Çözünürlük</span>
                <span className="font-semibold text-[var(--text-primary)]">1200px (Resized)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            {photos.length === 0 && (
              <button
                onClick={onLoadDemo}
                className="btn btn-outline flex w-full items-center justify-center gap-2 py-2.5 text-xs border-amber-500/20 text-amber-300 hover:bg-amber-500/5"
              >
                <Sparkles size={14} />
                Örnek Etkinlik Yükle (Demo)
              </button>
            )}
            {photos.length > 0 && (
              <button
                onClick={onClearAll}
                className="btn btn-danger flex w-full items-center justify-center gap-2 py-2.5 text-xs"
              >
                <Trash2 size={14} />
                Tüm Veritabanını Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery/List section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon size={20} className="text-[var(--color-primary)]" />
            Yüklenen Görseller
          </h3>
          <span className="badge badge-glow-purple">
            {photos.length} Görsel Listeleniyor
          </span>
        </div>

        {photos.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)]">
              <ImageIcon size={32} />
            </div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Henüz fotoğraf yüklenmedi</h4>
            <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
              Yukarıdaki alana sürükleyip bırakarak fotoğraf yükleyebilir veya "Demo Yükle" butonu ile örnek verileri kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-solid)]">
                {/* Image */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={photo.dataUrl}
                    alt={photo.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Info Overlay */}
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-[var(--text-primary)]" title={photo.name}>
                    {photo.name}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="badge badge-glow-cyan text-[10px]">
                      {photo.faces?.length || 0} Yüz
                    </span>
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="rounded p-1 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition"
                      title="Fotoğrafı Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
