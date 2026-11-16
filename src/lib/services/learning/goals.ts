import type { CurriculumLevel, GoalMilestone, LearningGoal } from './types';

const LEVEL_ORDER: CurriculumLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

function levelGap(start: CurriculumLevel, target: CurriculumLevel): number {
  const s = LEVEL_ORDER.indexOf(start);
  const t = LEVEL_ORDER.indexOf(target);
  if (s === -1 || t === -1) return 0; // JFT-Basic/Custom: no ordered gap to measure
  return Math.max(0, s - t); // N5->N1 is a gap of 4; same/lower target is 0
}

export function createGoal(input: {
  mainGoalLabel: string;
  startLevel: CurriculumLevel;
  targetLevel: CurriculumLevel;
  deadline: string;
  dailyGoalMinutes: number;
}): LearningGoal {
  return { id: `goal-${Date.now()}`, createdAt: Date.now(), ...input };
}

// ponytail: evenly splits start->deadline into checkpoints; not a real
// curriculum/milestone scheduler (out of scope) — just gives the learner
// something to see progress against.
export function generateMilestones(goal: LearningGoal): GoalMilestone[] {
  const start = Date.now();
  const end = new Date(goal.deadline).getTime();
  const span = Math.max(0, end - start);
  const steps = 4;
  return Array.from({ length: steps }, (_, i) => {
    const fraction = (i + 1) / steps;
    const date = new Date(start + span * fraction);
    return {
      id: `${goal.id}-m${i}`,
      goalId: goal.id,
      label: `Checkpoint ${i + 1}/${steps}`,
      targetDate: date.toISOString().slice(0, 10),
      done: false,
    };
  });
}

// PRD gives no formula for "unrealistic" — this is one explicit, simple rule:
// deadline sooner than 4 weeks per level-gap, combined with low daily minutes.
export function isGoalRealistic(goal: LearningGoal): { realistic: boolean; reason?: string } {
  const gap = levelGap(goal.startLevel, goal.targetLevel);
  if (gap === 0) return { realistic: true };
  const weeksUntilDeadline = (new Date(goal.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000);
  const minWeeksNeeded = gap * 8; // ~2 months per JLPT level as a rough floor
  if (weeksUntilDeadline < minWeeksNeeded && goal.dailyGoalMinutes < 30) {
    return {
      realistic: false,
      reason: `Target ${gap} level dalam ${Math.max(0, Math.round(weeksUntilDeadline))} minggu dengan ${goal.dailyGoalMinutes} menit/hari kemungkinan terlalu ketat. Ini bukan jaminan kelulusan — pertimbangkan deadline lebih longgar atau waktu belajar lebih banyak.`,
    };
  }
  return { realistic: true };
}
