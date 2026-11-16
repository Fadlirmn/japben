import type { CurriculumLevel, Question, QuestionCategory, QuizMode } from './types';
import { questionsForCategory } from './questionBank';

export type QuizDraft = {
  mode: QuizMode;
  level: CurriculumLevel;
  category: QuestionCategory | 'all';
  questions: Question[];
  idx: number;
  correct: number;
  explainChosenIndex: number | null;
};

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function samplePool(level: CurriculumLevel, category: QuestionCategory | 'all', size = 10): Question[] {
  return shuffle(questionsForCategory(level, category)).slice(0, size);
}

export function createSession(mode: QuizMode, level: CurriculumLevel, category: QuestionCategory | 'all'): QuizDraft {
  return {
    mode,
    level,
    category,
    questions: samplePool(level, category, 10),
    idx: 0,
    correct: 0,
    explainChosenIndex: null,
  };
}

export function currentQuestion(draft: QuizDraft): Question | null {
  return draft.questions[draft.idx] ?? null;
}

export function isComplete(draft: QuizDraft): boolean {
  return draft.idx >= draft.questions.length;
}

/** Both modes advance with an explanation shown on a wrong answer (no retry loop). */
export function submitAnswer(draft: QuizDraft, chosenIndex: number): { correct: boolean; explanation: string } {
  const q = draft.questions[draft.idx];
  const correct = chosenIndex === q.answerIndex;
  if (correct) {
    draft.correct++;
    draft.idx++;
  } else {
    draft.explainChosenIndex = chosenIndex;
  }
  return { correct, explanation: q.explanation };
}

export function advanceAfterExplain(draft: QuizDraft): void {
  draft.explainChosenIndex = null;
  draft.idx++;
}

// ponytail: rough heuristic threshold, not a validated placement test —
// good enough to point a learner at a starting level, not to certify one.
export function suggestLevelFromScore(correct: number, total: number): CurriculumLevel | 'Pemula' {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.9) return 'N4';
  if (pct >= 0.6) return 'N5';
  return 'Pemula';
}
