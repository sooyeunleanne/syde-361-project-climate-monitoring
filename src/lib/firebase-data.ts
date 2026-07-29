// Stand-in for the Firebase Realtime Database. In production this reads
// `readings/<locationKey>` from Firebase directly; for now it reads the
// same shape from a static export of that database, with an optional
// client-side simulation loop (below) that appends new readings on an
// interval so demos/recordings can show the feed updating live.
import exportData from "./data/test-location-export.json";

export interface RawReading {
  epoch: number;
  humidity_pct: number;
  light_raw: number;
  temperature_c: number;
  timestamp: string;
}

type FirebaseExport = {
  readings: Record<string, Record<string, RawReading>>;
};

const data = exportData as FirebaseExport;

// mutable in-memory copy, seeded lazily from the static export, so the
// live simulation can append to it without touching the imported JSON
const store: Record<string, RawReading[]> = {};

function readingsFor(locationKey: string): RawReading[] {
  if (!store[locationKey]) {
    const node = data.readings[locationKey] ?? {};
    // Firebase push IDs sort chronologically as strings, so a key sort
    // recovers insertion order without needing a valid epoch on every row.
    store[locationKey] = Object.keys(node)
      .sort()
      .map((key) => node[key]);
  }
  return store[locationKey];
}

export function getRawReadings(locationKey: string): RawReading[] {
  return readingsFor(locationKey);
}

const listeners = new Set<() => void>();

/** Notified after every simulated reading is appended, for any locationKey. */
export function subscribeToLiveReadings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTimestamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function walk(prev: number, maxStep: number, min: number, max: number): number {
  const next = prev + (Math.random() - 0.5) * 2 * maxStep;
  return Math.min(max, Math.max(min, next));
}

function appendSimulatedReading(locationKey: string) {
  const readings = readingsFor(locationKey);
  const last = readings.at(-1);
  if (!last) return;

  const now = new Date();
  const reading: RawReading = {
    epoch: Math.floor(now.getTime() / 1000),
    timestamp: formatTimestamp(now),
    temperature_c: Math.round(walk(last.temperature_c, 0.7, 15, 45) * 100) / 100,
    humidity_pct: Math.round(walk(last.humidity_pct, 1.5, 10, 95) * 100) / 100,
    light_raw: Math.round(walk(last.light_raw, 80, 0, 4095)),
  };

  store[locationKey] = [...readings, reading].slice(-500);
  listeners.forEach((listener) => listener());
}

let simulationStarted = false;

/** Idempotent: call from a client effect to start appending readings every `intervalMs`. */
export function startLiveSimulation(locationKey: string, intervalMs = 4000): void {
  if (simulationStarted || typeof window === "undefined") return;
  simulationStarted = true;
  readingsFor(locationKey); // make sure it's seeded before the first tick
  setInterval(() => appendSimulatedReading(locationKey), intervalMs);
}
