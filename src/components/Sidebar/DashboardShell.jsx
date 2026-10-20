"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { DASHBOARD_MENU } from "@/services/constant";
import { CommandPalette } from "@/components/common/ui/command-palette";
import { AttentionMenu } from "@/components/common/ui/attention-menu";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { SettingsProvider, useSettings } from "@/provider/settings-provider";
import {
  PermissionProvider,
  usePermissions,
} from "@/provider/permission-provider";
import AccessDenied from "@/components/common/AccessDenied";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/config";

function ShellInner({ children }) {
  const pathname = usePathname();
  const { settings } = useSettings();
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
          On desktop it collapses to an icon rail, so the navigation is
          always one click away instead of disappearing. */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 shrink-0 bg-card transition-all duration-200 lg:static lg:transition-[width]",
          "w-sidebar shadow-xl lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed && "lg:w-sidebar-collapsed"
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

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Desktop top bar: global search + notifications.
            The account/profile lives in the sidebar footer, so it is not
            repeated here. */}
        <header className="hidden h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6 lg:flex">
          <CommandPalette className="w-full max-w-md" />

          <div className="ms-auto flex items-center gap-2">
            <AttentionMenu />
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
            <CommandPalette variant="icon" />
            <AttentionMenu />
          </div>
        </header>

        <main
          className={cn(
            "flex-1 overflow-auto bg-background p-4 md:p-6",

          )}
        >
          <div className="mx-auto w-full max-w-[1440px]">
            {allowed ? children : <AccessDenied pathname={pathname} />}
          </div>
        </main>

        <SessionExpiredDialog />
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
