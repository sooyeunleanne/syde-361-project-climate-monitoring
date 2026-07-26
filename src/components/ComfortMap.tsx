"use client";

import { useState } from "react";
import CampusMap from "./CampusMap";
import LocationsPanel from "./LocationsPanel";
import LocationDetailCard from "./LocationDetailCard";
import type { SensorLocation } from "@/lib/climate-data";

export default function ComfortMap() {
  const [selected, setSelected] = useState<SensorLocation | null>(null);

  function handleSelect(loc: SensorLocation) {
    setSelected((current) => (current?.id === loc.id ? null : loc));
  }

  const detailOnLeft = selected ? selected.x >= 55 : false;

  return (
    <div className="flex w-full flex-1 flex-col gap-4 p-4 md:relative md:block md:p-0">
      <div className="relative aspect-[1512/982] w-full overflow-hidden rounded-2xl bg-zinc-100 md:aspect-auto md:h-screen md:rounded-none">
        <CampusMap selectedId={selected?.id ?? null} onSelect={handleSelect} />
      </div>

      <div className="md:absolute md:top-4 md:left-4 md:z-20">
        <LocationsPanel selectedId={selected?.id ?? null} onSelect={handleSelect} />
      </div>

      {selected && (
        <div
          className="md:absolute md:z-30"
          style={
            detailOnLeft
              ? { right: `calc(${100 - selected.x}% + 2rem)`, top: `${Math.min(Math.max(selected.y, 6), 60)}%` }
              : { left: `calc(${selected.x}% + 2rem)`, top: `${Math.min(Math.max(selected.y, 6), 60)}%` }
          }
        >
          <LocationDetailCard location={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}
