import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  PrayerTimes,
  Prayer,
} from "adhan";
import { ymdInZone } from "./hijri";

export type MethodId =
  | "Karachi"
  | "MuslimWorldLeague"
  | "UmmAlQura"
  | "Egyptian"
  | "NorthAmerica"
  | "MoonsightingCommittee"
  | "Dubai"
  | "Kuwait"
  | "Qatar"
  | "Singapore"
  | "Tehran"
  | "Turkey";

export type MadhabId = "Hanafi" | "Shafi";

export type PrayerId = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_IDS: PrayerId[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
export const SALAH_IDS: Array<Exclude<PrayerId, "sunrise">> = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export type Offsets = Record<Exclude<PrayerId, "sunrise">, number>;

export const ZERO_OFFSETS: Offsets = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

export type MethodInfo = {
  id: MethodId;
  name: string;
  detail: string;
};

export const METHODS: MethodInfo[] = [
  { id: "Karachi", name: "University of Islamic Sciences, Karachi", detail: "Fajr and Isha at 18°" },
  { id: "MuslimWorldLeague", name: "Muslim World League", detail: "Isha at 17°" },
  { id: "UmmAlQura", name: "Umm Al-Qura, Makkah", detail: "Isha 90 minutes after Maghrib" },
  { id: "Egyptian", name: "Egyptian General Authority", detail: "Fajr 19.5°, Isha 17.5°" },
  { id: "NorthAmerica", name: "Islamic Society of North America", detail: "Fajr and Isha at 15°" },
  { id: "MoonsightingCommittee", name: "Moonsighting Committee", detail: "Seasonal Fajr and Isha" },
  { id: "Dubai", name: "Dubai", detail: "Used in the UAE" },
  { id: "Kuwait", name: "Kuwait", detail: "Fajr 18°, Isha 17.5°" },
  { id: "Qatar", name: "Qatar", detail: "Isha 90 minutes after Maghrib" },
  { id: "Singapore", name: "Singapore", detail: "Fajr 20°, Isha 18°" },
  { id: "Tehran", name: "Institute of Geophysics, Tehran", detail: "Fajr 17.7°, Isha 14°" },
  { id: "Turkey", name: "Diyanet, Turkey", detail: "Official Turkish method" },
];

export function methodById(id: MethodId): MethodInfo {
  return METHODS.find((m) => m.id === id) ?? METHODS[0]!;
}

function makeParams(method: MethodId, madhab: MadhabId): CalculationParameters {
  const factories: Record<MethodId, () => CalculationParameters> = {
    Karachi: () => CalculationMethod.Karachi(),
    MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
    UmmAlQura: () => CalculationMethod.UmmAlQura(),
    Egyptian: () => CalculationMethod.Egyptian(),
    NorthAmerica: () => CalculationMethod.NorthAmerica(),
    MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
    Dubai: () => CalculationMethod.Dubai(),
    Kuwait: () => CalculationMethod.Kuwait(),
    Qatar: () => CalculationMethod.Qatar(),
    Singapore: () => CalculationMethod.Singapore(),
    Tehran: () => CalculationMethod.Tehran(),
    Turkey: () => CalculationMethod.Turkey(),
  };
  const params = factories[method]();
  params.madhab = madhab === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  // Karachi() applies a +1 minute method adjustment to Dhuhr. The Aladhan
  // sample used in the mockups (12 Nov 2026, Karachi, Hanafi) is 12:16, which
  // matches adhan-js with that adjustment cleared and nearest-minute rounding.
  params.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  return params;
}

export type DayTimes = {
  date: { year: number; month: number; day: number };
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

export type ComputeInput = {
  year: number;
  month: number;
  day: number;
  latitude: number;
  longitude: number;
  method: MethodId;
  madhab: MadhabId;
  offsets?: Offsets;
};

/**
 * Compute prayer times for a civil date at the given coordinates.
 * The year/month/day are the location's calendar date (not the device's).
 */
export function computeDayTimes(input: ComputeInput): DayTimes {
  const params = makeParams(input.method, input.madhab);
  if (input.offsets) {
    params.adjustments = {
      fajr: input.offsets.fajr,
      sunrise: 0,
      dhuhr: input.offsets.dhuhr,
      asr: input.offsets.asr,
      maghrib: input.offsets.maghrib,
      isha: input.offsets.isha,
    };
  }
  // adhan-js reads getFullYear/getMonth/getDate from this Date. Using noon
  // avoids DST/midnight edge cases in the runtime timezone.
  const civil = new Date(input.year, input.month - 1, input.day, 12, 0, 0);
  const pt = new PrayerTimes(new Coordinates(input.latitude, input.longitude), civil, params);
  return {
    date: { year: input.year, month: input.month, day: input.day },
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };
}

export function computeForDate(
  date: Date,
  timeZone: string,
  latitude: number,
  longitude: number,
  method: MethodId,
  madhab: MadhabId,
  offsets?: Offsets,
): DayTimes {
  const ymd = ymdInZone(date, timeZone);
  return computeDayTimes({ ...ymd, latitude, longitude, method, madhab, offsets });
}

export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatClock(date: Date, timeZone: string): string {
  return formatTime(date, timeZone);
}

export type NextPrayer = {
  id: Exclude<PrayerId, "sunrise">;
  name: string;
  time: Date;
  startsAt: string;
  remainingMs: number;
};

export const PRAYER_NAMES: Record<PrayerId, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function nextPrayer(times: DayTimes, now: Date, tomorrow?: DayTimes): NextPrayer {
  const order: Array<Exclude<PrayerId, "sunrise">> = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  for (const id of order) {
    const time = times[id];
    if (time.getTime() > now.getTime()) {
      return {
        id,
        name: PRAYER_NAMES[id],
        time,
        startsAt: "",
        remainingMs: time.getTime() - now.getTime(),
      };
    }
  }
  const fajr = tomorrow?.fajr ?? new Date(times.fajr.getTime() + 24 * 60 * 60 * 1000);
  return {
    id: "fajr",
    name: "Fajr",
    time: fajr,
    startsAt: "",
    remainingMs: fajr.getTime() - now.getTime(),
  };
}

export function currentPrayerId(times: DayTimes, now: Date): PrayerId | "night" {
  if (now < times.fajr) return "night";
  if (now < times.sunrise) return "fajr";
  if (now < times.dhuhr) return "sunrise";
  if (now < times.asr) return "dhuhr";
  if (now < times.maghrib) return "asr";
  if (now < times.isha) return "maghrib";
  return "isha";
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "0 min";
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) {
    const sec = Math.max(1, Math.round(ms / 1000));
    return `${sec} sec`;
  }
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function monthDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 0 = Sunday. */
export function weekdaySundayZero(year: number, month: number, day: number, timeZone: string): number {
  // Noon UTC on that civil date, then weekday in zone — safer: construct and format
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(probe);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}

export function weekdayLong(year: number, month: number, day: number, timeZone: string): string {
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(probe);
}

export function weekdayShort(year: number, month: number, day: number, timeZone: string): string {
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(probe);
}

export function monthNameLong(month: number): string {
  return [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ][month - 1]!;
}

export function computeMonth(
  year: number,
  month: number,
  latitude: number,
  longitude: number,
  method: MethodId,
  madhab: MadhabId,
  offsets?: Offsets,
): DayTimes[] {
  const n = monthDays(year, month);
  const out: DayTimes[] = [];
  for (let d = 1; d <= n; d++) {
    out.push(computeDayTimes({ year, month, day: d, latitude, longitude, method, madhab, offsets }));
  }
  return out;
}

/** Known Karachi sample used in the plan and mockups, 12 Nov 2026. */
export const KARACHI_SAMPLE_2026_11_12 = {
  latitude: 24.8607,
  longitude: 67.0011,
  timezone: "Asia/Karachi",
  fajr: "05:28",
  sunrise: "06:46",
  dhuhr: "12:16",
  asr: "16:10",
  maghrib: "17:46",
  isha: "19:04",
};

// Re-export Prayer so scheduling can map names if needed.
export { Prayer };
