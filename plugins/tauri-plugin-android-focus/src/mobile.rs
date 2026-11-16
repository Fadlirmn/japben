use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_android_focus);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<AndroidFocus<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("com.plugin.android_focus", "FocusPlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_android_focus)?;
  Ok(AndroidFocus(handle))
}

/// Access to the android-focus APIs.
pub struct AndroidFocus<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> AndroidFocus<R> {
  pub fn check_usage_access(&self) -> crate::Result<UsageAccessStatus> {
    self
      .0
      .run_mobile_plugin("checkUsageAccess", ())
      .map_err(Into::into)
  }

  pub fn open_usage_access_settings(&self) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("openUsageAccessSettings", ())
      .map_err(Into::into)
  }

  pub fn get_installed_apps(&self) -> crate::Result<InstalledAppsResponse> {
    self
      .0
      .run_mobile_plugin("getInstalledApps", ())
      .map_err(Into::into)
  }

  pub fn get_usage_stats(&self, payload: UsageStatsRequest) -> crate::Result<UsageStatsResponse> {
    self
      .0
      .run_mobile_plugin("getUsageStats", payload)
      .map_err(Into::into)
  }
}
