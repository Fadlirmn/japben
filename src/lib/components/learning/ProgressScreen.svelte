<script lang="ts">
  import { onMount } from 'svelte';
  import GoalForm from './GoalForm.svelte';
  import CategoryPicker from './CategoryPicker.svelte';
  import QuizOverlay from './QuizOverlay.svelte';
  import { CATEGORIES } from '../../services/learning/questionBank';
  import { loadLearningState, recordQuizSession, setDiagnosticResult } from '../../services/learning/store';
  import { accuracyByCategory, overallAccuracy, masteredPercent, examReadinessEstimate } from '../../services/learning/progress';
  import type { QuestionCategory, QuizAnswer, QuizSession } from '../../services/learning/types';

  let learningState = $state(loadLearningState());
  onMount(() => { learningState = loadLearningState(); });

  let byCat = $derived(accuracyByCategory(learningState));
  let overall = $derived(overallAccuracy(learningState));
  let mastered = $derived(masteredPercent(learningState));
  let readiness = $derived(examReadinessEstimate(learningState));

  function reloadAfterGoalSaved() {
    learningState = loadLearningState();
  }

  // ---- practice + diagnostic (moved here from the old Learn tab) ----
  let activeQuiz = $state<{ mode: 'practice' | 'diagnostic'; category: QuestionCategory | 'all' } | null>(null);

  function startPractice(category: QuestionCategory) {
    activeQuiz = { mode: 'practice', category };
  }
  function startDiagnostic() {
    activeQuiz = { mode: 'diagnostic', category: 'all' };
  }
  function completeQuiz(session: QuizSession, answers: QuizAnswer[]) {
    recordQuizSession(session, answers);
    if (session.mode === 'diagnostic') setDiagnosticResult(session.correctCount, session.totalCount);
  }
  function closeQuiz() {
    learningState = loadLearningState();
    activeQuiz = null;
  }
</script>

<section class="section-block">
  <h2>Latihan & diagnostik</h2>
  <CategoryPicker diagnosticDone={learningState.diagnostic != null} onStartPractice={startPractice} onStartDiagnostic={startDiagnostic} />
</section>

{#if activeQuiz}
  <QuizOverlay mode={activeQuiz.mode} level="N5" category={activeQuiz.category} onComplete={completeQuiz} onClose={closeQuiz} />
{/if}

<section class="section-block grid-2">
  <article class="card stat-card"><span class="eyebrow">STREAK</span><strong>{learningState.streak.currentStreak} hari</strong></article>
  <article class="card stat-card"><span class="eyebrow">AKURASI KESELURUHAN</span><strong>{overall}%</strong></article>
  <article class="card stat-card"><span class="eyebrow">SOAL DIJAWAB</span><strong>{learningState.quizAnswers.length}</strong></article>
  <article class="card stat-card"><span class="eyebrow">KOSAKATA/KANJI DIKUASAI</span><strong>{mastered}%</strong></article>
</section>

<section class="section-block">
  <h2>Akurasi per kategori</h2>
  <div class="cat-list">
    {#each CATEGORIES as c (c.key)}
      {@const d = byCat[c.key] ?? { correct: 0, total: 0 }}
      {@const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0}
      <article class="card">
        <div class="row"><strong>{c.label}</strong><span class="muted">{d.correct}/{d.total}</span></div>
        <div class="track"><span style={`width:${pct}%`}></span></div>
      </article>
    {/each}
  </div>
</section>

{#if learningState.diagnostic}
  <section class="section-block card">
    <strong>Hasil diagnostik ({learningState.diagnostic.date})</strong>
    <p class="muted">{learningState.diagnostic.correct}/{learningState.diagnostic.total} benar → level disarankan: <strong>{learningState.diagnostic.suggestedLevel}</strong>. Estimasi ini bukan jaminan kelulusan JLPT/JFT-Basic.</p>
  </section>
{/if}

<section class="section-block card">
  <strong>Estimasi kesiapan ujian: {readiness}%</strong>
  <p class="muted">Perkiraan kasar dari akurasi, diagnostik, dan penguasaan soal — bukan jaminan kelulusan JLPT/JFT-Basic.</p>
</section>

<section class="section-block">
  {#if learningState.goal}
    <article class="card">
      <h2>{learningState.goal.mainGoalLabel}</h2>
      <p class="muted">{learningState.goal.startLevel} → {learningState.goal.targetLevel} · deadline {learningState.goal.deadline} · {learningState.goal.dailyGoalMinutes} menit/hari</p>
      <ul class="milestones">
        {#each learningState.milestones as m (m.id)}
          <li>{m.label} — {m.targetDate}</li>
        {/each}
      </ul>
    </article>
  {:else}
    <GoalForm onSaved={reloadAfterGoalSaved} />
  {/if}
</section>

<style>
  .section-block { margin-bottom: var(--space-6); }
  .section-block h2 { font: 700 18px var(--font-display); margin: 0 0 var(--space-3); }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-3); }
  .card { padding: var(--space-5); border: 1px solid var(--border); background: var(--surface); }
  .stat-card { display: flex; flex-direction: column; gap: 6px; }
  .eyebrow { letter-spacing: 0.08em; font: 700 10px var(--font-ui); color: var(--accent); text-transform: uppercase; }
  .stat-card strong { font: 700 22px var(--font-display); }
  .muted { color: var(--text-muted); font: 12px/1.6 var(--font-ui); margin: 4px 0 0; }
  .cat-list { display: flex; flex-direction: column; gap: var(--space-2); }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .track { height: 4px; background: var(--surface-muted); margin-top: var(--space-2); }
  .track span { display: block; height: 100%; background: var(--accent); }
  .milestones { margin: var(--space-2) 0 0; padding-left: 18px; color: var(--text-muted); font: 12px/1.7 var(--font-ui); }
</style>
