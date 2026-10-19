"use client";

import React from "react";

import { cn } from "@/lib/utils";

/**
 * Pill strip used to narrow a list down to one status.
 *
 * The counts are supplied by the caller so they always describe the rows
 * currently on screen — the same contract the Orders page uses for its
 * fulfilment-status tabs.
 */
export function StatusFilter({
  options = [],
  value,
  onChange,
  className,
  ariaLabel = "Filter by status",
}) {
  if (!options.length) return null;

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/70 p-1",
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
              isActive
                ? "border-border bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
            )}
          >
            {option.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Builds the option list for a `StatusFilter` from a dataset.
 *
 * `getStatus` maps a row to its status label; `order` pins the statuses that
 * should appear first (anything else follows, alphabetically). The "all"
 * option always comes first and carries the total row count.
 */
export function buildStatusOptions(
  rows = [],
  getStatus,
  { allLabel = "All", order = [] } = {}
) {
  const counts = new Map();

  rows.forEach((row) => {
    const status = getStatus(row);
    if (status === undefined || status === null || status === "") return;
    counts.set(status, (counts.get(status) || 0) + 1);
  });

  const ordered = [
    ...order.filter((status) => counts.has(status)),
    ...[...counts.keys()]
      .filter((status) => !order.includes(status))
      .sort(),
  ];

  return [
    { value: "all", label: allLabel, count: rows.length },
    ...ordered.map((status) => ({
      value: status,
      label: status,
      count: counts.get(status),
    })),
  ];
}

export default StatusFilter;
