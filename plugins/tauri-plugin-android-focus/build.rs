const COMMANDS: &[&str] = &[
  "check_usage_access",
  "open_usage_access_settings",
  "get_installed_apps",
  "get_usage_stats",
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
