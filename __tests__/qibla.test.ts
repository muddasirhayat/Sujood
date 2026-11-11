import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  qiblaBearing,
  qiblaDistanceKm,
  roundedBearing,
  formatDistance,
  compassRotation,
  isFacingQibla,
  cardinalFromBearing,
  KAABA,
} from "../src/prayer/qibla";

describe("qibla bearing", () => {
  it("is about 267.7° (268° west) from Karachi, and roughly 2,800 km", () => {
    const bearing = qiblaBearing(24.8607, 67.0011);
    assert.ok(Math.abs(bearing - 267.7) < 0.2, `bearing ${bearing}`);
    assert.equal(roundedBearing(bearing), 268);
    const km = qiblaDistanceKm(24.8607, 67.0011);
    assert.ok(km > 2700 && km < 2900, `distance ${km}`);
    assert.equal(formatDistance(2800), "2,800 km");
    assert.equal(cardinalFromBearing(268), "West");
  });

  it("is approximately 0° / a short distance from the Kaaba itself", () => {
    const km = qiblaDistanceKm(KAABA.latitude, KAABA.longitude);
    assert.ok(km < 0.05, `distance ${km}`);
  });

  it("rotates a Qibla-up compass so the arrow is up when facing Qibla", () => {
    assert.equal(compassRotation(268, 268), 0);
    assert.equal(compassRotation(268, 178), 90);
    assert.equal(isFacingQibla(268, 268), true);
    assert.equal(isFacingQibla(268, 250), false);
  });
});
