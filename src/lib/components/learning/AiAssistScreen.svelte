<script lang="ts">
  import { onMount } from 'svelte';
  import { getSettings, updateSettings, type AppPreferences } from '../../services/commands';
  import { isLoggedIn, login, register, logout, aiProxyChat } from '../../services/serverClient';
  import {
    loadAiAssistState, saveConfig, appendMessage, buildRequest, extractReply,
    PROVIDER_PRESETS, type AiProvider, type AiProviderConfig,
  } from '../../services/learning/aiAssist';

  let loggedIn = $state(false);
  let prefs = $state<AppPreferences | null>(null);
  let aiState = $state(loadAiAssistState());

  onMount(async () => {
    loggedIn = isLoggedIn();
    try { prefs = await getSettings(); } catch { prefs = null; }
  });

  // ---- step 1: login/register ----
  let authMode = $state<'login' | 'register'>('login');
  let email = $state('');
  let password = $state('');
  let authError = $state<string | null>(null);
  let authBusy = $state(false);

  async function submitAuth() {
    authBusy = true;
    authError = null;
    try {
      if (authMode === 'login') await login(email, password);
      else await register(email, password);
      loggedIn = true;
    } catch (e) {
      authError = e instanceof Error ? e.message : String(e);
    } finally {
      authBusy = false;
    }
  }

  // ---- step 2: consent ----
  async function enableAiOnline() {
    await updateSettings({ aiOnlineEnabled: true });
    if (prefs) prefs.aiOnlineEnabled = true;
  }

  // ---- step 3: provider + key ----
  let provider = $state<AiProvider>('anthropic');
  let apiKey = $state('');
  let model = $state(PROVIDER_PRESETS.anthropic.defaultModel);

  function pickProvider(p: AiProvider) {
    provider = p;
    model = PROVIDER_PRESETS[p].defaultModel;
  }

  function submitConfig() {
    const config: AiProviderConfig = { provider, apiKey, model };
    saveConfig(config);
    aiState = loadAiAssistState();
  }

  // ---- step 4: chat ----
  let draft = $state('');
  let sending = $state(false);
  let chatError = $state<string | null>(null);

  async function send() {
    const config = aiState.config;
    const text = draft.trim();
    if (!config || !text || sending) return;
    chatError = null;
    draft = '';
    aiState = appendMessage({ role: 'user', content: text, at: Date.now() });
    sending = true;
    try {
      const req = buildRequest(config, aiState.messages);
      const json = await aiProxyChat(req);
      const reply = extractReply(config.provider, json);
      aiState = appendMessage({ role: 'assistant', content: reply, at: Date.now() });
    } catch (e) {
      chatError = e instanceof Error ? e.message : String(e);
    } finally {
      sending = false;
    }
  }

  function changeKey() {
    aiState.config = null;
  }
</script>

