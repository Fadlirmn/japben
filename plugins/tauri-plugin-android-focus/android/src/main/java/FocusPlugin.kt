package com.plugin.android_focus

import android.app.AppOpsManager
import android.app.Activity
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Process
import android.provider.Settings
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSArray
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import java.util.concurrent.Executors

@InvokeArg
class UsageStatsArgs {
  var startMillis: Long = 0
  var endMillis: Long = 0
}

@TauriPlugin
class FocusPlugin(private val activity: Activity) : Plugin(activity) {
  // queryIntentActivities/queryAndAggregateUsageStats can take noticeable time on
  // devices with many installed apps; run them off the main thread so they never
  // block the UI (Invoke.resolve/reject is safe to call from a background thread).
  private val backgroundExecutor = Executors.newSingleThreadExecutor()

  private fun hasUsageAccess(): Boolean {
    val appOps = activity.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      activity.packageName,
    )
    return mode == AppOpsManager.MODE_ALLOWED
  }

  @Command
  fun checkUsageAccess(invoke: Invoke) {
    val ret = JSObject()
    ret.put("granted", hasUsageAccess())
    invoke.resolve(ret)
  }

  @Command
  fun openUsageAccessSettings(invoke: Invoke) {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    intent.data = Uri.parse("package:${activity.packageName}")
    activity.startActivity(intent)
    invoke.resolve()
  }

  @Command
  fun getInstalledApps(invoke: Invoke) {
    backgroundExecutor.execute {
      try {
        val pm = activity.packageManager
        val launcherIntent = Intent(Intent.ACTION_MAIN)
        launcherIntent.addCategory(Intent.CATEGORY_LAUNCHER)

        val seenPackages = HashSet<String>()
        val apps = JSArray()
        for (resolveInfo in pm.queryIntentActivities(launcherIntent, 0)) {
          val packageName = resolveInfo.activityInfo.packageName
          if (packageName == activity.packageName) continue
          if (!seenPackages.add(packageName)) continue // skip duplicate launcher entries (e.g. app twins)

          val app = JSObject()
          app.put("packageName", packageName)
          app.put("appName", resolveInfo.loadLabel(pm).toString())
          apps.put(app)
        }

        val ret = JSObject()
        ret.put("apps", apps)
        invoke.resolve(ret)
      } catch (e: Exception) {
        invoke.reject(e.message ?: "Failed to list installed apps")
      }
    }
  }

  @Command
  fun getUsageStats(invoke: Invoke) {
    if (!hasUsageAccess()) {
      invoke.reject("Usage access permission not granted")
      return
    }

    backgroundExecutor.execute {
      try {
        val args = invoke.parseArgs(UsageStatsArgs::class.java)
        val usageStatsManager =
          activity.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val stats = usageStatsManager.queryAndAggregateUsageStats(args.startMillis, args.endMillis)

        val usages = JSArray()
        for ((packageName, usageStats) in stats) {
          if (usageStats.totalTimeInForeground <= 0) continue
          val usage = JSObject()
          usage.put("packageName", packageName)
          usage.put("foregroundMillis", usageStats.totalTimeInForeground)
          usages.put(usage)
        }

        val ret = JSObject()
        ret.put("usages", usages)
        invoke.resolve(ret)
      } catch (e: Exception) {
        invoke.reject(e.message ?: "Failed to read usage stats")
      }
    }
  }
}
