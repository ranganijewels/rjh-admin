"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ScrollspyMenu } from "./ScrollspyMenu";
import { cn } from "@/lib/utils";
import SidebarMenu from "./SidebarMenu";
import SidebarHeader from "./SidebarHeader";

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
        "bg-background border-e border-border flex flex-col w-sidebar-mobile h-full overflow-y-auto"
      )}
    >
      {dashboardSidebar ? (
        <>
          <SidebarHeader />
          <div className="overflow-hidden">
            <div className="w-(--sidebar-default-width)">
              <SidebarMenu />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-5 border-b border-muted-foreground">
            <Link href="/">
              <img src="/app/rj-house.svg" alt="Logo" className="w-[160px]" />
            </Link>
          </div>
          <div className="p-6 overflow-hidden">
            {
              <ScrollspyMenu
                items={items}
                onClick={handleClick}
                activeItem={active}
              />
            }
          </div>
        </>
      )}
    </aside>
  );
}
