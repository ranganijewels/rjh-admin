"use client";
import React from "react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebarMenu } from "./useSidebarMenu";
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
  // The menu, the permission filtering and the active-path matching are
  // shared with the collapsed icon rail, so the two can never disagree.
  const { visibleMenu, matchPath, hasActiveChild, pathname } = useSidebarMenu();

  const classNames = {
    root: "space-y-1",
    group: "space-y-0.5",
    label:
      "uppercase text-[11px] font-semibold tracking-wider text-muted-foreground/70 pt-4 pb-1.5 first:pt-0",
    item: [
      "h-10 rounded-lg px-3 gap-2.5 text-sm font-medium text-muted-foreground",
      "[&_svg]:opacity-100 [&_svg]:size-[18px]",
      "hover:bg-muted/70 hover:text-foreground",
      "data-[selected=true]:bg-success/10 data-[selected=true]:text-success data-[selected=true]:font-semibold",
      "dark:data-[selected=true]:bg-success/15 dark:data-[selected=true]:text-success",
    ].join(" "),
    subTrigger: [
      "h-10 rounded-lg px-3 gap-2.5 text-sm font-medium text-muted-foreground",
      "[&_svg]:opacity-100 [&_svg]:size-[18px]",
      "hover:bg-muted/70 hover:text-foreground",
      "data-[state=open]:text-foreground",
      "data-[active=true]:text-success data-[active=true]:font-semibold",
      "dark:data-[active=true]:text-success",
      "data-[active=true]:hover:bg-success/10 dark:data-[active=true]:hover:bg-success/15",
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
