<script lang="ts">
  import { onMount } from 'svelte';
  import {
    checkUsageAccess,
    openUsageAccessSettings,
    getFocusApps,
    addRule,
    updateRule,
    isFocusSupported,
    type FocusApp,
  } from '../../services/commands';

  let hasAccess = $state<boolean | null>(null);
  let apps = $state<FocusApp[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let limitWarning = $state<string | null>(null);
  let unsupported = $state(false);

  async function load() {
    loading = true;
    error = null;
    unsupported = !isFocusSupported();
    if (unsupported) {
      loading = false;
      return;
    }
    try {
      hasAccess = await checkUsageAccess();
      apps = hasAccess ? await getFocusApps() : [];
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  async function toggleProtected(app: FocusApp) {
    if (app.protected) {
      await updateRule(app.packageName, { enabled: false });
    } else {
      await addRule(app.packageName, app.appName, app.dailyLimitSeconds ?? 1800);
    }
    await load();
  }

  async function changeLimit(app: FocusApp, minutes: number) {
    if (!Number.isFinite(minutes) || minutes <= 0) {
      limitWarning = 'Batas menit harus angka lebih dari 0.';
      await load(); // reset input back to the last saved value
      return;
    }
    limitWarning = null;
    await updateRule(app.packageName, { dailyLimitSeconds: minutes * 60 });
    await load();
  }

  const toMinutes = (seconds: number | null) => Math.round((seconds ?? 0) / 60);
</script>

<div class="focus-screen">
  {#if loading}
    <p class="hint">Memeriksa izin Usage Access…</p>
  {:else if unsupported}
    <div class="permission-card">
      <span class="eyebrow">TIDAK TERSEDIA DI WEB</span>
      <h2>Focus belum tersedia di versi web</h2>
      <p>
        Fitur ini memerlukan Usage Access, API Android untuk membaca waktu pemakaian aplikasi —
        tidak ada ekuivalennya di browser. Gunakan versi Android untuk Focus Engine.
      </p>
    </div>
  {:else if error}
    <p class="hint error">{error}</p>
  {:else if !hasAccess}
    <div class="permission-card">
      <span class="eyebrow">IZIN DIPERLUKAN</span>
      <h2>Usage Access belum aktif</h2>
      <p>
        Japanese Focus butuh izin Usage Access untuk membaca waktu pemakaian aplikasi di
        perangkatmu. Tidak ada isi pesan, foto, atau data pribadi yang diakses — hanya nama
        aplikasi dan durasi pemakaian.
      </p>
      <div class="actions">
        <button class="primary-action" onclick={openUsageAccessSettings}>Buka Pengaturan</button>
        <button class="text-action" onclick={load}>Sudah aktifkan? Cek lagi</button>
      </div>
    </div>
  {:else if apps.length === 0}
    <p class="hint">Tidak ada aplikasi yang terdeteksi.</p>
  {:else}
    {#if limitWarning}
      <p class="hint error">{limitWarning}</p>
    {/if}
    <ul class="app-list">
      {#each apps as app (app.packageName)}
        <li class="app-row">
          <div class="app-info">
            <strong>{app.appName}</strong>
            <span class="muted">{app.packageName} · {toMinutes(app.usageSeconds)} menit hari ini</span>
          </div>
          <div class="app-controls">
            {#if app.protected}
              <input
                class="limit-input"
                type="number"
                min="1"
                value={toMinutes(app.dailyLimitSeconds)}
                onchange={(e) => changeLimit(app, Number(e.currentTarget.value))}
                aria-label={`Batas menit per hari untuk ${app.appName}`}
              />
              <span class="muted">min/hari</span>
            {/if}
            <label class="switch">
              <input type="checkbox" checked={app.protected} onchange={() => toggleProtected(app)} />
              <span>{app.protected ? 'Dilindungi' : 'Lindungi'}</span>
            </label>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .focus-screen { display: flex; flex-direction: column; gap: var(--space-4); }
  .hint { color: var(--text-muted); font: 13px var(--font-ui); }
  .hint.error { color: var(--danger); }

  .permission-card {
    display: flex; flex-direction: column; gap: var(--space-3);
    padding: var(--space-6); border: 1px solid var(--border); background: var(--surface);
  }
  .permission-card h2 { font: 700 22px var(--font-display); margin: 0; }
  .permission-card p { color: var(--text-muted); font: 13px/1.6 var(--font-ui); margin: 0; }
  .eyebrow { letter-spacing: 0.08em; font: 700 10px var(--font-ui); color: var(--accent); text-transform: uppercase; }
  .actions { display: flex; align-items: center; gap: var(--space-4); margin-top: var(--space-2); }
  .primary-action {
    background: var(--accent); color: var(--surface); border: none; padding: 10px 18px;
    font: 700 12px var(--font-ui); cursor: pointer;
  }
  .text-action { background: none; border: none; color: var(--text); font: 600 12px var(--font-ui); cursor: pointer; text-decoration: underline; }

  .app-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
  .app-row {
    display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
    padding: var(--space-4); border: 1px solid var(--border); background: var(--surface);
  }
  .app-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .app-info strong { font: 700 13px var(--font-ui); }
  .muted { color: var(--text-muted); font-size: 11px; }
  .app-controls { display: flex; align-items: center; gap: var(--space-2); flex: 0 0 auto; }
  .limit-input { width: 56px; padding: 4px 6px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font: 12px var(--font-ui); }
  .switch { display: flex; align-items: center; gap: 6px; font: 600 11px var(--font-ui); cursor: pointer; }
</style>
