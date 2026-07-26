"use client";

import Image from "next/image";
import { comfortStatus, LOCATIONS, type SensorLocation } from "@/lib/climate-data";

const STATUS_VAR: Record<string, string> = {
  good: "var(--status-good)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
};

interface CampusMapProps {
  selectedId: string | null;
  onSelect: (loc: SensorLocation) => void;
}

export default function CampusMap({ selectedId, onSelect }: CampusMapProps) {
  return (
    <div className="relative h-full w-full">
      <Image
        src="/campus-map.png"
        alt="University of Waterloo campus map"
        fill
        priority
        className="object-contain"
      />

      {LOCATIONS.map((loc) => {
        const status = comfortStatus(loc.baseTemp);
        const selected = loc.id === selectedId;
        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc)}
            aria-label={`${loc.name} sensor — ${loc.baseTemp}°C`}
            aria-pressed={selected}
            className="group absolute flex items-center justify-center rounded-full font-semibold text-white shadow-md transition-transform"
            style={{
              left: `${loc.x}%`,
              top: `${loc.y}%`,
              transform: `translate(-50%, -50%) scale(${selected ? 1.15 : 1})`,
              width: 26,
              height: 26,
              fontSize: 12,
              background: STATUS_VAR[status],
              outline: selected ? "3px solid var(--chart-surface)" : "2px solid var(--chart-surface)",
              outlineOffset: 0,
              boxShadow: selected
                ? "0 0 0 3px " + STATUS_VAR[status] + ", 0 2px 6px rgba(0,0,0,0.35)"
                : "0 2px 6px rgba(0,0,0,0.35)",
              zIndex: selected ? 30 : 10,
            }}
          >
            {loc.number}
          </button>
        );
      })}
    </div>
  );
}
