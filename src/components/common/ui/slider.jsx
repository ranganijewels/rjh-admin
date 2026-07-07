"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({ className, children, disabled, ...props }) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      disabled={disabled}
      className={cn(
        "relative flex h-4 w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-accent">
        <SliderPrimitive.Range
          className={cn(
            "absolute h-full",
            disabled ? "bg-muted-foreground" : "bg-primary"
          )}
        />
      </SliderPrimitive.Track>
      {/* Inject disabled into all children */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { disabled })
          : child
      )}
    </SliderPrimitive.Root>
  );
}

function SliderThumb({ className, disabled, ...props }) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        "box-content block size-4 shrink-0 rounded-full shadow-xs shadow-black/5 border-[2px] outline-hidden focus:outline-hidden",
        disabled
          ? "bg-muted border-muted-foreground cursor-not-allowed"
          : "border-primary bg-primary-foreground cursor-pointer",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}

export { Slider, SliderThumb };
