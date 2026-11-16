/**
 * Adapter UI ke Tauri commands (Rust). Semua keputusan bisnis — status lock,
 * skor kuis, masa unlock — datang dari Rust. UI di sini hanya menampilkan.
 *
 * Di luar Tauri (versi website), Focus Engine tidak punya ekuivalen browser
 * (Usage Access adalah API Android) — fungsi-fungsi focus_* di bawah
 * mengembalikan hasil "tidak tersedia" yang jujur, bukan data palsu.
 * Settings tetap jalan penuh di web, dibackup oleh localStorage.
 */
import { invoke, isTauri } from '@tauri-apps/api/core';
import { readJSON, writeJSON } from './storage';

export type FocusApp = {
  packageName: string;
  appName: string;
  protected: boolean;
  dailyLimitSeconds: number | null;
  usageSeconds: number;
};

/** Focus Engine butuh Android Usage Access — tidak ada ekuivalennya di browser. */
export function isFocusSupported(): boolean {
  return isTauri();
}

export function checkUsageAccess(): Promise<boolean> {
  if (!isTauri()) return Promise.resolve(false);
  return invoke('focus_check_usage_access');
}

export function openUsageAccessSettings(): Promise<void> {
  if (!isTauri()) return Promise.resolve();
  return invoke('focus_open_usage_access_settings');
}

export function getFocusApps(): Promise<FocusApp[]> {
  if (!isTauri()) return Promise.resolve([]);
  return invoke('focus_get_apps');
}

export function addRule(packageName: string, appName: string, dailyLimitSeconds: number): Promise<void> {
  if (!isTauri()) return Promise.reject(new Error('Focus belum tersedia di versi web'));
  return invoke('focus_add_rule', { payload: { packageName, appName, dailyLimitSeconds } });
}

export function updateRule(
  packageName: string,
  changes: { enabled?: boolean; dailyLimitSeconds?: number },
): Promise<void> {
  if (!isTauri()) return Promise.reject(new Error('Focus belum tersedia di versi web'));
  return invoke('focus_update_rule', { payload: { packageName, ...changes } });
}

export type AppPreferences = {
  displayName: string | null;
  interfaceLanguage: string;
  theme: string;
  aiOnlineEnabled: boolean;
};

const SETTINGS_KEY = 'jf_settings_v1';
const DEFAULT_SETTINGS: AppPreferences = {
  displayName: null,
  interfaceLanguage: 'id',
  theme: 'system',
  aiOnlineEnabled: false,
};

export function getSettings(): Promise<AppPreferences> {
  if (!isTauri()) return Promise.resolve(readJSON(SETTINGS_KEY, DEFAULT_SETTINGS));
  return invoke('settings_get');
}

export function updateSettings(changes: Partial<{
  displayName: string;
  interfaceLanguage: string;
  theme: string;
  aiOnlineEnabled: boolean;
}>): Promise<void> {
  if (!isTauri()) {
    const current = readJSON(SETTINGS_KEY, DEFAULT_SETTINGS);
    writeJSON(SETTINGS_KEY, { ...current, ...changes });
    return Promise.resolve();
  }
  return invoke('settings_update', { payload: changes });
}
