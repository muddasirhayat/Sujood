import type { DayTimes, PrayerId } from "./times";
import { SALAH_IDS, PRAYER_NAMES } from "./times";

export type AzanSound = "dawn" | "classic" | "dusk";

export type PrayerAlertPref = {
  enabled: boolean;
  sound: AzanSound;
};

export type AlertPrefs = {
  azanEnabled: boolean;
  perPrayer: Record<Exclude<PrayerId, "sunrise">, PrayerAlertPref>;
  preReminder: boolean;
  preReminderMinutes: number;
  dailyAyah: boolean;
  dailyHadith: boolean;
  jumuah: boolean;
  /** When true, Suhoor is scheduled on Ramadan days only. */
  suhoor: boolean;
  /** When true, Iftar is scheduled on Ramadan days only. */
  iftar: boolean;
};

export type ScheduledKind =
  | "azan"
  | "pre-reminder"
  | "daily-ayah"
  | "daily-hadith"
  | "jumuah"
  | "suhoor"
  | "iftar";

export type ScheduledAlert = {
  id: string;
  kind: ScheduledKind;
  prayer?: Exclude<PrayerId, "sunrise">;
  fireAt: Date;
  title: string;
  body: string;
  sound: AzanSound | "chime";
  channelId: string;
};

function atTime(base: Date, hour: number, minute: number): Date {
  const d = new Date(base.getTime());
  d.setHours(hour, minute, 0, 0);
  return d;
}

function minusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

/**
 * Build the local notification schedule for one civil day.
 * Pure: no native APIs. The caller persists or hands these to expo-notifications.
 * Only future alerts (fireAt > now) are returned when `now` is provided.
 */
export function buildDaySchedule(options: {
  times: DayTimes;
  prefs: AlertPrefs;
  isRamadan: boolean;
  isFriday: boolean;
  now?: Date;
  ayahBody?: string;
  hadithBody?: string;
}): ScheduledAlert[] {
  const { times, prefs, isRamadan, isFriday, now } = options;
  const out: ScheduledAlert[] = [];
  const y = times.date.year;
  const m = times.date.month;
  const d = times.date.day;
  const prefix = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  if (prefs.azanEnabled) {
    for (const id of SALAH_IDS) {
      const pref = prefs.perPrayer[id];
      if (!pref?.enabled) continue;
      const fireAt = times[id];
      out.push({
        id: `${prefix}-azan-${id}`,
        kind: "azan",
        prayer: id,
        fireAt,
        title: PRAYER_NAMES[id],
        body: "It is time to pray",
        sound: pref.sound,
        channelId: "azan",
      });
      if (prefs.preReminder) {
        out.push({
          id: `${prefix}-pre-${id}`,
          kind: "pre-reminder",
          prayer: id,
          fireAt: minusMinutes(fireAt, prefs.preReminderMinutes),
          title: `${PRAYER_NAMES[id]} in ${prefs.preReminderMinutes} minutes`,
          body: "A quiet reminder before the Azan.",
          sound: "chime",
          channelId: "reminders",
        });
      }
    }
  }

  if (prefs.dailyAyah) {
    // After Fajr: 20 minutes after Fajr, or 07:00 if Fajr is later than that.
    const afterFajr = new Date(times.fajr.getTime() + 20 * 60 * 1000);
    out.push({
      id: `${prefix}-ayah`,
      kind: "daily-ayah",
      fireAt: afterFajr,
      title: "Daily ayah",
      body: options.ayahBody ?? "A verse for today is waiting in Sujood.",
      sound: "chime",
      channelId: "reminders",
    });
  }

  if (prefs.dailyHadith) {
    // Mid-morning, 10:00 local — constructed from Dhuhr's calendar date.
    const midMorning = new Date(times.dhuhr.getTime());
    midMorning.setHours(10, 0, 0, 0);
    out.push({
      id: `${prefix}-hadith`,
      kind: "daily-hadith",
      fireAt: midMorning,
      title: "Hadith of the day",
      body: options.hadithBody ?? "Open the Hadith collection in Sujood.",
      sound: "chime",
      channelId: "reminders",
    });
  }

  if (prefs.jumuah && isFriday) {
    const jumuah = new Date(times.dhuhr.getTime());
    jumuah.setHours(11, 30, 0, 0);
    out.push({
      id: `${prefix}-jumuah`,
      kind: "jumuah",
      fireAt: jumuah,
      title: "Jumu'ah reminder",
      body: "Friday prayer is approaching.",
      sound: "chime",
      channelId: "reminders",
    });
  }

  if (prefs.suhoor && isRamadan) {
    out.push({
      id: `${prefix}-suhoor`,
      kind: "suhoor",
      fireAt: minusMinutes(times.fajr, 45),
      title: "Suhoor",
      body: "Fajr is in 45 minutes.",
      sound: "chime",
      channelId: "reminders",
    });
  }

  if (prefs.iftar && isRamadan) {
    out.push({
      id: `${prefix}-iftar`,
      kind: "iftar",
      prayer: "maghrib",
      fireAt: times.maghrib,
      title: "Iftar",
      body: "Maghrib has arrived.",
      sound: "dawn",
      channelId: "azan",
    });
  }

  if (!now) return out;
  return out.filter((a) => a.fireAt.getTime() > now.getTime());
}

/**
 * Build a rolling schedule of `days` days starting at `from` (inclusive).
 * Used to feed expo-notifications, which is capped at 64 local notifications
 * on iOS and is happier with a bounded Android set too.
 */
export function buildRollingSchedule(
  days: Array<{
    times: DayTimes;
    isRamadan: boolean;
    isFriday: boolean;
  }>,
  prefs: AlertPrefs,
  now: Date,
  extras?: { ayahBody?: string; hadithBody?: string },
): ScheduledAlert[] {
  const all: ScheduledAlert[] = [];
  for (const day of days) {
    all.push(
      ...buildDaySchedule({
        times: day.times,
        prefs,
        isRamadan: day.isRamadan,
        isFriday: day.isFriday,
        now,
        ayahBody: extras?.ayahBody,
        hadithBody: extras?.hadithBody,
      }),
    );
  }
  all.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return all;
}

export const DEFAULT_PREFS: AlertPrefs = {
  azanEnabled: true,
  perPrayer: {
    fajr: { enabled: true, sound: "dawn" },
    dhuhr: { enabled: true, sound: "classic" },
    asr: { enabled: true, sound: "classic" },
    maghrib: { enabled: true, sound: "dusk" },
    isha: { enabled: true, sound: "classic" },
  },
  preReminder: true,
  preReminderMinutes: 15,
  dailyAyah: true,
  dailyHadith: true,
  jumuah: true,
  suhoor: true,
  iftar: true,
};

// silence unused in some toolchains
void atTime;
