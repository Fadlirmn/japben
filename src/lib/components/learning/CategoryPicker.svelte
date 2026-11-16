<script lang="ts">
  import { CATEGORIES } from '../../services/learning/questionBank';
  import type { QuestionCategory } from '../../services/learning/types';

  let { diagnosticDone, onStartPractice, onStartDiagnostic }: {
    diagnosticDone: boolean;
    onStartPractice: (category: QuestionCategory) => void;
    onStartDiagnostic: () => void;
  } = $props();

  const comingSoon = [
    { label: 'Listening', note: 'Perlu audio/transcript.' },
    { label: 'Conversation (AI Tutor)', note: 'Perlu AI online/lokal.' },
    { label: 'Material Import', note: 'Perlu parser PDF/TXT/CSV.' },
  ];
</script>

{#if !diagnosticDone}
  <section class="card diagnostic-banner">
    <strong>Belum ambil tes diagnostik.</strong>
    <p class="muted">Tes 10 soal campuran untuk menentukan level awal kamu.</p>
    <button class="btn primary" onclick={onStartDiagnostic}>Mulai Tes Diagnostik</button>
  </section>
{/if}

<div class="cat-grid">
  {#each CATEGORIES as c (c.key)}
    <button class="cat-card" onclick={() => onStartPractice(c.key)}>
      <span class="cat-jp">{c.jp}</span>
      <strong>{c.label}</strong>
    </button>
  {/each}
</div>

<div class="grid-2">
  {#each comingSoon as c (c.label)}
    <article class="card soon">
      <strong>{c.label}</strong>
      <p class="muted">{c.note} Belum tersedia.</p>
    </article>
  {/each}
</div>

<style>
  .card { padding: var(--space-6); border: 1px solid var(--border); background: var(--surface); }
  .diagnostic-banner { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
  .muted { color: var(--text-muted); font: 12px var(--font-ui); margin: 0; }
  .btn { align-self: flex-start; border: 1px solid var(--border); background: var(--surface); color: var(--text); padding: 10px 18px; font: 700 12px var(--font-ui); cursor: pointer; }
  .btn.primary { background: var(--accent); color: var(--surface); border: none; }

  .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4); }
  .cat-card {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
    padding: var(--space-5); border: 1px solid var(--border); background: var(--surface); cursor: pointer;
  }
  .cat-card:hover { border-color: var(--accent); }
  .cat-jp { font: 32px var(--font-japanese); color: var(--accent); }
  .cat-card strong { font: 700 12px var(--font-ui); text-align: center; }

  .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-3); }
  .soon { opacity: 0.6; }
  .soon strong { display: block; font: 700 13px var(--font-ui); margin-bottom: 4px; }
</style>
