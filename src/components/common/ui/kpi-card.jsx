"use client";

import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/common/ui/cards/card";
import { cn } from "@/lib/utils";

/**
 * Tiny inline SVG sparkline for a KPI tile.
 *
 * Drawn by hand rather than with the chart library: a sparkline is a
 * decoration next to the number, not a chart, and it has to stay crisp at
 * 80×28. `aria-hidden` — the value itself carries the meaning.
 */
function Sparkline({ data = [], className }) {
  const points = data.map(Number).filter((n) => Number.isFinite(n));
  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 100;
  const height = 28;
  const step = width / (points.length - 1);

  const coords = points.map((value, index) => [
    index * step,
    height - ((value - min) / range) * (height - 4) - 2,
  ]);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-7 w-20 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={`0,${height} ${line} ${width},${height}`} className="fill-primary/10" />
      <polyline
        points={line}
        fill="none"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Shared KPI tile used by the dashboard and the orders page so both read as
// one system: label + icon chip on top, big value, optional trend/sub line.
export function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  trend,
  sparkline,
  className,
}) {
  const hasSparkline = Array.isArray(sparkline) && sparkline.length > 1;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3 text-[22px] font-semibold leading-none text-foreground sm:text-[28px]">
        {value}
      </div>

      {/* The sparkline sits under the number rather than beside it — the
          tiles are narrow, and a long value would squeeze it into nothing. */}
      {hasSparkline && <Sparkline data={sparkline} className="mt-3 h-6 w-full" />}

      {(sub || trend != null) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          {trend != null && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trend >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="size-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden="true" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
        </div>
      )}
    </Card>
  );
}

export { Sparkline };
export default KpiCard;
