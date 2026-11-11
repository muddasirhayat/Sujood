import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeDayTimes,
  formatTime,
  nextPrayer,
  formatRemaining,
  KARACHI_SAMPLE_2026_11_12 as S,
  methodById,
} from "../src/prayer/times";

const TZ = "Asia/Karachi";

function timesOn(day: number) {
  return computeDayTimes({
    year: 2026,
    month: 11,
    day,
    latitude: S.latitude,
    longitude: S.longitude,
    method: "Karachi",
    madhab: "Hanafi",
  });
}

describe("prayer times — Karachi, Hanafi, 12 Nov 2026", () => {
  it("matches the known sample used in the mockups", () => {
    const t = timesOn(12);
    assert.equal(formatTime(t.fajr, TZ), S.fajr);
    assert.equal(formatTime(t.sunrise, TZ), S.sunrise);
    assert.equal(formatTime(t.dhuhr, TZ), S.dhuhr);
    assert.equal(formatTime(t.asr, TZ), S.asr);
    assert.equal(formatTime(t.maghrib, TZ), S.maghrib);
    assert.equal(formatTime(t.isha, TZ), S.isha);
  });

  it("applies a per-prayer minute offset", () => {
    const base = timesOn(12);
    const shifted = computeDayTimes({
      year: 2026,
      month: 11,
      day: 12,
      latitude: S.latitude,
      longitude: S.longitude,
      method: "Karachi",
      madhab: "Hanafi",
      offsets: { fajr: 5, dhuhr: -2, asr: 0, maghrib: 3, isha: 0 },
    });
    assert.equal(shifted.fajr.getTime() - base.fajr.getTime(), 5 * 60 * 1000);
    assert.equal(shifted.dhuhr.getTime() - base.dhuhr.getTime(), -2 * 60 * 1000);
    assert.equal(shifted.maghrib.getTime() - base.maghrib.getTime(), 3 * 60 * 1000);
  });

  it("uses a later Asr for Hanafi than for Shafi", () => {
    const hanafi = timesOn(12);
    const shafi = computeDayTimes({
      year: 2026,
      month: 11,
      day: 12,
      latitude: S.latitude,
      longitude: S.longitude,
      method: "Karachi",
      madhab: "Shafi",
    });
    assert.ok(hanafi.asr.getTime() > shafi.asr.getTime());
  });

  it("names the Karachi method as in the mockup", () => {
    assert.equal(methodById("Karachi").name, "University of Islamic Sciences, Karachi");
    assert.match(methodById("Karachi").detail, /18/);
  });
});

describe("next-prayer countdown", () => {
  it("finds Fajr 36 minutes after 04:52 on 12 Nov 2026", () => {
    const t = timesOn(12);
    // 04:52 Asia/Karachi = 23:52 UTC on 11 Nov (UTC+5)
    const now = new Date("2026-11-12T04:52:00+05:00");
    const next = nextPrayer(t, now);
    assert.equal(next.id, "fajr");
    assert.equal(next.name, "Fajr");
    const minutes = Math.round(next.remainingMs / 60000);
    assert.equal(minutes, 36);
    assert.equal(formatRemaining(next.remainingMs), "36 min");
  });

  it("rolls to tomorrow's Fajr after Isha", () => {
    const today = timesOn(12);
    const tomorrow = timesOn(13);
    const now = new Date(today.isha.getTime() + 60 * 1000);
    const next = nextPrayer(today, now, tomorrow);
    assert.equal(next.id, "fajr");
    assert.equal(next.time.getTime(), tomorrow.fajr.getTime());
    assert.ok(next.remainingMs > 0);
  });
});
