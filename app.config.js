const BADGE_PERMISSIONS = [
  "com.sec.android.provider.badge.permission.READ",
  "com.sec.android.provider.badge.permission.WRITE",
  "com.htc.launcher.permission.READ_SETTINGS",
  "com.htc.launcher.permission.UPDATE_SHORTCUT",
  "com.sonyericsson.home.permission.BROADCAST_BADGE",
  "com.sonymobile.home.permission.PROVIDER_INSERT_BADGE",
  "com.anddoes.launcher.permission.UPDATE_COUNT",
  "com.majeur.launcher.permission.UPDATE_BADGE",
  "com.huawei.android.launcher.permission.CHANGE_BADGE",
  "com.huawei.android.launcher.permission.READ_SETTINGS",
  "com.huawei.android.launcher.permission.WRITE_SETTINGS",
  "android.permission.READ_APP_BADGE",
  "com.oppo.launcher.permission.READ_SETTINGS",
  "com.oppo.launcher.permission.WRITE_SETTINGS",
  "me.everything.badger.permission.BADGE_COUNT_READ",
  "me.everything.badger.permission.BADGE_COUNT_WRITE",
];

function pluginName(plugin) {
  return Array.isArray(plugin) ? plugin[0] : plugin;
}

module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const includeDevClient = !profile || profile === "development";

  const plugins = (config.plugins ?? []).filter(
    (plugin) => includeDevClient || pluginName(plugin) !== "expo-dev-client",
  );

  const blocked = new Set(config.android?.blockedPermissions ?? []);
  for (const permission of BADGE_PERMISSIONS) blocked.add(permission);
  if (!includeDevClient) {
    blocked.add("android.permission.SYSTEM_ALERT_WINDOW");
  }

  return {
    ...config,
    plugins,
    android: {
      ...config.android,
      blockedPermissions: [...blocked],
    },
  };
};