<div class="ai-assist">
  {#if !loggedIn}
    <section class="card">
      <span class="eyebrow">AKUN JAPBEN</span>
      <h2>{authMode === 'login' ? 'Masuk' : 'Daftar'} dulu buat pakai AI Assist</h2>
      <p class="muted">Akun ini cuma dipakai server buat ngejaga proxy AI tidak disalahgunakan — API key AI-mu sendiri nggak pernah disimpan di server.</p>
      <input class="text-input" type="email" placeholder="Email" bind:value={email} />
      <input class="text-input" type="password" placeholder="Password (min. 8 karakter)" bind:value={password} />
      {#if authError}<p class="error">{authError}</p>{/if}
      <div class="actions">
        <button class="primary-action" onclick={submitAuth} disabled={authBusy}>{authMode === 'login' ? 'Masuk' : 'Daftar'}</button>
        <button class="text-action" onclick={() => authMode = authMode === 'login' ? 'register' : 'login'}>
          {authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
    </section>
  {:else if !prefs?.aiOnlineEnabled}
    <section class="card">
      <span class="eyebrow">PERSETUJUAN</span>
      <h2>AI online butuh persetujuanmu dulu</h2>
      <p class="muted">Pesanmu akan dikirim lewat server Japben ke provider AI pilihanmu, memakai API key milikmu sendiri (BYOK). Nonaktif secara default.</p>
      <button class="primary-action" onclick={enableAiOnline}>Aktifkan AI Online</button>
    </section>
  {:else if !aiState.config}
    <section class="card">
      <span class="eyebrow">PENGATURAN AI</span>
      <h2>Pilih provider & masukkan API key-mu</h2>
      <div class="provider-pick">
        {#each Object.entries(PROVIDER_PRESETS) as [key, preset]}
          <button class="provider-btn {provider === key ? 'active' : ''}" onclick={() => pickProvider(key as AiProvider)}>{preset.label}</button>
        {/each}
      </div>
      <input class="text-input" type="password" placeholder="API key" bind:value={apiKey} />
      <input class="text-input" type="text" placeholder="Model" bind:value={model} />
      <button class="primary-action" onclick={submitConfig} disabled={!apiKey}>Simpan & mulai ngobrol</button>
    </section>
  {:else}
    <div class="chat">
      <div class="chat-header">
        <span class="muted">{PROVIDER_PRESETS[aiState.config.provider].label} · {aiState.config.model}</span>
        <button class="text-action" onclick={changeKey}>Ganti API key</button>
      </div>
      <div class="chat-log">
        {#each aiState.messages as m (m.at)}
          <div class="bubble {m.role}">{m.content}</div>
        {/each}
        {#if sending}<div class="bubble assistant pending">Mengetik…</div>{/if}
      </div>
      {#if chatError}<p class="error">{chatError}</p>{/if}
      <form class="chat-input" onsubmit={(e) => { e.preventDefault(); send(); }}>
        <input class="text-input" type="text" placeholder="Tulis pesan…" bind:value={draft} />
        <button class="primary-action" type="submit" disabled={sending || !draft.trim()}>Kirim</button>
      </form>
    </div>
  {/if}
</div>

<style>
  .ai-assist { display: flex; flex-direction: column; gap: var(--space-4); }
  .card { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-6); border: 1px solid var(--border); background: var(--surface); }
  .eyebrow { letter-spacing: 0.08em; font: 700 10px var(--font-ui); color: var(--accent); text-transform: uppercase; }
  h2 { margin: 0; font: 700 20px var(--font-display); }
  .muted { color: var(--text-muted); font: 13px/1.6 var(--font-ui); margin: 0; }
  .error { color: var(--danger); font: 12px var(--font-ui); margin: 0; }
  .text-input { padding: 8px 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font: 13px var(--font-ui); }
  .actions { display: flex; align-items: center; gap: var(--space-4); }
  .primary-action { align-self: flex-start; border: none; background: var(--accent); color: var(--surface); padding: 10px 18px; font: 700 12px var(--font-ui); cursor: pointer; }
  .primary-action:disabled { background: var(--surface-muted); color: var(--text-muted); cursor: not-allowed; }
  .text-action { background: none; border: none; color: var(--text); font: 600 12px var(--font-ui); cursor: pointer; text-decoration: underline; }

  .provider-pick { display: flex; gap: var(--space-2); }
  .provider-btn { padding: 8px 14px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font: 600 12px var(--font-ui); cursor: pointer; }
  .provider-btn.active { border-color: var(--accent); color: var(--accent); }

  .chat { display: flex; flex-direction: column; gap: var(--space-3); border: 1px solid var(--border); background: var(--surface); padding: var(--space-4); min-height: 400px; }
  .chat-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: var(--space-2); }
  .chat-log { display: flex; flex-direction: column; gap: var(--space-2); flex: 1; overflow-y: auto; }
  .bubble { max-width: 75%; padding: 10px 14px; font: 13px/1.6 var(--font-ui); }
  .bubble.user { align-self: flex-end; background: var(--accent); color: var(--surface); }
  .bubble.assistant { align-self: flex-start; background: var(--surface-muted); color: var(--text); }
  .bubble.pending { opacity: 0.6; }
  .chat-input { display: flex; gap: var(--space-2); }
  .chat-input .text-input { flex: 1; }
</style>
