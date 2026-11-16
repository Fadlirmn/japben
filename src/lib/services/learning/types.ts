// Shapes here are named/structured to mirror prd.md §10 table names
// (questions, quiz_sessions, quiz_answers, learning_goals, goal_milestones)
// so a future Rust/SQLite port is a field-rename, not a redesign. No Rust
// port is being built now — this is the browser-only (website) data layer.

export type QuestionCategory = 'vocabulary' | 'grammar' | 'kanji' | 'reading' | 'translation' | 'sentence';

// Only N5 has content today; the full axis is modeled so other levels slot
// in later without reshaping callers.
export type CurriculumLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'JFT-Basic' | 'Custom';

export type Question = {
  id: string;
  level: CurriculumLevel;
  category: QuestionCategory;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

export type QuizMode = 'practice' | 'diagnostic';

export type QuizSession = {
  id: string;
  mode: QuizMode;
  level: CurriculumLevel;
  category: QuestionCategory | 'all';
  startedAt: number;
  finishedAt: number;
  correctCount: number;
  totalCount: number;
};

export type QuizAnswer = {
  sessionId: string;
  questionId: string;
  category: QuestionCategory;
  chosenIndex: number;
  correct: boolean;
  answeredAt: number;
};

export type LearningGoal = {
  id: string;
  mainGoalLabel: string;
  startLevel: CurriculumLevel;
  targetLevel: CurriculumLevel;
  deadline: string; // YYYY-MM-DD, local calendar date
  dailyGoalMinutes: number;
  createdAt: number;
};

export type GoalMilestone = {
  id: string;
  goalId: string;
  label: string;
  targetDate: string; // YYYY-MM-DD
  done: boolean;
};

export type StreakState = {
  lastStudyDate: string | null; // YYYY-MM-DD, local calendar date
  currentStreak: number;
};

export type DiagnosticResult = {
  date: string;
  correct: number;
  total: number;
  suggestedLevel: CurriculumLevel | 'Pemula';
};

// Single persisted blob (localStorage). ponytail: mastery is tracked at
// question-id granularity (1 question ≈ 1 N5 vocab/kanji item) instead of
// separate vocabulary_progress/kanji_progress tables keyed by lexical item —
// fine until curriculum content is modeled as discrete lexical items rather
// than quiz questions; upgrade then.
export type LearningState = {
  profile: { level: CurriculumLevel | 'Pemula' };
  diagnostic: DiagnosticResult | null;
  goal: LearningGoal | null;
  milestones: GoalMilestone[];
  quizSessions: QuizSession[];
  quizAnswers: QuizAnswer[];
  masteredQuestionIds: string[];
  streak: StreakState;
  studyTime: { date: string; seconds: number };
};
