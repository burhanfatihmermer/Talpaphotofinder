import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'Talpa2026') {
      onLoginSuccess();
    } else {
      setError('Hatalı kullanıcı adı veya şifre! Lütfen bilgilerinizi kontrol edin.');
    }
  };

  const handleGoBack = () => {
    // Redirect back to main participant view by resetting hash
    window.location.hash = '';
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 border-white/10 relative overflow-hidden shadow-2xl animate-slide-up">
        {/* Glow effect */}
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-32 w-32 rounded-full bg-[var(--color-primary-glow)] blur-2xl" />

        {/* Back Link */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white mb-6 transition"
        >
          <ArrowLeft size={12} />
          Katılımcı Paneline Dön
        </button>

        {/* Brand/Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-[var(--shadow-glow)]">
            <Lock size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">Yönetici Girişi</h3>
          <p className="text-xs text-[var(--text-secondary)]">Etkinlik albümlerini yönetmek için giriş yapın.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Kullanıcı Adı</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Kullanıcı adını girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-text w-full pl-11 text-sm"
              />
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Şifre</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-text w-full pl-11 text-sm"
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 mt-4"
          >
            Sisteme Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
