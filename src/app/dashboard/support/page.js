// // "use client";

// // import React, { useState } from "react";
// // import CommunicationandSupportDetais from "@/components/commonPages/Support";
// // import TicketDetailView from "@/components/commonPages/Support/InternalSupportTickets/TicketDetailView";
// // import TicketList from "@/components/commonPages/Support/InternalSupportTickets/TicketList";
// // import {
// //   dummyTickets,
// // } from "@/components/commonPages/Support/constant";
// // import TicketCreationSheet from "@/components/commonPages/Support/InternalSupportTickets/TicketCreation";

// // const Page = () => {
// //   const [selectedTicket, setSelectedTicket] = useState(null);
// //   const [tickets, setTickets] = useState([]);

// //   return (
// //     <>
// //       <CommunicationandSupportDetais />
// //       <div className="flex h-screen">
// //         <TicketList
// //           selectedTicket={selectedTicket}
// //           setSelectedTicket={setSelectedTicket}
// //           tickets={dummyTickets} // or your actual data
// //           isLoading={false}
// //           loadTickets={() => {}}
// //           error={null}
// //           searchQuery=""
// //           setSearchQuery={() => {}}
// //           departmentFilter=""
// //           setDepartmentFilter={() => {}}
// //           statusFilter=""
// //           setStatusFilter={() => {}}
// //           departments={["web-tech-support", "graphics-design-support"]}
// //           currentUserId="admin-1"
// //         />

// //         <TicketCreationSheet
// //           isOpen={isNewTicketSheetOpen}
// //           onOpenChange={setIsNewTicketSheetOpen}
// //           onCreate={handleTicketCreate} // ✅ Pass create handler
// //         />

// //         <TicketDetailView
// //           selectedTicket={selectedTicket}
// //           setIsAssignDialogOpen={() => {}}
// //           isAssignDialogOpen={false}
// //           isAssigning={false}
// //           assignTicket={() => {}}
// //           unassignTicket={() => {}}
// //           filteredAssignees={[]}
// //           assigneeSearchQuery=""
// //           setAssigneeSearchQuery={() => {}}
// //           updateTicketStatus={() => {}}
// //           getStatusColor={() => "default"}
// //           getPriorityColor={() => "bg-gray-500"}
// //           getAssigneeStatusColor={() => "text-gray-500"}
// //           newReply=""
// //           setNewReply={() => {}}
// //           replyFiles={[]}
// //           handleFileSelect={() => {}}
// //           removeFile={() => {}}
// //           replyFileInputRef={{ current: null }}
// //           addReply={() => {}}
// //           isReplying={false}
// //         />
// //       </div>
// //     </>
// //   );
// // };

// // export default Page;

// "use client";

// import React, { useState } from "react";
// import CommunicationandSupportDetais from "@/components/commonPages/Support";
// import TicketDetailView from "@/components/commonPages/Support/InternalSupportTickets/TicketDetailView";
// import TicketList from "@/components/commonPages/Support/InternalSupportTickets/TicketList";
// import TicketCreationSheet from "@/components/commonPages/Support/InternalSupportTickets/TicketCreation";
// import { dummyTickets } from "@/components/commonPages/Support/constant";
// import { NotificationCenterSheet } from "@/components/commonPages/Support/InternalSupportTickets/NotificationCenter";

// const Page = () => {
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [tickets, setTickets] = useState([...dummyTickets]);
//   const [isNewTicketSheetOpen, setIsNewTicketSheetOpen] = useState(false);
//   const [isNewNotificationSheetOpen, setIsNewNotificationSheetOpen] =
//     useState(false);

//   const handleTicketCreate = (newTicket) => {
//     setTickets((prev) => [newTicket, ...prev]);
//     setSelectedTicket(newTicket);
//   };

//   return (
//     <>
//       <CommunicationandSupportDetais
//         onNewTicketClick={() => setIsNewTicketSheetOpen(true)}
//         onNewNotificationClick={() => setIsNewNotificationSheetOpen(true)}
//       />

//       <div className="flex h-screen">
//         <TicketList
//           selectedTicket={selectedTicket}
//           setSelectedTicket={setSelectedTicket}
//           tickets={tickets}
//           isLoading={false}
//           loadTickets={() => {}}
//           error={null}
//           searchQuery=""
//           setSearchQuery={() => {}}
//           departmentFilter=""
//           setDepartmentFilter={() => {}}
//           statusFilter=""
//           setStatusFilter={() => {}}
//           departments={["web-tech-support", "graphics-design-support"]}
//           currentUserId="admin-1"
//         />

//         <TicketCreationSheet
//           isOpen={isNewTicketSheetOpen}
//           onOpenChange={setIsNewTicketSheetOpen}
//           onCreate={handleTicketCreate}
//         />

//         <NotificationCenterSheet
//           isOpen={isNewNotificationSheetOpen}
//           onOpenChange={setIsNewNotificationSheetOpen}
//         />

//         <TicketDetailView
//           selectedTicket={selectedTicket}
//           setIsAssignDialogOpen={() => {}}
//           isAssignDialogOpen={false}
//           isAssigning={false}
//           assignTicket={() => {}}
//           unassignTicket={() => {}}
//           filteredAssignees={[]}
//           assigneeSearchQuery=""
//           setAssigneeSearchQuery={() => {}}
//           updateTicketStatus={() => {}}
//           getStatusColor={() => "default"}
//           getPriorityColor={() => "bg-gray-500"}
//           getAssigneeStatusColor={() => "text-gray-500"}
//           newReply=""
//           setNewReply={() => {}}
//           replyFiles={[]}
//           handleFileSelect={() => {}}
//           removeFile={() => {}}
//           replyFileInputRef={{ current: null }}
//           addReply={() => {}}
//           isReplying={false}
//         />
//       </div>
//     </>
//   );
// };

// export default Page;

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
