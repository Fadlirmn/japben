// Dev-only runnable check for the pure logic in this folder. No test runner
// exists in this project yet and adding one is unjustified for this pass —
// console.assert is enough to catch a broken refactor during `npm run dev`.
import { samplePool, suggestLevelFromScore } from './quizEngine';
import { computeStreak, accuracyByCategory, todayStr } from './progress';
import { isGoalRealistic } from './goals';
import type { LearningState } from './types';

export function runLearningSelfChecks(): void {
  const sample = samplePool('N5', 'all', 10);
  console.assert(sample.length === 10, 'samplePool should return 10 questions for N5/all');
  console.assert(new Set(sample.map((q) => q.id)).size === sample.length, 'samplePool should not repeat questions');

  console.assert(suggestLevelFromScore(10, 10) === 'N4', 'perfect score should suggest N4');
  console.assert(suggestLevelFromScore(6, 10) === 'N5', '60% should suggest N5');
  console.assert(suggestLevelFromScore(3, 10) === 'Pemula', '30% should suggest Pemula');

  const today = '2026-01-10';
  const yesterday = '2026-01-09';
  const gap = '2026-01-01';
  console.assert(computeStreak({ lastStudyDate: today, currentStreak: 5 }, today).currentStreak === 5, 'same-day streak unchanged');
  console.assert(computeStreak({ lastStudyDate: yesterday, currentStreak: 5 }, today).currentStreak === 6, 'consecutive day increments by 1');
  console.assert(computeStreak({ lastStudyDate: gap, currentStreak: 5 }, today).currentStreak === 1, 'gap day resets to 1');

  const answers: LearningState['quizAnswers'] = [
    { sessionId: 's', questionId: 'q1', category: 'vocabulary', chosenIndex: 0, correct: true, answeredAt: 0 },
    { sessionId: 's', questionId: 'q2', category: 'vocabulary', chosenIndex: 0, correct: false, answeredAt: 0 },
  ];
  const acc = accuracyByCategory({ ...emptyState(), quizAnswers: answers });
  console.assert(acc.vocabulary.correct === 1 && acc.vocabulary.total === 2, 'accuracyByCategory tallies correct/total');

  const flagged = isGoalRealistic({
    id: 'g', mainGoalLabel: '', startLevel: 'N5', targetLevel: 'N1',
    deadline: todayStr(new Date(Date.now() + 7 * 86_400_000)), dailyGoalMinutes: 10, createdAt: Date.now(),
  });
  console.assert(!flagged.realistic, 'N5->N1 in 1 week at 10min/day should be flagged unrealistic');

  const fine = isGoalRealistic({
    id: 'g', mainGoalLabel: '', startLevel: 'N5', targetLevel: 'N4',
    deadline: todayStr(new Date(Date.now() + 200 * 86_400_000)), dailyGoalMinutes: 30, createdAt: Date.now(),
  });
  console.assert(fine.realistic, 'N5->N4 in ~6 months at 30min/day should be realistic');
}

function emptyState(): LearningState {
  return {
    profile: { level: 'Pemula' },
    diagnostic: null,
    goal: null,
    milestones: [],
    quizSessions: [],
    quizAnswers: [],
    masteredQuestionIds: [],
    streak: { lastStudyDate: null, currentStreak: 0 },
    studyTime: { date: todayStr(), seconds: 0 },
  };
}
