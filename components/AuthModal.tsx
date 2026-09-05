'use client';

import React, { useState } from 'react';
import { X, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUserAsync, registerUserAsync, UserAccount } from '@/lib/auth';
import { AppLogo } from '@/components/AppLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, isNewUser: boolean) => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const result = await registerUserAsync(username, password);
        if (!result.success || !result.user) {
          setError(result.error || 'Pendaftaran gagal');
          setIsLoading(false);
          return;
        }
        setSuccessMsg('Akun berhasil dibuat & tersimpan di database server!');
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(result.user!, true);
          onClose();
        }, 500);
      } else {
        const result = await loginUserAsync(username, password);
        if (!result.success || !result.user) {
          setError(result.error || 'Login gagal');
          setIsLoading(false);
          return;
        }
        setSuccessMsg('Berhasil masuk dari database server!');
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(result.user!, false);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan sistem');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AppLogo size="lg" showText={false} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {mode === 'register' ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {mode === 'register'
              ? 'Daftar cukup gunakan username & password untuk mulai belajar'
              : 'Gunakan username & password untuk mengakses materi belajarmu'}
          </p>
        </div>

        {/* Error / Success Toast */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form: Username and Password ONLY */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: siswa123 atau namamu"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'register' ? 'Daftar Sekarang' : 'Masuk'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          {mode === 'register' ? (
            <p className="text-xs text-slate-500">
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-sky-600 hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-sky-600 hover:underline cursor-pointer"
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
