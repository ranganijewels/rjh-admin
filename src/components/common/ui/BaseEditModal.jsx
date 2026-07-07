"use client";

import React from "react";
import { Button } from "@/components/common/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/common/ui/sheet";
import { Save, X } from "lucide-react";
import { Form } from "@/components/common/ui/form";
import { ScrollArea } from "./scroll-area";

const BaseEditModal = ({
  open,
  onOpenChange,
  children,
  title,
  form,
  onSubmit,
  loading,
  scrollContent,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[calc(100vw-2rem)] max-w-none sm:w-[90%] md:max-w-[70vw] lg:max-w-[50vw] xl:max-w-[30vw] inset-5 start-auto h-auto max-h-[calc(100dvh-4rem)] rounded-lg p-0 overflow-y-auto"
      >
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetBody className="px-3 md:px-5 py-0">
              <ScrollArea className="h-[calc(100dvh-11.75rem)] pe-3 -me-3">
                {scrollContent}
              </ScrollArea>
            </SheetBody>

            <SheetFooter className="mt-4 px-3 md:px-5 py-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-1" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default BaseEditModal;
