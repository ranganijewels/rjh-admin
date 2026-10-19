"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/common/ui/switch";
import { useSettings } from "@/provider/settings-provider";

export default function ThemeToggle() {
  const { settings, storeOption } = useSettings();
  const isDark = settings?.theme?.mode === "dark";

  return (
    <div className="flex items-center justify-between gap-2 px-3 lg:px-6 py-4 border-t border-border shrink-0">
      <div className="flex items-center gap-2 text-2sm text-muted-foreground">
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        <span>{isDark ? "Dark mode" : "Light mode"}</span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) =>
          storeOption("theme.mode", checked ? "dark" : "light")
        }
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
