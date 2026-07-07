"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  MessageCircleMore,
  Search,
  SquareChevronRight,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Container } from "../ui/container";

import { Button } from "../ui/button";
import SidebarMenu from "../Sidebar/SidebarMenu";
import { cn } from "@/lib/utils";
import { NotificationsSheet } from "../Topbar/notifications-sheet";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import { ChatSheet } from "../Topbar/chat-sheet";
import { UserDropdownMenu } from "../Topbar/user-dropdown-menu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Input } from "../ui/input";

export function Header() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const [isMegaMenuSheetOpen, setIsMegaMenuSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState();

  const pathname = usePathname();
  const mobileMode = useIsMobile();

  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;
  return (
    <header
      className={cn(
        "header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)]",
        headerSticky && "border-b border-border"
      )}
    >
      <Container className="flex justify-between items-stretch lg:gap-4">
        {/* HeaderLogo */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 w-40"
            />

            {searchQuery?.length > 0 && (
              <Button
                mode="icon"
                variant="ghost"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-1 lg:hidden items-center">
          <Link href="/" className="shrink-0">
            <img
              src={"/media/app/mini-logo.svg"}
              className="h-[25px] w-full"
              alt="mini-logo"
            />
          </Link>

          <div className="flex items-center">
            {mobileMode && (
              <Sheet
                open={isSidebarSheetOpen}
                onOpenChange={setIsSidebarSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" mode="icon">
                    <Menu className="text-muted-foreground hover:text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="p-0 gap-0 w-[275px]"
                  side="left"
                  close={false}
                >
                  <SheetHeader className="p-0 space-y-0" />
                  <SheetBody className="p-0 overflow-y-auto">
                    <SidebarMenu />
                  </SheetBody>
                </SheetContent>
              </Sheet>
            )}
            {mobileMode && (
              <Sheet
                open={isMegaMenuSheetOpen}
                onOpenChange={setIsMegaMenuSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" mode="icon">
                    <SquareChevronRight className="text-muted-foreground hover:text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="p-0 gap-0 w-[275px]"
                  side="left"
                  close={false}
                >
                  <SheetHeader className="p-0 space-y-0" />
                  <SheetBody className="p-0 overflow-y-auto">
                    {/* <MegaMenuMobile /> */}
                  </SheetBody>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* HeaderTopbar */}
        <div className="flex items-center gap-3">
          {pathname.startsWith("/store-client") ? (
            <></>
          ) : (
            <>
              <NotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <Bell className="size-4.5!" />
                  </Button>
                }
              />

              <ChatSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <MessageCircleMore className="size-4.5!" />
                  </Button>
                }
              />

              <UserDropdownMenu
                trigger={
                  <img
                    className="size-9 rounded-full border-2 border-success shrink-0 cursor-pointer"
                    src={"/images/avatars/300-2.png"}
                    alt="User Avatar"
                  />
                }
              />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
