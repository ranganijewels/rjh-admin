"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { logoutUser } from "@/store/authThunks";
import { usePermissions } from "@/provider/permission-provider";
import { useSidebarCollapsed } from "./useSidebarCollapsed";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

const roleLabel = (role) => {
  if (!role) return "Admin Manager";
  const raw =
    typeof role === "string"
      ? role
      : role.name || role.slug || role.key || role.id || "";
  return String(raw)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function SidebarFooter() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { roleMeta } = usePermissions();
  const collapsed = useSidebarCollapsed();

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        toast.success("Logged out successfully");
        router.push("/login");
      })
      .catch((err) => {
        toast.error(err?.message || "Logout failed");
      });
  };

  const role = roleMeta?.name || roleLabel(user?.role);

  // In the collapsed rail there is no room for the name and the role, so
  // they move into the avatar's tooltip.
  if (collapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center gap-2 border-t border-border px-3 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex rounded-full">
              <img
                className="size-9 rounded-full border border-border object-cover ring-2 ring-success/40"
                src="/images/avatars/300-2.png"
                alt=""
                width={36}
                height={36}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {user?.name || "Admin"} · {role}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Log out
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-border px-3 py-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <img
          className="size-9 shrink-0 rounded-full border border-border object-cover ring-2 ring-success/40"
          src="/images/avatars/300-2.png"
          alt=""
          width={36}
          height={36}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.name || "Admin"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {role}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}
