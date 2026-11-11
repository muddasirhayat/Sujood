/**
 * Islamic civil (tabular) calendar.
 * 30-year cycle with 11 leap years (2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29).
 * Epoch JD 1948439, which yields 2 Jumada al-Akhirah 1448 on 12 November 2026,
 * the date used in the Sujood mockups.
 */

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qa'dah",
  "Dhul-Hijjah",
] as const;

export const HIJRI_MONTHS_SHORT = [
  "Muharram",
  "Safar",
  "Rabi' I",
  "Rabi' II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qa'dah",
  "Dhul-Hijjah",
] as const;

const LEAP = new Set([2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]);
const EPOCH_JD = 1948439;

export type HijriDate = {
  year: number;
  month: number; // 1-12
  day: number;
  monthName: string;
  monthShort: string;
  isRamadan: boolean;
};

export function gregorianToJd(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function isHijriLeap(year: number): boolean {
  return LEAP.has(((year - 1) % 30) + 1);
}

export function hijriYearLength(year: number): number {
  return isHijriLeap(year) ? 355 : 354;
}

export function hijriMonthLength(year: number, month: number): number {
  if (month % 2 === 1) return 30;
  if (month === 12 && isHijriLeap(year)) return 30;
  return 29;
}

export function toHijri(year: number, month: number, day: number): HijriDate {
  let days = gregorianToJd(year, month, day) - EPOCH_JD;
  if (days < 0) {
    return { year: 1, month: 1, day: 1, monthName: HIJRI_MONTHS[0], monthShort: HIJRI_MONTHS_SHORT[0], isRamadan: false };
  }
  const cycle = Math.floor(days / 10631);
  let rem = days % 10631;
  let hy = cycle * 30 + 1;
  while (rem >= hijriYearLength(hy)) {
    rem -= hijriYearLength(hy);
    hy += 1;
  }
  let hm = 1;
  while (rem >= hijriMonthLength(hy, hm)) {
    rem -= hijriMonthLength(hy, hm);
    hm += 1;
  }
  const hd = rem + 1;
  return {
    year: hy,
    month: hm,
    day: hd,
    monthName: HIJRI_MONTHS[hm - 1]!,
    monthShort: HIJRI_MONTHS_SHORT[hm - 1]!,
    isRamadan: hm === 9,
  };
}

export function toHijriFromDate(date: Date, timeZone: string): HijriDate {
  const parts = ymdInZone(date, timeZone);
  return toHijri(parts.year, parts.month, parts.day);
}

export function ymdInZone(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const raw = fmt.format(date); // YYYY-MM-DD
  const [y, m, d] = raw.split("-").map((n) => Number(n));
  return { year: y!, month: m!, day: d! };
}

export function formatHijri(h: HijriDate, style: "long" | "short" | "day-month" = "long"): string {
  if (style === "short") return `${h.day} ${h.monthShort} ${h.year}`;
  if (style === "day-month") return `${h.day} ${h.monthName}`;
  return `${h.day} ${h.monthName} ${h.year}`;
}

export function isFriday(date: Date, timeZone: string): boolean {
  // 0 Sun .. 5 Friday in en-US weekday numeric? Use format
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  return wd === "Fri";
}
