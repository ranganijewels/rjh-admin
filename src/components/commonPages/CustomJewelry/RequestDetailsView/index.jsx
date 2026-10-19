"use client";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Container } from "@/components/common/ui/container";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import React, { Fragment, useState } from "react";

const RequestDetailsView = () => {
  const [confirmAction, setConfirmAction] = useState(null);

  const handleForwardToProduction = () => {
    // TODO: wire up actual forward-to-production API call
    setConfirmAction(null);
  };

  const handleConvertToProduct = () => {
    // TODO: wire up actual convert-to-product API call
    setConfirmAction(null);
  };

  const statistics = [
    {
      total: "Trial",
      description: "Status",
    },
    {
      total: "10,000",
      description: "Query runs",
    },
    {
      total: "Unlimited",
      description: "API calls",
    },
    {
      total: "$99.00",
      description: "Price",
    },
    {
      total: "17 Aug, 2024",
      description: "Next bill date",
    },
  ];

  const renderItem = (statistic, index) => {
    return (
      <div
        key={index}
        className="flex flex-col gap-1.5 px-3 py-2 border border-dashed border-input rounded-md"
      >
        <span className="text-mono text-sm leading-none font-medium">
          {statistic.total}
        </span>
        <span className="text-secondary-foreground text-xs">
          {statistic.description}
        </span>
      </div>
    );
  };
  return (
    <Fragment>
      {/* <PageNavbar /> */}
      {/* {settings?.layout === "demo1" && ( */}
      <Container className="px-0 lg:px-0">
        <Toolbar>
          <ToolbarHeading>
            <div className="flex items-center gap-2.5">
              <ToolbarPageTitle text={"Custom Request Details"} />
              <Badge size="md" variant="info" appearance="light">
                Requested
              </Badge>
            </div>
            <div className="flex items-center gap-2.5 mt-3">
              <ToolbarDescription className="font-semibold">
                #CJ-20250604-0001
              </ToolbarDescription>
              <ToolbarDescription>Noira</ToolbarDescription>
              <ToolbarDescription>28 Jul, 20 25 10:02</ToolbarDescription>
            </div>
          </ToolbarHeading>
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => setConfirmAction("forward")}
            >
              Forward to Production
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmAction("convert")}
            >
              Convert to Product
            </Button>
            <Button asChild>
              <Link href="/messages">Message</Link>
            </Button>
            <Button aria-label="More actions">
              <MoreVertical size={20} />
            </Button>
          </ToolbarActions>
        </Toolbar>

        {/* )} */}
      </Container>

      <ConfirmDialog
        open={confirmAction === "forward"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleForwardToProduction}
        title="Forward to Production"
        message="Are you sure? This action cannot be undone."
      />
      <ConfirmDialog
        open={confirmAction === "convert"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConvertToProduct}
        title="Convert to Product"
        message="Are you sure? This action cannot be undone."
      />
    </Fragment>
  );
};

export default RequestDetailsView;
