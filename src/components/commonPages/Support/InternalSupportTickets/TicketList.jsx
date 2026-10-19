"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Clock,
  Filter,
  Paperclip,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { Input } from "@/components/common/ui/input";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Skeleton } from "@/components/common/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";

const DEPARTMENTS = [
  { value: "web-tech-support", label: "Web Tech Support" },
  { value: "graphics-design-support", label: "Graphics Design Support" },
  { value: "social-media-marketing-support", label: "Social Media & Marketing" },
  { value: "order-related-support", label: "Order Related" },
  { value: "account-support", label: "Account Support" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

// Ticket status pills use the shared pastel badge treatments.
const STATUS_BADGE = {
  open: { variant: "primary", appearance: "light" },
  "in-progress": { variant: "info", appearance: "light" },
  resolved: { variant: "success", appearance: "light" },
  closed: { variant: "secondary", appearance: "outline" },
};

const getStatusBadge = (status) =>
  STATUS_BADGE[status] || { variant: "secondary", appearance: "light" };

// Activates a badge that behaves like a button (Enter / Space).
const activateOnKey = (handler) => (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

export default function TicketList({
  tickets,
  selectedTicket,
  setSelectedTicket = () => {},
  isLoading,
  loadTickets,

  currentUserId,
}) {
  const { list, loading, error, pagination, fetchById } =
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

      // The pagination object comes from the list hook as plain state, so the
      // current page is advanced in place to stop the sentinel from asking
      // for the same page again.
      pagination.currentPage = data.current_page;
    } catch (err) {
      toast.error(err?.message || "Failed to load more tickets");
    }
  };
  const allTickets = [...(tickets || [])];

  // Auto-load the next page as the sentinel scrolls into view.
  const hasMoreTickets = pagination.currentPage < pagination.totalPages;
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreTickets && !loading)
          handleLoadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreTickets, loading, pagination.currentPage]);

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
      toast.error(err?.message || "Failed to fetch ticket details");
    }
  };

  return (
    <Page className="w-full min-w-0 border-r border-border md:w-1/2">
      <PageHeader
        title="Support Tickets"
        description="Internal tickets raised across the storefront."
        actions={
          <Button
            variant="outline"
            size="md"
            onClick={() => loadTickets?.()}
            disabled={isLoading}
            aria-label="Refresh tickets"
            title="Refresh tickets"
          >
            <RefreshCw className="size-4" />
          </Button>
        }
      />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="flex-col items-stretch gap-3 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Filter badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={unassignedCount > 0 ? "destructive" : "secondary"}
              appearance={unassignedCount > 0 ? "light" : "outline"}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => setDepartmentFilter("unassigned")}
              onKeyDown={activateOnKey(() => setDepartmentFilter("unassigned"))}
            >
              {unassignedCount} Unassigned
            </Badge>
            <Badge
              variant={myTicketsCount > 0 ? "primary" : "secondary"}
              appearance={myTicketsCount > 0 ? "light" : "outline"}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => setDepartmentFilter("mine")}
              onKeyDown={activateOnKey(() => setDepartmentFilter("mine"))}
            >
              {myTicketsCount} My Tickets
            </Badge>
            <Badge variant="secondary" appearance="outline">
              {allTickets.length} Total
            </Badge>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
                aria-label="Search tickets"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Filter by department">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="mine">My Tickets</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36" aria-label="Filter by status">
                <Filter className="mr-2 size-4" aria-hidden="true" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Ticket List */}
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : allTicketsData?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <AlertCircle
                className="size-8 text-muted-foreground opacity-50"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-foreground">No tickets found</p>
              <p className="text-sm text-muted-foreground">Try adjusting filters</p>
            </div>
          ) : (
            allTicketsData?.map((ticket) => {
              const ticketBadge = getStatusBadge(ticket.status);
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
                  className={cn(
                    "cursor-pointer border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedTicket?.id === ticket.id &&
                      "border-l-4 border-l-primary bg-muted"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                        aria-label={`Priority: ${ticket.priority || "none"}`}
                        title={`Priority: ${ticket.priority || "none"}`}
                        role="img"
                      />
                      <span className="font-medium text-foreground">
                        {ticket?.ticket_number}
                      </span>
                      <Badge
                        variant={ticketBadge.variant}
                        appearance={ticketBadge.appearance}
                      >
                        {ticket.status}
                      </Badge>
                      {!ticket.assignedUser?.name && (
                        <Badge variant="secondary" appearance="outline" className="text-xs">
                          <User className="mr-1 size-3" aria-hidden="true" />
                          Unassigned
                        </Badge>
                      )}
                      {ticket.status === "open" && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-Assigned
                        </Badge>
                      )}
                      {ticket.attachments?.length > 0 && (
                        <Badge variant="secondary" appearance="outline" className="text-xs">
                          <Paperclip className="mr-1 size-3" aria-hidden="true" />
                          {ticket.attachments.length}
                        </Badge>
                      )}
                    </div>
                    {ticket.slaDeadline && (
                      <div className="flex shrink-0 items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 size-3" aria-hidden="true" />
                        SLA: {new Date(ticket.slaDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <h2 className="mb-1 truncate text-sm font-medium text-foreground">
                    {ticket.subject}
                  </h2>
                  <div className="mb-2 truncate text-sm text-muted-foreground">
                    {ticket?.department?.name}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="truncate">
                      Created by {ticket?.creator?.name} •{" "}
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    {ticket.cc && (
                      <div className="flex shrink-0 items-center gap-1">
                        <span>{ticket?.cc?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {hasMoreTickets && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              {loading && (
                <span className="text-sm text-muted-foreground">Loading more…</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
