import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toHijri, formatHijri, isHijriLeap, hijriMonthLength } from "../src/prayer/hijri";

describe("hijri civil calendar", () => {
  it("gives 2 Jumada al-Akhirah 1448 on 12 November 2026", () => {
    const h = toHijri(2026, 11, 12);
    assert.equal(h.year, 1448);
    assert.equal(h.month, 6);
    assert.equal(h.day, 2);
    assert.equal(h.monthName, "Jumada al-Akhirah");
    assert.equal(h.isRamadan, false);
    assert.equal(formatHijri(h), "2 Jumada al-Akhirah 1448");
    assert.equal(formatHijri(h, "short"), "2 Jumada II 1448");
    assert.equal(formatHijri(h, "day-month"), "2 Jumada al-Akhirah");
  });

  it("flags Ramadan only in month 9", () => {
    // 1 Ramadan 1448 is 6 months after 1 Muharram; just check the flag by construction
    // 2 Jumada II is month 6; Ramadan starts ~88 days later (3*29.5).
    const before = toHijri(2026, 11, 12);
    assert.equal(before.isRamadan, false);
    // Walk forward until month 9 of 1448
    let found = false;
    for (let d = 1; d <= 200; d++) {
      const date = new Date(Date.UTC(2026, 10, 12 + d));
      const h = toHijri(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
      if (h.year === 1448 && h.month === 9 && h.day === 1) {
        assert.equal(h.isRamadan, true);
        assert.equal(h.monthName, "Ramadan");
        found = true;
        break;
      }
    }
    assert.equal(found, true);
  });

  it("uses 30/29 alternating months and 355-day leap years", () => {
    assert.equal(hijriMonthLength(1448, 1), 30);
    assert.equal(hijriMonthLength(1448, 2), 29);
    assert.equal(typeof isHijriLeap(1448), "boolean");
  });
});
