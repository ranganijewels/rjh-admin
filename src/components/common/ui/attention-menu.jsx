"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Clock, Inbox, RefreshCw, Sparkles } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import { cn } from "@/lib/utils";

/**
 * "Needs attention" panel behind the notification bell.
 *
 * The bell used to be a decorative button with a permanent red dot. This
 * replaces it with the three queues an admin actually has to clear:
 * unconfirmed orders, unanswered support tickets and custom requests waiting
 * on a decision. Every row links to the screen where the work happens.
 */

const SOURCES = [
  {
    key: "orders",
    label: "Orders awaiting confirmation",
    icon: Clock,
    href: "/dashboard/order-management/all",
    // Anything that has not shipped yet still needs a human.
    isOpen: (row) => {
      const status = String(row.order_status || row.status || "").toLowerCase();
      return (
        status === "pending" ||
        status === "order placed" ||
        status === "confirmed" ||
        status === "processing" ||
        status === "in production"
      );
    },
  },
  {
    key: "tickets",
    label: "Open support tickets",
    icon: Inbox,
    href: "/dashboard/support",
    isOpen: (row) => {
      const status = String(row.status || row.ticket_status || "").toLowerCase();
      return !status || status === "open" || status === "in progress" ||
        status === "in-progress" || status === "pending";
    },
  },
  {
    key: "custom",
    label: "Custom requests to review",
    icon: Sparkles,
    href: "/dashboard/custom-jewelary/all-custom-request",
    isOpen: (row) => {
      const status = String(row.status || row.request_status || "").toLowerCase();
      return !status || status === "pending" || status === "new" ||
        status === "submitted";
    },
  },
];

const ENDPOINTS = {
  orders: "/api/order-management?limit=100",
  tickets: "/api/internal-tickets?limit=100",
  custom: "/api/custom-request?limit=100",
};

function extractRows(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  const candidate =
    payload.data ?? payload.rows ?? payload.results ?? payload.items ?? null;
  if (Array.isArray(candidate)) return candidate;
  if (candidate && typeof candidate === "object") {
    const nested =
      candidate.data ?? candidate.rows ?? candidate.results ?? candidate.items;
    if (Array.isArray(nested)) return nested;
  }
  return null;
}

export function AttentionMenu({ className, align = "end" }) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    const entries = await Promise.all(
      SOURCES.map(async (source) => {
        try {
          const res = await fetch(ENDPOINTS[source.key]);
          if (!res.ok) return [source.key, null];
          const rows = extractRows(await res.json());
          if (!rows) return [source.key, null];
          return [source.key, rows.filter(source.isOpen).length];
        } catch {
          // A source that cannot be reached is simply not reported.
          return [source.key, null];
        }
      })
    );

    setCounts(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const total = Object.values(counts).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          title="What needs attention"
          className={cn(
            "relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <Bell className="size-[18px]" />
          {total > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Needs attention
            </p>
            <p className="text-xs text-muted-foreground">
              {total > 0
                ? `${total} item${total === 1 ? "" : "s"} waiting on you`
                : "Nothing is waiting on you"}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            aria-label="Refresh"
            title="Refresh"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw
              className={cn("size-4", loading && "animate-spin")}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="p-2">
          {SOURCES.map((source) => {
            const count = counts[source.key];
            const Icon = source.icon;

            return (
              <Link
                key={source.key}
                href={source.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {source.label}
                </span>
                {count == null ? (
                  <span className="shrink-0 text-xs text-muted-foreground">—</span>
                ) : (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      count > 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AttentionMenu;
