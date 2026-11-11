import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORE_KEY, isPersistedState, migrateState, type PersistedState, defaultState } from "./schema";

export async function loadState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed: unknown = JSON.parse(raw);
    if (isPersistedState(parsed)) return parsed;
    return migrateState(parsed);
  } catch {
    return defaultState();
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // The session continues; the next save retries.
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORE_KEY);
  } catch {
    // ignore
  }
}
