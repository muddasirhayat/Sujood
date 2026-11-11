import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { loadState, saveState } from "../storage/store";
import {
  defaultState,
  defaultTasbih,
  todayKey,
  type PersistedState,
  type SavedLocation,
} from "../storage/schema";
import { computeForDate, formatTime, nextPrayer, type DayTimes, type NextPrayer, type MethodId, type MadhabId, type PrayerId, SALAH_IDS } from "../prayer/times";
import { toHijriFromDate, formatHijri, type HijriDate, ymdInZone } from "../prayer/hijri";
import type { AlertPrefs, AzanSound } from "../prayer/schedule";
import { syncAzanSchedule } from "../notifications/sync";

export const CLOCK_STORAGE_KEY = "sujood.clock";

function readFrozenClock(): Date | null {
  if (Platform.OS !== "web" || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLOCK_STORAGE_KEY);
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function formatClockLabel(date: Date, timeZone: string): string {
  const raw = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "numeric", minute: "2-digit", hour12: false }).format(date);
  // "04:52" or "4:52" — mockups use no leading zero on the hour for 4:52? Looking at mockup: "4:52" in status bar!
  // The mockup status bar says "4:52" without leading zero. Prayer times use 05:28 with zero.
  const [h, m] = raw.split(":");
  return `${Number(h)}:${m}`;
}

type AppContextValue = {
  ready: boolean;
  state: PersistedState;
  now: Date;
  frozen: boolean;
  clockLabel: string;
  today: DayTimes | null;
  tomorrow: DayTimes | null;
  next: NextPrayer | null;
  hijri: HijriDate | null;
  hijriLabel: string;
  patch: (partial: Partial<PersistedState> | ((s: PersistedState) => PersistedState)) => void;
  setLocation: (loc: SavedLocation) => void;
  setMethod: (method: MethodId) => void;
  setMadhab: (madhab: MadhabId) => void;
  setOffset: (prayer: Exclude<PrayerId, "sunrise">, value: number) => void;
  setAlerts: (partial: Partial<AlertPrefs>) => void;
  setPrayerAlert: (prayer: Exclude<PrayerId, "sunrise">, partial: { enabled?: boolean; sound?: AzanSound }) => void;
  completeOnboarding: () => void;
  bumpTasbih: () => void;
  resetTasbih: () => void;
  nextPhrase: () => void;
  toggleSalahMark: (prayer: Exclude<PrayerId, "sunrise">) => void;
  setTranslationOn: (on: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const PHRASES = 3; // SubhanAllah, Alhamdulillah, AllahuAkbar — 33 each

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState>(defaultState);
  const [frozenClock] = useState<Date | null>(() => readFrozenClock());
  const [now, setNow] = useState<Date>(() => frozenClock ?? new Date());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadState();
      if (!cancelled) {
        setState(loaded);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveState(state);
  }, [ready, state]);

  useEffect(() => {
    if (frozenClock) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [frozenClock]);

  const patch = useCallback((partial: Partial<PersistedState> | ((s: PersistedState) => PersistedState)) => {
    setState((s) => (typeof partial === "function" ? partial(s) : { ...s, ...partial }));
  }, []);

  const tz = state.location.timezone;
  const today = useMemo(() => {
    if (!ready) return null;
    return computeForDate(now, tz, state.location.latitude, state.location.longitude, state.method, state.madhab, state.offsets);
  }, [ready, now, tz, state.location.latitude, state.location.longitude, state.method, state.madhab, state.offsets]);

  const tomorrow = useMemo(() => {
    if (!ready) return null;
    const ymd = ymdInZone(now, tz);
    const nextDay = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + 1, 12, 0, 0));
    return computeForDate(nextDay, "UTC", state.location.latitude, state.location.longitude, state.method, state.madhab, state.offsets);
  }, [ready, now, tz, state.location.latitude, state.location.longitude, state.method, state.madhab, state.offsets]);

  const next = useMemo(() => {
    if (!today) return null;
    const n = nextPrayer(today, now, tomorrow ?? undefined);
    n.startsAt = formatTime(n.time, tz);
    return n;
  }, [today, tomorrow, now, tz]);

  const hijri = useMemo(() => (ready ? toHijriFromDate(now, tz) : null), [ready, now, tz]);
  const hijriLabel = hijri ? formatHijri(hijri) : "";
  const clockLabel = formatClockLabel(now, tz);

  useEffect(() => {
    if (!ready || !state.onboardingComplete) return;
    void syncAzanSchedule(state, now);
  }, [ready, state, now]);

  // Roll tasbih marks onto the new civil day when the clock crosses midnight.
  const tasbihDate = todayKey(tz, now);
  const tasbih = state.tasbih.marks.date === tasbihDate
    ? state.tasbih
    : { ...defaultTasbih(tz, now), phraseIndex: state.tasbih.phraseIndex, count: 0, target: state.tasbih.target };

  const value: AppContextValue = {
    ready,
    state: tasbih === state.tasbih ? state : { ...state, tasbih },
    now,
    frozen: !!frozenClock,
    clockLabel,
    today,
    tomorrow,
    next,
    hijri,
    hijriLabel,
    patch,
    setLocation: (location) => patch({ location }),
    setMethod: (method) => patch({ method }),
    setMadhab: (madhab) => patch({ madhab }),
    setOffset: (prayer, value) =>
      patch((s) => ({ ...s, offsets: { ...s.offsets, [prayer]: Math.max(-30, Math.min(30, value)) } })),
    setAlerts: (partial) => patch((s) => ({ ...s, alerts: { ...s.alerts, ...partial } })),
    setPrayerAlert: (prayer, partial) =>
      patch((s) => ({
        ...s,
        alerts: {
          ...s.alerts,
          perPrayer: { ...s.alerts.perPrayer, [prayer]: { ...s.alerts.perPrayer[prayer], ...partial } },
        },
      })),
    completeOnboarding: () => patch({ onboardingComplete: true, onboardingStep: 3 }),
    bumpTasbih: () =>
      patch((s) => {
        const count = s.tasbih.count + 1;
        if (count >= s.tasbih.target) {
          return { ...s, tasbih: { ...s.tasbih, count: 0, phraseIndex: (s.tasbih.phraseIndex + 1) % PHRASES } };
        }
        return { ...s, tasbih: { ...s.tasbih, count } };
      }),
    resetTasbih: () => patch((s) => ({ ...s, tasbih: { ...s.tasbih, count: 0 } })),
    nextPhrase: () => patch((s) => ({ ...s, tasbih: { ...s.tasbih, phraseIndex: (s.tasbih.phraseIndex + 1) % PHRASES, count: 0 } })),
    toggleSalahMark: (prayer) =>
      patch((s) => ({ ...s, tasbih: { ...s.tasbih, marks: { ...s.tasbih.marks, [prayer]: !s.tasbih.marks[prayer] } } })),
    setTranslationOn: (translationOn) => patch({ translationOn }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useClock(): { now: Date; clockLabel: string; frozen: boolean; timeZone: string } {
  const ctx = useContext(AppContext);
  if (!ctx) {
    const now = new Date();
    return { now, clockLabel: formatClockLabel(now, "Asia/Karachi"), frozen: false, timeZone: "Asia/Karachi" };
  }
  return { now: ctx.now, clockLabel: ctx.clockLabel, frozen: ctx.frozen, timeZone: ctx.state.location.timezone };
}

void SALAH_IDS;
