'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Trophy,
  CreditCard,
  ChevronRight,
  MoreVertical,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  UserPlus,
  CheckCircle2,
  Sparkles,
  Inbox
} from 'lucide-react';
import { Material } from '@/lib/types';
import { UserAccount } from '@/lib/auth';
import { AppLogo } from '@/components/AppLogo';

interface DashboardProps {
  materials: Material[];
  onOpenMaterial: (materialId: string) => void;
  onOpenUploadModal: () => void;
  onViewAllMaterials: () => void;
  onOpenMobileMenu?: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onSwitchAccount?: () => void;
}

export function Dashboard({
  materials,
  onOpenMaterial,
  onOpenUploadModal,
  onViewAllMaterials,
  onOpenMobileMenu,
  currentUser,
  onLogout,
  onSwitchAccount
}: DashboardProps) {
  // Grab active material if any
  const activeMaterial = materials[0] || null;

  // Header popover states (Matches Image 3)
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications mock data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Selamat Datang!',
      desc: 'Mulai belajarmu dengan mengupload materi pelajaran.',
      time: 'Baru saja',
      read: false
    },
    {
      id: 2,
      title: 'Flashcard & Kuis Siap',
      desc: 'AI siap mengekstrak konsep kunci dan membuat latihan soal.',
      time: '1 jam lalu',
      read: false
    }
  ]);

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHasUnreadNotif(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = currentUser?.name || currentUser?.username || 'Malik';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC]">
      {/* Top Header Bar */}
      <header className="h-16 px-6 lg:px-8 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden">
            <AppLogo size="sm" showText={true} />
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-600 rounded-full border border-sky-100">
            Semester Genap • 2026
          </span>
        </div>

        {/* Right User Navigation (Matches Image 3, fully functional) */}
        <div className="flex items-center gap-4">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen((prev) => !prev);
                setIsProfileOpen(false);
              }}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {hasUnreadNotif && (
                <span className="w-2.5 h-2.5 bg-sky-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-900">Notifikasi</span>
                  {hasUnreadNotif && (
                    <button
                      onClick={handleMarkAllNotifsRead}
                      className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 mt-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Header Dropdown (Matches Image 3) */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => {
                setIsProfileOpen((prev) => !prev);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {initial}
              </div>
              <span className="text-sm font-semibold text-slate-800 hidden sm:inline">{displayName}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] text-slate-400">
                    {currentUser?.username ? `@${currentUser.username}` : 'Akun Pelajar'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onViewAllMaterials();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-sky-500" />
                  <span>Materi Saya</span>
                </button>

                {onSwitchAccount && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSwitchAccount();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-sky-500" />
                    <span>Ganti / Masuk Akun</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Keluar dari Akun</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content - Full Width Clean Layout (Image 2 removed as requested) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            Selamat datang, {displayName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Tetap semangat! Mulai belajarmu dengan Ruang Belajar AI.
          </p>
        </div>

        {/* Dashboard Content Area */}
        <div className="space-y-6">
          {/* 1. Upload Materi Baru (Dashed Dropzone) */}
          <div
            onClick={onOpenUploadModal}
            className="border-2 border-dashed border-sky-200 hover:border-sky-400 bg-white hover:bg-sky-50/40 rounded-2xl p-8 text-center transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-105 transition-transform mb-3 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              Upload materi baru
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              PDF, DOCX, PPTX, atau TXT (Maks. 20MB)
            </p>
            <button
              type="button"
              className="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 transition-all cursor-pointer"
            >
              Pilih File
            </button>
          </div>

          {/* 2. Check if user has materials or is a new user with empty dashboard */}
          {materials.length === 0 ? (
            /* Clean Empty State for New Users */
            <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Dashboard Belajarmu Masih Kosong
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                Kamu belum memiliki materi pelajaran. Unggah materi pertamamu lewat tombol upload di atas, dan AI akan otomatis membuatkan Flashcard, Kuis, Ringkasan, serta Mind Map!
              </p>
              <button
                onClick={onOpenUploadModal}
                className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Materi Pertama</span>
              </button>
            </div>
          ) : (
            <>
              {/* Lanjutkan Belajar Section */}
              {activeMaterial && (
                <div>
                  <h2 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                    Lanjutkan Belajar
                  </h2>
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      {/* Book Thumbnail & Info */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {/* Book Cover */}
                        <div className="w-20 h-24 rounded-xl bg-gradient-to-b from-sky-600 to-sky-700 text-white p-2.5 flex flex-col justify-between shrink-0 shadow-sm relative overflow-hidden">
                          <span className="text-[10px] font-black tracking-wider uppercase text-sky-200">
                            {activeMaterial.subject}
                          </span>
                          <div className="mt-auto">
                            <div className="w-full h-4 border-b border-sky-300/40 flex items-end">
                              <div className="w-2 h-2 bg-white rounded-full ml-1 mb-1 shadow-xs" />
                            </div>
                          </div>
                        </div>

                        {/* Info & Progress */}
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-slate-800 hover:text-sky-600 transition-colors">
                            {activeMaterial.title}
                          </h3>

                          {/* Progress bar */}
                          <div className="mt-2.5 flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium">Progres belajar</span>
                            <div className="flex-1 max-w-[140px] bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-sky-500 h-full rounded-full transition-all"
                                style={{ width: `${activeMaterial.progress_percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {activeMaterial.progress_percent}%
                            </span>
                          </div>

                          {/* Best Score & Flashcard Badges */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5 bg-amber-50/80 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200/60">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              <span>
                                Skor Kuis Terbaik <strong>{activeMaterial.best_quiz_score?.score ?? 8} / {activeMaterial.best_quiz_score?.total ?? 10}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-200/60">
                              <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                              <span>
                                Flashcard Dikuasai <strong>{activeMaterial.mastered_flashcards_count ?? 12} kartu</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="w-full sm:w-auto">
                        <button
                          onClick={() => onOpenMaterial(activeMaterial.id)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-sky-50 border border-sky-300 text-sky-600 hover:text-sky-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Lanjutkan Belajar</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Materi Terbaru List */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800">Materi Terbaru</h2>
                  <button
                    onClick={onViewAllMaterials}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
                  >
                    Lihat semua
                  </button>
                </div>

                <div className="space-y-3">
                  {materials.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            item.source_type === 'pdf'
                              ? 'bg-red-50 text-red-600'
                              : item.source_type === 'docx'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="truncate">
                          <h4
                            onClick={() => onOpenMaterial(item.id)}
                            className="text-sm font-semibold text-slate-800 hover:text-sky-600 cursor-pointer truncate"
                          >
                            {item.source_filename || item.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Diupload {item.created_at} • {item.source_size || '2.4 MB'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpenMaterial(item.id)}
                          className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-sky-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Buka
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
