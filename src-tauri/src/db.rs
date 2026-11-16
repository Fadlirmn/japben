use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub struct Db(pub Mutex<Connection>);

const SCHEMA_VERSION: i32 = 1;

// ponytail: app_rules uses package_name as primary key (skips a separate
// UUID `id` column from prd.md 10.1) since package_name is already unique
// per device and every planned FK (usage_sessions, unlock_events, ...)
// would reference it anyway. Revisit if a rule ever needs a stable id that
// survives a package_name change (it won't: package_name is the OS identity).
const SCHEMA: &str = "
  CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS app_rules (
    package_name TEXT PRIMARY KEY,
    app_name TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    daily_limit_seconds INTEGER NOT NULL,
    unlock_duration_seconds INTEGER NOT NULL DEFAULT 900,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS app_preferences (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    display_name TEXT,
    interface_language TEXT NOT NULL DEFAULT 'id',
    theme TEXT NOT NULL DEFAULT 'system',
    ai_online_enabled INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
";

pub fn init(app: &AppHandle) -> rusqlite::Result<Db> {
  let dir = app
    .path()
    .app_data_dir()
    .expect("app data dir must resolve");
  std::fs::create_dir_all(&dir).expect("create app data dir");

  let conn = Connection::open(dir.join("japanese-focus.db"))?;
  conn.pragma_update(None, "foreign_keys", true)?;
  conn.execute_batch(SCHEMA)?;

  let version: i32 = conn.query_row(
    "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
    [],
    |row| row.get(0),
  )?;
  if version < SCHEMA_VERSION {
    conn.execute(
      "INSERT INTO schema_migrations (version) VALUES (?1)",
      [SCHEMA_VERSION],
    )?;
  }

  Ok(Db(Mutex::new(conn)))
}

pub fn now_millis() -> i64 {
  std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap()
    .as_millis() as i64
}
