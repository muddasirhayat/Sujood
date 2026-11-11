export type Mosque = {
  id: string;
  name: string;
  vicinity: string;
  latitude: number;
  longitude: number;
};

export type MosquesResult =
  | { ok: true; mosques: Mosque[]; attribution: string }
  | { ok: false; reason: "offline" | "empty" | "error"; message: string; attribution: string };

export const OSM_ATTRIBUTION = "Map data © OpenStreetMap contributors (ODbL).";
const ENDPOINTS = [
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const TIMEOUT_MS = 12000;
const OFFLINE_MESSAGE =
  "Nearby mosques need a short connection to OpenStreetMap. Prayer times, the Quran and the Azan still work offline.";

function vicinityFromTags(tags: Record<string, string> | undefined, fallbackCity: string): string {
  if (!tags) return fallbackCity;
  const parts = [
    tags["addr:street"] || tags["addr:place"] || tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:district"],
    tags["addr:city"] || tags["addr:town"] || fallbackCity,
  ].filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = p.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out.join(", ") || fallbackCity;
}

type OverpassElement = {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function parseElements(elements: OverpassElement[] | undefined, cityLabel: string): Mosque[] {
  const mosques: Mosque[] = [];
  for (const el of elements ?? []) {
    const name = el.tags?.name || el.tags?.["name:en"] || "Mosque";
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    mosques.push({
      id: `${el.type}-${el.id}`,
      name,
      vicinity: vicinityFromTags(el.tags, cityLabel),
      latitude: lat,
      longitude: lon,
    });
  }
  const seen = new Set<string>();
  return mosques.filter((m) => {
    const k = m.name.toLowerCase() + ":" + m.latitude.toFixed(4);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function postOverpass(endpoint: string, body: string): Promise<OverpassElement[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json",
      },
      body,
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { elements?: OverpassElement[] };
    return data.elements ?? [];
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchMosques(
  latitude: number,
  longitude: number,
  cityLabel: string,
  radiusMeters = 8000,
): Promise<MosquesResult> {
  const query = `[out:json][timeout:10];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude}););out center 30;`;
  const body = "data=" + encodeURIComponent(query);

  for (const endpoint of ENDPOINTS) {
    const elements = await postOverpass(endpoint, body);
    if (elements == null) continue;
    const unique = parseElements(elements, cityLabel);
    if (unique.length === 0) {
      return {
        ok: false,
        reason: "empty",
        message: "No mosques were found nearby. You can try again when you have a connection.",
        attribution: OSM_ATTRIBUTION,
      };
    }
    return { ok: true, mosques: unique.slice(0, 20), attribution: OSM_ATTRIBUTION };
  }

  return { ok: false, reason: "offline", message: OFFLINE_MESSAGE, attribution: OSM_ATTRIBUTION };
}
