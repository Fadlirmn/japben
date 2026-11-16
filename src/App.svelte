<script lang="ts">
  import AppShell from './lib/components/layout/AppShell.svelte';
  import EditorialHeader from './lib/components/editorial/EditorialHeader.svelte';
  import ProgressCard from './lib/components/learning/ProgressCard.svelte';
  import FocusAppCard from './lib/components/focus/FocusAppCard.svelte';
  import FocusScreen from './lib/components/focus/FocusScreen.svelte';
  import SettingsScreen from './lib/components/settings/SettingsScreen.svelte';
  import AiAssistScreen from './lib/components/learning/AiAssistScreen.svelte';
  import ProgressScreen from './lib/components/learning/ProgressScreen.svelte';
  import { onMount } from 'svelte';
  import { getFocusApps, getSettings, type FocusApp } from './lib/services/commands';
  import { loadLearningState } from './lib/services/learning/store';
  import type { LearningState } from './lib/services/learning/types';

  let activeTab = $state('Home');

  let focusApps = $state<FocusApp[]>([]);
  let learningState = $state<LearningState>(loadLearningState());
  onMount(async () => {
    try {
      focusApps = await getFocusApps();
    } catch {
      focusApps = [];
    }
    try {
      const prefs = await getSettings();
      applyTheme(prefs.theme);
    } catch {
      // keep default theme if settings can't be loaded
    }
    learningState = loadLearningState();
  });

  let protectedApps = $derived(focusApps.filter((a) => a.protected));
  let totalUsageSeconds = $derived(protectedApps.reduce((sum, a) => sum + a.usageSeconds, 0));
  let totalLimitSeconds = $derived(
    protectedApps.reduce((sum, a) => sum + (a.dailyLimitSeconds ?? 0), 0),
  );
  let goalPercent = $derived(
    totalLimitSeconds > 0 ? Math.min(100, Math.round((totalUsageSeconds / totalLimitSeconds) * 100)) : 0,
  );
  const toHoursMinutes = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0') };
  };
  const toMinutes = (seconds: number | null) => Math.round((seconds ?? 0) / 60);

  function applyTheme(next: string) {
    const resolved = next === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : next;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }

  const navItems = [
    { label: 'Home', icon: '⌂' },
    { label: 'AI Assist', icon: '話' },
    { label: 'Focus', icon: '◉' },
    { label: 'Progress', icon: '↗' },
    { label: 'Settings', icon: '⚙' }
  ];
</script>

<svelte:head>
  <meta name="description" content="Learn Japanese before you play." />
</svelte:head>

