import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import SearchPanel from './components/SearchPanel';
import PhotoGrid from './components/PhotoGrid';
import PhotoLightbox from './components/PhotoLightbox';
import AdminLogin from './components/AdminLogin';
import { useFaceApi } from './hooks/useFaceApi';
import { getAllPhotos, addPhoto, deletePhoto, clearAllPhotos } from './utils/db';
import { DEMO_PHOTOS } from './utils/demoData';
import { Shield, Code, Heart, Sparkles } from 'lucide-react';

export default function App() {
  // Hash-based simple router
  const [isAdminMode, setIsAdminMode] = useState(window.location.hash === '#admin');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    sessionStorage.getItem('spotlight_admin_auth') === 'true'
  );
  
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  
  // Participant Search State
  const [searchSelfie, setSearchSelfie] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Demo loading progress state
  const [demoProgress, setDemoProgress] = useState({ loading: false, current: 0, total: 0, text: '' });

  const faceApi = useFaceApi();

  // Listen to hash changes for simple routing
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load photos from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedPhotos = await getAllPhotos();
        setPhotos(storedPhotos);
      } catch (err) {
        console.error('Failed to load photos from IndexedDB:', err);
      } finally {
        setLoadingPhotos(false);
      }
    }
    loadData();
  }, []);

  // Admin Actions
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('spotlight_admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('spotlight_admin_auth');
    // Redirect back to participant panel
    window.location.hash = '';
  };

  const handleAddPhoto = async (photoItem) => {
    const id = await addPhoto(photoItem);
    const savedPhoto = { ...photoItem, id };
    setPhotos((prev) => [savedPhoto, ...prev]);
  };

  const handleDeletePhoto = async (id) => {
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = async () => {
    if (window.confirm('Tüm fotoğrafları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      await clearAllPhotos();
      setPhotos([]);
      setSearchSelfie(null);
      setSearchResults([]);
    }
  };

  // Demo Helpers
  const fetchImageAsDataUrl = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Demo görseli okunamadı.'));
      reader.readAsDataURL(blob);
    });
  };

  const resizeDemoImage = (dataUrl, maxDimension = 800) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.src = dataUrl;
    });
  };

  const handleLoadDemo = async () => {
    if (!faceApi.ready) {
      alert('Yapay zeka modellerinin yüklenmesi bekleniyor...');
      return;
    }

    setDemoProgress({ loading: true, current: 0, total: DEMO_PHOTOS.length, text: 'Bağlantı kuruluyor...' });

    try {
      await clearAllPhotos();
      const loadedPhotos = [];

      for (let i = 0; i < DEMO_PHOTOS.length; i++) {
        const demo = DEMO_PHOTOS[i];
        setDemoProgress({
          loading: true,
          current: i + 1,
          total: DEMO_PHOTOS.length,
          text: `"${demo.name}" indiriliyor...`
        });

        const rawDataUrl = await fetchImageAsDataUrl(demo.url);
        const resizedDataUrl = await resizeDemoImage(rawDataUrl);

        setDemoProgress((prev) => ({
          ...prev,
          text: `"${demo.name}" yapay zeka ile taranıyor...`
        }));
        const faces = await faceApi.extractFaces(resizedDataUrl);

        const photoItem = {
          name: demo.name,
          dataUrl: resizedDataUrl,
          faces: faces,
          uploadedAt: new Date().toISOString()
        };

        const id = await addPhoto(photoItem);
        loadedPhotos.push({ ...photoItem, id });
      }

      setPhotos(loadedPhotos);
      alert('Örnek etkinlik fotoğrafları yönetici paneline başarıyla yüklendi!');
    } catch (err) {
      console.error('Demo loading failed:', err);
      alert('Demo yüklenirken hata oluştu: ' + err.message);
    } finally {
      setDemoProgress({ loading: false, current: 0, total: 0, text: '' });
    }
  };

  // Participant Matching Search
  const handleSearch = async (selfieDataUrl) => {
    if (!faceApi.ready) return;

    try {
      setSearchSelfie(selfieDataUrl);

      const targetFaces = await faceApi.extractFaces(selfieDataUrl);

      if (targetFaces.length === 0) {
        setSearchResults([]);
        return;
      }

      const targetDescriptor = targetFaces[0].descriptor;
      const matchedPhotos = faceApi.matchFaces(targetDescriptor, photos, 0.55);

      setSearchResults(matchedPhotos);
    } catch (err) {
      console.error('Search match failed:', err);
      alert('Yüz arama sırasında hata oluştu: ' + err.message);
    }
  };

  const handleResetSearch = () => {
    setSearchSelfie(null);
    setSearchResults([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Navbar with Admin Mode support */}
      <Navbar
        isAdminMode={isAdminMode}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleLogout}
        onLoadDemo={handleLoadDemo}
        onClearAll={handleClearAll}
        photoCount={photos.length}
      />

      {/* Main Content Area */}
      <main className="container flex-1 py-10">
        
        {loadingPhotos ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div className="spinner h-10 w-10" />
            <p className="text-sm text-[var(--text-secondary)]">Veritabanı yükleniyor...</p>
          </div>
        ) : (
          <>
            {isAdminMode ? (
              /* ADMIN VIEWS */
              isAdminAuthenticated ? (
                <AdminPanel
                  photos={photos}
                  onAddPhoto={handleAddPhoto}
                  onDeletePhoto={handleDeletePhoto}
                  onClearAll={handleClearAll}
                  faceApi={faceApi}
                  onLoadDemo={handleLoadDemo}
                />
              ) : (
                <AdminLogin onLoginSuccess={handleLoginSuccess} />
              )
            ) : (
              /* PARTICIPANT VIEWS (No galleries, only search + matches) */
              <div className="space-y-6">
                {searchSelfie ? (
                  <PhotoGrid
                    matches={searchResults}
                    searchSelfie={searchSelfie}
                    onReset={handleResetSearch}
                    onSelectPhoto={setSelectedPhoto}
                  />
                ) : (
                  <SearchPanel
                    onSearch={handleSearch}
                    faceApi={faceApi}
                    photos={photos}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Demo Loading Overlay (Admin Only) */}
      {demoProgress.loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="glass-card max-w-md w-full p-8 text-center border-white/10 space-y-6">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-glow)]">
              <Sparkles size={32} className="text-amber-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-dashed border-[var(--color-primary)] animate-[spin_8s_linear_infinite]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Örnek Veriler Kuruluyor</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Yönetici paneli için etkinlik görselleri işleniyor.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300"
                  style={{ width: `${(demoProgress.current / demoProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                <span>Görsel {demoProgress.current} / {demoProgress.total}</span>
                <span>{Math.round((demoProgress.current / demoProgress.total) * 100)}%</span>
              </div>
            </div>

            <p className="text-xs font-medium text-[var(--color-secondary)] animate-pulse">
              {demoProgress.text}
            </p>
          </div>
        </div>
      )}

      {/* Photo Lightbox Details Overlay */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-black/40 py-8 text-center text-xs text-[var(--text-muted)]">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 max-w-md px-4">
          <div className="flex items-center justify-center gap-2 text-center text-[10px] leading-normal text-[var(--text-muted)]">
            <Shield size={12} className="text-[var(--color-primary)] shrink-0" />
            <span>Kişisel Verilerin Korunması: Biyometrik veriniz hiçbir sunucuya aktarılmaz, yerel olarak işlenir.</span>
          </div>
          <div className="w-full rounded-xl bg-white/95 py-2.5 px-4 text-center text-xs font-bold text-slate-900 shadow-md">
            Tüm hakları saklıdır. TALPA Türkiye Havayolu Pilotları Derneği
          </div>
        </div>
      </footer>
    </div>
  );
}
