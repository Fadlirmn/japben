import { readJSON, writeJSON } from '../storage';

export type AiProvider = 'anthropic' | 'openai';
export type ChatMessage = { role: 'user' | 'assistant'; content: string; at: number };
export type AiProviderConfig = { provider: AiProvider; apiKey: string; model: string };

export const PROVIDER_PRESETS: Record<AiProvider, { label: string; baseUrl: string; path: string; defaultModel: string }> = {
  anthropic: { label: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com', path: '/v1/messages', defaultModel: 'claude-3-5-haiku-latest' },
  openai: { label: 'OpenAI', baseUrl: 'https://api.openai.com', path: '/v1/chat/completions', defaultModel: 'gpt-4o-mini' },
};

type AiAssistState = { config: AiProviderConfig | null; messages: ChatMessage[] };
const KEY = 'jf_ai_assist_v1';
const MAX_MESSAGES = 200;

export function loadAiAssistState(): AiAssistState {
  return readJSON(KEY, { config: null, messages: [] });
}

export function saveConfig(config: AiProviderConfig): void {
  const state = loadAiAssistState();
  state.config = config;
  writeJSON(KEY, state);
}

export function appendMessage(message: ChatMessage): AiAssistState {
  const state = loadAiAssistState();
  state.messages = [...state.messages, message].slice(-MAX_MESSAGES);
  writeJSON(KEY, state);
  return state;
}

// Each provider shapes its chat request/response differently — this is
// exactly why the server proxy stays generic and the client owns the shape.
export function buildRequest(
  config: AiProviderConfig,
  messages: ChatMessage[],
): { baseUrl: string; path: string; headers: Record<string, string>; body: unknown } {
  const preset = PROVIDER_PRESETS[config.provider];
  const history = messages.map((m) => ({ role: m.role, content: m.content }));
  if (config.provider === 'anthropic') {
    return {
      baseUrl: preset.baseUrl,
      path: preset.path,
      headers: { 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
      body: { model: config.model, max_tokens: 1024, messages: history },
    };
  }
  return {
    baseUrl: preset.baseUrl,
    path: preset.path,
    headers: { authorization: `Bearer ${config.apiKey}` },
    body: { model: config.model, messages: history },
  };
}

export function extractReply(provider: AiProvider, json: any): string {
  if (provider === 'anthropic') {
    return json?.content?.[0]?.text ?? '(tidak ada balasan)';
  }
  return json?.choices?.[0]?.message?.content ?? '(tidak ada balasan)';
}
