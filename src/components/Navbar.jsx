import React from 'react';
import { Camera, LogOut, Sparkles, Trash2, ShieldAlert } from 'lucide-react';

export default function Navbar({ isAdminMode, isAdminAuthenticated, onLogout, onLoadDemo, onClearAll, photoCount }) {
  const handleLogoClick = () => {
    // Return to participant panel by clearing hash
    window.location.hash = '';
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-base)]/80 backdrop-blur-md">
      {isAdminMode && isAdminAuthenticated ? (
        // ADMIN MODE HEADER (Brand Left, Actions Right)
        <div className="container mx-auto flex h-20 items-center justify-between py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <img
              src="/talpa-logo.png"
              alt="TALPA Logo"
              className="h-12 w-auto object-contain md:h-14"
            />
            <div className="border-l border-white/10 pl-3">
              <h1 className="text-base font-extrabold tracking-tight md:text-lg text-white">
                TALPA Yönetici Paneli
              </h1>
              <p className="text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-bold">
                Etkinlik Fotoğraf Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-glow-purple mr-2 hidden sm:inline-flex">
              {photoCount} Fotoğraf İndeksli
            </span>

            <button
              onClick={onLoadDemo}
              className="btn btn-outline flex items-center gap-1.5 py-2 text-xs"
              title="Örnek albüm yükler"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Demo Yükle</span>
            </button>

            {photoCount > 0 && (
              <button
                onClick={onClearAll}
                className="btn btn-danger flex items-center gap-1.5 py-2 text-xs"
                title="Tüm albümü temizler"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Temizle</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="btn btn-outline border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 py-2 text-xs"
            >
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      ) : (
        // PARTICIPANT & LOGIN HEADER (Logo and Text Centered in the Page)
        <div className="container mx-auto flex h-20 items-center justify-center py-4 text-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <img
              src="/talpa-logo.png"
              alt="TALPA Logo"
              className="h-12 w-auto object-contain md:h-14"
            />
            <div className="border-l border-white/10 pl-3 text-left">
              <h1 className="text-base font-extrabold tracking-tight md:text-lg text-white">
                TALPA Katılımcı Paneli
              </h1>
              <p className="text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-bold">
                Etkinlik Fotoğraf Sistemi
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
