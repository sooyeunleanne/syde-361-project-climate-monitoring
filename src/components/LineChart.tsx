"use client";

import { useId, useRef, useState, type PointerEvent } from "react";

interface LineChartProps {
  data: { label: string; value: number }[];
  color: string;
  unit?: string;
  height?: number;
  formatValue?: (v: number) => string;
  /** compact mode: no axes, gridlines, or tooltip — for use in list rows */
  sparkline?: boolean;
}

export default function LineChart({
  data,
  color,
  unit = "",
  height = 96,
  formatValue,
  sparkline = false,
}: LineChartProps) {
  const clipId = `chart-clip-${useId().replace(/:/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 100; // viewBox units; scales via CSS width:100%
  const padX = sparkline ? 2 : 8;
  const padTop = sparkline ? 2 : 10;
  const padBottom = sparkline ? 2 : 18;
  const plotH = height - padTop - padBottom;
  const plotW = width - padX * 2;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const yFor = (v: number) => padTop + plotH - ((v - min) / spread) * plotH;
  const xFor = (i: number) => padX + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);

  const points = data.map((d, i) => ({ x: xFor(i), y: yFor(d.value), d }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)},${(padTop + plotH).toFixed(2)} L${points[0].x.toFixed(2)},${(padTop + plotH).toFixed(2)} Z`;

  const fmt = formatValue ?? ((v: number) => `${v}${unit}`);

  const gridLines = sparkline ? [] : [min + spread * 0.5, max];

  // show at most ~6 x-axis tick labels
  const tickEvery = Math.max(1, Math.ceil(data.length / 6));
  const last = points[points.length - 1];

  function handlePointerMove(e: PointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const tooltipFlip = hovered && hovered.x > width - 28;

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="block overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
        </defs>

        {!sparkline &&
          gridLines.map((gv, i) => (
            <g key={i}>
              <line
                x1={padX}
                x2={width - padX}
                y1={yFor(gv)}
                y2={yFor(gv)}
                stroke="var(--chart-grid)"
                strokeWidth={0.5}
              />
              <text x={0} y={yFor(gv) - 1} fontSize={3.6} fill="var(--chart-muted)">
                {Math.round(gv)}
                {unit}
              </text>
            </g>
          ))}

        <path d={areaPath} fill={color} opacity={0.1} clipPath={`url(#${clipId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={sparkline ? 1.4 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* end marker with surface ring */}
        <circle cx={last.x} cy={last.y} r={sparkline ? 1.6 : 2.4} fill="var(--chart-surface)" />
        <circle cx={last.x} cy={last.y} r={sparkline ? 1.1 : 1.7} fill={color} />

        {!sparkline && (
          <>
            {hovered && (
              <>
                <line
                  x1={hovered.x}
                  x2={hovered.x}
                  y1={padTop}
                  y2={padTop + plotH}
                  stroke="var(--chart-axis)"
                  strokeWidth={0.4}
                />
                <circle cx={hovered.x} cy={hovered.y} r={2.2} fill="var(--chart-surface)" />
                <circle cx={hovered.x} cy={hovered.y} r={1.5} fill={color} />
              </>
            )}

            {data.map((d, i) =>
              i % tickEvery === 0 || i === data.length - 1 ? (
                <text
                  key={i}
                  x={xFor(i)}
                  y={height - 2}
                  fontSize={3.6}
                  textAnchor="middle"
                  fill="var(--chart-muted)"
                >
                  {d.label}
                </text>
              ) : null
            )}

            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </>
        )}
      </svg>

      {!sparkline && hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-y-full rounded-md border border-black/10 bg-(--chart-surface) px-2 py-1 text-xs shadow-md dark:border-white/10"
          style={{
            left: `${hovered.x}%`,
            transform: `translate(${tooltipFlip ? "-100%" : "0%"}, calc(-100% - 4px))`,
          }}
        >
          <div className="font-medium text-(--text-primary)">{fmt(hovered.d.value)}</div>
          <div className="text-(--text-muted)">{hovered.d.label}</div>
        </div>
      )}
    </div>
  );
}
