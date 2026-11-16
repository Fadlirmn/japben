use crate::db::{now_millis, Db};
use serde::{Deserialize, Serialize};
use tauri::{command, State};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPreferences {
  pub display_name: Option<String>,
  pub interface_language: String,
  pub theme: String,
  pub ai_online_enabled: bool,
}

impl Default for AppPreferences {
  fn default() -> Self {
    Self {
      display_name: None,
      interface_language: "id".to_string(),
      theme: "system".to_string(),
      ai_online_enabled: false,
    }
  }
}

#[command]
pub async fn settings_get(db: State<'_, Db>) -> Result<AppPreferences, String> {
  let conn = db.0.lock().map_err(|e| e.to_string())?;
  let prefs = conn
    .query_row(
      "SELECT display_name, interface_language, theme, ai_online_enabled FROM app_preferences WHERE id = 1",
      [],
      |row| {
        Ok(AppPreferences {
          display_name: row.get(0)?,
          interface_language: row.get(1)?,
          theme: row.get(2)?,
          ai_online_enabled: row.get::<_, i64>(3)? != 0,
        })
      },
    )
    .ok()
    .unwrap_or_default();
  Ok(prefs)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsRequest {
  pub display_name: Option<String>,
  pub interface_language: Option<String>,
  pub theme: Option<String>,
  pub ai_online_enabled: Option<bool>,
}

#[command]
pub async fn settings_update(
  db: State<'_, Db>,
  payload: UpdateSettingsRequest,
) -> Result<(), String> {
  let conn = db.0.lock().map_err(|e| e.to_string())?;

  let current = conn
    .query_row(
      "SELECT display_name, interface_language, theme, ai_online_enabled FROM app_preferences WHERE id = 1",
      [],
      |row| {
        Ok(AppPreferences {
          display_name: row.get(0)?,
          interface_language: row.get(1)?,
          theme: row.get(2)?,
          ai_online_enabled: row.get::<_, i64>(3)? != 0,
        })
      },
    )
    .ok()
    .unwrap_or_default();

  let merged = AppPreferences {
    display_name: payload.display_name.or(current.display_name),
    interface_language: payload.interface_language.unwrap_or(current.interface_language),
    theme: payload.theme.unwrap_or(current.theme),
    ai_online_enabled: payload.ai_online_enabled.unwrap_or(current.ai_online_enabled),
  };

  conn
    .execute(
      "INSERT INTO app_preferences (id, display_name, interface_language, theme, ai_online_enabled, updated_at)
       VALUES (1, ?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET
         display_name = excluded.display_name,
         interface_language = excluded.interface_language,
         theme = excluded.theme,
         ai_online_enabled = excluded.ai_online_enabled,
         updated_at = excluded.updated_at",
      rusqlite::params![
        merged.display_name,
        merged.interface_language,
        merged.theme,
        merged.ai_online_enabled as i64,
        now_millis(),
      ],
    )
    .map_err(|e| e.to_string())?;

  Ok(())
}
