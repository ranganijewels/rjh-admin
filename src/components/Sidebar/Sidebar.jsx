"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollspyMenu } from "./ScrollspyMenu";
import { cn } from "@/lib/utils";
import SidebarMenu from "./SidebarMenu";
import SidebarHeader from "./SidebarHeader";
import ThemeToggle from "./ThemeToggle";

// Layout notes (scroll bug fix):
// - The <aside> itself must NOT be the scroll container: the collapse chevron
//   in SidebarHeader hangs outside its edge (start-full), and an overflowing
//   aside clips it / spawns a phantom horizontal scrollbar.
// - Instead the aside is a plain flex column (header pinned, no overflow) and
//   the MENU AREA is its own scroll region: flex-1 + min-h-0 + overflow-y-auto.
//   min-h-0 is what actually allows a flex child to shrink and scroll.
export function Sidebar({ sideBarMenus, dashboardSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");

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
    <aside
      className={cn(
        "bg-background border-e border-border flex flex-col w-sidebar-mobile h-full min-h-0"
      )}
    >
      {dashboardSidebar ? (
        <>
          <SidebarHeader />
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pb-6">
            <div className="w-(--sidebar-default-width)">
              <SidebarMenu />
            </div>
          </div>
          <ThemeToggle />
        </>
      ) : (
        <>
          <div className="p-5 border-b border-muted-foreground shrink-0">
            <Link href="/">
              <img src="/app/rj-house.svg" alt="Logo" className="w-[160px]" />
            </Link>
          </div>
          <div className="p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
