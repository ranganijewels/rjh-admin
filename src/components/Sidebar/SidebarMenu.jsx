"use client";
import React, { useCallback, useMemo } from "react";

import { MENU_SIDEBAR } from "@/config/menu.config";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/provider/permission-provider";
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from "../common/ui/accordion-menu";

const SidebarMenu = () => {
  const pathname = usePathname();
  const { can } = usePermissions();

  const filterMenu = useCallback(
    (items, inheritedModule) =>
      items.flatMap((item) => {
        const moduleKey = item.module || inheritedModule;

        // Hide the branch when the role cannot view its module.
        if (moduleKey && !can(moduleKey, "view")) return [];

        const children = item.children
          ? filterMenu(item.children, moduleKey)
          : undefined;

        // A parent with no visible children is noise — hide it too.
        if (item.children && children.length === 0) return [];

        return [{ ...item, ...(children ? { children } : {}) }];
      }),
    [can]
  );

  const visibleMenu = useMemo(() => {
    const filtered = filterMenu(MENU_SIDEBAR);
    // Drop orphan headings left behind when role filtering removes the items
    // that sat beneath them, and collapse consecutive headings.
    return filtered.reduce((acc, item) => {
      if (item.heading) {
        if (acc.length && acc[acc.length - 1]?.heading) return acc;
        acc.push(item);
        return acc;
      }
      acc.push(item);
      return acc;
    }, []).filter((item, index, all) => {
      if (!item.heading) return true;
      // Keep a heading only when a real item follows before the next heading.
      for (let next = index + 1; next < all.length; next += 1) {
        if (all[next].heading) return false;
        return true;
      }
      return false;
    });
  }, [filterMenu]);

  const matchPath = useCallback(
    (path) => {
      if (!path) return false;
      // `/dashboard` is both a page and the prefix of every admin route, so it
      // must only match the dashboard routes — otherwise the Dashboard item
      // would look active on every single page.
      if (path === "/dashboard") {
        return (
          pathname === path ||
          pathname === "/dashboard/overview" ||
          pathname === "/dashboard/dashboard"
        );
      }
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname]
  );

  // A parent should look active whenever one of its descendants is the
  // current page. Used for the trigger's data-active styling.
  const hasActiveChild = (item) =>
    Boolean(item.path && matchPath(item.path)) ||
    Boolean(item.children?.some(hasActiveChild));

  const classNames = {
    root: "space-y-1",
    group: "space-y-0.5",
    label:
      "uppercase text-[11px] font-semibold tracking-wider text-muted-foreground/70 pt-4 pb-1.5 first:pt-0",
    item: [
      "h-10 rounded-lg px-3 gap-2.5 text-sm font-medium text-muted-foreground",
      "[&_svg]:opacity-100 [&_svg]:size-[18px]",
      "hover:bg-muted/70 hover:text-foreground",
      "data-[selected=true]:bg-emerald-50 data-[selected=true]:text-emerald-700 data-[selected=true]:font-semibold",
      "dark:data-[selected=true]:bg-emerald-950/40 dark:data-[selected=true]:text-emerald-400",
    ].join(" "),
    subTrigger: [
      "h-10 rounded-lg px-3 gap-2.5 text-sm font-medium text-muted-foreground",
      "[&_svg]:opacity-100 [&_svg]:size-[18px]",
      "hover:bg-muted/70 hover:text-foreground",
      "data-[state=open]:text-foreground",
      "data-[active=true]:text-emerald-700 data-[active=true]:font-semibold",
      "dark:data-[active=true]:text-emerald-400",
      "data-[active=true]:hover:bg-emerald-50 dark:data-[active=true]:hover:bg-emerald-950/30",
    ].join(" "),
    subContent: "overflow-hidden transition-all duration-300 ease-in-out",
  };

  const renderMenu = (items, level = 0) =>
    items.map((item, index) => {
      const key = item.path || `${item.title}-${level}`;

      if (item.heading) {
        // Headings carry neither a path nor a title, so the key above would
        // be "undefined-0" for every heading — React then sees duplicate
        // keys. Key off the heading text plus its position instead.
        return (
          <AccordionMenuLabel key={`heading-${item.heading}-${level}-${index}`}>
            {item.heading}
          </AccordionMenuLabel>
        );
      }

      if (item.children) {
        const active = hasActiveChild(item);

        return (
          <AccordionMenuSub key={key} value={item.path || key}>
            <AccordionMenuSubTrigger
              data-active={active ? "true" : undefined}
              className={cn(level > 0 && "h-9")}
            >
              {item.icon && <item.icon data-slot="accordion-menu-icon" />}
              <span data-slot="accordion-menu-title">{item.title}</span>
            </AccordionMenuSubTrigger>
            <AccordionMenuSubContent
              type="single"
              collapsible
              parentValue={item.path || key}
              className={cn(
                level === 0 ? "ps-7" : "ps-4",
                "pt-0.5 pb-1"
              )}
            >
              <AccordionMenuGroup>
                {renderMenu(item.children, level + 1)}
              </AccordionMenuGroup>
            </AccordionMenuSubContent>
          </AccordionMenuSub>
        );
      }

      const active = matchPath(item.path);

      return (
        <AccordionMenuItem
          key={key}
          value={item.path || ""}
          className={cn(
            level === 0 && "h-10 text-muted-foreground",
            level > 0 && "h-9 ps-3 text-sm"
          )}
        >
          <Link
            href={item.path || "#"}
            aria-current={active ? "page" : undefined}
            className="flex min-w-0 items-center gap-2.5"
          >
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title" className="truncate">
              {item.title}
            </span>
          </Link>
        </AccordionMenuItem>
      );
    });

  return (
    <nav aria-label="Main navigation" className="px-3 py-3">
      <AccordionMenu
        selectedValue={pathname}
        matchPath={matchPath}
        type="single"
        collapsible
        classNames={classNames}
      >
        {renderMenu(visibleMenu)}
      </AccordionMenu>
    </nav>
  );
};

export default SidebarMenu;
