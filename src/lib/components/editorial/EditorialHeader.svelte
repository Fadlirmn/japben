<script lang="ts">
  let { eyebrow, title, description }: { eyebrow: string; title: string; description: string } = $props();
</script>
<section class="editorial-header">
  <div class="eyebrow">{eyebrow}</div>
  <h1>{@html title}</h1>
  <p>{description}</p>
  <span class="japanese-mark" aria-hidden="true">学</span>
</section>
<style>
  .editorial-header { position: relative; padding: 10px 0 22px; border-bottom: 1px solid var(--border); }
  h1 { max-width: 720px; margin: 14px 0 10px; font-size: clamp(42px, 6vw, 66px); font-weight: 600; line-height: 1.04; letter-spacing: -.055em; }
  p { max-width: 460px; margin: 0; padding-right: 90px; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
  .japanese-mark { position: absolute; right: 2px; bottom: 20px; color: var(--accent); font: 64px var(--font-japanese); }
  @media (max-width: 700px) { .japanese-mark { font-size: 44px; } p { padding-right: 60px; } }
</style>
