"use client";

import React from "react";

import { cn } from "@/lib/utils";

/**
 * A tiny chart for a KPI tile.
 *
 * Drawn by hand rather than with the chart library: a mini chart is a
 * decoration next to the number, not a chart, and it has to stay crisp at
 * 80×28. It is `aria-hidden` — the value itself carries the meaning.
 *
 * `variant`:
 *   area  — a filled line (the default)
 *   line  — a stroked line only
 *   bar   — a column chart, for counts
 */
export function MiniChart({
  data = [],
  variant = "area",
  className,
  tone = "primary",
  height = 28,
  strokeWidth = 1.5,
}) {
  const points = data.map(Number).filter((n) => Number.isFinite(n));
  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 100;
  const step = width / (points.length - 1);

  const coords = points.map((value, index) => [
    index * step,
    height - ((value - min) / range) * (height - 4) - 2,
  ]);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  const toneClass = {
    primary: "stroke-primary fill-primary/10",
    success: "stroke-success fill-success/10",
    destructive: "stroke-destructive fill-destructive/10",
    warning: "stroke-warning fill-warning/10",
    info: "stroke-info fill-info/10",
  }[tone] || "stroke-primary fill-primary/10";

  if (variant === "bar") {
    const barWidth = Math.max(1.5, (width / points.length) * 0.6);
    const gap = width / points.length;
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={cn("w-full shrink-0", className)}
        style={{ height }}
        aria-hidden="true"
        focusable="false"
      >
        {points.map((value, index) => {
          const barHeight = Math.max(
            1,
            ((value - min) / range) * (height - 3) + 1
          );
          return (
            <rect
              key={index}
              x={index * gap + (gap - barWidth) / 2}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={0.8}
              className={toneClass.split(" ")[1]}
            />
          );
        })}
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full shrink-0", className)}
      style={{ height }}
      aria-hidden="true"
      focusable="false"
    >
      {variant === "area" && (
        <polygon
          points={`0,${height} ${line} ${width},${height}`}
          className={toneClass.split(" ")[1]}
        />
      )}
      <polyline
        points={line}
        fill="none"
        className={toneClass.split(" ")[0]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* The latest point is the one that matters. */}
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r={1.8}
        className={toneClass.split(" ")[0]}
        strokeWidth={0}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default MiniChart;
