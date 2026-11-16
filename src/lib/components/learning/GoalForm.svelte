<script lang="ts">
  import { createGoal, generateMilestones, isGoalRealistic } from '../../services/learning/goals';
  import { setGoal } from '../../services/learning/store';
  import type { CurriculumLevel } from '../../services/learning/types';

  let { onSaved }: { onSaved: () => void } = $props();

  const LEVELS: CurriculumLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'JFT-Basic', 'Custom'];

  let mainGoalLabel = $state('JLPT N4 dalam 6 bulan');
  let startLevel = $state<CurriculumLevel>('N5');
  let targetLevel = $state<CurriculumLevel>('N4');
  let deadline = $state(new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10));
  let dailyGoalMinutes = $state(20);
  let warning = $state<string | null>(null);

  function save() {
    const goal = createGoal({ mainGoalLabel, startLevel, targetLevel, deadline, dailyGoalMinutes });
    const check = isGoalRealistic(goal);
    warning = check.realistic ? null : (check.reason ?? null);
    setGoal(goal, generateMilestones(goal));
    onSaved();
  }
</script>

<section class="card">
  <span class="eyebrow">LEARNING GOALS</span>
  <h2>Atur target belajar.</h2>
  <label>Target utama<input type="text" bind:value={mainGoalLabel} /></label>
  <label>Level sekarang
    <select bind:value={startLevel}>{#each LEVELS as l}<option value={l}>{l}</option>{/each}</select>
  </label>
  <label>Level target
    <select bind:value={targetLevel}>{#each LEVELS as l}<option value={l}>{l}</option>{/each}</select>
  </label>
  <label>Deadline<input type="date" bind:value={deadline} /></label>
  <label>Target belajar harian (menit)<input type="number" min="1" bind:value={dailyGoalMinutes} /></label>
  {#if warning}<p class="warn">{warning}</p>{/if}
  <button class="btn primary" onclick={save}>Simpan target</button>
</section>

<style>
  .card { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-6); border: 1px solid var(--border); background: var(--surface); }
  .eyebrow { letter-spacing: 0.08em; font: 700 10px var(--font-ui); color: var(--accent); text-transform: uppercase; }
  h2 { margin: 0; font: 700 20px var(--font-display); }
  label { display: flex; flex-direction: column; gap: 4px; font: 600 12px var(--font-ui); color: var(--text-muted); }
  input, select { padding: 8px 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font: 13px var(--font-ui); }
  .warn { color: var(--danger); font: 12px/1.5 var(--font-ui); margin: 0; }
  .btn { align-self: flex-start; border: none; background: var(--accent); color: var(--surface); padding: 10px 18px; font: 700 12px var(--font-ui); cursor: pointer; }
</style>
