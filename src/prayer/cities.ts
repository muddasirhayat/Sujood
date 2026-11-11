export type City = {
  id: string;
  label: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

/** Curated cities for the manual location fallback. Coordinates are well-known city centres. */
export const CITIES: City[] = [
  { id: "karachi", label: "Karachi", country: "Pakistan", latitude: 24.8607, longitude: 67.0011, timezone: "Asia/Karachi" },
  { id: "lahore", label: "Lahore", country: "Pakistan", latitude: 31.5204, longitude: 74.3587, timezone: "Asia/Karachi" },
  { id: "islamabad", label: "Islamabad", country: "Pakistan", latitude: 33.6844, longitude: 73.0479, timezone: "Asia/Karachi" },
  { id: "rawalpindi", label: "Rawalpindi", country: "Pakistan", latitude: 33.5651, longitude: 73.0169, timezone: "Asia/Karachi" },
  { id: "peshawar", label: "Peshawar", country: "Pakistan", latitude: 34.0151, longitude: 71.5249, timezone: "Asia/Karachi" },
  { id: "quetta", label: "Quetta", country: "Pakistan", latitude: 30.1798, longitude: 66.975, timezone: "Asia/Karachi" },
  { id: "faisalabad", label: "Faisalabad", country: "Pakistan", latitude: 31.4504, longitude: 73.135, timezone: "Asia/Karachi" },
  { id: "multan", label: "Multan", country: "Pakistan", latitude: 30.1575, longitude: 71.5249, timezone: "Asia/Karachi" },
  { id: "makkah", label: "Makkah", country: "Saudi Arabia", latitude: 21.3891, longitude: 39.8579, timezone: "Asia/Riyadh" },
  { id: "madinah", label: "Madinah", country: "Saudi Arabia", latitude: 24.5247, longitude: 39.5692, timezone: "Asia/Riyadh" },
  { id: "riyadh", label: "Riyadh", country: "Saudi Arabia", latitude: 24.7136, longitude: 46.6753, timezone: "Asia/Riyadh" },
  { id: "dubai", label: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { id: "istanbul", label: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul" },
  { id: "cairo", label: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo" },
  { id: "london", label: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  { id: "newyork", label: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { id: "toronto", label: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
  { id: "jakarta", label: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta" },
  { id: "kualalumpur", label: "Kuala Lumpur", country: "Malaysia", latitude: 3.139, longitude: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { id: "dhaka", label: "Dhaka", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125, timezone: "Asia/Dhaka" },
  { id: "istanbul2", label: "Ankara", country: "Turkey", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul" },
  { id: "doha", label: "Doha", country: "Qatar", latitude: 25.2854, longitude: 51.531, timezone: "Asia/Qatar" },
  { id: "kuwait", label: "Kuwait City", country: "Kuwait", latitude: 29.3759, longitude: 47.9774, timezone: "Asia/Kuwait" },
  { id: "amman", label: "Amman", country: "Jordan", latitude: 31.9454, longitude: 35.9284, timezone: "Asia/Amman" },
];

export const KARACHI = CITIES[0]!;

export function nearestCity(latitude: number, longitude: number): City {
  let best = CITIES[0]!;
  let bestD = Infinity;
  for (const city of CITIES) {
    const dlat = city.latitude - latitude;
    const dlon = city.longitude - longitude;
    const d = dlat * dlat + dlon * dlon;
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  return best;
}

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES;
  return CITIES.filter(
    (c) => c.label.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
  );
}
