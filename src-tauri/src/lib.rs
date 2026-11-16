mod db;
mod focus;
mod settings;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_android_focus::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      let db = db::init(app.handle())?;
      app.manage(db);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      focus::focus_check_usage_access,
      focus::focus_open_usage_access_settings,
      focus::focus_get_apps,
      focus::focus_add_rule,
      focus::focus_update_rule,
      settings::settings_get,
      settings::settings_update,
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
