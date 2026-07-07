"use client";

import { Card } from "@/components/common/ui/cards/card";
import { Avatar, AvatarFallback } from "@/components/common/ui/avatar";
import { Badge } from "@/components/common/ui/badge";
import Link from "next/link";

export default function MessageCard({
  ccUsers = [],
  name,
  role,
  timestamp,
  message,
  description,
  // attachments = [],
}) {
  return (
    <Card className="border shadow-primary-500/350">
      <div className="flex items-center justify-between grow gap-5 p-5 rtl:bg-[center_left_-8rem] bg-[center_right_-8rem] bg-no-repeat bg-[length:700px] upgrade-bg">
        <div className="flex items-center gap-4">
          {(ccUsers ?? []).map((cc) => (
            <div key={cc.id} className="flex items-center gap-2 text-sm">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{cc.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="#"
                className="text-base font-medium text-mono hover:text-primary-active"
              >
                {name}
              </Link>
              <Badge variant="destructive" appearance="outline">
                {role}
              </Badge>
              <div className="text-xs">{description}</div>
              <div className="text-xs">{timestamp}</div>
            </div>
            <div className="text-sm text-secondary-foreground">{message}</div>
            {/* <Card>
              <CardContent className="p-2.5">
                {attachments.length > 0 && (
                  <div className="flex items-center gap-2.5 mt-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-[50px] h-[50px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </Card>
  );
}
