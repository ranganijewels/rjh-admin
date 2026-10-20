"use client";

import React from "react";

import { Skeleton } from "@/components/common/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton loaders that stand in for the real page.
 *
 * A spinner says "something is happening"; a skeleton says "this is what
 * you are about to get". Every route and every page that loads data uses
 * one of these, so the panel never flashes an empty card or a lone spinner
 * while the data is on its way.
 *
 * They are shaped after the real layouts — the page heading, the KPI row,
 * the toolbar, the table — so nothing jumps when the content arrives.
 */

function Heading({ className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

function KpiRow({ count = 5, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[124px] rounded-xl" />
      ))}
    </div>
  );
}

function TableBlock({ rows = 8, className }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Skeleton className="h-9 w-64" />
        <div className="ms-auto flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <div className="ms-auto flex gap-2">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A page that is a title, some KPIs and a table. */
export function ListPageSkeleton({
  kpis = 5,
  rows = 8,
  className,
  showKpis = true,
}) {
  return (
    <div className={cn("flex flex-col gap-5 lg:gap-6", className)}>
      <Heading />
      {showKpis && <KpiRow count={kpis} />}
      <TableBlock rows={rows} />
    </div>
  );
}

/** A page that is a title and a set of stacked panels. */
export function DetailPageSkeleton({ panels = 3, className }) {
  return (
    <div className={cn("flex flex-col gap-5 lg:gap-6", className)}>
      <Heading />
      {Array.from({ length: panels }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="border-b border-border bg-muted/60 px-5 py-3.5">
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A page that is a title and a long form. */
export function FormPageSkeleton({ fields = 8, className }) {
  return (
    <div className={cn("flex flex-col gap-5 lg:gap-6", className)}>
      <Heading />
      <div className="space-y-6 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

/** The dashboard: a heading, five KPIs and a chart. */
export function DashboardPageSkeleton({ className }) {
  return (
    <div className={cn("flex flex-col gap-5 lg:gap-6", className)}>
      <Heading />
      <KpiRow count={5} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

/** A centred card — the sign-in screen. */
export function CardSkeleton({ className }) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center p-6",
        className
      )}
    >
      <div className="w-full max-w-[400px] space-y-5 rounded-xl border border-border bg-card p-8">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-6 w-24" />
          <Skeleton className="mx-auto h-3.5 w-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

export default ListPageSkeleton;
