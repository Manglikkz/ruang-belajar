'use client';

import React, { useState } from 'react';
import {
  FileText,
  BookmarkCheck,
  BookOpen,
  AlertCircle,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { SummaryData, KeyTerm } from '@/lib/types';

interface SummaryTabProps {
  summary: SummaryData;
  materialTitle: string;
  onUpdateSummary: (updated: SummaryData) => void;
  onRegenerateSummary: () => void;
  isRegenerating?: boolean;
}

export function SummaryTab({
  summary,
  materialTitle,
  onUpdateSummary,
  onRegenerateSummary,
  isRegenerating
}: SummaryTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [overview, setOverview] = useState(summary.overview);
  const [keyPoints, setKeyPoints] = useState<string[]>(summary.key_points);
  const [keyTerms, setKeyTerms] = useState<KeyTerm[]>(summary.key_terms);
  const [rememberList, setRememberList] = useState<string[]>(summary.remember);
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  const handleSave = () => {
    const updated: SummaryData = {
      overview,
      key_points: keyPoints.filter((p) => p.trim().length > 0),
      key_terms: keyTerms.filter((t) => t.term.trim().length > 0),
      remember: rememberList.filter((r) => r.trim().length > 0)
    };
    onUpdateSummary(updated);
    setIsEditing(false);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  const handleAddKeyPoint = () => {
    setKeyPoints([...keyPoints, 'Poin penting baru']);
  };

  const handleAddTerm = () => {
    setKeyTerms([...keyTerms, { term: 'Istilah Baru', definition: 'Penjelasan istilah' }]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ringkasan Materi</h1>
          <p className="text-sm text-slate-500 mt-0.5">{materialTitle}</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-sky-500" />
              <span>Edit Ringkasan</span>
            </button>
          )}

          <button
            onClick={() => setShowConfirmRegenerate(true)}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-sky-50 text-sky-600 font-semibold text-xs sm:text-sm rounded-xl border border-sky-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Menyusun...' : 'Generate Ulang'}</span>
          </button>
        </div>
      </div>

      {showSavedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Perubahan ringkasan berhasil disimpan secara otomatis.</span>
        </div>
      )}

      {/* Confirmation Dialog for Regenerate */}
      {showConfirmRegenerate && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Konfirmasi Generate Ulang Ringkasan:</span>
              <p className="text-amber-700 mt-0.5">
                Generate ulang hanya memperbarui teks ringkasan materi ini dan tidak akan menghapus flashcard, kuis, atau mind map yang ada.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmRegenerate(false)}
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-amber-800 font-semibold hover:bg-amber-100"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setShowConfirmRegenerate(false);
                onRegenerateSummary();
              }}
              className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 shadow-xs"
            >
              Ya, Generate Ulang
            </button>
          </div>
        </div>
      )}

      {/* 1. Overview Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Gambaran Umum (Overview)</h2>
        </div>

        {isEditing ? (
          <textarea
            rows={4}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-800 leading-relaxed"
          />
        ) : (
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {summary.overview}
          </p>
        )}
      </div>

      {/* 2. Poin-Poin Penting (Key Points) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Poin-Poin Penting</h2>

          {isEditing && (
            <button
              onClick={handleAddKeyPoint}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Poin</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(isEditing ? keyPoints : summary.key_points).map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </div>

              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const updated = [...keyPoints];
                      updated[index] = e.target.value;
                      setKeyPoints(updated);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={() => setKeyPoints(keyPoints.filter((_, i) => i !== index))}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed flex-1 font-medium">
                  {point}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Istilah Penting (Key Terms) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Istilah Penting</h2>

          {isEditing && (
            <button
              onClick={handleAddTerm}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Istilah</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(isEditing ? keyTerms : summary.key_terms).map((termItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 flex flex-col justify-between"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={termItem.term}
                    onChange={(e) => {
                      const updated = [...keyTerms];
                      updated[idx].term = e.target.value;
                      setKeyTerms(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-purple-200 rounded"
                    placeholder="Nama istilah..."
                  />
                  <textarea
                    rows={2}
                    value={termItem.definition}
                    onChange={(e) => {
                      const updated = [...keyTerms];
                      updated[idx].definition = e.target.value;
                      setKeyTerms(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-purple-200 rounded"
                    placeholder="Definisi istilah..."
                  />
                  <button
                    onClick={() => setKeyTerms(keyTerms.filter((_, i) => i !== idx))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Hapus Istilah
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="text-xs sm:text-sm font-bold text-purple-950 mb-1">{termItem.term}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{termItem.definition}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Hal yang Perlu Diingat (Remember) */}
      <div className="bg-sky-50/70 rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-sky-950">Hal yang Perlu Diingat</h2>
        </div>

        <ul className="space-y-2.5">
          {summary.remember.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-sky-900 leading-relaxed font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
