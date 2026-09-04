'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  ChevronRight,
  BookOpen,
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { QuizQuestion, QuizAttempt } from '@/lib/types';

interface QuizTabProps {
  quizQuestions: QuizQuestion[];
  materialTitle: string;
  onSaveAttempt: (attempt: QuizAttempt) => void;
  onOpenDifficultFlashcards?: () => void;
  onBackToSummary?: () => void;
}

export function QuizTab({
  quizQuestions,
  materialTitle,
  onSaveAttempt,
  onOpenDifficultFlashcards,
  onBackToSummary
}: QuizTabProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ question_id: string; selected_index: number; is_correct: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = quizQuestions[currentIdx] || quizQuestions[0];
  const totalQuestions = quizQuestions.length;

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === currentQ.correct_index;
    const answerRecord = {
      question_id: currentQ.id,
      selected_index: idx,
      is_correct: isCorrect
    };

    const nextAnswers = [...userAnswers, answerRecord];
    setUserAnswers(nextAnswers);

    // If it's the last question, finalize attempt
    if (currentIdx === totalQuestions - 1) {
      const correctCount = nextAnswers.filter((a) => a.is_correct).length;
      const attempt: QuizAttempt = {
        id: `attempt-${nextAnswers.length}-${totalQuestions}`,
        date: 'Baru saja',
        score: correctCount,
        total: totalQuestions,
        difficulty: 'Sedang',
        answers: nextAnswers
      };
      onSaveAttempt(attempt);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setUserAnswers([]);
    setIsCompleted(false);
  };

  const correctCount = userAnswers.filter((a) => a.is_correct).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Render Result Screen
  if (isCompleted) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 shadow-xs">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">Kuis Selesai!</h2>
          <p className="text-sm text-slate-500 mt-1">Kamu telah menyelesaikan latihan mandiri materi ini.</p>

          <div className="my-6 p-6 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-around">
            <div>
              <div className="text-3xl font-black text-sky-600">{scorePercent}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Nilai Akhir</div>
            </div>
            <div className="w-px h-10 bg-sky-200" />
            <div>
              <div className="text-3xl font-black text-slate-800">
                {correctCount} / {totalQuestions}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Jawaban Benar</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestartQuiz}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-sky-500" />
              <span>Ulangi Kuis</span>
            </button>

            {onOpenDifficultFlashcards && (
              <button
                onClick={onOpenDifficultFlashcards}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-sky-50 text-sky-600 font-semibold text-xs sm:text-sm rounded-xl border border-sky-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buka Flashcard Sulit</span>
              </button>
            )}

            {onBackToSummary && (
              <button
                onClick={onBackToSummary}
                className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Kembali ke Ringkasan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kuis Interaktif</h1>
          <p className="text-sm text-slate-500 mt-0.5">{materialTitle}</p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
          Soal <span className="text-sky-600 font-black">{currentIdx + 1}</span> dari {totalQuestions}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-sky-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Topic Tag */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
          TOPIK: {currentQ.topic}
        </span>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === currentQ.correct_index;

            let optionStyle = 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/50 text-slate-800';
            if (hasAnswered) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-2xs';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-red-50 border-red-400 text-red-900 font-semibold';
              } else {
                optionStyle = 'bg-white border-slate-200 opacity-60';
              }
            }

            return (
              <button
                key={i}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(i)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-600 shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>

                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation Box (Grounded in Material) */}
        {hasAnswered && (
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs sm:text-sm text-slate-700 space-y-1.5 animate-fadeIn">
            <div className="text-sky-800 font-bold text-xs uppercase tracking-wider">
              Pembahasan Materi
            </div>
            <p className="leading-relaxed text-slate-600">{currentQ.explanation}</p>
          </div>
        )}

        {/* Continue Button */}
        {hasAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{currentIdx < totalQuestions - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Kuis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
