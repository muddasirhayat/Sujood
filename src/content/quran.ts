import arabicFile from "../../assets/content/quran-arabic.json";
import pickthallFile from "../../assets/content/pickthall.json";
import itaniFile from "../../assets/content/itani.json";
import { surahByNumber, type SurahMeta } from "./surahs";

export type TranslationId = "pickthall" | "itani";

type ArabicFile = { source: string; url: string; license: string; notice: string; surahs: string[][] };
type PickthallSurah = {
  ayahs: string[];
  prose: string;
  revealed: string;
  complete: boolean;
  aligned: boolean;
  pending?: boolean;
};
type PickthallFile = { source: string; url: string; license: string; credit: string; note: string; surahs: Array<PickthallSurah | null> };
type ItaniFile = { source: string; url: string; license: string; credit: string; notice: string; surahs: string[][] };

const arabic = arabicFile as ArabicFile;
const pickthall = pickthallFile as PickthallFile;
const itani = itaniFile as ItaniFile;

export function arabicAyahs(surah: number): string[] {
  return arabic.surahs[surah - 1] ?? [];
}

export function arabicAyah(surah: number, ayah: number): string {
  return arabicAyahs(surah)[ayah - 1] ?? "";
}

export function pickthallSurah(surah: number): PickthallSurah | null {
  return pickthall.surahs[surah - 1] ?? null;
}

export function pickthallAyah(surah: number, ayah: number): string | null {
  const s = pickthallSurah(surah);
  if (!s || !s.aligned) return null;
  return s.ayahs[ayah - 1] ?? null;
}

export function itaniAyahs(surah: number): string[] {
  return itani.surahs[surah - 1] ?? [];
}

export function itaniAyah(surah: number, ayah: number): string {
  return itaniAyahs(surah)[ayah - 1] ?? "";
}

export function translationAyah(id: TranslationId, surah: number, ayah: number): string | null {
  if (id === "itani") return itaniAyah(surah, ayah);
  return pickthallAyah(surah, ayah);
}

export type ReaderAyah = {
  number: number;
  arabic: string;
  translation: string | null;
};

export function readerAyahs(surah: number, translation: TranslationId): ReaderAyah[] {
  const ar = arabicAyahs(surah);
  return ar.map((arabicText, i) => ({
    number: i + 1,
    arabic: arabicText,
    translation: translationAyah(translation, surah, i + 1),
  }));
}

export function surahWithContent(surah: number): SurahMeta & { arabicCount: number } {
  const meta = surahByNumber(surah);
  return { ...meta, arabicCount: arabicAyahs(surah).length };
}

export const QURAN_CREDITS = {
  arabic: {
    source: arabic.source,
    url: arabic.url,
    license: arabic.license,
    notice: arabic.notice,
  },
  pickthall: {
    source: pickthall.source,
    url: pickthall.url,
    license: pickthall.license,
    credit: pickthall.credit,
    note: pickthall.note,
  },
  itani: {
    source: itani.source,
    url: itani.url,
    license: itani.license,
    credit: itani.credit,
  },
};

/** Daily dua shown on Home: Al-Fatiha 5, Pickthall 1930, as in the mockup. */
export const DAILY_DUA = {
  ref: "Al-Fatiha 5",
  surah: 1,
  ayah: 5,
  text: "Thee (alone) we worship; Thee (alone) we ask for help.",
  credit: "Marmaduke Pickthall, 1930",
};

/** A rotating ayah for the daily-ayah notification, using only aligned Pickthall verses. */
export function ayahForDay(dayOfYear: number): { ref: string; text: string } {
  const pool: Array<{ s: number; a: number }> = [];
  for (let s = 1; s <= 114; s++) {
    const p = pickthallSurah(s);
    if (!p?.aligned) continue;
    for (let a = 1; a <= p.ayahs.length; a++) pool.push({ s, a });
  }
  if (pool.length === 0) return { ref: DAILY_DUA.ref, text: DAILY_DUA.text };
  const pick = pool[dayOfYear % pool.length]!;
  const meta = surahByNumber(pick.s);
  return { ref: `${meta.name} ${pick.a}`, text: pickthallAyah(pick.s, pick.a) ?? DAILY_DUA.text };
}

export function dayOfYear(date: Date, timeZone: string): number {
  const raw = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const [y, m, d] = raw.split("-").map(Number);
  const start = Date.UTC(y!, 0, 1);
  const cur = Date.UTC(y!, m! - 1, d!);
  return Math.floor((cur - start) / 86400000) + 1;
}
