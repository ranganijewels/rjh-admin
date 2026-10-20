"use client";

import React from "react";

import { cn } from "@/lib/utils";

/**
 * A grid of label / value pairs.
 *
 * Detail views used to lay these out with inline `gap-9` flex rows, which
 * left the pairs drifting out of alignment as the panel narrowed. This is a
 * real grid, so the columns line up at every width.
 */
export function SummaryGrid({
  items = [],
  columns = 3,
  className,
  itemClassName,
  labelClassName,
  valueClassName,
}) {
  if (!items.length) return null;

  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {items.map(([label, value, options], index) => (
        <div key={`${label}-${index}`} className={cn("min-w-0", itemClassName)}>
          <dt
            className={cn(
              "text-xs font-medium uppercase tracking-wide text-muted-foreground",
              labelClassName
            )}
          >
            {label}
          </dt>
          <dd
            // A long identifier is truncated to keep the grid aligned, so
            // the full value stays one hover away.
            title={typeof value === "string" ? value : undefined}
            className={cn(
              "mt-1 truncate text-sm font-medium text-foreground",
              options?.className,
              valueClassName
            )}
          >
            {value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default SummaryGrid;
