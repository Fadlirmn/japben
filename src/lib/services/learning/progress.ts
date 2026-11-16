import type { LearningState, QuestionCategory } from './types';
import { QUESTION_BANK } from './questionBank';

export function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function accuracyByCategory(state: LearningState): Record<QuestionCategory, { correct: number; total: number }> {
  const byCat = {} as Record<QuestionCategory, { correct: number; total: number }>;
  for (const a of state.quizAnswers) {
    byCat[a.category] ??= { correct: 0, total: 0 };
    byCat[a.category].total++;
    if (a.correct) byCat[a.category].correct++;
  }
  return byCat;
}

export function overallAccuracy(state: LearningState): number {
  const total = state.quizAnswers.length;
  if (total === 0) return 0;
  const correct = state.quizAnswers.filter((a) => a.correct).length;
  return Math.round((correct / total) * 100);
}

export function masteredPercent(state: LearningState): number {
  return Math.round((state.masteredQuestionIds.length / QUESTION_BANK.length) * 100);
}

// Consecutive local-calendar-day streak: same day keeps it, yesterday
// extends it by 1, anything older resets to 1.
export function computeStreak(streak: { lastStudyDate: string | null; currentStreak: number }, today = todayStr()) {
  if (streak.lastStudyDate === today) return streak;
  const yesterday = todayStr(new Date(Date.now() - 86_400_000));
  const currentStreak = streak.lastStudyDate === yesterday ? streak.currentStreak + 1 : 1;
  return { lastStudyDate: today, currentStreak };
}

// ponytail: naive weighted blend of overall accuracy + diagnostic result +
// mastered% — not a validated exam-readiness model. UI must show this with
// a disclaimer ("bukan jaminan kelulusan JLPT/JFT-Basic").
export function examReadinessEstimate(state: LearningState): number {
  const parts: number[] = [];
  parts.push(overallAccuracy(state));
  if (state.diagnostic) parts.push(Math.round((state.diagnostic.correct / state.diagnostic.total) * 100));
  parts.push(masteredPercent(state));
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
