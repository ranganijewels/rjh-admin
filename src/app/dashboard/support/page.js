"use client";

import React, { useState } from "react";
import CommunicationAndSupportDetails from "@/components/commonPages/Support";
import TicketDetailView from "@/components/commonPages/Support/InternalSupportTickets/TicketDetailView";
import TicketList from "@/components/commonPages/Support/InternalSupportTickets/TicketList";
import TicketCreationSheet from "@/components/commonPages/Support/InternalSupportTickets/TicketCreation";
import { NotificationCenterSheet } from "@/components/commonPages/Support/InternalSupportTickets/NotificationCenter";

export default function Page() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isNewTicketSheetOpen, setIsNewTicketSheetOpen] = useState(false);
  const [isNewNotificationSheetOpen, setIsNewNotificationSheetOpen] =
    useState(false);

  return (
    <>
      <CommunicationAndSupportDetails
        onNewTicketClick={() => setIsNewTicketSheetOpen(true)}
        onNewNotificationClick={() => setIsNewNotificationSheetOpen(true)}
      />

      <div className="flex h-screen">
        <TicketList
          selectedTicket={selectedTicket}
          setSelectedTicket={setSelectedTicket}
        />

        <TicketDetailView selectedTicket={selectedTicket} />

        <TicketCreationSheet
          isOpen={isNewTicketSheetOpen}
          onOpenChange={setIsNewTicketSheetOpen}
        />

        <NotificationCenterSheet
          isOpen={isNewNotificationSheetOpen}
          onOpenChange={setIsNewNotificationSheetOpen}
        />
      </div>
    </>
  );
}
