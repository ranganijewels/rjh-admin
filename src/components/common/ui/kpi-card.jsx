"use client";

import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/common/ui/cards/card";
import { cn } from "@/lib/utils";

// Shared KPI tile used by the dashboard and the orders page so both read as
// one system: label + icon chip on top, big value, optional trend/sub line.
// Everything is expressed with semantic tokens so it works in both themes.
export function KpiCard({ label, value, icon: Icon, sub, trend, className }) {
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

export default KpiCard;
