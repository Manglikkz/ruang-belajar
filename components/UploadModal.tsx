'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Settings2,
  Loader2
} from 'lucide-react';
import { Material } from '@/lib/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialCreated: (newMaterial: Material) => void;
}

export function UploadModal({ isOpen, onClose, onMaterialCreated }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Ekonomi');
  const [summaryStyle, setSummaryStyle] = useState<'Ringkas' | 'Poin penting' | 'Detail'>('Poin penting');
  const [flashcardCount, setFlashcardCount] = useState(12);
  const [quizCount, setQuizCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'Sulit'>('Sedang');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const steps = [
    'Mengekstrak teks berkas dokumen...',
    'Menganalisis konsep utama & taksonomi materi...',
    'AI menyusun Ringkasan terarah...',
    'Membuat Flashcard, Kuis, dan Mind Map interaktif...',
    'Selesai! Membuka ruang belajar Anda...'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto prefill title from file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      if (!title) {
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'upload' && !selectedFile && !pastedText) {
      setErrorMsg('Pilih file dokumen terlebih dahulu atau gunakan tab Paste Teks.');
      return;
    }

    if (activeTab === 'paste' && (!pastedText || pastedText.trim().length < 20)) {
      setErrorMsg('Teks materi minimal 20 karakter agar AI dapat mengolah materi.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Judul materi wajib diisi.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    try {
      // Advance progress visually
      const stepTimer1 = setTimeout(() => setProcessingStep(1), 700);
      const stepTimer2 = setTimeout(() => setProcessingStep(2), 1600);
      const stepTimer3 = setTimeout(() => setProcessingStep(3), 2600);

      let textToProcess = pastedText;

      // If file uploaded, extract text or read file
      if (selectedFile) {
        try {
          textToProcess = await selectedFile.text();
        } catch {
          textToProcess = `Materi dari dokumen: ${selectedFile.name}\nJudul: ${title}\nSubjek: ${subject}`;
        }
      }

      // If text is short or mock, enhance for generation
      if (textToProcess.length < 50) {
        textToProcess = `${title} (${subject}). Pembahasan komprehensif mengenai konsep fundamental, mekanisme kerja, rumus dan definisi penting, faktor-faktor pengaruh, serta aplikasi praktis dalam penyelesaian soal akademik.`;
      }

      // Call server-side API route
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          text: textToProcess,
          summaryStyle,
          flashcardCount,
          quizCount,
          difficulty
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!res.ok) {
        throw new Error('Gagal memproses materi');
      }

      const generatedData = await res.json();
      setProcessingStep(4);

      setTimeout(() => {
        const fileExt = selectedFile
          ? (selectedFile.name.split('.').pop()?.toLowerCase() as any)
          : 'text';

        const newMaterial: Material = {
          id: `mat-${Date.now()}`,
          title: title.trim(),
          subject: subject.trim(),
          source_type: ['pdf', 'docx', 'pptx', 'txt'].includes(fileExt) ? fileExt : 'text',
          source_filename: selectedFile ? selectedFile.name : undefined,
          source_size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
          extracted_text: textToProcess,
          status: 'ready',
          created_at: 'Baru saja',
          last_opened_at: 'Hari ini',
          progress_percent: 0,
          best_quiz_score: { score: 0, total: generatedData.quiz?.length || 5 },
          mastered_flashcards_count: 0,
          summary: generatedData.summary,
          flashcards: generatedData.flashcards,
          quiz: generatedData.quiz,
          quiz_attempts: [],
          mindmap: generatedData.mindmap
        };

        setIsProcessing(false);
        onMaterialCreated(newMaterial);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setErrorMsg('Gagal menghasilkan materi. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upload Materi Baru</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ubah materi menjadi 4 media belajar interaktif</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Processing State Overlay with Mascot Animation */}
        {isProcessing ? (
          <div className="p-8 my-auto flex flex-col items-center justify-center text-center space-y-6">
            {/* Mascot Character with Float & Shadow Animation */}
            <div className="relative flex flex-col items-center">
              {/* Floating Mascot Illustration */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 animate-float-mascot flex items-center justify-center drop-shadow-md">
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white/40 p-2">
                  <Image
                    src="/assets/mascot.jpg"
                    alt="Maskot Ruang Belajar AI"
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                    priority
                  />
                </div>

                {/* Animated Floating Sparkles */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center shadow-xs animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Dynamic Ground Shadow */}
              <div className="w-24 sm:w-28 h-3.5 bg-slate-400/20 rounded-full blur-xs mt-1 animate-shadow-pulse" />
            </div>

            <div className="space-y-2 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI Sedang Bekerja</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                Menyulap Materimu Jadi Seru...
              </h4>
              <p className="text-xs sm:text-sm text-sky-600 font-medium">
                {steps[processingStep]}
              </p>
            </div>

            {/* Progress Bar with Step Indicators */}
            <div className="w-full max-w-xs space-y-2">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${((processingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Langkah {processingStep + 1} dari {steps.length}</span>
                <span>{Math.round(((processingStep + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Switch Mode Tab */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Upload File (PDF, DOCX, PPTX)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Paste Teks Materi
              </button>
            </div>

            {/* File Dropzone or Textarea */}
            {activeTab === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/20 hover:bg-sky-50/50 p-6 rounded-2xl text-center cursor-pointer transition-colors"
                >
                  <FileUp className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800 break-all">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Pilih berkas dari perangkatmu</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mendukung PDF, DOCX, PPTX, TXT (Maks. 20MB)</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tempel (Paste) Teks Materi Pelajaran
                </label>
                <textarea
                  rows={5}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Salin dan tempelkan catatan materi Anda di sini..."
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-800"
                />
              </div>
            )}

            {/* Inputs: Title & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Materi *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Ekonomi — Inflasi"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  list="subjects-list"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ketik mata pelajaran kustom (misal: Biologi, Sejarah, Koding...)"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
                <datalist id="subjects-list">
                  <option value="Ekonomi" />
                  <option value="Biologi" />
                  <option value="Fisika" />
                  <option value="Kimia" />
                  <option value="Matematika" />
                  <option value="Sejarah" />
                  <option value="Sosiologi" />
                  <option value="Geografi" />
                  <option value="Bahasa Indonesia" />
                  <option value="Bahasa Inggris" />
                  <option value="Informatika" />
                </datalist>
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Ekonomi', 'Biologi', 'Fisika', 'Matematika', 'Sejarah'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        subject.toLowerCase() === s.toLowerCase()
                          ? 'bg-sky-100 border-sky-300 text-sky-700 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences (Summary style, flashcards count, quiz count, difficulty) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Settings2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Pengaturan Output Belajar</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Gaya Ringkasan</label>
                  <select
                    value={summaryStyle}
                    onChange={(e: any) => setSummaryStyle(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Poin penting">Poin penting</option>
                    <option value="Ringkas">Ringkas</option>
                    <option value="Detail">Detail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Jumlah Flashcard</label>
                  <select
                    value={flashcardCount}
                    onChange={(e) => setFlashcardCount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={8}>8 Kartu</option>
                    <option value={12}>12 Kartu (Standar)</option>
                    <option value={16}>16 Kartu</option>
                    <option value={20}>20 Kartu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Tingkat Kuis</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs shadow-sky-200 cursor-pointer"
              >
                Mulai Proses AI
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
