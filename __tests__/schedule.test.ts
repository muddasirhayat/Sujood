import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeDayTimes } from "../src/prayer/times";
import { buildDaySchedule, buildRollingSchedule, DEFAULT_PREFS } from "../src/prayer/schedule";
import { toHijri } from "../src/prayer/hijri";

const coords = { latitude: 24.8607, longitude: 67.0011 };

function day(d: number) {
  return computeDayTimes({
    year: 2026,
    month: 11,
    day: d,
    ...coords,
    method: "Karachi",
    madhab: "Hanafi",
  });
}

describe("notification scheduling", () => {
  it("schedules five Azans and five 15-minute pre-reminders by default", () => {
    const times = day(12);
    const now = new Date("2026-11-12T00:10:00+05:00");
    const alerts = buildDaySchedule({
      times,
      prefs: DEFAULT_PREFS,
      isRamadan: false,
      isFriday: false,
      now,
    });
    const azan = alerts.filter((a) => a.kind === "azan");
    const pre = alerts.filter((a) => a.kind === "pre-reminder");
    assert.equal(azan.length, 5);
    assert.equal(pre.length, 5);
    const fajr = azan.find((a) => a.prayer === "fajr")!;
    const fajrPre = pre.find((a) => a.prayer === "fajr")!;
    assert.equal(fajr.title, "Fajr");
    assert.equal(fajr.body, "It is time to pray");
    assert.equal(fajr.sound, "dawn");
    assert.equal(fajr.channelId, "azan-dawn");
    assert.equal(fajr.fireAt.getTime() - fajrPre.fireAt.getTime(), 15 * 60 * 1000);
  });

  it("does not schedule past alerts", () => {
    const times = day(12);
    const afterDhuhr = new Date(times.dhuhr.getTime() + 1000);
    const alerts = buildDaySchedule({
      times,
      prefs: DEFAULT_PREFS,
      isRamadan: false,
      isFriday: false,
      now: afterDhuhr,
    });
    assert.equal(alerts.some((a) => a.prayer === "fajr" && a.kind === "azan"), false);
    assert.equal(alerts.some((a) => a.prayer === "asr" && a.kind === "azan"), true);
  });

  it("schedules Jumu'ah at 11:30 only on Fridays", () => {
    const friday = day(13); // 13 Nov 2026 is Friday
    const thursday = day(12);
    const now = new Date("2026-11-12T00:10:00+05:00");
    const fri = buildDaySchedule({ times: friday, prefs: DEFAULT_PREFS, isRamadan: false, isFriday: true, now: new Date("2026-11-13T00:10:00+05:00") });
    const thu = buildDaySchedule({ times: thursday, prefs: DEFAULT_PREFS, isRamadan: false, isFriday: false, now });
    assert.equal(fri.some((a) => a.kind === "jumuah"), true);
    assert.equal(thu.some((a) => a.kind === "jumuah"), false);
    const j = fri.find((a) => a.kind === "jumuah")!;
    const hour = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false }).format(j.fireAt);
    assert.equal(hour, "11:30");
  });

  it("schedules Suhoor and Iftar only in Ramadan when those prefs are on", () => {
    const times = day(12);
    const now = new Date("2026-11-12T00:10:00+05:00");
    const off = buildDaySchedule({ times, prefs: DEFAULT_PREFS, isRamadan: false, isFriday: false, now });
    const on = buildDaySchedule({ times, prefs: DEFAULT_PREFS, isRamadan: true, isFriday: false, now });
    assert.equal(off.some((a) => a.kind === "suhoor" || a.kind === "iftar"), false);
    assert.equal(on.some((a) => a.kind === "suhoor"), true);
    assert.equal(on.some((a) => a.kind === "iftar"), true);
    const suhoor = on.find((a) => a.kind === "suhoor")!;
    assert.equal(times.fajr.getTime() - suhoor.fireAt.getTime(), 45 * 60 * 1000);
  });

  it("drops a prayer when its toggle is off", () => {
    const prefs = structuredClone(DEFAULT_PREFS);
    prefs.perPrayer.isha.enabled = false;
    const alerts = buildDaySchedule({
      times: day(12),
      prefs,
      isRamadan: false,
      isFriday: false,
      now: new Date("2026-11-12T00:10:00+05:00"),
    });
    assert.equal(alerts.some((a) => a.prayer === "isha"), false);
    assert.equal(alerts.filter((a) => a.kind === "azan").length, 4);
  });

  it("builds a rolling multi-day schedule in fire-at order", () => {
    const days = [12, 13, 14].map((d) => {
      const times = day(d);
      const h = toHijri(2026, 11, d);
      return { times, isRamadan: h.isRamadan, isFriday: d === 13 };
    });
    const rolling = buildRollingSchedule(days, DEFAULT_PREFS, new Date("2026-11-12T00:10:00+05:00"));
    assert.ok(rolling.length > 15);
    for (let i = 1; i < rolling.length; i++) {
      assert.ok(rolling[i]!.fireAt.getTime() >= rolling[i - 1]!.fireAt.getTime());
    }
  });
});
