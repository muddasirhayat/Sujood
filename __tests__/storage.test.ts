import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultState, isPersistedState, migrateState, todayKey } from "../src/storage/schema";

describe("persisted state", () => {
  it("starts with Karachi, the Karachi method, and Hanafi, and every alert on", () => {
    const s = defaultState();
    assert.equal(s.location.label, "Karachi");
    assert.equal(s.location.timezone, "Asia/Karachi");
    assert.equal(s.method, "Karachi");
    assert.equal(s.madhab, "Hanafi");
    assert.equal(s.onboardingComplete, false);
    assert.equal(s.alerts.azanEnabled, true);
    assert.equal(s.alerts.perPrayer.fajr.sound, "dawn");
    assert.equal(s.alerts.perPrayer.maghrib.sound, "dusk");
    assert.equal(s.alerts.preReminder, true);
    assert.equal(s.alerts.dailyAyah, true);
    assert.equal(s.alerts.jumuah, true);
    assert.equal(s.offsets.fajr, 0);
  });

  it("accepts a well-formed document and rejects a broken one", () => {
    const s = defaultState();
    assert.equal(isPersistedState(s), true);
    assert.equal(isPersistedState({ schema: 1 }), false);
    assert.equal(isPersistedState(null), false);
    assert.equal(isPersistedState({ schema: 99, onboardingComplete: true }), false);
  });

  it("migrates a partial document onto the defaults", () => {
    const migrated = migrateState({
      schema: 1,
      onboardingComplete: true,
      method: "UmmAlQura",
      madhab: "Shafi",
      location: { label: "Lahore" },
    });
    assert.equal(migrated.onboardingComplete, true);
    assert.equal(migrated.method, "UmmAlQura");
    assert.equal(migrated.madhab, "Shafi");
    assert.equal(migrated.location.label, "Lahore");
    assert.equal(migrated.location.timezone, "Asia/Karachi"); // filled from default then overwritten only for provided keys
    assert.equal(migrated.alerts.azanEnabled, true);
  });

  it("formats a date key in the location timezone", () => {
    const key = todayKey("Asia/Karachi", new Date("2026-11-12T00:30:00+05:00"));
    assert.equal(key, "2026-11-12");
    // Still 11 Nov in New York at that instant? 00:30 PKT = 11 Nov 14:30 ET. Use a clear instant.
    const late = todayKey("America/New_York", new Date("2026-11-12T00:30:00+05:00"));
    assert.equal(late, "2026-11-11");
  });
});
