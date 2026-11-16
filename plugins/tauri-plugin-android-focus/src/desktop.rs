use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<AndroidFocus<R>> {
  Ok(AndroidFocus(app.clone()))
}

/// Desktop has no Usage Access concept; Focus Engine is Android-only (see prd.md 9.1).
pub struct AndroidFocus<R: Runtime>(AppHandle<R>);

impl<R: Runtime> AndroidFocus<R> {
  pub fn check_usage_access(&self) -> crate::Result<UsageAccessStatus> {
    Ok(UsageAccessStatus { granted: false })
  }

  pub fn open_usage_access_settings(&self) -> crate::Result<()> {
    Ok(())
  }

  pub fn get_installed_apps(&self) -> crate::Result<InstalledAppsResponse> {
    Ok(InstalledAppsResponse::default())
  }

  pub fn get_usage_stats(&self, _payload: UsageStatsRequest) -> crate::Result<UsageStatsResponse> {
    Ok(UsageStatsResponse::default())
  }
}
