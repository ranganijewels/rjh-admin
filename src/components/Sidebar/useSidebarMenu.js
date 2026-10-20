"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

import { MENU_SIDEBAR } from "@/config/menu.config";
import { usePermissions } from "@/provider/permission-provider";

/**
 * The navigation the sidebar renders, filtered for the current role.
 *
 * Shared by the expanded sidebar and the collapsed icon rail so the two can
 * never drift apart — a page the role may not open must not appear in
 * either.
 */
export function useSidebarMenu() {
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
  const hasActiveChild = useCallback(
    (item) =>
      Boolean(item.path && matchPath(item.path)) ||
      Boolean(item.children?.some(hasActiveChild)),
    [matchPath]
  );

  return { visibleMenu, matchPath, hasActiveChild, pathname };
}

export default useSidebarMenu;
