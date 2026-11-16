// The one seam that talks to server/ (account auth + AI proxy) — same
// discipline as commands.ts being the only seam for Tauri.
// ponytail: no settings UI to change this yet — fine while the server only
// runs locally; add a config field once it's actually deployed somewhere.
import { readJSON, writeJSON } from './storage';

const SERVER_URL = 'http://localhost:8787';
const TOKEN_KEY = 'jf_server_token';

export function isLoggedIn(): boolean {
  return readJSON<string | null>(TOKEN_KEY, null) !== null;
}

export function logout(): void {
  writeJSON(TOKEN_KEY, null);
}

async function authRequest(path: string, email: string, password: string): Promise<void> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'gagal menghubungi server');
  writeJSON(TOKEN_KEY, json.token as string);
}

export function register(email: string, password: string): Promise<void> {
  return authRequest('/auth/register', email, password);
}

export function login(email: string, password: string): Promise<void> {
  return authRequest('/auth/login', email, password);
}

export async function aiProxyChat(payload: {
  baseUrl: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}): Promise<unknown> {
  const token = readJSON<string | null>(TOKEN_KEY, null);
  if (!token) throw new Error('belum login');
  const res = await fetch(`${SERVER_URL}/ai/proxy`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message || json.error || 'gagal menghubungi AI');
  return json;
}
