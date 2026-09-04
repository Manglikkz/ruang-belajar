export interface KeyTerm {
  term: string;
  definition: string;
}

export interface SummaryData {
  overview: string;
  key_points: string[];
  key_terms: KeyTerm[];
  remember: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag: string;
  status: 'unseen' | 'mastered' | 'repeat' | 'difficult';
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correct_index: number; // 0-3
  explanation: string;
  topic: string;
}

export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  total: number;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  answers: { question_id: string; selected_index: number; is_correct: boolean }[];
}

export interface MindMapNode {
  id: string;
  label: string;
  parent_id: string | null;
  level: number; // 0 = root, 1 = main topic, 2 = subtopic / detail
  icon?: string;
  x?: number;
  y?: number;
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  source_type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'text';
  source_filename?: string;
  source_size?: string;
  extracted_text?: string;
  status: 'ready' | 'processing' | 'extracting' | 'failed';
  created_at: string;
  last_opened_at: string;
  progress_percent: number;
  best_quiz_score?: { score: number; total: number };
  mastered_flashcards_count?: number;
  summary: SummaryData;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  quiz_attempts: QuizAttempt[];
  mindmap: {
    title: string;
    nodes: MindMapNode[];
  };
}

export interface LearningHistoryEvent {
  id: string;
  material_id: string;
  material_title: string;
  event_type: 'quiz_completed' | 'flashcard_session' | 'material_created' | 'mindmap_edited';
  description: string;
  timestamp: string;
  score?: string;
}
