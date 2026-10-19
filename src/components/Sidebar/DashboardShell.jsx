"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { DASHBOARD_MENU } from "@/services/constant";
import { MENU_SIDEBAR } from "@/config/menu.config";
import { SettingsProvider, useSettings } from "@/provider/settings-provider";
import {
  PermissionProvider,
  usePermissions,
} from "@/provider/permission-provider";
import AccessDenied from "@/components/common/AccessDenied";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/config";

// Flatten the sidebar config into searchable { title, path, trail } records.
// Group headings and parent-only items without a path are skipped.
function flattenMenu(items, trail = []) {
  return items.flatMap((item) => {
    if (item.heading) return [];
    const nextTrail = item.title ? [...trail, item.title] : trail;
    const self = item.path
      ? [{ title: item.title, path: item.path, trail: trail.join(" / ") }]
      : [];
    const children = item.children ? flattenMenu(item.children, nextTrail) : [];
    return [...self, ...children];
  });
}

const SEARCHABLE_MENU = flattenMenu(MENU_SIDEBAR);

function GlobalSearch({ className }) {
  const router = useRouter();
  const { canAccess } = usePermissions();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return SEARCHABLE_MENU.filter(
      (item) =>
        canAccess(item.path) &&
        (item.title.toLowerCase().includes(term) ||
          item.trail.toLowerCase().includes(term))
    ).slice(0, 8);
  }, [query, canAccess]);

  const open = focused && query.trim().length > 0;
  const showEmpty = open && results.length === 0;

  const go = (path) => {
    setQuery("");
    setFocused(false);
    router.push(path);
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setQuery("");
            setFocused(false);
          }
          if (event.key === "Enter" && results[0]) go(results[0].path);
        }}
        placeholder="Search anything..."
        aria-label="Search the admin panel"
        className="h-9 w-full rounded-lg border border-border bg-muted/50 ps-9 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/30 focus:bg-card focus:ring-[3px] focus:ring-primary/10"
      />
      {open && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-popover"
        >
          {results.map((item) => (
            <button
              key={item.path}
              type="button"
              role="option"
              aria-selected="false"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => go(item.path)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <span className="truncate font-medium">{item.title}</span>
              {item.trail && (
                <span className="shrink-0 truncate text-xs text-muted-foreground">
                  {item.trail}
                </span>
              )}
            </button>
          ))}
          {showEmpty && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No matching pages
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ShellInner({ children }) {
  const pathname = usePathname();
  const { settings, storeOption } = useSettings();
  const { canAccess } = usePermissions();
  const collapsed = !!settings?.layouts?.demo1?.sidebarCollapse;
  const [open, setOpen] = useState(false); // mobile drawer
  const allowed = canAccess(pathname);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const expand = () => storeOption("layouts.demo1.sidebarCollapse", false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: static column on desktop, off-canvas drawer on mobile.
          On desktop it collapses to width 0 when sidebarCollapse is set. */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 shrink-0 bg-card transition-all duration-200 lg:static lg:transition-[width]",
          "w-sidebar shadow-xl lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed && "lg:w-0 lg:overflow-hidden lg:border-0"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-md p-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar sideBarMenus={DASHBOARD_MENU} dashboardSidebar={true} />
      </div>

      {/* Floating expand button — shown on desktop only when collapsed */}
      {collapsed && (
        <button
          onClick={expand}
          className="fixed left-4 top-4 z-[60] hidden h-9 w-9 items-center justify-center rounded-md border border-border bg-card shadow-sm hover:bg-muted lg:flex"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Desktop top bar: global search + notifications.
            The account/profile lives in the sidebar footer, so it is not
            repeated here. */}
        <header className="hidden h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6 lg:flex">
          <GlobalSearch className="w-full max-w-md" />

          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>
          </div>
        </header>

        {/* Mobile top bar with hamburger */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold tracking-wide">{BRAND_NAME}</span>
          <div className="ms-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 overflow-auto bg-background p-4 md:p-6",
            collapsed && "lg:pl-16"
          )}
        >
          <div className="mx-auto w-full max-w-[1440px]">
            {allowed ? children : <AccessDenied pathname={pathname} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <SettingsProvider>
      <PermissionProvider>
        <ShellInner>{children}</ShellInner>
      </PermissionProvider>
    </SettingsProvider>
  );
}
