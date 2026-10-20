"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Catalogue media with a graceful fallback.
 *
 * Product photos are served from signed URLs that expire, and a token that
 * has gone stale makes the CDN answer 401. The browser then draws its own
 * broken-image glyph inside every cell and every card — which reads as a
 * broken product list rather than a broken session. A failed load falls back
 * to the same muted placeholder used for a product with no photo at all.
 */
export function ProductThumb({
  src,
  alt = "",
  className,
  iconClassName,
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden bg-muted",
          className
        )}
      >
        <ImageOff
          className={cn("size-4 text-muted-foreground", iconClassName)}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

export default ProductThumb;
