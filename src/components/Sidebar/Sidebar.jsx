"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollspyMenu } from "./ScrollspyMenu";
import SidebarMenu from "./SidebarMenu";
import SidebarRailMenu from "./SidebarRailMenu";
import SidebarHeader from "./SidebarHeader";
import SidebarFooter from "./SidebarFooter";
import ThemeToggle from "./ThemeToggle";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

// Layout notes:
// - The <aside> is a plain flex column and never scrolls itself; the MENU AREA
//   is the only scroll region (flex-1 + min-h-0 + overflow-y-auto). Keeping a
//   single scroll container avoids nested scrollbars and lets the account
//   footer + theme toggle stay pinned to the bottom.
// - min-h-0 is what actually allows a flex child to shrink and scroll.
export function Sidebar({ sideBarMenus, dashboardSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const collapsed = useSidebarCollapsed();

  useEffect(() => {
    setActive(pathname.replace(/^\//, ""));
  }, [pathname]);

  const handleClick = (target) => {
    const cleaned = target.replace(/^\//, "");
    setActive(cleaned);
    router.push(target.startsWith("/") ? target : `/${target}`);
  };

  const items = sideBarMenus
    .filter((item) => item.path)
    .map((item) => ({
      title: item.title,
      target: item.path,
      active: pathname.startsWith(item.path),
    }));

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-e border-border bg-card">
      {dashboardSidebar ? (
        <>
          <SidebarHeader />
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
            {collapsed ? <SidebarRailMenu /> : <SidebarMenu />}
          </div>
          <SidebarFooter />
          <ThemeToggle />
        </>
      ) : (
        <>
          <div className="shrink-0 border-b border-border p-5">
            <Link href="/" aria-label="Rangani Jewelry House home">
              <img
                src="/app/rj-house.svg"
                alt="Rangani Jewelry House"
                className="w-[150px] dark:brightness-0 dark:invert"
              />
            </Link>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 overscroll-contain">
            <ScrollspyMenu
              items={items}
              onClick={handleClick}
              activeItem={active}
            />
          </div>
        </>
      )}
    </aside>
  );
}
