"use client";

import { Badge } from "@/components/common/ui/badge";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/ui/select";
import {
  Mail,
  Clock,
  Paperclip,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Card } from "@/components/common/ui/cards/card";
import { useState, useMemo, useEffect } from "react";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";

export default function TicketList({
  tickets,
  selectedTicket,
  setSelectedTicket = () => {},
  isLoading,
  loadTickets,

  currentUserId,
}) {
  const { list, loading, error, fetchData, pagination, fetchById } =
    useCrudListWithPagination("/api/internal-tickets");

  const [allTicketsData, setAllTicketsData] = useState([]);
  useEffect(() => {
    setAllTicketsData(list?.data);
  }, [list]);

  const handleLoadMore = async () => {
    const nextPage = pagination.currentPage + 1;
    if (nextPage > pagination.totalPages) return;

    try {
      const res = await fetch(
        `/api/internal-tickets?page=${nextPage}&limit=${pagination.per_page}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!res.ok) throw new Error("Failed to load more data");
      const data = await res.json();

      const newTickets = data.data || [];
      setAllTicketsData((prev) => [...prev, ...newTickets]);

      // optional: you can update pagination locally too
      pagination.currentPage = data.current_page;
    } catch (err) {
      console.error("Load more failed:", err);
    }
  };
  const allTickets = [...(tickets || [])];

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const unassignedCount = allTickets.filter(
    (t) => !t.assignedTo && t.status !== "closed"
  ).length;

  const myTicketsCount = allTickets.filter(
    (t) => t.assignedTo?.id === currentUserId && t.status !== "closed"
  ).length;

  // Semantic priority tokens (see src/css/config.reui.css) instead of
  // hardcoded Tailwind color utilities. (design-audit fix)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "var(--priority-urgent)";
      case "high":
        return "var(--priority-high)";
      case "medium":
        return "var(--priority-medium)";
      case "low":
        return "var(--priority-low)";
      default:
        return "var(--priority-default)";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "primary";
      case "in-progress":
        return "default";
      case "resolved":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  const handleSelectTicket = async (ticket) => {
    try {
      // Optional: show loading state or placeholder
      setSelectedTicket({ loading: true, id: ticket.id });

      // Fetch full details
      const response = await fetchById(ticket.id);
      const ticketData = response?.data || response; // adjust depending on your API structure

      // ✅ Set selected ticket with full detail
      setSelectedTicket(ticketData);
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
    }
  };

  return (
    <div className="w-full md:w-1/2 border-r border-border flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b border-border space-y-3 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-mono">Support Tickets</h2>
          <Button
            size="sm"
            onClick={loadTickets}
            disabled={isLoading}
            className="bg-primary"
          >
            <RefreshCw />
          </Button>
        </div>

        {error && (
          <div className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Filter badges */}
        <div className="flex gap-2">
          <Badge
            variant={unassignedCount > 0 ? "destructive" : "outline"}
            className="cursor-pointer"
            onClick={() => setDepartmentFilter("unassigned")}
          >
            {unassignedCount} Unassigned
          </Badge>
          <Badge
            variant={myTicketsCount > 0 ? "default" : "outline"}
            className="cursor-pointer bg-primary text-white hover:bg-primary/90"
            onClick={() => setDepartmentFilter("mine")}
          >
            {myTicketsCount} My Tickets
          </Badge>
          <Badge variant="outline">{allTickets.length} Total</Badge>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="web-tech-support">Web Tech Support</SelectItem>
              <SelectItem value="graphics-design-support">
                Graphics Design Support
              </SelectItem>
              <SelectItem value="social-media-marketing-support">
                Social Media & Marketing
              </SelectItem>
              <SelectItem value="order-related-support">
                Order Related
              </SelectItem>
              <SelectItem value="account-support">Account Support</SelectItem>
              {/* {(departments || []).map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ticket List */}
      <Card className="flex-1 overflow-y-auto m-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Loading...
          </div>
        ) : allTicketsData?.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tickets found</p>
              <p className="text-sm">Try adjusting filters</p>
            </div>
          </div>
        ) : (
          allTicketsData?.map((ticket) => {
            return (
              <div
                key={`${ticket.id}-${ticket.createdAt}`}
                onClick={() => handleSelectTicket(ticket)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectTicket(ticket);
                  }
                }}
                className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedTicket?.id === ticket.id
                    ? "bg-accent border-l-4 border-l-primary"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                      aria-label={`Priority: ${ticket.priority || "none"}`}
                      title={`Priority: ${ticket.priority || "none"}`}
                    />
                    <span className="font-medium">{ticket?.ticket_number}</span>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    {!ticket.assignedUser?.name && (
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        ticket.assignedUser?.name
                      </Badge>
                    )}
                    {ticket.status === "open" && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-Assigned
                      </Badge>
                    )}
                    {ticket.attachments?.length > 0 && (
                      <Badge className="border border-primary">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {ticket.attachments.length}
                      </Badge>
                    )}
                  </div>
                  {ticket.slaDeadline && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      SLA: {new Date(ticket.slaDeadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <h3 className="font-medium mb-1">{ticket.subject}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {ticket?.subject} • {ticket?.department?.name}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Created by {ticket?.creator?.name} •{" "}
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  {ticket.cc && (
                    <div className="flex items-center gap-1">
                      <span>{ticket?.cc?.name}</span>
                      {/* {ticket.ccUsers?.length > 0 && (
                        <>
                          <Mail className="h-3 w-3" />
                          <span>CC: {ticket.ccUsers.length}</span>
                        </>
                      )} */}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {pagination.currentPage < pagination.totalPages && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleLoadMore} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// "use client";

// import { Badge } from "@/components/common/ui/badge";
// import { Input } from "@/components/common/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/common/ui/select";
// import {
//   Mail,
//   Clock,
//   Paperclip,
//   Search,
//   Filter,
//   RefreshCw,
//   AlertCircle,
//   User,
// } from "lucide-react";
// import { Button } from "@/components/common/ui/button";
// import { Card } from "@/components/common/ui/cards/card";
// import { useState, useEffect } from "react";
// import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";

// export default function TicketList({ selectedTicket, setSelectedTicket }) {
//   const { list, loading, error, fetchData, pagination, fetchById } =
//     useCrudListWithPagination("/api/internal-tickets");

//   const [allTickets, setAllTickets] = useState([]);

//   useEffect(() => {
//     setAllTickets(list?.data || []);
//   }, [list]);

//   const handleSelectTicket = async (ticket) => {
//     try {
//       setSelectedTicket({ loading: true, id: ticket.id });
//       const res = await fetchById(ticket.id);
//       setSelectedTicket(res?.data || res);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleLoadMore = async () => {
//     const nextPage = pagination.currentPage + 1;
//     if (nextPage > pagination.totalPages) return;
//     const res = await fetch(
//       `/api/internal-tickets?page=${nextPage}&limit=${pagination.per_page}`
//     );
//     const data = await res.json();
//     setAllTickets((prev) => [...prev, ...(data.data || [])]);
//   };

//   return (
//     <div className="w-1/2 border-r border-border flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between">
//         <h2 className="text-primary font-semibold">Internal Support Tickets</h2>
//         <Button
//           size="sm"
//           onClick={() => fetchData({ page: 1 })}
//           disabled={loading}
//         >
//           <RefreshCw className="h-4 w-4" />
//         </Button>
//       </div>

//       {/* Search */}
//       <div className="p-3 border-b border-border flex gap-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search tickets..." className="pl-9" />
//         </div>
//       </div>

//       {/* Ticket List */}
//       <Card className="flex-1 overflow-y-auto m-2">
//         {loading ? (
//           <div className="flex items-center justify-center h-32 text-muted-foreground">
//             Loading...
//           </div>
//         ) : error ? (
//           <div className="flex items-center justify-center h-32 text-destructive">
//             {error}
//           </div>
//         ) : allTickets.length === 0 ? (
//           <div className="flex items-center justify-center h-32 text-muted-foreground">
//             No tickets found
//           </div>
//         ) : (
//           allTickets.map((ticket) => (
//             <div
//               key={ticket.id}
//               onClick={() => handleSelectTicket(ticket)}
//               className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
//                 selectedTicket?.id === ticket.id
//                   ? "bg-accent border-l-4 border-l-primary"
//                   : ""
//               }`}
//             >
//               <div className="flex items-start justify-between mb-2">
//                 <div className="flex items-center gap-2 text-xs">
//                   <span className="font-medium">{ticket.ticket_number}</span>
//                   <Badge variant="outline">{ticket.status}</Badge>
//                   {ticket.attachments?.length > 0 && (
//                     <Badge className="border border-primary">
//                       <Paperclip className="h-3 w-3 mr-1" />{" "}
//                       {ticket.attachments.length}
//                     </Badge>
//                   )}
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   {new Date(ticket.created_at).toLocaleDateString()}
//                 </span>
//               </div>
//               <h3 className="font-medium">{ticket.subject}</h3>
//               <p className="text-sm text-muted-foreground">
//                 {ticket.department?.name}
//               </p>
//             </div>
//           ))
//         )}

//         {pagination.currentPage < pagination.totalPages && (
//           <div className="flex justify-center mt-4">
//             <Button onClick={handleLoadMore} disabled={loading}>
//               {loading ? "Loading..." : "Load More"}
//             </Button>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }
