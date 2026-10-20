"use client";

import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/common/ui/cards/card";
import { MiniChart } from "@/components/common/ui/mini-chart";
import { cn } from "@/lib/utils";

/**
 * The KPI tile used by the dashboard and the orders page, so both read as
 * one system: label + icon chip on top, the big value, an optional chart or
 * progress bar, and a trend/sub line.
 *
 * `chart` is a series for the mini chart (line, area or bar). `progress` is
 * a { value, max } pair rendered as a bar — useful for the tiles that
 * describe a share rather than a total (live products of the catalogue,
 * for instance). A tile never shows both.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  trend,
  chart,
  chartVariant = "area",
  chartTone = "primary",
  progress,
  progressLabel,
  footer,
  className,
}) {
  const hasChart = Array.isArray(chart) && chart.length > 1;
  const hasProgress =
    progress && Number.isFinite(Number(progress.value)) && Number(progress.max) > 0;

  const progressPct = hasProgress
    ? Math.min(
        100,
        Math.max(0, (Number(progress.value) / Number(progress.max)) * 100)
      )
    : 0;

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

      {/* The chart sits under the number rather than beside it — the tiles
          are narrow, and a long value would squeeze it into nothing. */}
      {hasChart && (
        <MiniChart
          data={chart}
          variant={chartVariant}
          tone={chartTone}
          className="mt-3"
        />
      )}

      {hasProgress && (
        <div className="mt-3">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressLabel || label}
          >
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {(sub || trend != null || footer) && (
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
              {Math.abs(Math.round(trend))}%
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
          {footer}
        </div>
      )}
    </Card>
  );
}

export default KpiCard;
