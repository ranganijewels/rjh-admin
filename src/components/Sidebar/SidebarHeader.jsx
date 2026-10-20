import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { ChevronFirst } from "lucide-react";
import { useSettings } from "@/provider/settings-provider";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

const SidebarHeader = () => {
  const { settings, storeOption } = useSettings();
  const collapsed = useSidebarCollapsed();

  const handleToggleClick = () => {
    storeOption("layouts.demo1.sidebarCollapse", !collapsed);
  };

  return (
    <div
      className={cn(
        "sidebar-header relative flex shrink-0 items-center justify-center border-b border-border px-4",
        collapsed ? "h-[92px] flex-col gap-2 pb-2 pt-3" : "h-[72px]"
      )}
    >
      <Link
        href="/dashboard"
        className="flex items-center justify-center rounded-sm"
        aria-label="Rangani Jewelry House dashboard"
      >
        {collapsed ? (
          // The wordmark does not fit a 68px rail, so the rail shows the
          // house monogram instead.
          <span
            className="flex size-9 items-center justify-center rounded-lg bg-brand-navy text-sm font-semibold tracking-tight text-white"
            aria-hidden="true"
          >
            RJ
          </span>
        ) : (
          <img
            src="/app/rj-house.svg"
            className="default-logo w-[150px] dark:brightness-0 dark:invert"
            alt="Rangani Jewelry House"
          />
        )}
      </Link>
      <button
        type="button"
        onClick={handleToggleClick}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className={cn(
          "hidden size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground lg:flex",
          // In the rail the toggle sits under the monogram — beside it, it
          // would cover the mark.
          collapsed
            ? "absolute bottom-2 left-1/2 -translate-x-1/2"
            : "absolute end-2.5 top-1/2 -translate-y-1/2",
          collapsed ? "rotate-180" : "rtl:rotate-180"
        )}
      >
        <ChevronFirst className="size-4" />
      </button>
    </div>
  );
};

export default SidebarHeader;
