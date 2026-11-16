import { Router } from 'express';
import { requireAuth } from '../auth.ts';

export const aiProxyRouter = Router();
aiProxyRouter.use(requireAuth);

export function parseAllowedHosts(raw: string | undefined): string[] {
  return (
    raw || 'api.anthropic.com,api.openai.com,generativelanguage.googleapis.com,api.mistral.ai,openrouter.ai'
  ).split(',').map((h) => h.trim()).filter(Boolean);
}

const ALLOWED_HOSTS = parseAllowedHosts(process.env.AI_PROXY_ALLOWED_HOSTS);

// Hop-by-hop / connection-specific headers that must never be forwarded verbatim.
const STRIPPED_HEADERS = new Set(['host', 'content-length', 'connection', 'cookie']);

aiProxyRouter.post('/proxy', async (req, res) => {
  const { baseUrl, path = '', method = 'POST', headers = {}, body } = req.body ?? {};

  let target: URL;
  try {
    target = new URL(path, baseUrl);
  } catch {
    res.status(400).json({ error: 'baseUrl/path tidak valid' });
    return;
  }

  // SSRF guard: only forward to known AI provider hosts. This is the one
  // non-negotiable check — "generic passthrough" must not become an open
  // relay to arbitrary/internal URLs.
  if (!ALLOWED_HOSTS.includes(target.hostname)) {
    res.status(400).json({ error: `host tidak diizinkan: ${target.hostname}` });
    return;
  }

  const outHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (typeof v === 'string' && !STRIPPED_HEADERS.has(k.toLowerCase())) outHeaders[k] = v;
  }
  if (body !== undefined && !outHeaders['content-type'] && !outHeaders['Content-Type']) {
    outHeaders['content-type'] = 'application/json';
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers: outHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch {
    // Never log headers/body here — they contain the caller's own API key.
    res.status(502).json({ error: 'gagal menghubungi upstream' });
  }
});
