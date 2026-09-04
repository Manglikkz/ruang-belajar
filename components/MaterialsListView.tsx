'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Trophy,
  CreditCard,
  ChevronRight,
  BookOpen,
  Trash2
} from 'lucide-react';
import { Material } from '@/lib/types';

interface MaterialsListViewProps {
  materials: Material[];
  onOpenMaterial: (id: string) => void;
  onOpenUploadModal: () => void;
  onDeleteMaterial: (id: string) => void;
}

export function MaterialsListView({
  materials,
  onOpenMaterial,
  onOpenUploadModal,
  onDeleteMaterial
}: MaterialsListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Semua');

  const subjects = ['Semua', ...Array.from(new Set(materials.map((m) => m.subject)))];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'Semua' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Materi Saya</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Kelola dan pelajari seluruh materi pelajaran yang sudah kamu upload.
            </p>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Materi Baru</span>
          </button>
        </div>

        {/* Search & Subject Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul materi atau pelajaran..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === sub
                    ? 'bg-sky-500 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada materi ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau upload materi baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-600">
                      {m.subject}
                    </span>
                    <span className="text-[11px] text-slate-400">{m.created_at}</span>
                  </div>

                  <h3
                    onClick={() => onOpenMaterial(m.id)}
                    className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer line-clamp-2"
                  >
                    {m.title}
                  </h3>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>Progres</span>
                      <span className="font-bold text-slate-700">{m.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all"
                        style={{ width: `${m.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                      <span>{m.flashcards?.length || 12} Flashcard</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Kuis: {m.best_quiz_score?.score ?? 0}/{m.best_quiz_score?.total ?? 10}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenMaterial(m.id)}
                    className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Buka Materi</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteMaterial(m.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Hapus materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
