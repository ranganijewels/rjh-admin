"use client";

import React from "react";

import { cn } from "@/lib/utils";

/**
 * Standard page frame for every dashboard page.
 *
 * The app shell already provides the page padding (`p-4 md:p-6`), so pages
 * must NOT add their own — otherwise the inset compounds and the layout
 * drifts from page to page. `Page` therefore only owns vertical rhythm, and
 * `PageHeader` owns the title / description / actions block.
 */
export function Page({ children, className }) {
  return (
    <div className={cn("flex w-full flex-col gap-5 lg:gap-6", className)}>
      {children}
    </div>
  );
}

/**
 * Page heading block: title, optional description, optional actions.
 * Actions sit on the right on wide screens and wrap below on small ones.
 *
 * `titleAs="h2"` renders a section heading instead of the page heading — used
 * by panels that live inside a tab (CMS tabs, for example), where the tab
 * strip already owns the h1.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
  titleAs = "h1",
}) {
  const Heading = titleAs;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <Heading
          className={cn(
            "font-semibold leading-tight text-foreground",
            titleAs === "h2" ? "text-lg" : "text-2xl",
            titleClassName
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default Page;
