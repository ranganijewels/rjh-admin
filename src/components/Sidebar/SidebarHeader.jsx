import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { ChevronFirst } from "lucide-react";
import { useSettings } from "@/provider/settings-provider";

const SidebarHeader = () => {
  const { settings, storeOption } = useSettings();
  const collapsed = !!settings.layouts.demo1.sidebarCollapse;

  const handleToggleClick = () => {
    storeOption("layouts.demo1.sidebarCollapse", !collapsed);
  };

  return (
    <div className="sidebar-header relative flex h-[72px] shrink-0 items-center justify-center border-b border-border px-4">
      <Link
        href="/dashboard"
        className="flex items-center justify-center rounded-sm"
        aria-label="Rangani Jewelry House dashboard"
      >
        <img
          src="/app/rj-house.svg"
          className="default-logo w-[150px] dark:brightness-0 dark:invert"
          alt="Rangani Jewelry House"
        />
      </Link>
      <button
        type="button"
        onClick={handleToggleClick}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className={cn(
          "absolute end-2.5 top-1/2 hidden size-7 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground lg:flex",
          collapsed ? "rotate-180" : "rtl:rotate-180"
        )}
      >
        <ChevronFirst className="size-4" />
      </button>
    </div>
  );
};

export default SidebarHeader;
