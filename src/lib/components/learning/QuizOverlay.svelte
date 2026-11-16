<script lang="ts">
  import type { QuestionCategory, CurriculumLevel, QuizSession, QuizAnswer } from '../../services/learning/types';
  import {
    createSession, currentQuestion, isComplete, submitAnswer, advanceAfterExplain, suggestLevelFromScore,
    type QuizDraft,
  } from '../../services/learning/quizEngine';

  let { mode, level, category, onComplete, onClose }: {
    mode: 'practice' | 'diagnostic';
    level: CurriculumLevel;
    category: QuestionCategory | 'all';
    onComplete: (session: QuizSession, answers: QuizAnswer[]) => void;
    onClose: () => void;
  } = $props();

  // Snapshot props once: a quiz's question set shouldn't reshuffle if a prop
  // changes mid-session (it can't anyway — the parent remounts this component
  // for a new quiz via {#if}).
  const initialMode = mode, initialLevel = level, initialCategory = category;
  let draft = $state<QuizDraft>(createSession(initialMode, initialLevel, initialCategory));
  let answers: QuizAnswer[] = [];
  let startedAt = Date.now();
  let done = $state(false);

  let total = $derived(draft.questions.length);
  let question = $derived(currentQuestion(draft));

  function answer(choiceIndex: number) {
    const q = question!;
    const result = submitAnswer(draft, choiceIndex);
    answers.push({
      sessionId: 'current', questionId: q.id, category: q.category,
      chosenIndex: choiceIndex, correct: result.correct, answeredAt: Date.now(),
    });
    if (isComplete(draft)) finish();
  }

  function continueAfterExplain() {
    advanceAfterExplain(draft);
    if (isComplete(draft)) finish();
  }

  function finish() {
    done = true;
    const session: QuizSession = {
      id: `session-${startedAt}`, mode, level, category,
      startedAt, finishedAt: Date.now(), correctCount: draft.correct, totalCount: total,
    };
    onComplete(session, answers);
  }

  let suggestedLevel = $derived(mode === 'diagnostic' ? suggestLevelFromScore(draft.correct, total) : null);
</script>

<div class="overlay">
  <div class="overlay-inner">
    {#if done}
      <div class="lock-mark">学</div>
      <h1>Skor: {draft.correct}/{total}</h1>
      {#if mode === 'diagnostic'}
        <p class="lead">Level disarankan: <strong>{suggestedLevel}</strong>. Ini estimasi, bukan jaminan kelulusan JLPT/JFT-Basic.</p>
      {:else}
        <p class="lead">Latihan selesai. Progres sudah tersimpan.</p>
      {/if}
      <div class="actions"><button class="btn primary" onclick={onClose}>Selesai</button></div>
    {:else if draft.explainChosenIndex != null && question}
      <div class="quiz-progress"><span>Soal {draft.idx + 1} / {total}</span><span>{draft.correct} benar</span></div>
      <div class="quiz-track"><span style={`width:${(draft.idx / total) * 100}%`}></span></div>
      <div class="quiz-question">{question.prompt}</div>
      <div class="quiz-choices">
        {#each question.choices as c, i}
          <div class="quiz-choice {i === question.answerIndex ? 'correct' : (i === draft.explainChosenIndex ? 'wrong' : '')}">{c}</div>
        {/each}
      </div>
      <div class="explanation-box">{question.explanation}</div>
      <div class="actions"><button class="btn primary" onclick={continueAfterExplain}>Lanjut</button></div>
    {:else if question}
      <button class="close" onclick={onClose}>← Keluar</button>
      <div class="quiz-progress"><span>Soal {draft.idx + 1} / {total}</span><span>{draft.correct} benar</span></div>
      <div class="quiz-track"><span style={`width:${(draft.idx / total) * 100}%`}></span></div>
      <div class="quiz-question">{question.prompt}</div>
      <div class="quiz-choices">
        {#each question.choices as c, i}
          <button class="quiz-choice" onclick={() => answer(i)}>{c}</button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay { position: fixed; inset: 0; background: var(--bg); z-index: 50; display: flex; justify-content: center; overflow-y: auto; }
  .overlay-inner { max-width: 560px; width: 100%; padding: var(--space-8) var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
  .close { align-self: flex-start; background: none; border: none; color: var(--text-muted); font: 600 12px var(--font-ui); cursor: pointer; margin-bottom: var(--space-2); }
  .lock-mark { font: 48px var(--font-japanese); color: var(--accent); }
  h1 { font: 700 28px var(--font-display); margin: 0; }
  .lead { color: var(--text-muted); font: 14px/1.6 var(--font-ui); }
  .quiz-progress { display: flex; justify-content: space-between; font: 700 11px var(--font-ui); color: var(--text-muted); }
  .quiz-track { height: 4px; background: var(--surface-muted); }
  .quiz-track span { display: block; height: 100%; background: var(--accent); }
  .quiz-question { font: 700 18px/1.5 var(--font-display); margin: var(--space-2) 0; }
  .quiz-choices { display: flex; flex-direction: column; gap: var(--space-2); }
  .quiz-choice {
    text-align: left; padding: var(--space-4); border: 1px solid var(--border); background: var(--surface);
    color: var(--text); font: 14px var(--font-ui); cursor: pointer;
  }
  .quiz-choice.correct { border-color: var(--success); color: var(--success); }
  .quiz-choice.wrong { border-color: var(--danger); color: var(--danger); }
  .explanation-box { padding: var(--space-4); background: var(--surface-muted); font: 13px/1.6 var(--font-ui); }
  .actions { margin-top: var(--space-2); }
  .btn { border: 1px solid var(--border); background: var(--surface); color: var(--text); padding: 10px 18px; font: 700 12px var(--font-ui); cursor: pointer; }
  .btn.primary { background: var(--accent); color: var(--surface); border: none; }
</style>
