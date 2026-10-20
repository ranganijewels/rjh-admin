"use client";

import { useEffect, useState } from "react";

import { useSettings } from "@/provider/settings-provider";

/**
 * Whether the sidebar is showing as the collapsed icon rail.
 *
 * The preference is stored as a setting, but the rail only makes sense on
 * the desktop layout: on a phone the sidebar is an off-canvas drawer, and a
 * drawer of unlabelled icons would be worse than the full menu.
 */
export function useSidebarCollapsed() {
  const { settings } = useSettings();
  const collapsed = !!settings?.layouts?.demo1?.sidebarCollapse;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return collapsed && isDesktop;
}

export default useSidebarCollapsed;
