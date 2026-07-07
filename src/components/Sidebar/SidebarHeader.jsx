import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { ChevronFirst } from "lucide-react";
import { useSettings } from "@/provider/settings-provider";
import { Button } from "../common/ui/button";

const SidebarHeader = () => {
  const { settings, storeOption } = useSettings();

  const handleToggleClick = () => {
    storeOption(
      "layouts.demo1.sidebarCollapse",
      !settings.layouts.demo1.sidebarCollapse
    );
  };

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-center px-3 lg:px-6 shrink-0 py-5">
      <Link href="/">
        <div> 
          <img
            src={"/app/rj-house.svg"}
            className="default-logo w-[160px]"
            alt="Default Logo"
          />
        </div>
      </Link>
      <Button
        onClick={handleToggleClick}
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(
          "size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4",
          settings.layouts.demo1.sidebarCollapse
            ? "ltr:rotate-180"
            : "rtl:rotate-180"
        )}
      >
        <ChevronFirst className="size-4" />
      </Button>
    </div>
  );
};

export default SidebarHeader;
