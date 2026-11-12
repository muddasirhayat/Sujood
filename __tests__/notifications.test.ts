import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ANDROID_CHANNELS,
  BUNDLED_NOTIFICATION_SOUNDS,
  SOUND_FILE,
  androidSoundName,
  channelIdFor,
} from "../src/notifications/channels";
import { buildDaySchedule, DEFAULT_PREFS } from "../src/prayer/schedule";
import { computeDayTimes } from "../src/prayer/times";

const root = join(__dirname, "..");

describe("Azan alert notification sounds", () => {
  it("maps every tone to a bundled wav listed in the expo-notifications plugin", () => {
    const app = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
    const plugin = app.expo.plugins.find(
      (entry: unknown) => Array.isArray(entry) && entry[0] === "expo-notifications",
    );
    assert.ok(plugin, "expo-notifications plugin is missing");
    const sounds: string[] = plugin[1].sounds;
    assert.deepEqual(sounds, [...BUNDLED_NOTIFICATION_SOUNDS]);
    for (const relative of BUNDLED_NOTIFICATION_SOUNDS) {
      assert.equal(existsSync(join(root, relative)), true, `${relative} is missing`);
    }
    for (const file of Object.values(SOUND_FILE)) {
      assert.equal(
        sounds.some((s: string) => s.endsWith(`/${file}`)),
        true,
        `${file} is not in the plugin sounds list`,
      );
    }
  });

  it("gives each Azan tone its own channel whose custom sound is the raw resource name", () => {
    assert.deepEqual(
      ANDROID_CHANNELS.map((c) => ({ id: c.id, sound: c.sound })),
      [
        { id: "azan-dawn", sound: "azan_dawn" },
        { id: "azan-classic", sound: "azan_classic" },
        { id: "azan-dusk", sound: "azan_dusk" },
        { id: "reminders", sound: "chime" },
      ],
    );
    assert.equal(androidSoundName("dawn"), "azan_dawn");
    assert.equal(androidSoundName("classic"), "azan_classic");
    assert.equal(androidSoundName("dusk"), "azan_dusk");
    assert.equal(androidSoundName("chime"), "chime");
  });

  it("schedules Azan and Iftar on the matching sound channel, and reminders on the chime channel", () => {
    const times = computeDayTimes({
      year: 2026,
      month: 11,
      day: 12,
      latitude: 24.8607,
      longitude: 67.0011,
      method: "Karachi",
      madhab: "Hanafi",
    });
    const alerts = buildDaySchedule({
      times,
      prefs: DEFAULT_PREFS,
      isRamadan: true,
      isFriday: false,
      now: new Date("2026-11-12T00:10:00+05:00"),
    });
    const fajr = alerts.find((a) => a.kind === "azan" && a.prayer === "fajr")!;
    const dhuhr = alerts.find((a) => a.kind === "azan" && a.prayer === "dhuhr")!;
    const maghrib = alerts.find((a) => a.kind === "azan" && a.prayer === "maghrib")!;
    const pre = alerts.find((a) => a.kind === "pre-reminder")!;
    const iftar = alerts.find((a) => a.kind === "iftar")!;
    assert.equal(fajr.channelId, "azan-dawn");
    assert.equal(dhuhr.channelId, "azan-classic");
    assert.equal(maghrib.channelId, "azan-dusk");
    assert.equal(pre.channelId, "reminders");
    assert.equal(iftar.channelId, "azan-dawn");
    for (const alert of alerts) {
      assert.equal(alert.channelId, channelIdFor(alert.kind, alert.sound));
      const channel = ANDROID_CHANNELS.find((c) => c.id === alert.channelId);
      assert.ok(channel, `missing channel ${alert.channelId}`);
      assert.equal(channel.sound, androidSoundName(alert.sound));
      assert.equal(SOUND_FILE[alert.sound], `${channel.sound}.wav`);
    }
  });

  it("turns off expo-audio background playback and blocks foreground-service permissions", () => {
    const app = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
    const audio = app.expo.plugins.find((entry: unknown) => Array.isArray(entry) && entry[0] === "expo-audio");
    assert.ok(audio, "expo-audio plugin is missing");
    assert.equal(audio[1].enableBackgroundPlayback, false);
    assert.equal(audio[1].enableBackgroundRecording, false);
    const blocked: string[] = app.expo.android.blockedPermissions;
    assert.equal(blocked.includes("android.permission.FOREGROUND_SERVICE"), true);
    assert.equal(blocked.includes("android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"), true);
    const requested: string[] = app.expo.android.permissions;
    assert.equal(requested.includes("android.permission.SCHEDULE_EXACT_ALARM"), true);
    assert.equal(requested.includes("android.permission.USE_EXACT_ALARM"), false);
  });
});
