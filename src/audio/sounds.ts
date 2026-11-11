import { Platform } from "react-native";
import type { AzanSound } from "../prayer/schedule";

const MODULES: Record<AzanSound | "chime", number> = {
  dawn: require("../../assets/sounds/azan_dawn.wav"),
  classic: require("../../assets/sounds/azan_classic.wav"),
  dusk: require("../../assets/sounds/azan_dusk.wav"),
  chime: require("../../assets/sounds/chime.wav"),
};

let player: { replace?: (s: unknown) => void; play?: () => void; pause?: () => void; remove?: () => void } | null = null;

export async function playAzan(sound: AzanSound | "chime" = "classic"): Promise<void> {
  if (Platform.OS === "web") {
    try {
      const Audio = (globalThis as unknown as { Audio?: new (src?: string) => { play: () => Promise<unknown>; pause: () => void } }).Audio;
      // Metro gives a URI string on web for wav requires in many setups; if not, skip quietly
      const src = MODULES[sound] as unknown as string;
      if (Audio && typeof src === "string") {
        const a = new Audio(src);
        await a.play();
      }
    } catch {
      // no audio on this web build
    }
    return;
  }
  try {
    const Audio = await import("expo-audio");
    const create = (Audio as unknown as { createAudioPlayer?: (s: unknown) => { play: () => void; remove?: () => void } }).createAudioPlayer;
    if (!create) return;
    try {
      player?.remove?.();
    } catch {
      /* ignore */
    }
    player = create(MODULES[sound]);
    player?.play?.();
  } catch {
    // audio module not available
  }
}

export async function stopAzan(): Promise<void> {
  try {
    player?.pause?.();
    player?.remove?.();
    player = null;
  } catch {
    /* ignore */
  }
}
