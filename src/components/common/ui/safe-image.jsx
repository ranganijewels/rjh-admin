"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * An image with a graceful fallback.
 *
 * Catalogue media is served from signed URLs that expire, and a token that
 * has gone stale makes the CDN answer 401. The browser then draws its own
 * broken-image glyph inside every cell and every card — which reads as a
 * broken page rather than a broken session. A failed load falls back to the
 * muted placeholder instead.
 *
 * `fallbackSrc` swaps in a specific image (a bundled placeholder photo)
 * rather than the icon.
 */
export function SafeImage({
  src,
  alt = "",
  className,
  iconClassName,
  fallbackSrc,
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  if (failed && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        {...rest}
      />
    );
  }

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

export default SafeImage;
