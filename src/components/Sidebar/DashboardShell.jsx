"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, PanelLeftOpen } from "lucide-react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { DASHBOARD_MENU } from "@/services/constant";
import { SettingsProvider, useSettings } from "@/provider/settings-provider";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/config";

function ShellInner({ children }) {
  const pathname = usePathname();
  const { settings, storeOption } = useSettings();
  const collapsed = !!settings?.layouts?.demo1?.sidebarCollapse;
  const [open, setOpen] = useState(false); // mobile drawer

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
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: static column on desktop, off-canvas drawer on mobile.
          On desktop it collapses to width 0 when sidebarCollapse is set. */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 shrink-0 transition-all duration-200 lg:transition-[width] bg-background",
          "w-sidebar-mobile",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed && "lg:w-0 lg:overflow-hidden"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-3 right-3 z-10 p-1 rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
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
          className="hidden lg:flex fixed top-4 left-4 z-[60] items-center justify-center h-9 w-9 rounded-md border border-border bg-background shadow-sm hover:bg-muted"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar with hamburger */}
        <header className="lg:hidden flex items-center gap-3 border-b border-border px-4 h-14 shrink-0 bg-background">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold tracking-wide">{BRAND_NAME}</span>
        </header>

        <main className={cn("flex-1 overflow-auto p-4 md:p-6", collapsed && "lg:pl-16")}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <SettingsProvider>
      <ShellInner>{children}</ShellInner>
    </SettingsProvider>
  );
}
