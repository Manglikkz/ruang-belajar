'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  FileText,
  CreditCard,
  HelpCircle,
  Network,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { Material, SummaryData, Flashcard, QuizAttempt, MindMapNode } from '@/lib/types';
import { SummaryTab } from './SummaryTab';
import { FlashcardTab } from './FlashcardTab';
import { QuizTab } from './QuizTab';
import { MindMapTab } from './MindMapTab';

export type WorkspaceTabKey = 'summary' | 'flashcard' | 'quiz' | 'mindmap';

interface MaterialWorkspaceProps {
  material: Material;
  initialTab?: WorkspaceTabKey;
  activeTab?: WorkspaceTabKey;
  onTabChange?: (tab: WorkspaceTabKey) => void;
  onBackToDashboard: () => void;
  onUpdateMaterial: (updated: Material) => void;
}

export function MaterialWorkspace({
  material,
  initialTab = 'flashcard', // Default can be flashcard or mindmap or summary
  activeTab: controlledTab,
  onTabChange,
  onBackToDashboard,
  onUpdateMaterial
}: MaterialWorkspaceProps) {
  const [internalTab, setInternalTab] = useState<WorkspaceTabKey>(initialTab);
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleSelectTab = (tab: WorkspaceTabKey) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const [isCopied, setIsCopied] = useState(false);

  // Handlers to update state
  const handleUpdateSummary = (newSummary: SummaryData) => {
    onUpdateMaterial({
      ...material,
      summary: newSummary
    });
  };

  const handleUpdateFlashcards = (newFlashcards: Flashcard[]) => {
    const mastered = newFlashcards.filter((f) => f.status === 'mastered').length;
    onUpdateMaterial({
      ...material,
      flashcards: newFlashcards,
      mastered_flashcards_count: mastered
    });
  };

  const handleUpdateMindmap = (newNodes: MindMapNode[]) => {
    onUpdateMaterial({
      ...material,
      mindmap: {
        ...material.mindmap,
        nodes: newNodes
      }
    });
  };

  const handleSaveQuizAttempt = (attempt: QuizAttempt) => {
    const existing = material.quiz_attempts || [];
    const bestScore =
      material.best_quiz_score && material.best_quiz_score.score > attempt.score
        ? material.best_quiz_score
        : { score: attempt.score, total: attempt.total };

    onUpdateMaterial({
      ...material,
      quiz_attempts: [attempt, ...existing],
      best_quiz_score: bestScore
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC]">
      {/* Workspace Sub-header with Breadcrumbs & Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs Row */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                onClick={onBackToDashboard}
                className="hover:text-sky-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Materi Saya</span>
              </button>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-medium">
                {material.subject}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Link Tersalin' : 'Bagikan'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Ringkasan, Flashcard, Kuis, Mind Map) */}
          <div className="flex items-center gap-2 sm:gap-6 border-t border-slate-100 overflow-x-auto">
            <button
              onClick={() => handleSelectTab('summary')}
              className={`py-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => handleSelectTab('flashcard')}
              className={`py-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcard'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Flashcard</span>
            </button>

            <button
              onClick={() => handleSelectTab('quiz')}
              className={`py-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Kuis</span>
            </button>

            <button
              onClick={() => handleSelectTab('mindmap')}
              className={`py-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'mindmap'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Mind Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Active Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'summary' && (
          <SummaryTab
            summary={material.summary}
            materialTitle={material.title}
            onUpdateSummary={handleUpdateSummary}
            onRegenerateSummary={() => {
              // Quick regeneration simulation
              handleUpdateSummary({
                ...material.summary,
                overview: `${material.summary.overview} (Diperbarui secara mendalam dengan penekanan pada prinsip utama).`
              });
            }}
          />
        )}

        {activeTab === 'flashcard' && (
          <FlashcardTab
            flashcards={material.flashcards}
            materialTitle={material.title}
            onUpdateFlashcards={handleUpdateFlashcards}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            quizQuestions={material.quiz}
            materialTitle={material.title}
            onSaveAttempt={handleSaveQuizAttempt}
            onOpenDifficultFlashcards={() => handleSelectTab('flashcard')}
            onBackToSummary={() => handleSelectTab('summary')}
          />
        )}

        {activeTab === 'mindmap' && (
          <MindMapTab
            mindmap={material.mindmap}
            materialTitle={material.title}
            onUpdateMindmap={handleUpdateMindmap}
          />
        )}
      </main>
    </div>
  );
}