<AppShell {navItems} bind:activeTab>
  {#snippet topbar()}
    <div class="topbar-brand">
      <span class="brand-mark">日</span>
      <span>JAPBEN</span>
      <span class="edition">VOL. 01</span>
    </div>
    <div class="topbar-actions">
      <button class="avatar" aria-label="Profil" onclick={() => activeTab = 'Settings'}>A</button>
    </div>
  {/snippet}

  {#if activeTab === 'Home'}
    <div class="page-content">
      <EditorialHeader eyebrow="SUNDAY, NOVEMBER 15 · DAILY JOURNAL" title="Make time<br />for Japanese." description="Small steps, steady progress. Your next chapter starts today." />

      {#if !learningState.diagnostic}
        <section class="placeholder-panel">
          <h2>Belum ambil tes diagnostik.</h2>
          <p>Tentukan level awal kamu dulu di tab Progress.</p>
          <button class="text-action" onclick={() => activeTab = 'Progress'}>Mulai tes diagnostik ↗</button>
        </section>
      {:else if !learningState.goal}
        <section class="placeholder-panel">
          <h2>Belum ada target belajar.</h2>
          <p>Atur target dan deadline di tab Progress.</p>
          <button class="text-action" onclick={() => activeTab = 'Progress'}>Atur target ↗</button>
        </section>
      {/if}

      <section class="hero-grid">
        <article class="focus-hero">
          <div class="eyebrow light-eyebrow">FOCUS TIME TODAY</div>
          {#if protectedApps.length === 0}
            <p>Belum ada aplikasi yang dilindungi. Atur di tab Focus.</p>
          {:else}
            <div class="hero-time">{toHoursMinutes(totalUsageSeconds).h}<span>:</span>{toHoursMinutes(totalUsageSeconds).m}</div>
            <p>Every focused minute moves you forward.</p>
            <div class="hero-bottom"><span>DAILY FOCUS</span><span>{goalPercent}% OF GOAL</span></div>
            <div class="hero-track"><span style={`width:${goalPercent}%`}></span></div>
          {/if}
        </article>
        <div class="stat-stack">
          <article class="stat-card">
            <span class="eyebrow">LEARNING STREAK</span>
            <strong>{learningState.streak.currentStreak} hari</strong>
          </article>
          <article class="stat-card accent-stat">
            <span class="eyebrow">CURRENT LEVEL</span>
            <strong>{learningState.diagnostic ? learningState.profile.level : 'Belum diatur'}</strong>
            {#if !learningState.diagnostic}<span class="muted">Ambil tes diagnostik di tab Progress.</span>{/if}
          </article>
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <div><span class="eyebrow">YOUR LEARNING PATH</span><h2>Progress in focus.</h2></div>
          <button class="text-action" onclick={() => activeTab = 'Progress'}>View learning path ↗</button>
        </div>
        <ProgressCard />
      </section>

      <section class="section-block">
        <div class="section-heading">
          <div><span class="eyebrow">DIGITAL WELLBEING</span><h2>Protected attention.</h2></div>
          <button class="text-action" onclick={() => activeTab = 'Focus'}>Manage focus ↗</button>
        </div>
        {#if protectedApps.length === 0}
          <p class="muted">Belum ada aplikasi yang dilindungi.</p>
        {:else}
          <div class="focus-list">
            {#each protectedApps.slice(0, 2) as app (app.packageName)}
              <FocusAppCard
                app={app.appName}
                usage={`${toMinutes(app.usageSeconds)} min / ${toMinutes(app.dailyLimitSeconds)} min`}
                status={app.usageSeconds >= (app.dailyLimitSeconds ?? Infinity) ? 'Limit reached' : 'Within limit'}
              />
            {/each}
          </div>
        {/if}
      </section>
      <footer class="page-footer"><span>日本語を学ぼう</span><span>LEARN JAPANESE BEFORE YOU PLAY.</span></footer>
    </div>
  {:else if activeTab === 'Focus'}
    <div class="page-content">
      <EditorialHeader eyebrow="FOCUS / APLIKASI TERLINDUNGI" title="Protected attention." description="Pilih aplikasi yang ingin dibatasi dan atur batas waktu hariannya." />
      <FocusScreen />
    </div>
  {:else if activeTab === 'AI Assist'}
    <div class="page-content">
      <EditorialHeader eyebrow="AI ASSIST" title="Ngobrol santai." description="Percakapan bebas buat latihan bahasa Jepang, pakai API key AI milikmu sendiri (BYOK)." />
      <AiAssistScreen />
    </div>
  {:else if activeTab === 'Progress'}
    <div class="page-content">
      <EditorialHeader eyebrow="PROGRESS" title="Perkembanganmu." description="Latihan kategori, tes diagnostik, statistik kuis, dan target belajar kamu — semua di sini." />
      <ProgressScreen />
    </div>
  {:else if activeTab === 'Settings'}
    <div class="page-content">
      <EditorialHeader eyebrow="SETTINGS / PREFERENSI" title="Make it yours." description="Profil lokal, bahasa, tema, izin, privasi, dan AI — semua di satu tempat." />
      <SettingsScreen />
    </div>
  {:else}
    <div class="page-content placeholder-page">
      <EditorialHeader eyebrow="JAPBEN / WORKSPACE" title={activeTab + "."} description="This area is ready for the next screen in the product roadmap." />
      <div class="placeholder-panel">
        <span class="eyebrow">COMING IN THE NEXT BUILD</span>
        <h2>{activeTab} experience</h2>
        <p>The navigation and editorial shell are working. Connect this page to the corresponding Svelte route and Rust commands when its feature is implemented.</p>
      </div>
    </div>
  {/if}
</AppShell>
