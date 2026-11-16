<script lang="ts">
  let { app, usage, status }: { app: string; usage: string; status: string } = $props();
  let blocked = $derived(status === 'Limit reached');
</script>
<article class="focus-card">
  <div class="app-icon">{app.slice(0, 1)}</div>
  <div class="details"><strong>{app}</strong><span>{usage}</span></div>
  <span class:blocked class="status">{status}</span>
</article>
<style>
  .focus-card { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 15px; border: 1px solid var(--border); background: var(--surface); }
  .app-icon { width: 36px; height: 36px; flex: 0 0 36px; display: grid; place-items: center; background: var(--surface-muted); color: var(--text); font: 18px var(--font-display); }
  .details { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .details strong { font: 700 13px var(--font-ui); }
  .details span { color: var(--text-muted); font-size: 10px; }
  .status { margin-left: auto; color: var(--success); font-size: 10px; white-space: nowrap; }
  .status.blocked { color: var(--danger); }
</style>
