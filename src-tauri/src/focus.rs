use crate::db::{now_millis, Db};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, AppHandle, State};
use tauri_plugin_android_focus::{AndroidFocusExt, UsageStatsRequest};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FocusApp {
  pub package_name: String,
  pub app_name: String,
  pub protected: bool,
  pub daily_limit_seconds: Option<i64>,
  pub usage_seconds: i64,
}

#[command]
pub async fn focus_check_usage_access(app: AppHandle) -> Result<bool, String> {
  app
    .android_focus()
    .check_usage_access()
    .map(|s| s.granted)
    .map_err(|e| e.to_string())
}

#[command]
pub async fn focus_open_usage_access_settings(app: AppHandle) -> Result<(), String> {
  app
    .android_focus()
    .open_usage_access_settings()
    .map_err(|e| e.to_string())
}

#[command]
pub async fn focus_get_apps(app: AppHandle, db: State<'_, Db>) -> Result<Vec<FocusApp>, String> {
  let installed = app
    .android_focus()
    .get_installed_apps()
    .map_err(|e| e.to_string())?;

  // ponytail: "today" here is UTC-midnight-aligned, not device local midnight
  // (prd.md 7.4 wants local-date resets). Fine for displaying today's usage;
  // revisit when implementing the daily/emergency-unlock reset logic, which
  // needs real local-calendar handling.
  let now = now_millis();
  let start_of_day = now - (now % 86_400_000);
  let usage = app
    .android_focus()
    .get_usage_stats(UsageStatsRequest {
      start_millis: start_of_day,
      end_millis: now,
    })
    .map_err(|e| e.to_string())?;
  let usage_by_package: HashMap<String, i64> = usage
    .usages
    .into_iter()
    .map(|u| (u.package_name, u.foreground_millis / 1000))
    .collect();

  let conn = db.0.lock().map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT enabled, daily_limit_seconds FROM app_rules WHERE package_name = ?1")
    .map_err(|e| e.to_string())?;

  let apps = installed
    .apps
    .into_iter()
    .map(|app_info| {
      let rule: Option<(bool, i64)> = stmt
        .query_row([&app_info.package_name], |row| {
          Ok((row.get::<_, i64>(0)? != 0, row.get(1)?))
        })
        .ok();
      FocusApp {
        usage_seconds: usage_by_package
          .get(&app_info.package_name)
          .copied()
          .unwrap_or(0),
        protected: rule.map(|r| r.0).unwrap_or(false),
        daily_limit_seconds: rule.map(|r| r.1),
        package_name: app_info.package_name,
        app_name: app_info.app_name,
      }
    })
    .collect();

  Ok(apps)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddRuleRequest {
  pub package_name: String,
  pub app_name: String,
  pub daily_limit_seconds: i64,
}

#[command]
pub async fn focus_add_rule(db: State<'_, Db>, payload: AddRuleRequest) -> Result<(), String> {
  if payload.daily_limit_seconds <= 0 {
    return Err("daily_limit_seconds must be positive".to_string());
  }
  let conn = db.0.lock().map_err(|e| e.to_string())?;
  let now = now_millis();
  conn
    .execute(
      "INSERT INTO app_rules (package_name, app_name, enabled, daily_limit_seconds, unlock_duration_seconds, created_at, updated_at)
       VALUES (?1, ?2, 1, ?3, 900, ?4, ?4)
       ON CONFLICT(package_name) DO UPDATE SET
         enabled = 1,
         daily_limit_seconds = excluded.daily_limit_seconds,
         updated_at = excluded.updated_at",
      rusqlite::params![payload.package_name, payload.app_name, payload.daily_limit_seconds, now],
    )
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateRuleRequest {
  pub package_name: String,
  pub enabled: Option<bool>,
  pub daily_limit_seconds: Option<i64>,
}

#[command]
pub async fn focus_update_rule(
  db: State<'_, Db>,
  payload: UpdateRuleRequest,
) -> Result<(), String> {
  let conn = db.0.lock().map_err(|e| e.to_string())?;
  let now = now_millis();
  if let Some(enabled) = payload.enabled {
    conn
      .execute(
        "UPDATE app_rules SET enabled = ?1, updated_at = ?2 WHERE package_name = ?3",
        rusqlite::params![enabled as i64, now, payload.package_name],
      )
      .map_err(|e| e.to_string())?;
  }
  if let Some(limit) = payload.daily_limit_seconds {
    if limit <= 0 {
      return Err("daily_limit_seconds must be positive".to_string());
    }
    conn
      .execute(
        "UPDATE app_rules SET daily_limit_seconds = ?1, updated_at = ?2 WHERE package_name = ?3",
        rusqlite::params![limit, now, payload.package_name],
      )
      .map_err(|e| e.to_string())?;
  }
  Ok(())
}
