use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::AndroidFocusExt;
use crate::Result;

#[command]
pub(crate) async fn check_usage_access<R: Runtime>(app: AppHandle<R>) -> Result<UsageAccessStatus> {
  app.android_focus().check_usage_access()
}

#[command]
pub(crate) async fn open_usage_access_settings<R: Runtime>(app: AppHandle<R>) -> Result<()> {
  app.android_focus().open_usage_access_settings()
}

#[command]
pub(crate) async fn get_installed_apps<R: Runtime>(
  app: AppHandle<R>,
) -> Result<InstalledAppsResponse> {
  app.android_focus().get_installed_apps()
}

#[command]
pub(crate) async fn get_usage_stats<R: Runtime>(
  app: AppHandle<R>,
  payload: UsageStatsRequest,
) -> Result<UsageStatsResponse> {
  app.android_focus().get_usage_stats(payload)
}
