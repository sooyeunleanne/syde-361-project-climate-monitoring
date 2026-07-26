"use client";

import { useState } from "react";
import LineChart from "./LineChart";
import {
  comfortStatus,
  generateSeries,
  LAND_COVER_LABEL,
  LOCATIONS,
  minutesAgo,
  STATUS_LABEL,
  type SensorLocation,
} from "@/lib/climate-data";

const STATUS_VAR: Record<string, string> = {
  good: "var(--status-good)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
};

interface LocationsPanelProps {
  selectedId: string | null;
  onSelect: (loc: SensorLocation) => void;
}

export default function LocationsPanel({ selectedId, onSelect }: LocationsPanelProps) {
  const [tab, setTab] = useState<"locations" | "history">("locations");

  return (
    <div className="w-full rounded-2xl border border-black/10 bg-(--panel-surface) shadow-xl backdrop-blur md:w-[340px]">
      <div className="border-b border-black/10 px-4 pt-4 pb-2">
        <h1 className="text-base font-semibold text-(--text-primary)">Campus Comfort Map</h1>
        <p className="text-xs text-(--text-muted)">{LOCATIONS.length} locations</p>

        <div className="mt-3 flex gap-4 text-sm">
          <button
            type="button"
            onClick={() => setTab("locations")}
            className={`border-b-2 pb-2 font-medium ${
              tab === "locations"
                ? "border-(--text-primary) text-(--text-primary)"
                : "border-transparent text-(--text-muted)"
            }`}
          >
            Locations
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`border-b-2 pb-2 font-medium ${
              tab === "history"
                ? "border-(--text-primary) text-(--text-primary)"
                : "border-transparent text-(--text-muted)"
            }`}
          >
            Historical Data
          </button>
        </div>
      </div>

      {tab === "locations" ? (
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-(--text-muted)">
            <span>Location</span>
            <span>Temp.</span>
            <span>Humidity</span>
            <span>LDR</span>
          </div>
          {LOCATIONS.map((loc) => {
            const status = comfortStatus(loc.baseTemp);
            const selected = loc.id === selectedId;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelect(loc)}
                className={`grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-4 py-3 text-left transition-colors ${
                  selected ? "bg-black/5" : "hover:bg-black/[0.03]"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium text-(--text-primary)">{loc.name}</span>
                  <span className="block text-xs text-(--text-muted)">
                    Last updated {minutesAgo(loc)} mins ago
                  </span>
                </span>
                <span className="text-sm font-semibold" style={{ color: STATUS_VAR[status] }}>
                  {loc.baseTemp}°C
                </span>
                <span className="text-sm text-(--text-secondary)">{loc.baseHumidity}%</span>
                <span className="text-sm text-(--text-secondary)">{loc.baseLight}V</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
          <p className="mb-2 text-xs text-(--text-muted)">7-day temperature trend by location</p>
          {LOCATIONS.map((loc) => {
            const status = comfortStatus(loc.baseTemp);
            const series = generateSeries(loc, "7d");
            const selected = loc.id === selectedId;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelect(loc)}
                className={`mb-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                  selected ? "bg-black/5" : "hover:bg-black/[0.03]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-(--text-primary)">{loc.name}</div>
                  <div className="text-[11px] text-(--text-muted)">{LAND_COVER_LABEL[loc.landCover]}</div>
                </div>
                <div className="w-20">
                  <LineChart
                    sparkline
                    data={series.map((r) => ({ label: r.label, value: r.temperature }))}
                    color={STATUS_VAR[status]}
                    height={28}
                  />
                </div>
                <div className="w-14 text-right text-sm font-semibold text-(--text-primary)">
                  {loc.baseTemp}°C
                </div>
              </button>
            );
          })}
          <p className="mt-1 text-[11px] text-(--text-muted)">
            Status: <span style={{ color: STATUS_VAR.good }}>{STATUS_LABEL.good}</span> ·{" "}
            <span style={{ color: STATUS_VAR.serious }}>{STATUS_LABEL.serious}</span> ·{" "}
            <span style={{ color: STATUS_VAR.critical }}>{STATUS_LABEL.critical}</span>
          </p>
        </div>
      )}
    </div>
  );
}
