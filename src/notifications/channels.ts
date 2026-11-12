import type { AzanSound, ScheduledKind } from "../prayer/schedule";

/** Filenames copied into Android res/raw by the expo-notifications plugin. */
export const SOUND_FILE: Record<AzanSound | "chime", string> = {
  dawn: "azan_dawn.wav",
  classic: "azan_classic.wav",
  dusk: "azan_dusk.wav",
  chime: "chime.wav",
};

/** Must match the `sounds` array on the expo-notifications plugin in app.json. */
export const BUNDLED_NOTIFICATION_SOUNDS = [
  "./assets/sounds/azan_dawn.wav",
  "./assets/sounds/azan_classic.wav",
  "./assets/sounds/azan_dusk.wav",
  "./assets/sounds/chime.wav",
] as const;

export function androidSoundName(sound: AzanSound | "chime"): string {
  return SOUND_FILE[sound].replace(/\.wav$/, "");
}

/**
 * Android 8+ plays the channel's custom sound, not a one-off on the notification.
 * Azan and Iftar each get a channel named after the chosen tone.
 */
export function channelIdFor(kind: ScheduledKind, sound: AzanSound | "chime"): string {
  if (kind === "azan" || kind === "iftar") return `azan-${sound}`;
  return "reminders";
}

export type ChannelConfig = {
  id: string;
  name: string;
  sound: string;
  bypassDnd: boolean;
};

export const ANDROID_CHANNELS: ChannelConfig[] = [
  { id: "azan-dawn", name: "Azan", sound: androidSoundName("dawn"), bypassDnd: true },
  { id: "azan-classic", name: "Azan", sound: androidSoundName("classic"), bypassDnd: true },
  { id: "azan-dusk", name: "Azan", sound: androidSoundName("dusk"), bypassDnd: true },
  { id: "reminders", name: "Reminders", sound: androidSoundName("chime"), bypassDnd: false },
];
