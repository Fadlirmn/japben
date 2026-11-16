<script lang="ts">
  import { onMount } from 'svelte';
  import { loadLearningState } from '../../services/learning/store';
  import { masteredPercent } from '../../services/learning/progress';

  let state = $state(loadLearningState());
  onMount(() => { state = loadLearningState(); });

  let pct = $derived(masteredPercent(state));
  let levelLabel = $derived(state.diagnostic ? state.profile.level : 'BELUM DIATUR');
  let goalLabel = $derived(state.goal?.mainGoalLabel ?? null);
</script>

<article class="progress-card">
  <div class="topline"><span class="eyebrow">JLPT PREPARATION</span><span class="level">{levelLabel}</span></div>
  <div class="progress-row">
    <div>
      <h3>{goalLabel ?? 'Belum ada target belajar.'}</h3>
      <p>
        {#if state.diagnostic}
          Hasil tes diagnostik ({state.diagnostic.date}): {state.diagnostic.correct}/{state.diagnostic.total} benar.
        {:else}
          Ambil tes diagnostik di tab Learn untuk menentukan level awal.
        {/if}
      </p>
    </div>
  </div>
  <div class="hero-track"><span style={`width:${pct}%`}></span></div>
  <div class="bottomline"><span>{state.masteredQuestionIds.length} SOAL DIKUASAI</span><span>{pct}%</span></div>
</article>
<style>
  .progress-card { padding: 22px; background: var(--surface); border: 1px solid var(--border); }
  .topline, .bottomline, .progress-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .level { color: var(--text-muted); font-size: 10px; font-weight: 800; letter-spacing: .1em; }
  .progress-row { margin: 20px 0 16px; align-items: end; }
  h3 { margin: 0 0 5px; font: 22px var(--font-display); }
  p { margin: 0; color: var(--text-muted); font-size: 12px; }
  .hero-track { height: 6px; background: var(--surface-muted); margin-top: 4px; }
  .hero-track span { display: block; height: 100%; background: var(--accent); }
  .bottomline { margin-top: 12px; color: var(--text-muted); font-size: 9px; letter-spacing: .1em; font-weight: 750; }
</style>
