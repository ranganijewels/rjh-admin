"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCheck,
  MoreVertical,
  Settings2,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/common/avatar-group";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from "@/components/common/ui/avatar";
import { Button } from "@/components/common/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/common/ui/dropdown-menu";
import { Input } from "@/components/common/ui/input";
import { CardContent, CardTitle } from "@/components/common/ui/cards/card";

// Converts a small allowed subset (line breaks) to plain text and strips any
// other HTML tags so message content can be rendered safely without
// dangerouslySetInnerHTML.
function toSafeMessageText(text) {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "");
}

export function Communication() {
  const [emailInput, setEmailInput] = useState("");

  const messages = [
    {
      avatar: "/media/avatars/300-5.png",
      time: "14:04",
      text: "Hello! <br> Next week we are closing the project. Do You have questions?",
      in: true,
    },
    {
      avatar: "/media/avatars/300-2.png",
      text: "This is excellent news!",
      time: "14:08",
      read: true,
      out: true,
    },
    {
      avatar: "/media/avatars/300-4.png",
      time: "14:26",
      text: "I have checked the features, can not wait to demo them!",
      in: true,
    },
    {
      avatar: "/media/avatars/300-1.png",
      time: "15:09",
      text: "I have looked over the rollout plan, and everything seems spot on. I am ready on my end and can not wait for the user feedback.",
      in: true,
    },
    {
      avatar: "/media/avatars/300-2.png",
      text: "Haven't seen the build yet, I'll look now.",
      time: "15:52",
      read: false,
      out: true,
    },
    {
      avatar: "/media/avatars/300-2.png",
      text: "Checking the build now",
      time: "15:52",
      read: false,
      out: true,
    },
    {
      avatar: "/media/avatars/300-4.png",
      time: "17:40",
      text: "Tomorrow, I will send the link for the meeting",
      in: true,
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-md border border-border w-full flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="max-w-4xl">
          <CardContent className="lg:py-7.5">
            <CardTitle className="mb-5">Communication</CardTitle>
          </CardContent>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" mode="icon" size="sm">
              <MoreVertical className="size-4!" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44" side="bottom" align="end">
            <DropdownMenuItem asChild>
              <Link href="/account/members/teams">
                <Users /> Invite Users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings2 />
                <span>Team Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href="/account/members/import-members">
                      <Shield />
                      Find Members
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/members/import-members">
                      <Calendar /> Meetings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/members/import-members">
                      <Shield /> Group Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link href="/account/security/privacy-settings">
                <Shield /> Group Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Typing/avatars row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-accent/50">
        <AvatarGroup
          size="size-8"
          group={[
            { path: "/media/avatars/300-4.png" },
            { path: "/media/avatars/300-1.png" },
            { path: "/media/avatars/300-2.png" },
            {
              fallback: "+10",
              variant: "bg-success text-white",
            },
          ]}
        />
        <span className="text-xs italic text-muted-foreground block ml-2">
          Jessy is typing...
        </span>
      </div>
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-0 py-3 space-y-3.5 bg-card"
        aria-live="polite"
      >
        {messages.map((message, index) =>
          message.out ? (
            <div key={index} className="flex items-end justify-end gap-3 px-5">
              <div className="flex flex-col gap-1">
                <div className="bg-primary text-primary-foreground text-sm font-medium p-3 rounded-lg shadow-xs whitespace-pre-line">
                  {toSafeMessageText(message.text)}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-xs text-secondary-foreground">
                    {message.time}
                  </span>
                  <CheckCheck
                    className={cn(
                      "w-4 h-4",
                      message.read ? "text-success" : "text-muted-foreground"
                    )}
                  />
                </div>
              </div>
              <div className="relative">
                <Avatar className="size-9">
                  <AvatarImage
                    src={"/media/avatars//300-2.png"}
                    alt="Your avatar"
                  />
                  <AvatarFallback>CH</AvatarFallback>
                  <AvatarIndicator className="-end-2 -bottom-2">
                    <AvatarStatus variant="online" className="size-2.5" />
                  </AvatarIndicator>
                </Avatar>
              </div>
            </div>
          ) : message.in ? (
            <div key={index} className="flex items-end gap-3 px-5">
              <Avatar className="size-9">
                <AvatarImage src={message.avatar} alt="Sender avatar" />
                <AvatarFallback>CH</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="bg-accent/50 text-foreground text-sm font-medium p-3 rounded-lg shadow-xs whitespace-pre-line">
                  {toSafeMessageText(message.text)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {message.time}
                </span>
              </div>
            </div>
          ) : null
        )}
      </div>
      {/* Input row */}
      <div className="p-5 flex items-center gap-2 relative border-t border-border">
        <img
          src={"/media/avatars/300-2.png"}
          className="w-8 h-8 rounded-full absolute left-7 top-1/2 -translate-y-1/2"
          alt="Your avatar"
          width={32}
          height={32}
        />
        <Input
          type="text"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Write a message..."
          className="w-full ps-12 pe-24 py-4 h-auto"
        />
        <div className="absolute end-7 top-1/2 -translate-y-1/2 flex gap-2">
          <Button size="sm" variant="ghost" mode="icon">
            <Upload className="size-4!" />
          </Button>
          <Button size="sm" variant="mono">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Communication;
