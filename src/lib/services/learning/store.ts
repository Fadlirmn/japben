import { readJSON, writeJSON } from '../storage';
import { todayStr, computeStreak } from './progress';
import { suggestLevelFromScore } from './quizEngine';
import type { LearningGoal, LearningState, QuizAnswer, QuizSession } from './types';

const LEARNING_KEY = 'jf_learning_v1';
const MAX_SESSIONS = 200;
const MAX_ANSWERS = 500;

function defaultState(): LearningState {
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

export function loadLearningState(): LearningState {
  return readJSON(LEARNING_KEY, defaultState());
}

function save(state: LearningState): LearningState {
  writeJSON(LEARNING_KEY, state);
  return state;
}

export function recordQuizSession(session: QuizSession, answers: QuizAnswer[]): LearningState {
  const state = loadLearningState();
  if (state.studyTime.date !== todayStr()) state.studyTime = { date: todayStr(), seconds: 0 };
  state.studyTime.seconds += answers.length * 15; // ~15s/question, matches practice pacing

  state.quizSessions = [session, ...state.quizSessions].slice(0, MAX_SESSIONS);
  state.quizAnswers = [...answers, ...state.quizAnswers].slice(0, MAX_ANSWERS);
  for (const a of answers) {
    if (a.correct && !state.masteredQuestionIds.includes(a.questionId)) {
      state.masteredQuestionIds.push(a.questionId);
    }
  }
  state.streak = computeStreak(state.streak);
  return save(state);
}

export function setDiagnosticResult(correct: number, total: number): LearningState {
  const state = loadLearningState();
  const suggestedLevel = suggestLevelFromScore(correct, total);
  state.diagnostic = { date: todayStr(), correct, total, suggestedLevel };
  state.profile.level = suggestedLevel;
  return save(state);
}

export function setGoal(goal: LearningGoal, milestones: LearningState['milestones']): LearningState {
  const state = loadLearningState();
  state.goal = goal;
  state.milestones = milestones;
  return save(state);
}
