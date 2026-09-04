'use client';

import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  CheckSquare,
  Network,
  Clock,
  Target,
  Brain,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Upload,
  CheckCircle2,
  FileCheck2,
  BookOpen
} from 'lucide-react';
import { Navbar } from './Navbar';
import { AppLogo } from './AppLogo';

interface LandingPageProps {
  onStartLearning: () => void;
  onLogin?: () => void;
  onOpenSampleMaterial?: () => void;
}

export function LandingPage({ onStartLearning, onLogin, onOpenSampleMaterial }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah Ruang Belajar AI benar-benar 100% gratis?',
      a: 'Ya! Ruang Belajar AI dibuat untuk membantu seluruh pelajar Indonesia tanpa biaya langganan, tanpa batasan token tersembunyi, dan tanpa fitur yang terkunci.'
    },
    {
      q: 'Format file apa saja yang didukung untuk diupload?',
      a: 'Anda dapat mengunggah file PDF, DOCX (Microsoft Word), PPTX (PowerPoint), dan file teks (TXT) dengan ukuran maksimal 20 MB, atau langsung menyalin dan menempel (paste) teks materi Anda.'
    },
    {
      q: 'Bagaimana cara AI membuat 4 output pembelajaran?',
      a: 'Sistem membaca dan mengekstrak teks materi yang Anda berikan, menganalisis struktur taksonomi dan konsep kunci, kemudian menyusun ringkasan terarah, kartu flashcard tanya-jawab, kuis pilihan ganda dengan pembahasan, serta peta konsep visual.'
    },
    {
      q: 'Apakah hasil ringkasan, flashcard, dan mind map bisa diedit?',
      a: 'Tentu saja! Anda dapat mengedit teks ringkasan, menambah/mengubah kartu flashcard, memindahkan serta menambahkan node pada mind map, dan menyimpan perkembangan belajar Anda.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-sky-100 selection:text-sky-800">
      <Navbar onStartLearning={onStartLearning} onLogin={onLogin || onStartLearning} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Background Subtle Decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Floating Decorative Elements (Matches design sketch) */}
          <div className="hidden lg:block absolute left-2 top-8 -rotate-12 transform hover:rotate-0 transition-transform duration-300">
            <div className="w-24 h-32 bg-white rounded-xl shadow-md border border-slate-100 p-3 flex flex-col justify-between opacity-85">
              <div className="space-y-1.5">
                <div className="w-10 h-2 bg-sky-200 rounded-full" />
                <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
                <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute right-4 top-12 rotate-12 transform hover:rotate-0 transition-transform duration-300">
            <div className="w-28 h-36 bg-sky-500 rounded-xl shadow-lg shadow-sky-200 p-3 text-white flex flex-col justify-between opacity-95">
              <div className="flex items-center justify-between">
                <BookOpen className="w-5 h-5 text-sky-100" />
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold">Catatan Belajar</div>
                <div className="text-[9px] text-sky-100">Siap Ujian</div>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#16324F] tracking-tight leading-[1.15]">
            Belajar dari materimu, <br />
            <span className="text-sky-500">lebih terarah.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Upload materi apa pun, dan AI akan mengubahnya menjadi ringkasan, flashcard, kuis, dan mind map yang siap membantumu paham.
          </p>

          {/* CTA Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-md shadow-sky-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Mulai Belajar Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Visual Product Preview Card (Exact Match to Image 1 Left) */}
          <div className="mt-12 md:mt-16 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 max-w-4xl mx-auto text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Step 1: Upload Card */}
              <div className="md:col-span-5 bg-slate-50/70 border border-slate-200/70 rounded-2xl p-5 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  1. Upload materi Anda
                </span>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col items-center text-center">
                  <div className="w-14 h-16 bg-red-50 text-red-600 rounded-lg flex flex-col items-center justify-center border border-red-200 mb-3 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider">PDF</span>
                    <FileText className="w-5 h-5 mt-1" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 break-all">
                    Ekonomi_Permintaan_Penawaran.pdf
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">2.4 MB</span>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Upload berhasil</span>
                  </div>
                </div>
              </div>

              {/* Step 2: 4 Output Learning Cards */}
              <div className="md:col-span-7 flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  2. AI mengubah menjadi 4 output belajar
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Output 1: Ringkasan */}
                  <div
                    onClick={onOpenSampleMaterial}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">Ringkasan</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Inti materi dalam poin penting yang mudah dipahami.
                    </p>
                  </div>

                  {/* Output 2: Flashcard */}
                  <div
                    onClick={onOpenSampleMaterial}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">Flashcard</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Kartu tanya-jawab untuk menguji ingatanmu.
                    </p>
                  </div>

                  {/* Output 3: Kuis */}
                  <div
                    onClick={onOpenSampleMaterial}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">Kuis</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Soal latihan interaktif beserta pembahasan instan.
                    </p>
                  </div>

                  {/* Output 4: Mind Map */}
                  <div
                    onClick={onOpenSampleMaterial}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Network className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">Mind Map</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Peta konsep untuk memahami hubungan antar topik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Bottom Benefits Grid (Exact Match to Image 1 Left) */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto text-left">
            <div className="flex items-start gap-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Hemat waktu belajar</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Dapatkan rangkuman cepat dari materi panjang.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Belajar lebih aktif</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Latih dengan flashcard dan kuis interaktif.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Paham lebih dalam</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mind map membantu melihat gambaran besar materi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Privat & aman</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Materi milikmu hanya bisa diakses olehmu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#16324F]">Cara Kerja Ruang Belajar AI</h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Hanya tiga langkah mudah untuk mengubah materi belajar rumit menjadi pengalaman belajar yang menyenangkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Upload Materi Belajarmu</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pilih file PDF, DOCX, PPTX, TXT atau salin teks catatan materi yang ingin dipelajari langsung ke aplikasi.
              </p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">AI Mengolah Secara Cermat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sistem mengekstrak fakta penting, mengaitkan konsep utama, dan menyusun pertanyaan kuis serta flashcard yang relevan.
              </p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Mulai Belajar & Kuasai Materi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Baca ringkasan, latih ingatan dengan flashcard, uji pemahaman lewat kuis, dan visualisasikan konsep via mind map.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#16324F]">Pertanyaan Umum (FAQ)</h2>
          <p className="text-slate-500 text-sm mt-2">Semua hal yang perlu kamu ketahui tentang Ruang Belajar AI</p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 hover:text-sky-600 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-sky-500' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/40 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" showText={true} />
            <span className="hidden md:inline">— Platform Belajar Cerdas Terbuka untuk Pelajar Indonesia</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#fitur" className="hover:text-slate-700">Fitur</a>
            <a href="#cara-kerja" className="hover:text-slate-700">Cara Kerja</a>
            <a href="#faq" className="hover:text-slate-700">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
