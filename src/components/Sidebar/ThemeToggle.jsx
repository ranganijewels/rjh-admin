"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/common/ui/switch";
import { useSettings } from "@/provider/settings-provider";
import { useSidebarCollapsed } from "./useSidebarCollapsed";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

export default function ThemeToggle() {
  const { settings, storeOption } = useSettings();
  const isDark = settings?.theme?.mode === "dark";
  const collapsed = useSidebarCollapsed();

  // The rail has room for the icon, not for the label and the switch.
  if (collapsed) {
    return (
      <div className="flex shrink-0 justify-center border-t border-border px-2 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() =>
                storeOption("theme.mode", isDark ? "light" : "dark")
              }
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isDark ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {isDark ? "Switch to light mode" : "Switch to dark mode"}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        <span>{isDark ? "Dark mode" : "Light mode"}</span>
      </div>
      <Switch
        size="sm"
        checked={isDark}
        onCheckedChange={(checked) =>
          storeOption("theme.mode", checked ? "dark" : "light")
        }
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
