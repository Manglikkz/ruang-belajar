'use client';

import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Leaf,
  Pointer
} from 'lucide-react';
import { Flashcard } from '@/lib/types';

interface FlashcardTabProps {
  flashcards: Flashcard[];
  materialTitle: string;
  onUpdateFlashcards: (updated: Flashcard[]) => void;
}

export function FlashcardTab({
  flashcards,
  materialTitle,
  onUpdateFlashcards
}: FlashcardTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0); // Start from card 1 in sequence
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300); // 05:00
  const [isCompletedSession, setIsCompletedSession] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // New card modal state
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTag, setNewTag] = useState('DEFINISI');

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || cards[0];
  // Sync count directly with actual cards completed in sequence
  const completedInSession = cards.filter((c) => c.status !== 'unseen').length;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNextCard = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isManageModalOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < totalCards - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalCards, isManageModalOpen]);

  const handleSetStatus = (status: Flashcard['status']) => {
    const updated = [...cards];
    if (updated[currentIndex]) {
      updated[currentIndex] = {
        ...updated[currentIndex],
        status
      };
      setCards(updated);
      onUpdateFlashcards(updated);
    }

    const labels: Record<Flashcard['status'], string> = {
      mastered: 'Sudah Paham',
      repeat: 'Ulangi',
      difficult: 'Belum Paham',
      unseen: 'Belum Dilihat'
    };
    setStatusFeedback(`Status "${labels[status]}" berhasil disimpan`);
    setTimeout(() => setStatusFeedback(null), 2000);

    // Auto advance if not last card
    if (currentIndex < totalCards - 1) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      }, 150);
    } else {
      // On the last card: flip back and show completion dialog
      setIsFlipped(false);
      setIsCompletedSession(true);
    }
  };

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Add / Edit card handler
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    if (editingCard) {
      const updated = cards.map((c) =>
        c.id === editingCard.id
          ? { ...c, front: newFront, back: newBack, tag: newTag || 'KONSEP' }
          : c
      );
      setCards(updated);
      onUpdateFlashcards(updated);
      setEditingCard(null);
    } else {
      const newCard: Flashcard = {
        id: `fc-custom-${Date.now()}`,
        front: newFront,
        back: newBack,
        tag: newTag || 'KONSEP',
        status: 'unseen'
      };
      const updated = [...cards, newCard];
      setCards(updated);
      onUpdateFlashcards(updated);
    }

    setNewFront('');
    setNewBack('');
    setNewTag('DEFINISI');
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    onUpdateFlashcards(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
  };

  const startEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setNewFront(card.front);
    setNewBack(card.back);
    setNewTag(card.tag);
  };

  return (
    <div className="w-full">
      {/* Top Header Row (Matches Image 2 Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Flashcard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{materialTitle}</p>
        </div>

        {/* Action Button: Atur Kartu */}
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4 text-sky-500" />
          <span>Atur Kartu</span>
        </button>
      </div>

      {/* Progress Bar Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs sm:text-sm font-bold text-slate-700 shrink-0">
            Kartu <span className="text-sky-600">{currentIndex + 1}</span> dari {totalCards}
          </span>
          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Flashcard Area (Left 8 cols) + Side Session Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Large Centered Flashcard */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Card Container with 3D Flip */}
          <div
            onClick={handleFlip}
            className="w-full h-80 sm:h-96 cursor-pointer select-none perspective-1000 group relative"
          >
            <div
              className={`w-full h-full relative duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD (Solid opaque white background, no bleed-through) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                }}
                className={`absolute inset-0 bg-white rounded-3xl border-2 border-sky-400 p-8 flex flex-col items-center justify-between text-center shadow-md shadow-sky-100/50 transition-opacity duration-200 ${
                  isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                {/* Category Badge Pill */}
                <div className="px-4 py-1 rounded-full bg-sky-50 text-sky-600 font-bold text-xs tracking-wider uppercase border border-sky-100">
                  {currentCard?.tag || 'DEFINISI'}
                </div>

                {/* Main Question */}
                <div className="my-auto px-4 max-w-xl">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#16324F] leading-snug">
                    {currentCard?.front}
                  </h2>
                </div>

                {/* Tap to Flip Prompt */}
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-sky-500 transition-colors">
                  <Pointer className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span>Klik kartu untuk melihat jawaban</span>
                </div>
              </div>

              {/* BACK OF CARD (Flipped - Solid opaque white background with blue accent) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className={`absolute inset-0 bg-white rounded-3xl border-2 border-sky-500 p-8 flex flex-col items-center justify-between text-center shadow-md shadow-sky-200/50 transition-opacity duration-200 ${
                  isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="px-4 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-xs tracking-wider uppercase border border-sky-200">
                  JAWABAN • {currentCard?.tag || 'DEFINISI'}
                </div>

                <div className="my-auto px-4 max-w-xl">
                  <p className="text-base sm:text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
                    {currentCard?.back}
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  Klik lagi untuk kembali ke pertanyaan
                </div>
              </div>
            </div>
          </div>

          {/* Status Feedback Toast */}
          {statusFeedback && (
            <div className="mt-4 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full animate-fadeIn flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{statusFeedback}</span>
            </div>
          )}

          {/* Action Buttons Below Card (Matches Image 2: Belum Paham, Ulangi, Sudah Paham) */}
          <div className="mt-8 flex items-center justify-center gap-4 w-full max-w-md">
            {/* Belum Paham Button (Red Outline) */}
            <button
              onClick={() => handleSetStatus('difficult')}
              className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                currentCard?.status === 'difficult'
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-red-400 text-red-500 hover:bg-red-50 active:bg-red-100'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  currentCard?.status === 'difficult'
                    ? 'bg-white text-red-500'
                    : 'bg-red-500 text-white'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </div>
              <span>Belum Paham</span>
            </button>

            {/* Ulangi Button (Neutral Outline) */}
            <button
              onClick={() => handleSetStatus('repeat')}
              className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                currentCard?.status === 'repeat'
                  ? 'border-amber-400 bg-amber-400 text-slate-900'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Ulangi</span>
            </button>

            {/* Sudah Paham Button (Blue Filled) */}
            <button
              onClick={() => handleSetStatus('mastered')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shadow-sky-200 ${
                currentCard?.status === 'mastered'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white text-sky-500 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Sudah Paham</span>
            </button>
          </div>

          {/* Bottom Numbered Pagination */}
          <div className="mt-8 flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 px-2">
            <button
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {cards.map((c, idx) => {
              const isActive = idx === currentIndex;
              const isMastered = c.status === 'mastered';
              const isRepeat = c.status === 'repeat';
              const isDifficult = c.status === 'difficult';

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`relative w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'border-2 border-sky-500 text-sky-600 bg-sky-50 shadow-xs'
                      : 'border border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                  }`}
                >
                  {idx + 1}
                  {/* Status Indicator Dot */}
                  {isMastered && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                  {isRepeat && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                  )}
                  {isDifficult && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
              );
            })}

            <button
              onClick={handleNextCard}
              disabled={currentIndex === totalCards - 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-400">
            Gunakan tombol <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-slate-600 font-mono">Spasi</kbd> untuk membalik kartu, dan panah <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-slate-600 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-slate-600 font-mono">→</kbd> untuk berpindah.
          </div>
        </div>

        {/* Right Side: Session Panel (Sesi Hari Ini - Synchronized) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-6">Sesi Hari Ini</h3>

            {/* Circular Progress Ring (Synchronized dynamically with sequence) */}
            {(() => {
              const radius = 25;
              const circumference = 2 * Math.PI * radius;
              const progressRatio = totalCards > 0 ? completedInSession / totalCards : 0;
              const strokeDashoffset = circumference - progressRatio * circumference;

              return (
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="stroke-slate-100"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="stroke-emerald-400 transition-all duration-500 ease-out"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">
                      {completedInSession} / {totalCards}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">kartu selesai</div>
                  </div>
                </div>
              );
            })()}

            {/* Timer Row */}
            <div className="flex items-center gap-3.5 pt-5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-xs text-slate-400">waktu tersisa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atur Kartu Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Atur Kartu Flashcard</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tambah, edit, atau hapus kartu flashcard materi ini.</p>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Form Tambah/Edit */}
              <form onSubmit={handleSaveCard} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {editingCard ? 'Edit Kartu' : 'Tambah Kartu Baru'}
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pertanyaan (Bagian Depan)</label>
                  <input
                    type="text"
                    required
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Contoh: Apa bunyi Hukum Permintaan?"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jawaban (Bagian Belakang)</label>
                  <textarea
                    required
                    rows={2}
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Contoh: Jika harga naik maka jumlah permintaan turun..."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="w-48">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori Tag</label>
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="DEFINISI">DEFINISI</option>
                      <option value="HUKUM EKONOMI">HUKUM & PRINSIP</option>
                      <option value="FAKTOR">FAKTOR PENGARUH</option>
                      <option value="ANALISIS">ANALISIS</option>
                      <option value="RUMUS">RUMUS</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2 pt-4">
                    {editingCard && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCard(null);
                          setNewFront('');
                          setNewBack('');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-xs"
                    >
                      {editingCard ? 'Perbarui Kartu' : 'Simpan Kartu'}
                    </button>
                  </div>
                </div>
              </form>

              {/* List Kartu Saat Ini */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Kartu ({cards.length})
                </h4>
                {cards.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-left hover:border-slate-300"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-sky-600">#{i + 1}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {c.tag}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{c.front}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.back}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditCard(c)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-xl cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sesi Belajar Selesai Modal (Celebration / Review) */}
      {isCompletedSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Sesi Flashcard Selesai! 🎉</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Kamu telah meninjau seluruh {totalCards} kartu pada materi ini. Status tiap kartu telah disimpan dengan baik.
            </p>

            <div className="grid grid-cols-3 gap-2 my-5 text-center">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="text-xl font-black text-emerald-600">
                  {cards.filter((c) => c.status === 'mastered').length}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 mt-0.5">Sudah Paham</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="text-xl font-black text-amber-600">
                  {cards.filter((c) => c.status === 'repeat').length}
                </div>
                <div className="text-[11px] font-bold text-amber-800 mt-0.5">Ulangi</div>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                <div className="text-xl font-black text-red-500">
                  {cards.filter((c) => c.status === 'difficult').length}
                </div>
                <div className="text-[11px] font-bold text-red-800 mt-0.5">Belum Paham</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsCompletedSession(false);
                }}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Ulangi Sesi dari Kartu Pertama
              </button>
              <button
                onClick={() => setIsCompletedSession(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                Tutup & Tetap di Kartu Terakhir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
