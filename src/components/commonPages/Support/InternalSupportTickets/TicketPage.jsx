"use client";

import React, { useState } from "react";
import TicketList from "./TicketList";
import TicketDetailsView from "./TicketDetailsView";

export default function TicketPage() {
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div className="flex h-[calc(100vh-100px)]">
      <TicketList
        selectedTicket={selectedTicket}
        setSelectedTicket={setSelectedTicket}
      />
      <TicketDetailsView selectedTicket={selectedTicket} />
    </div>
  );
}
