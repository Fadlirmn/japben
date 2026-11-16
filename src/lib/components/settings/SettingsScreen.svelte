<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getSettings,
    updateSettings,
    checkUsageAccess,
    openUsageAccessSettings,
    isFocusSupported,
    type AppPreferences,
  } from '../../services/commands';

  let loading = $state(true);
  let error = $state<string | null>(null);
  let prefs = $state<AppPreferences>({
    displayName: null,
    interfaceLanguage: 'id',
    theme: 'system',
    aiOnlineEnabled: false,
  });
  let usageAccessGranted = $state<boolean | null>(null);

  function applyTheme(next: string) {
    const resolved = next === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : next;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }

  async function load() {
    loading = true;
    error = null;
    try {
      prefs = await getSettings();
      applyTheme(prefs.theme);
      usageAccessGranted = isFocusSupported() ? await checkUsageAccess() : null;
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  async function changeDisplayName(value: string) {
    prefs.displayName = value;
    await updateSettings({ displayName: value });
  }

  async function changeLanguage(value: string) {
    prefs.interfaceLanguage = value;
    await updateSettings({ interfaceLanguage: value });
  }

  async function changeTheme(value: string) {
    prefs.theme = value;
    applyTheme(value);
    await updateSettings({ theme: value });
  }

  async function recheckUsageAccess() {
    usageAccessGranted = await checkUsageAccess();
  }

  async function changeAiOnline(value: boolean) {
    prefs.aiOnlineEnabled = value;
    await updateSettings({ aiOnlineEnabled: value });
  }
</script>

<div class="settings-screen">
  {#if loading}
    <p class="hint">Memuat pengaturan…</p>
  {:else if error}
    <p class="hint error">{error}</p>
  {:else}
    <section class="list">
      <div class="group-label">UMUM</div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">Nama panggilan</span>
          <input
            class="row-input"
            type="text"
            placeholder="Belum diatur"
            value={prefs.displayName ?? ''}
            onchange={(e) => changeDisplayName(e.currentTarget.value)}
          />
        </div>
      </div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">Bahasa</span>
          <select class="row-select" value={prefs.interfaceLanguage} onchange={(e) => changeLanguage(e.currentTarget.value)}>
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">Tampilan</span>
          <select class="row-select" value={prefs.theme} onchange={(e) => changeTheme(e.currentTarget.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div class="group-label">FOCUS &amp; PRIVASI</div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">Usage Access</span>
          {#if !isFocusSupported()}
            <span class="row-value muted">Tidak relevan di web</span>
          {:else if usageAccessGranted}
            <span class="row-value ok">Aktif</span>
          {:else}
            <span class="row-value muted">Belum aktif</span>
          {/if}
        </div>
        {#if isFocusSupported() && !usageAccessGranted}
          <div class="row-caption actions">
            <button class="link-action" onclick={openUsageAccessSettings}>Buka Pengaturan</button>
            <button class="link-action" onclick={recheckUsageAccess}>Cek lagi</button>
          </div>
        {/if}
      </div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">Privasi</span>
        </div>
        <ul class="row-caption privacy-list">
          <li>Data pemakaian aplikasi disimpan lokal di perangkat ini saja.</li>
          <li>Tidak ada isi pesan, foto, atau data pribadi dari aplikasi lain yang dikumpulkan.</li>
          <li>Tidak ada monitoring jarak jauh — tidak ada pihak lain yang bisa melihat data kamu.</li>
          <li>Kamu bisa menghapus seluruh data lokal kapan saja.</li>
        </ul>
      </div>

      <div class="group-label">AI &amp; DATA</div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">AI Online (AI Assist)</span>
          <label class="toggle">
            <input type="checkbox" checked={prefs.aiOnlineEnabled} onchange={(e) => changeAiOnline(e.currentTarget.checked)} />
            <span class="track"></span>
            <span class="thumb"></span>
          </label>
        </div>
        <p class="row-caption">Butuh persetujuanmu — AI Assist memakai API key milikmu sendiri (BYOK), dikirim ke server Japben lalu diteruskan ke provider AI pilihanmu.</p>
      </div>

      <div class="row">
        <div class="row-main">
          <span class="row-label">Cadangkan data</span>
          <span class="row-value muted">Belum tersedia</span>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .settings-screen { display: flex; flex-direction: column; gap: var(--space-4); }
  .hint { color: var(--text-muted); font: 13px var(--font-ui); }
  .hint.error { color: var(--danger); }

  .list { border: 1px solid var(--border); background: var(--surface); }

  .group-label {
    padding: 18px 18px 6px; font: 700 10px var(--font-ui); letter-spacing: 0.08em;
    color: var(--text-muted); text-transform: uppercase;
  }
  .group-label:first-child { padding-top: 14px; }

  .row { border-top: 1px solid var(--border); padding: 13px 18px; }
  .group-label + .row { border-top: none; }
  .row-main { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); min-height: 24px; }
  .row-label { font: 600 14px var(--font-ui); color: var(--text); }
  .row-value { font: 13px var(--font-ui); color: var(--text); }
  .row-value.muted { color: var(--text-muted); }
  .row-value.ok { color: var(--success); font-weight: 600; }
  .row-caption { margin: 8px 0 0; color: var(--text-muted); font: 12px/1.6 var(--font-ui); }

  .row-input {
    border: none; background: transparent; color: var(--text); text-align: right;
    font: 14px var(--font-ui); padding: 0; max-width: 60%;
  }
  .row-input::placeholder { color: var(--text-muted); }
  .row-input:focus { outline: none; }

  .row-select {
    border: none; background: transparent; color: var(--text-muted); text-align: right;
    font: 600 13px var(--font-ui); padding: 0; cursor: pointer;
  }
  .row-select:focus { outline: none; }

  .actions { display: flex; align-items: center; gap: var(--space-4); }
  .link-action { background: none; border: none; color: var(--accent); font: 700 12px var(--font-ui); cursor: pointer; padding: 0; }

  .privacy-list { padding-left: 16px; }
  .privacy-list li { margin-bottom: 4px; }

  /* Pure-CSS pill toggle, native-settings style */
  .toggle { position: relative; display: inline-block; width: 40px; height: 24px; flex-shrink: 0; }
  .toggle input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; z-index: 1; }
  .toggle .track { position: absolute; inset: 0; background: var(--surface-muted); border-radius: 999px; transition: background 0.15s ease; }
  .toggle .thumb {
    position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); transition: transform 0.15s ease;
  }
  .toggle input:checked + .track { background: var(--accent); }
  .toggle input:checked ~ .thumb { transform: translateX(16px); }
</style>
