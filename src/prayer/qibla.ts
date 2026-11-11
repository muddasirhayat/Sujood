/** Kaaba, Masjid al-Haram, Makkah. */
export const KAABA = { latitude: 21.422487, longitude: 39.826206 };

const EARTH_KM = 6371.0088;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Forward azimuth from (lat, lon) to the Kaaba, 0-360 degrees, clockwise from true north. */
export function qiblaBearing(latitude: number, longitude: number): number {
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA.latitude);
  const dLon = toRad(KAABA.longitude - longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

/** Great-circle distance to the Kaaba, in kilometres. */
export function qiblaDistanceKm(latitude: number, longitude: number): number {
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA.latitude);
  const dLat = toRad(KAABA.latitude - latitude);
  const dLon = toRad(KAABA.longitude - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function roundedBearing(bearing: number): number {
  return Math.round(bearing);
}

export function formatDistance(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  const rounded = Math.round(km / 50) * 50;
  return `${rounded.toLocaleString("en-US")} km`;
}

/** Compass heading from magnetometer x/y (device face-up). Returns 0-360 or null. */
export function headingFromMagnetometer(x: number, y: number): number {
  const heading = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return heading;
}

/**
 * Rotation to apply to a "Qibla-up" compass rose, given device heading (0 = north).
 * When the device points at the Qibla, this is 0 (arrow stays up).
 */
export function compassRotation(qibla: number, heading: number): number {
  return (qibla - heading + 360) % 360;
}

export function isFacingQibla(qibla: number, heading: number, tolerance = 8): boolean {
  const delta = Math.abs(((qibla - heading + 540) % 360) - 180);
  return delta <= tolerance;
}

export function cardinalFromBearing(bearing: number): string {
  const dirs = ["North", "North-east", "East", "South-east", "South", "South-west", "West", "North-west"];
  const i = Math.round(bearing / 45) % 8;
  return dirs[i]!;
}
