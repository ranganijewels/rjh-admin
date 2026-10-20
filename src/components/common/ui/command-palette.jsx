"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  FileText,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { usePermissions } from "@/provider/permission-provider";
import { searchSidebar } from "@/lib/nav-search";
import { cn } from "@/lib/utils";

/**
 * Admin command palette (⌘K / Ctrl+K).
 *
 * Searches three things at once:
 *  - the pages of the admin panel (instant, from the sidebar config)
 *  - products (server side, `?search=`)
 *  - orders and customers (server side, filtered client side)
 *
 * The palette is deliberately keyboard first: arrows move, Enter opens, Esc
 * closes — an admin who lives in the panel should never need the mouse to
 * jump to a product.
 */

const KINDS = {
  page: { label: "Page", icon: FileText },
  product: { label: "Product", icon: Package },
  order: { label: "Order", icon: ShoppingBag },
  customer: { label: "Customer", icon: Users },
};

// Different endpoints wrap their payload differently; this reads whichever
// shape comes back so one missing field never breaks the palette.
function extractRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const candidate =
    payload.data ?? payload.rows ?? payload.results ?? payload.items ?? null;
  if (Array.isArray(candidate)) return candidate;
  if (candidate && typeof candidate === "object") {
    const nested =
      candidate.data ?? candidate.rows ?? candidate.results ?? candidate.items;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function CommandPalette({
  className,
  placeholder = "Search anything...",
  variant = "field",
}) {
  const router = useRouter();
  const { canAccess } = usePermissions();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState({ products: [], orders: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // --- open / close -------------------------------------------------------

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    // Focus the field once the dialog has mounted.
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  // --- remote sources -----------------------------------------------------

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setRemote({ products: [], orders: [], customers: [] });
      setLoading(false);
      return undefined;
    }

    let alive = true;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      const safe = (url) =>
        fetch(url)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

      const [products, orders, customers] = await Promise.all([
        safe(`/api/product-management?search=${encodeURIComponent(term)}&limit=5`),
        safe(`/api/order-management?search=${encodeURIComponent(term)}&limit=5`),
        safe(`/api/customer-data?limit=50`),
      ]);

      if (!alive) return;

      const productRows = extractRows(products)
        .map((row) => ({
          kind: "product",
          id: row.id,
          title:
            row.productName ||
            row.title ||
            row.design_no ||
            row.productCode ||
            "Untitled product",
          subtitle: row.design_no || row.productCode || row.category || "",
          path: `/dashboard/product-management/view/${row.id}`,
        }))
        .filter((row) => row.id);

      const orderRows = extractRows(orders)
        .map((row) => ({
          kind: "order",
          id: row.id,
          title: row.orderNumber || row.order_number || row.id,
          subtitle: row.customer_name || row.customerName || "",
          path: "/dashboard/order-management/all",
        }))
        .filter((row) => row.id);

      const needle = term.toLowerCase();
      const customerRows = extractRows(customers)
        .filter((row) => {
          const haystack = [
            row.name,
            row.customer_name,
            row.email,
            row.phone,
            row.id,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(needle);
        })
        .map((row) => ({
          kind: "customer",
          id: row.id,
          title:
            row.name || row.customer_name || row.email || String(row.id || ""),
          subtitle: row.email || row.phone || "",
          path: "/dashboard/customer-data",
        }))
        .filter((row) => row.id);

      setRemote({
        products: productRows.slice(0, 5),
        orders: orderRows.slice(0, 5),
        customers: customerRows.slice(0, 5),
      });
      setLoading(false);
    }, 260);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  // --- results ------------------------------------------------------------

  const pageResults = useMemo(
    () =>
      searchSidebar(query, canAccess).slice(0, 6).map((item) => ({
        kind: "page",
        id: item.path,
        title: item.title,
        subtitle: item.trail,
        path: item.path,
      })),
    [query, canAccess]
  );

  const groups = useMemo(() => {
    const result = [];
    if (pageResults.length) result.push({ label: "Pages", items: pageResults });
    if (remote.products.length)
      result.push({ label: "Products", items: remote.products });
    if (remote.orders.length) result.push({ label: "Orders", items: remote.orders });
    if (remote.customers.length)
      result.push({ label: "Customers", items: remote.customers });
    return result;
  }, [pageResults, remote]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    setActive(0);
  }, [flat.length]);

  // --- navigation ---------------------------------------------------------

  const go = useCallback(
    (path) => {
      setOpen(false);
      setQuery("");
      router.push(path);
    },
    [router]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((index) => (flat.length ? (index + 1) % flat.length : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((index) =>
          flat.length ? (index - 1 + flat.length) % flat.length : 0
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = flat[active];
        if (target) go(target.path);
      }
    },
    [flat, active, go]
  );

  const isMac =
    typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the command palette"
        title="Search (⌘K)"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="size-[18px]" />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the command palette"
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-muted/50 ps-3 pe-2 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/10",
          className
        )}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{placeholder}</span>
        <kbd className="ms-auto hidden shrink-0 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
    );

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          close={false}
          className="top-[12%] max-w-xl gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages, products, orders and customers.
          </DialogDescription>

          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search pages, products, orders and customers…"
              aria-label="Search pages, products, orders and customers"
              className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {loading && (
              <Loader2
                className="size-4 shrink-0 animate-spin text-muted-foreground"
                aria-label="Searching"
              />
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {flat.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {query.trim().length < 2
                  ? "Type at least two characters to search products, orders and customers."
                  : "No results found."}
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const index = flat.indexOf(item);
                    const kind = KINDS[item.kind] ?? KINDS.page;
                    const KindIcon = kind.icon;
                    const isActive = index === active;

                    return (
                      <button
                        key={`${item.kind}-${item.id}`}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(item.path)}
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors",
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        )}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <KindIcon className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          {item.subtitle &&
                            item.subtitle !== item.title && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            )}
                        </span>
                        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {kind.label}
                        </span>
                        {isActive && (
                          <CornerDownLeft
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">
                ↓
              </kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">
                ↵
              </kbd>
              to open
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">
                esc
              </kbd>
              to close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CommandPalette;
