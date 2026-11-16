use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::AndroidFocus;
#[cfg(mobile)]
use mobile::AndroidFocus;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the android-focus APIs.
pub trait AndroidFocusExt<R: Runtime> {
  fn android_focus(&self) -> &AndroidFocus<R>;
}

impl<R: Runtime, T: Manager<R>> crate::AndroidFocusExt<R> for T {
  fn android_focus(&self) -> &AndroidFocus<R> {
    self.state::<AndroidFocus<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("android-focus")
    .invoke_handler(tauri::generate_handler![
      commands::check_usage_access,
      commands::open_usage_access_settings,
      commands::get_installed_apps,
      commands::get_usage_stats
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let android_focus = mobile::init(app, api)?;
      #[cfg(desktop)]
      let android_focus = desktop::init(app, api)?;
      app.manage(android_focus);
      Ok(())
    })
    .build()
}
