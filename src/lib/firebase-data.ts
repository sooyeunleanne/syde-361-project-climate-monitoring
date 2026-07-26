// Stand-in for the Firebase Realtime Database. In production this reads
// `readings/<locationKey>` from Firebase directly; for now it reads the
// same shape from a static export of that database.
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

export function getRawReadings(locationKey: string): RawReading[] {
  const node = data.readings[locationKey] ?? {};
  // Firebase push IDs sort chronologically as strings, so a key sort
  // recovers insertion order without needing a valid epoch on every row.
  return Object.keys(node)
    .sort()
    .map((key) => node[key]);
}
