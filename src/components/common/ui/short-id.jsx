"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

// Renders a long opaque identifier (UUID, order number, SKU) as a short,
// scannable token: the first `length` characters plus an ellipsis. The full
// value stays available three ways: a tooltip on hover, the native `title`
// attribute, and click-to-copy — which is what makes truncated IDs usable
// instead of a guessing game.
export function ShortId({
  value,
  length = 8,
  label = "ID",
  className,
  iconClassName,
}) {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  const full = String(value);
  const short = full.length > length + 2 ? `${full.slice(0, length)}…` : full;

  const handleCopy = async (event) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          title={full}
          aria-label={`Copy ${label} ${full}`}
          className={cn(
            "group inline-flex max-w-full items-center gap-1.5 rounded-md font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <span className="truncate">{short}</span>
          {copied ? (
            <Check
              className={cn("size-3 shrink-0 text-success", iconClassName)}
              aria-hidden="true"
            />
          ) : (
            <Copy
              className={cn(
                "size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                iconClassName
              )}
              aria-hidden="true"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{full}</TooltipContent>
    </Tooltip>
  );
}

// Single-line clamp for free-text cells that would otherwise widen a column.
// The full value is exposed through the native tooltip on hover.
export function TruncatedText({ value, className, title }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  const text = String(value);
  return (
    <span
      title={title ?? text}
      className={cn("block max-w-full truncate", className)}
    >
      {text}
    </span>
  );
}
