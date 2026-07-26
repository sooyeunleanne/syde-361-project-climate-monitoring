export type LandCover = "open-pavement" | "tree-canopy" | "lawn" | "near-water";

export type ComfortStatus = "good" | "serious" | "critical";

export type TimeRange = "live" | "7d" | "30d" | "all";

export interface SensorLocation {
  id: string;
  number: number;
  name: string;
  /** position on the campus map image, in percent from top-left */
  x: number;
  y: number;
  landCover: LandCover;
  baseTemp: number;
  baseHumidity: number;
  baseLight: number;
}

export interface Reading {
  label: string;
  temperature: number;
  humidity: number;
  light: number;
}

export const LAND_COVER_LABEL: Record<LandCover, string> = {
  "open-pavement": "Open pavement",
  "tree-canopy": "Tree canopy",
  lawn: "Open lawn",
  "near-water": "Near water",
};

export const COMFORT_MAX_C = 23;
export const SERIOUS_MAX_C = 28;

export const LOCATIONS: SensorLocation[] = [
  { id: "cph", number: 1, name: "CPH Courtyard", x: 80, y: 78, landCover: "open-pavement", baseTemp: 31, baseHumidity: 40, baseLight: 4.6 },
  { id: "ring-road", number: 2, name: "Ring Road Path", x: 65, y: 60, landCover: "open-pavement", baseTemp: 29, baseHumidity: 43, baseLight: 4.2 },
  { id: "eng2", number: 3, name: "Engineering 2 Plaza", x: 76, y: 73, landCover: "open-pavement", baseTemp: 28, baseHumidity: 45, baseLight: 3.9 },
  { id: "mc", number: 4, name: "Outside MC", x: 63, y: 49, landCover: "open-pavement", baseTemp: 27, baseHumidity: 46, baseLight: 3.7 },
  { id: "rch", number: 5, name: "RCH Courtyard", x: 71, y: 77, landCover: "lawn", baseTemp: 24, baseHumidity: 48, baseLight: 2.6 },
  { id: "laurel-creek", number: 6, name: "Laurel Creek Bank", x: 53, y: 66, landCover: "near-water", baseTemp: 22, baseHumidity: 62, baseLight: 2.1 },
  { id: "arts-lawn", number: 7, name: "Arts Building Lawn", x: 62, y: 88, landCover: "tree-canopy", baseTemp: 20, baseHumidity: 53, baseLight: 1.7 },
  { id: "village-green", number: 8, name: "Village Green Canopy", x: 42, y: 47, landCover: "tree-canopy", baseTemp: 19, baseHumidity: 55, baseLight: 1.3 },
];

export function comfortStatus(tempC: number): ComfortStatus {
  if (tempC >= SERIOUS_MAX_C) return "critical";
  if (tempC >= COMFORT_MAX_C) return "serious";
  return "good";
}

export const STATUS_LABEL: Record<ComfortStatus, string> = {
  good: "Comfortable",
  serious: "Warm",
  critical: "Hot",
};

export function suggestion(loc: SensorLocation, currentTemp: number): string | null {
  const status = comfortStatus(currentTemp);
  if (status === "good") return null;
  const over = Math.round(currentTemp - COMFORT_MAX_C);
  if (loc.landCover === "open-pavement") {
    return `Add shade trees or a shade structure — temp runs ${over}°C above comfortable in full sun.`;
  }
  if (loc.landCover === "lawn") {
    return `Consider a shade sail or young tree planting — this lawn runs ${over}°C above comfortable at peak sun.`;
  }
  return `Add seating cover or shade to reduce heat exposure (${over}°C above comfortable).`;
}

export function comfortNote(loc: SensorLocation): string {
  if (loc.landCover === "tree-canopy") return "Well-shaded and comfortable — a good candidate for outdoor study tables.";
  if (loc.landCover === "near-water") return "Moderated by the creek — comfortable, though humidity runs higher here.";
  return "Comfortable — well-suited for outdoor seating as-is.";
}

// --- Deterministic mock time series (stable across server + client render) ---

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed;
  return function rng() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LIVE_HOURS = ["11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pointCount(range: TimeRange): number {
  switch (range) {
    case "live":
      return LIVE_HOURS.length;
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "all":
      return 12; // weekly buckets
  }
}

function labelFor(range: TimeRange, index: number, count: number): string {
  const today = new Date();
  if (range === "live") return LIVE_HOURS[index];
  if (range === "7d") {
    const d = new Date(today);
    d.setDate(d.getDate() - (count - 1 - index));
    return WEEKDAYS[d.getDay()];
  }
  if (range === "30d") {
    const d = new Date(today);
    d.setDate(d.getDate() - (count - 1 - index));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  // all: last N weeks
  const weeksAgo = count - 1 - index;
  return weeksAgo === 0 ? "This wk" : `-${weeksAgo}w`;
}

export function generateSeries(loc: SensorLocation, range: TimeRange): Reading[] {
  const count = pointCount(range);
  const rng = mulberry32(hashSeed(`${loc.id}:${range}`));

  const readings: Reading[] = [];
  let drift = 0;

  for (let i = 0; i < count; i++) {
    let warmth: number; // -1..1, how far above/below baseline

    if (range === "live") {
      // diurnal arc peaking mid-to-late afternoon
      const t = i / (count - 1);
      const arc = Math.sin(t * Math.PI - Math.PI / 6);
      const amplitude = loc.landCover === "open-pavement" ? 1 : loc.landCover === "near-water" ? 0.5 : 0.35;
      warmth = arc * amplitude + (rng() - 0.5) * 0.25;
    } else {
      drift += (rng() - 0.5) * 0.6;
      drift = Math.max(-1.4, Math.min(1.4, drift));
      warmth = drift;
    }

    const tempAmp = loc.landCover === "open-pavement" ? 2.5 : loc.landCover === "near-water" ? 1.2 : 1.6;
    const temperature = Math.round((loc.baseTemp + warmth * tempAmp) * 10) / 10;
    const humidity = Math.round(loc.baseHumidity - warmth * 4 + (rng() - 0.5) * 3);
    const light = Math.max(0, Math.round((loc.baseLight + Math.max(warmth, 0) * 1.2 + (rng() - 0.5) * 0.3) * 10) / 10);

    readings.push({
      label: labelFor(range, i, count),
      temperature,
      humidity: Math.max(15, Math.min(95, humidity)),
      light,
    });
  }

  return readings;
}

export function minutesAgo(loc: SensorLocation): number {
  const rng = mulberry32(hashSeed(`${loc.id}:updated`));
  return Math.floor(rng() * 14) + 1;
}
