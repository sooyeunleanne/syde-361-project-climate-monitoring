"use client";

import { useState } from "react";
import LineChart from "./LineChart";
import {
  comfortNote,
  comfortStatus,
  generateSeries,
  LAND_COVER_LABEL,
  minutesAgo,
  suggestion,
  type SensorLocation,
  type TimeRange,
} from "@/lib/climate-data";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "live", label: "Live Readings" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "all", label: "All" },
];

interface LocationDetailCardProps {
  location: SensorLocation;
  onClose: () => void;
}

export default function LocationDetailCard({ location, onClose }: LocationDetailCardProps) {
  const [range, setRange] = useState<TimeRange>("live");
  const series = generateSeries(location, range);
  const current = series[series.length - 1];
  const status = comfortStatus(current.temperature);
  const tip = suggestion(location, current.temperature);

  return (
    <div className="w-full rounded-2xl border border-black/10 bg-(--panel-surface) p-4 shadow-xl backdrop-blur dark:border-white/10 md:w-[360px]">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-(--text-primary)">{location.name}</h2>
          <p className="text-xs text-(--text-muted)">{LAND_COVER_LABEL[location.landCover]}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-(--text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          ×
        </button>
      </div>

      {tip ? (
        <div
          className="my-3 rounded-lg border-l-4 px-3 py-2 text-sm"
          style={{
            borderColor: "var(--status-good)",
            background: "color-mix(in srgb, var(--status-good) 12%, transparent)",
          }}
        >
          <p className="font-medium text-(--text-primary)">Suggested improvement</p>
          <p className="text-(--text-secondary)">{tip}</p>
        </div>
      ) : (
        <p className="my-3 text-sm text-(--text-secondary)">{comfortNote(location)}</p>
      )}

      <div className="mb-3 flex gap-4 border-b border-black/10 text-sm dark:border-white/10">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={`border-b-2 pb-2 font-medium ${
              range === r.id
                ? "border-(--text-primary) text-(--text-primary)"
                : "border-transparent text-(--text-muted)"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <ChartBlock
          label="Temperature (°C)"
          current={`${current.temperature}°C`}
          color="var(--series-temperature)"
          data={series.map((r) => ({ label: r.label, value: r.temperature }))}
          unit="°C"
        />
        <ChartBlock
          label="Humidity (%)"
          current={`${current.humidity}%`}
          color="var(--series-humidity)"
          data={series.map((r) => ({ label: r.label, value: r.humidity }))}
          unit="%"
        />
        <ChartBlock
          label="Light Intensity (V)"
          current={`${current.light}V`}
          color="var(--series-light)"
          data={series.map((r) => ({ label: r.label, value: r.light }))}
          unit="V"
        />
      </div>

      <p className="mt-3 text-xs text-(--text-muted)">
        Last updated {minutesAgo(location)} mins ago · status:{" "}
        <span
          style={{
            color:
              status === "good"
                ? "var(--status-good)"
                : status === "serious"
                ? "var(--status-serious)"
                : "var(--status-critical)",
          }}
        >
          {status === "good" ? "comfortable" : status === "serious" ? "warm" : "hot"}
        </span>
      </p>
    </div>
  );
}

function ChartBlock({
  label,
  current,
  color,
  data,
  unit,
}: {
  label: string;
  current: string;
  color: string;
  data: { label: string; value: number }[];
  unit: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-(--text-secondary)">{label}</span>
        <span className="text-sm font-semibold text-(--text-primary)">Current: {current}</span>
      </div>
      <LineChart data={data} color={color} unit={unit} height={96} />
    </div>
  );
}
