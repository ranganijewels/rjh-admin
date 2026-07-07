import { Button } from "@/components/common/ui/button";
import { Container } from "@/components/common/ui/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import React, { Fragment, useState } from "react";
import { Bell } from "lucide-react";
import TicketCreationSheet from "./InternalSupportTickets/TicketCreation";
import { NotificationCenterSheet } from "./InternalSupportTickets/NotificationCenter";

export const CommunicationAndSupportDetails = ({
  onNewTicketClick,
  onNewNotificationClick,
}) => {
  const [isNewTicketSheetOpen, setIsNewTicketSheetOpen] = useState(false);
  const [isNewNotificationSheetOpen, setIsNewNotificationSheetOpen] =
    useState(false);

  return (
    <>
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <div className="flex items-center gap-2.5">
                <ToolbarPageTitle text={"Internal Support Tickets"} />
              </div>
              <div className="flex items-center gap-2.5 mt-3">
                <ToolbarDescription className="font-semibold">
                  Manage communication and support across your business
                </ToolbarDescription>
              </div>
            </ToolbarHeading>
            <ToolbarActions>
              <Button
                onClick={() => setIsNewTicketSheetOpen(true)}
                variant="outline"
              >
                + New Ticket
              </Button>

              <Button
                onClick={() => setIsNewNotificationSheetOpen(true)}
                variant="outline"
              >
                <Bell />
              </Button>
            </ToolbarActions>
          </Toolbar>

          {/* )} */}
        </Container>
      </Fragment>

      <TicketCreationSheet
        isOpen={isNewTicketSheetOpen}
        onOpenChange={setIsNewTicketSheetOpen}
      />
      <NotificationCenterSheet
        isOpen={isNewNotificationSheetOpen}
        onOpenChange={setIsNewNotificationSheetOpen}
      />
    </>
  );
};

export default CommunicationAndSupportDetails;
