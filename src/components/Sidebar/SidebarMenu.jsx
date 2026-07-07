"use client";
import React, { useCallback } from "react";

import { MENU_SIDEBAR } from "@/config/menu.config";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from "../common/ui/accordion-menu";
import { LogOutIcon } from "lucide-react";
import { logoutUser } from "@/store/authThunks";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const SidebarMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, expires_at } = useSelector((state) => state.auth);
  console.log("user", expires_at);
  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        toast.success("Logout Successfull");
        router.push("/login");
      })
      .catch((err) => {
        toast.error("Logout failed ", err);
      });
  };

  const matchPath = useCallback(
    (path) => {
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname]
  );

  const classNames = {
    root: "lg:ps-1 space-y-3",
    group: "gap-px",
    label: "uppercase text-xs font-medium text-muted-foreground/70 pt-2.5 pb-1",
    item: "h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium",
    subTrigger:
      "h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium",
    subContent: "py-0 transition-all duration-300 ease-in-out overflow-hidden",
  };

  const renderMenu = (items, level = 0) =>
    items.map((item) => {
      const key = item.path || `${item.title}-${level}`;

      if (item.heading) {
        return (
          <AccordionMenuLabel key={`heading-${key}`}>
            {item.heading}
          </AccordionMenuLabel>
        );
      }

      if (item.children) {
        return (
          <AccordionMenuSub key={key} value={item.path || key}>
            <AccordionMenuSubTrigger
              className={
                level === 0
                  ? "text-[15px] text-secondary-foreground font-semibold"
                  : "text-sm"
              }
            >
              {item.icon && <item.icon data-slot="accordion-menu-icon" />}
              <span data-slot="accordion-menu-title">{item.title}</span>
            </AccordionMenuSubTrigger>
            <AccordionMenuSubContent
              type="single"
              collapsible
              parentValue={item.path || key}
              className={cn(level === 0 ? "ps-6" : "ps-4")}
            >
              <AccordionMenuGroup>
                {renderMenu(item.children, level + 1)}
              </AccordionMenuGroup>
            </AccordionMenuSubContent>
          </AccordionMenuSub>
        );
      }

      return (
        <AccordionMenuItem
          key={key}
          value={item.path || ""}
          className={level === 0 ? "text-sm font-medium" : "text-sm"}
        >
          <Link href={item.path || "#"} className="flex items-center gap-2">
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </Link>
        </AccordionMenuItem>
      );
    });

  return (
    <>
      <div className="overflow-y-auto py-5 px-5 max-h-[calc(100vh-5.5rem)] custom-scrollbar">
        <AccordionMenu
          selectedValue={pathname}
          matchPath={matchPath}
          type="single"
          collapsible
          classNames={classNames}
        >
          {renderMenu(MENU_SIDEBAR)}
        </AccordionMenu>
      </div>

      <div className="p-5 w-full sticky bottom-0 mt-auto bg-white">
        <div className="flex items-center gap-3">
          <img
            className="size-10 rounded-full border-2 border-success shrink-0"
            src="/images/avatars/300-2.png"
            alt="User Avatar"
            width={40}
            height={40}
          />
          <div className="flex flex-col">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-sm">Admin Manager</span>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 mt-4 cursor-pointer hover:text-primary group"
          onClick={handleLogout}
        >
          <LogOutIcon className="h-5 w-5 group-hover:text-primary" />
          <span className="group-hover:text-primary">Logout</span>
        </button>
      </div>
    </>
  );
};

export default SidebarMenu;
