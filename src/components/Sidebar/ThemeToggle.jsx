"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/common/ui/switch";
import { useSettings } from "@/provider/settings-provider";

export default function ThemeToggle() {
  const { settings, storeOption } = useSettings();
  const isDark = settings?.theme?.mode === "dark";

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
