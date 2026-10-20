"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/common/ui/cards/card";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ScrollArea } from "@/components/common/ui/scroll-area";

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
  } = requestDetails;

  const renderItem = (item) => {
    return <CardLocation image={item.image} />;
  };
  const CardLocation = ({ image }) => {
    return (
      <div className="flex flex-col items-center rounded-lg overflow-hidden">
        <img
          src={image}
          alt="Ring"
          className="w-[142px] h-[137px] object-cover rounded-xl"
        />
      </div>
    );
  };

  const diamondSpecs = [
    { label: "Shape", info: shape },
    { label: "Carat", info: carat },
    { label: "Cut", info: cut },
    { label: "Color", info: color },
    { label: "Clarity", info: clarity },
  ];

  const metalSpecs = [{ label: "Metal", info: metal }];

  const otherDetails = [
    { label: "Category", info: category?.name },
    { label: "Ring Size", info: ring_size },
  ];

  const customerInfo = [
    { label: "Full Name", info: full_name },
    { label: "Email", info: email },
    { label: "Phone", info: phone },
    { label: "Preferred Contact", info: contact_method },
    { label: "City", info: city },
    { label: "Country", info: country },
    { label: "Notes", info: notes },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        handleClose={onClose}
        className="sm:w-none md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] inset-2 sm:inset-5 start-auto h-auto rounded-lg p-0"
      >
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle>Request Details</SheetTitle>
        </SheetHeader>

        <SheetBody className="px-3 md:px-5 py-0 relative top-10">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] pe-3 -me-3">
            <Card className="max-w-6xl mx-auto p-5 space-y-6">
              {/* Uploaded Images */}
              <div>
                <CardTitle className="mb-4">Uploaded Images</CardTitle>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {file.map((img, index) => (
                      <CardLocation key={index} image={img} />
                    ))}
                  </div>
                </CardContent>
              </div>

              {/* Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Diamond Specs */}
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-base font-medium mb-4">
                    Diamond Specification
                  </h3>
                  <div className="space-y-3">
                    {diamondSpecs.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium">{item.info}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metal Specs + Other Details */}
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-base font-medium mb-4">
                    Metal Specification
                  </h3>
                  <div className="space-y-3">
                    {metalSpecs.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium">{item.info}</span>
                      </div>
                    ))}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Other Details
                      </h4>
                      {otherDetails.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center mt-2"
                        >
                          <span className="text-sm text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="text-sm font-medium">
                            {item.info}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description / Notes */}
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-base font-medium mb-4">
                    Additional Description
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {description || "No description provided."}
                  </p>
                </div>

                {/* Customer Info */}
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-base font-medium mb-4">
                    Customer Contact Info
                  </h3>
                  <div className="space-y-3">
                    {customerInfo.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium">{item.info}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </ScrollArea>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default RequestDetailsSheet;
