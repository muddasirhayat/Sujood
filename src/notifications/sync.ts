import { Platform } from "react-native";
import type { PersistedState } from "../storage/schema";
import { computeForDate } from "../prayer/times";
import { toHijri, isFriday, ymdInZone } from "../prayer/hijri";
import { buildRollingSchedule, type ScheduledAlert } from "../prayer/schedule";
import { ayahForDay, dayOfYear, DAILY_DUA } from "../content/quran";

const SOUND_FILE: Record<string, string> = {
  dawn: "azan-dawn.wav",
  classic: "azan-classic.wav",
  dusk: "azan-dusk.wav",
  chime: "chime.wav",
};

export function upcomingAlerts(state: PersistedState, now: Date, days = 4): ScheduledAlert[] {
  const loc = state.location;
  const list = [];
  const start = ymdInZone(now, loc.timezone);
  for (let i = 0; i < days; i++) {
    const probe = new Date(Date.UTC(start.year, start.month - 1, start.day + i, 12, 0, 0));
    const y = probe.getUTCFullYear();
    const m = probe.getUTCMonth() + 1;
    const d = probe.getUTCDate();
    const times = computeForDate(probe, "UTC", loc.latitude, loc.longitude, state.method, state.madhab, state.offsets);
    const h = toHijri(y, m, d);
    const friday = isFriday(probe, "UTC"); // noon UTC weekday may be off; use location tz
    const fridayLocal = isFriday(new Date(Date.UTC(y, m - 1, d, 8, 0, 0)), loc.timezone);
    list.push({ times, isRamadan: h.isRamadan, isFriday: fridayLocal });
    void friday;
  }
  const doy = dayOfYear(now, loc.timezone);
  const ayah = ayahForDay(doy);
  return buildRollingSchedule(list, state.alerts, now, { ayahBody: `${ayah.ref}: ${ayah.text}`, hadithBody: "Open the Hadith collections in Sujood." });
}

export async function syncAzanSchedule(state: PersistedState, now: Date): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === "android") {
      for (const [id, file] of Object.entries({
        "azan-dawn": SOUND_FILE.dawn,
        "azan-classic": SOUND_FILE.classic,
        "azan-dusk": SOUND_FILE.dusk,
        reminders: SOUND_FILE.chime,
        azan: SOUND_FILE.classic,
      })) {
        await Notifications.setNotificationChannelAsync(id, {
          name: id.startsWith("azan") ? "Azan" : "Reminders",
          importance: Notifications.AndroidImportance.MAX,
          sound: file,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          enableVibrate: true,
          bypassDnd: id.startsWith("azan"),
        });
      }
    }
    const alerts = upcomingAlerts(state, now, 3).slice(0, 50);
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const alert of alerts) {
      const channelId = alert.kind === "azan" || alert.kind === "iftar" ? `azan-${alert.sound}` : "reminders";
      const trigger: Record<string, unknown> = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alert.fireAt,
        channelId,
      };
      // SDK 58+ alarmClock delivery, ignored when unsupported
      trigger.delivery = "alarmClock";
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: alert.id,
          content: {
            title: alert.title,
            body: alert.body,
            sound: SOUND_FILE[alert.sound] ?? SOUND_FILE.classic,
            data: { kind: alert.kind, prayer: alert.prayer ?? null, url: alert.kind === "azan" ? "/azan" : "/" },
          },
          trigger: trigger as never,
        });
      } catch {
        // fall back without delivery field
        delete trigger.delivery;
        await Notifications.scheduleNotificationAsync({
          identifier: alert.id,
          content: {
            title: alert.title,
            body: alert.body,
            sound: SOUND_FILE[alert.sound] ?? SOUND_FILE.classic,
            data: { kind: alert.kind, prayer: alert.prayer ?? null },
          },
          trigger: trigger as never,
        });
      }
    }
  } catch {
    // Notifications are unavailable (simulator, denied, etc.)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const Notifications = await import("expo-notifications");
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function openExactAlarmSettings(): Promise<void> {
  const { Platform: P, Linking } = await import("react-native");
  if (P.OS !== "android") return;
  try {
    const IntentLauncher = await import("expo-intent-launcher");
    await IntentLauncher.startActivityAsync("android.settings.REQUEST_SCHEDULE_EXACT_ALARM");
  } catch {
    await Linking.openSettings();
  }
}

export async function openBatterySettings(): Promise<void> {
  const { Platform: P, Linking } = await import("react-native");
  if (P.OS !== "android") return;
  try {
    const IntentLauncher = await import("expo-intent-launcher");
    await IntentLauncher.startActivityAsync("android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS");
  } catch {
    await Linking.openSettings();
  }
}

void DAILY_DUA;
