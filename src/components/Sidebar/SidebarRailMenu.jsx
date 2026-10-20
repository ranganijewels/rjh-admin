"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

import { useSidebarMenu } from "./useSidebarMenu";

/**
 * The collapsed sidebar: a narrow rail of icons.
 *
 * Collapsing used to shrink the sidebar to nothing, which meant losing the
 * navigation entirely and having to click a floating button to get it back.
 * The rail keeps every destination one click away:
 *
 *   - a top-level entry that has children opens a flyout panel beside the
 *     rail listing them;
 *   - a top-level entry that is a page is a plain link.
 *
 * The label of every icon is exposed as a tooltip, so the rail is not a
 * guessing game.
 */
const RAIL_ITEM =
  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

const RAIL_ITEM_ACTIVE =
  "bg-success/10 text-success hover:bg-success/15 hover:text-success";

/**
 * The contents of a flyout.
 *
 * The menu is three levels deep in places ("Advanced (Enterprise)" →
 * "Catalog & Configurator" → "Catalog Masters"), so a group is rendered as a
 * sub-heading with its own pages under it rather than as a dead entry.
 */
function FlyoutItems({ items, matchPath, depth = 0 }) {
  return items.map((item) => {
    // A group: a sub-heading, and the pages under it.
    if (item.children) {
      return (
        <div key={item.path || item.title} className={depth > 0 ? "mt-1" : ""}>
          <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {item.title}
          </p>
          <FlyoutItems
            items={item.children}
            matchPath={matchPath}
            depth={depth + 1}
          />
        </div>
      );
    }

    const active = matchPath(item.path);
    const Icon = item.icon;

    return (
      <Link
        key={item.path || item.title}
        href={item.path || "#"}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
          active ? "bg-success/10 text-success" : "text-muted-foreground"
        )}
      >
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{item.title}</span>
      </Link>
    );
  });
}

export function SidebarRailMenu() {
  const { visibleMenu, matchPath, hasActiveChild } = useSidebarMenu();

  // The rail shows the top level only: a section that has children becomes
  // one flyout, not a wall of icons.
  const entries = visibleMenu.filter((item) => !item.heading);

  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-col items-center gap-1 px-2 py-3"
    >
      {entries.map((item) => {
        const Icon = item.icon;
        const active = item.children
          ? hasActiveChild(item)
          : matchPath(item.path);

        const icon = Icon ? (
          <Icon data-slot="accordion-menu-icon" className="size-[18px]" />
        ) : null;

        // A section: the icon opens a flyout with the pages inside it.
        if (item.children) {
          return (
            <Popover key={item.path || item.title}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={item.title}
                  className={cn(RAIL_ITEM, active && RAIL_ITEM_ACTIVE)}
                >
                  {icon}
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="start"
                sideOffset={8}
                className="w-60 p-1.5"
              >
                <p className="px-2.5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </p>
                <FlyoutItems items={item.children} matchPath={matchPath} />
              </PopoverContent>
            </Popover>
          );
        }

        // A plain destination.
        return (
          <Tooltip key={item.path || item.title}>
            <TooltipTrigger asChild>
              <Link
                href={item.path || "#"}
                aria-current={active ? "page" : undefined}
                aria-label={item.title}
                className={cn(RAIL_ITEM, active && RAIL_ITEM_ACTIVE)}
              >
                {icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.title}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export default SidebarRailMenu;
