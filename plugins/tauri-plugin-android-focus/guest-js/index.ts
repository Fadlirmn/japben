import { invoke } from '@tauri-apps/api/core';

export type UsageAccessStatus = { granted: boolean };
export type InstalledApp = { packageName: string; appName: string };
export type AppUsage = { packageName: string; foregroundMillis: number };

export async function checkUsageAccess(): Promise<UsageAccessStatus> {
  return invoke('plugin:android-focus|check_usage_access');
}

export async function openUsageAccessSettings(): Promise<void> {
  return invoke('plugin:android-focus|open_usage_access_settings');
}

export async function getInstalledApps(): Promise<InstalledApp[]> {
  const res = await invoke<{ apps: InstalledApp[] }>('plugin:android-focus|get_installed_apps');
  return res.apps;
}

export async function getUsageStats(startMillis: number, endMillis: number): Promise<AppUsage[]> {
  const res = await invoke<{ usages: AppUsage[] }>('plugin:android-focus|get_usage_stats', {
    payload: { startMillis, endMillis },
  });
  return res.usages;
}
