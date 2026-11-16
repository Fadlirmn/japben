<script lang="ts">
  type NavItem = { label: string; icon: string };
  let { navItems, activeTab = $bindable('Home'), children, topbar }: {
    navItems: NavItem[];
    activeTab?: string;
    children: import('svelte').Snippet;
    topbar?: import('svelte').Snippet;
  } = $props();
</script>

<div class="app-shell">
  <header class="topbar">
    <div class="topbar-inner">
      {@render topbar?.()}
    </div>
  </header>
  <aside class="sidebar">
    <div class="sidebar-label">WORKSPACE</div>
    {#each navItems as item}
      <button class:active={activeTab === item.label} class="nav-item" onclick={() => activeTab = item.label}>
        <span class="nav-icon">{item.icon}</span><span>{item.label}</span>
      </button>
    {/each}
    <div class="sidebar-note"><span class="brand-mark">日</span><p>Learn Japanese<br />before you play.</p></div>
  </aside>
  <main>{@render children()}</main>
  <nav class="bottom-nav" aria-label="Main navigation">
    {#each navItems as item}
      <button class:active={activeTab === item.label} onclick={() => activeTab = item.label} aria-current={activeTab === item.label ? 'page' : undefined}>
        <span class="nav-icon">{item.icon}</span><span>{item.label}</span>
      </button>
    {/each}
  </nav>
</div>

<style>
  .app-shell { min-height: 100vh; }
  .topbar { height: calc(66px + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top); border-bottom: 1px solid var(--border); background: var(--bg); box-sizing: border-box; }
  .topbar-inner { width: min(100% - 48px, var(--content-max)); height: 100%; margin: auto; display: flex; align-items: center; justify-content: space-between; }
  .sidebar { position: fixed; top: 66px; bottom: 0; left: 0; width: 216px; padding: 30px 18px; border-right: 1px solid var(--border); background: var(--bg); display: flex; flex-direction: column; gap: 7px; }
  .sidebar-label { padding: 0 12px 12px; color: var(--text-muted); font-size: 9px; letter-spacing: .16em; font-weight: 800; }
  .nav-item { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 12px; border: 0; background: transparent; color: var(--text-muted); text-align: left; font-size: 13px; }
  .nav-item.active { background: var(--surface-muted); color: var(--accent); font-weight: 750; }
  .nav-icon { width: 22px; text-align: center; font-size: 18px; }
  .sidebar-note { margin-top: auto; padding: 16px 12px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .sidebar-note p { margin: 0; font: 12px/1.5 var(--font-display); }
  .brand-mark { display: grid; place-items: center; width: 28px; height: 28px; background: var(--accent); color: white; font-family: var(--font-japanese); }
  main { margin-left: 216px; }
  .bottom-nav { display: none; }
  @media (max-width: 900px) {
    .sidebar { display: none; }
    main { margin-left: 0; }
    .bottom-nav { position: fixed; z-index: 20; display: grid; grid-template-columns: repeat(5, 1fr); left: 0; right: 0; bottom: 0; min-height: calc(var(--nav-height) + env(safe-area-inset-bottom)); padding: 8px 6px calc(8px + env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: var(--surface); }
    .bottom-nav button { border: 0; background: transparent; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 9px; }
    .bottom-nav button.active { color: var(--accent); font-weight: 800; }
    .bottom-nav .nav-icon { font-size: 18px; }
    main { padding-bottom: calc(var(--nav-height) + env(safe-area-inset-bottom)); }
  }
  @media (min-width: 901px) and (max-width: 1100px) {
    .sidebar { width: 176px; }
    main { margin-left: 176px; }
  }
</style>
