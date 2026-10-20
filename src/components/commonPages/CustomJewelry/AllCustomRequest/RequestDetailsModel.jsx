"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ScrollArea } from "@/components/common/ui/scroll-area";
import { SafeImage } from "@/components/common/ui/safe-image";
import { StatusBadge } from "@/components/common/ui/badge";
import { SummaryGrid } from "@/components/common/ui/summary-grid";
import { formatDateShort } from "@/lib/utils";

export const RequestDetailsSheet = ({ open, onClose, requestDetails }) => {
  if (!requestDetails) return null;

  const {
    file = [],
    shape,
    carat,
    cut,
    color,
    clarity,
    metal,
    ring_size,
    category,
    description,
    full_name,
    email,
    contact_method,
    phone,
    city,
    country,
    notes,
    id,
    store_name,
    status,
    created_at,
  } = requestDetails;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        handleClose={onClose}
        className="w-full sm:w-none md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] inset-2 sm:inset-5 start-auto h-auto rounded-lg p-0"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <SheetTitle className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-base font-semibold text-foreground">
                  {id || "Request"}
                </span>
                <StatusBadge status={status || "Pending"} />
              </SheetTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {store_name ? `${store_name} · ` : ""}Submitted{" "}
                {formatDateShort(created_at)}
              </p>
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="px-0 py-0">
          <ScrollArea className="h-[calc(100dvh-9.5rem)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-5">
              {/* Uploaded Images */}
              {file.length > 0 && (
                <Card>
                  <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                    <span className="text-sm font-semibold text-foreground">
                      Uploaded images
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {file.length}
                    </span>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {file.map((image, index) => (
                        <div
                          key={index}
                          className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted"
                        >
                          <SafeImage
                            src={image}
                            alt={`Reference ${index + 1}`}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What they asked for */}
              <Card>
                <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                  <span className="text-sm font-semibold text-foreground">
                    Specification
                  </span>
                </CardHeader>
                <CardContent className="p-5">
                  <SummaryGrid
                    columns={4}
                    items={[
                      ["Category", category?.name],
                      ["Metal", metal],
                      ["Ring size", ring_size],
                      ["Shape", shape],
                      ["Carat", carat],
                      ["Cut", cut],
                      ["Colour", color],
                      ["Clarity", clarity],
                    ]}
                  />
                </CardContent>
              </Card>

              {/* Who they are */}
              <Card>
                <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                  <span className="text-sm font-semibold text-foreground">
                    Customer
                  </span>
                </CardHeader>
                <CardContent className="p-5">
                  <SummaryGrid
                    columns={3}
                    items={[
                      ["Name", full_name],
                      ["Email", email],
                      ["Phone", phone],
                      ["Preferred contact", contact_method],
                      ["City", city],
                      ["Country", country],
                    ]}
                  />
                </CardContent>
              </Card>

              {/* What they said */}
              {(description || notes) && (
                <Card>
                  <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                    <span className="text-sm font-semibold text-foreground">
                      Notes
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5">
                    {description && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Description
                        </p>
                        <p className="mt-1.5 text-sm text-foreground">
                          {description}
                        </p>
                      </div>
                    )}
                    {notes && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Customer notes
                        </p>
                        <p className="mt-1.5 text-sm text-foreground">{notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default RequestDetailsSheet;
