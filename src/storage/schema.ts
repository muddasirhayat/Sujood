import type { MethodId, MadhabId, Offsets } from "../prayer/times";
import { ZERO_OFFSETS } from "../prayer/times";
import type { AlertPrefs } from "../prayer/schedule";
import { DEFAULT_PREFS } from "../prayer/schedule";
import { KARACHI } from "../prayer/cities";

export const STORE_KEY = "sujood.state.v1";
export const STORE_SCHEMA = 1;

export type LocationSource = "gps" | "manual" | "default";

export type SavedLocation = {
  latitude: number;
  longitude: number;
  label: string;
  country: string;
  timezone: string;
  source: LocationSource;
};

export type SalahMarks = {
  date: string; // YYYY-MM-DD in the location timezone
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
};

export type TasbihState = {
  phraseIndex: number;
  count: number;
  target: number;
  marks: SalahMarks;
};

export type PersistedState = {
  schema: number;
  onboardingComplete: boolean;
  onboardingStep: number;
  location: SavedLocation;
  method: MethodId;
  madhab: MadhabId;
  offsets: Offsets;
  alerts: AlertPrefs;
  tasbih: TasbihState;
  translationOn: boolean;
  lastScheduleAt?: string;
};

export function todayKey(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function defaultTasbih(timeZone: string, now = new Date()): TasbihState {
  return {
    phraseIndex: 0,
    count: 0,
    target: 33,
    marks: {
      date: todayKey(timeZone, now),
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    },
  };
}

export function defaultState(): PersistedState {
  return {
    schema: STORE_SCHEMA,
    onboardingComplete: false,
    onboardingStep: 1,
    location: {
      latitude: KARACHI.latitude,
      longitude: KARACHI.longitude,
      label: KARACHI.label,
      country: KARACHI.country,
      timezone: KARACHI.timezone,
      source: "default",
    },
    method: "Karachi",
    madhab: "Hanafi",
    offsets: { ...ZERO_OFFSETS },
    alerts: structuredClone(DEFAULT_PREFS),
    tasbih: defaultTasbih(KARACHI.timezone),
    translationOn: true,
  };
}

export function isPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<PersistedState>;
  return v.schema === STORE_SCHEMA && typeof v.onboardingComplete === "boolean" && !!v.location && !!v.method && !!v.madhab;
}

export function migrateState(raw: unknown): PersistedState {
  const fallback = defaultState();
  if (!raw || typeof raw !== "object") return fallback;
  const v = raw as Partial<PersistedState>;
  if (v.schema !== STORE_SCHEMA) return fallback;
  try {
    return {
      ...fallback,
      ...v,
      schema: STORE_SCHEMA,
      location: { ...fallback.location, ...(v.location ?? {}) },
      offsets: { ...fallback.offsets, ...(v.offsets ?? {}) },
      alerts: {
        ...fallback.alerts,
        ...(v.alerts ?? {}),
        perPrayer: { ...fallback.alerts.perPrayer, ...(v.alerts?.perPrayer ?? {}) },
      },
      tasbih: { ...fallback.tasbih, ...(v.tasbih ?? {}), marks: { ...fallback.tasbih.marks, ...(v.tasbih?.marks ?? {}) } },
    };
  } catch {
    return fallback;
  }
}
