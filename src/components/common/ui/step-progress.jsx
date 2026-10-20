"use client";

import React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A horizontal progress stepper.
 *
 * The connector between two steps has to sit on the circle's centre line,
 * not on the middle of the column — a stepper whose label wraps pushes the
 * line down between the words. So the stages are laid out as a grid: each
 * stage owns a column, and the connector is drawn from the previous stage's
 * centre to this one.
 */
export function StepProgress({
  steps = [],
  currentIndex = -1,
  className,
  stepClassName,
}) {
  if (!steps.length) return null;

  return (
    <div
      className={cn("grid min-w-max gap-y-2", className)}
      style={{
        gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
      }}
    >
      {steps.map((step, index) => {
        const done = currentIndex >= 0 && index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step}
            className="relative flex flex-col items-center gap-2 px-1 text-center"
          >
            {/* The connector from the previous stage. */}
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute end-1/2 top-2.5 h-0.5 w-full rounded-full",
                  index <= currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                isCurrent && "ring-4 ring-primary/15"
              )}
            >
              {done && index < currentIndex ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>

            <span
              className={cn(
                "text-xs leading-tight",
                done ? "font-medium text-foreground" : "text-muted-foreground",
                stepClassName
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StepProgress;
