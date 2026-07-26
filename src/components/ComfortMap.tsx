"use client";

import { useLayoutEffect, useRef, useState } from "react";
import CampusMap from "./CampusMap";
import LocationsPanel from "./LocationsPanel";
import LocationDetailCard from "./LocationDetailCard";
import type { SensorLocation } from "@/lib/climate-data";

const EDGE_MARGIN = 16;
const PIN_GAP = 32;

export default function ComfortMap() {
  const [selected, setSelected] = useState<SensorLocation | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleSelect(loc: SensorLocation) {
    setSelected((current) => (current?.id === loc.id ? null : loc));
  }

  useLayoutEffect(() => {
    if (!selected) {
      setCardPos(null);
      return;
    }

    function reposition() {
      const container = containerRef.current;
      const card = cardRef.current;
      if (!container || !card || !selected) return;

      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const anchorX = (selected.x / 100) * containerRect.width;
      const anchorY = (selected.y / 100) * containerRect.height;

      const maxLeft = containerRect.width - cardRect.width - EDGE_MARGIN;
      const maxTop = containerRect.height - cardRect.height - EDGE_MARGIN;

      const fitsOnRight = anchorX + PIN_GAP + cardRect.width <= containerRect.width - EDGE_MARGIN;

      const top = Math.min(Math.max(anchorY, EDGE_MARGIN), Math.max(maxTop, EDGE_MARGIN));

      if (fitsOnRight) {
        setCardPos({ top, left: Math.min(Math.max(anchorX + PIN_GAP, EDGE_MARGIN), Math.max(maxLeft, EDGE_MARGIN)) });
      } else {
        const rightEdge = containerRect.width - anchorX + PIN_GAP;
        setCardPos({
          top,
          right: Math.min(Math.max(rightEdge, EDGE_MARGIN), Math.max(maxLeft, EDGE_MARGIN)),
        });
      }
    }

    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [selected]);

  return (
    <div ref={containerRef} className="flex w-full flex-1 flex-col gap-4 p-4 md:relative md:block md:p-0">
      <div className="relative aspect-[1512/982] w-full overflow-hidden rounded-2xl bg-zinc-100 md:aspect-auto md:h-screen md:rounded-none">
        <CampusMap selectedId={selected?.id ?? null} onSelect={handleSelect} />
      </div>

      <div className="md:absolute md:top-4 md:left-4 md:z-20">
        <LocationsPanel selectedId={selected?.id ?? null} onSelect={handleSelect} />
      </div>

      {selected && (
        <div
          ref={cardRef}
          className="md:absolute md:z-30"
          style={
            cardPos
              ? { top: `${cardPos.top}px`, left: cardPos.left != null ? `${cardPos.left}px` : undefined, right: cardPos.right != null ? `${cardPos.right}px` : undefined }
              : { top: 0, left: 0, visibility: "hidden" }
          }
        >
          <LocationDetailCard location={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}
