"use client";

import { useRef, useState } from "react";
import { Mail, Paperclip, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/common/ui/avatar";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { Dialog, DialogTrigger } from "@/components/common/ui/dialog";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Textarea } from "@/components/common/ui/textarea";

// Semantic priority tokens (see src/css/config.reui.css) instead of
// hardcoded Tailwind color utilities.
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

const TICKET_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const initials = (name) =>
  name && name.trim() ? name.trim().charAt(0).toUpperCase() : "?";

export default function TicketDetailView({
  selectedTicket,
  isAssigning = false,
  onReassign,
  onUnassign,
}) {
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState([]);
  const replyFileInputRef = useRef(null);

  if (!selectedTicket) {
    return (
      <Page className="w-full min-w-0 md:w-1/2">
        <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted-foreground">
          Select a ticket to view details
        </div>
      </Page>
    );
  }

  if (selectedTicket.loading) {
    return (
      <Page className="w-full min-w-0 md:w-1/2">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </Page>
    );
  }

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = () => {
    toast.success("Reply sent");
    setReply("");
    setFiles([]);
  };

  const assignee = selectedTicket.assignedTo;
  const creator = selectedTicket.creator;
  const priority = selectedTicket.priority;

  return (
    <Page className="w-full min-w-0 md:w-1/2">
      <PageHeader
        title={selectedTicket.subject || "Ticket details"}
        description={
          selectedTicket.description || "Internal support ticket overview."
        }
        actions={
          <Select value={selectedTicket.status}>
            <SelectTrigger className="w-36" aria-label="Ticket status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {TICKET_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Ticket details */}
      <Card>
        <CardHeader className="py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Ticket details
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Everything captured on this ticket.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Ticket number</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {selectedTicket.ticket_number || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-1">
                {selectedTicket.status ? (
                  <StatusBadge status={selectedTicket.status} />
                ) : (
                  <span className="text-sm text-foreground">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Department</dt>
              <dd className="mt-1 text-sm text-foreground">
                {selectedTicket.department?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Priority</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: getPriorityColor(priority) }}
                  aria-hidden="true"
                />
                {priority
                  ? priority.charAt(0).toUpperCase() + priority.slice(1)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Created by</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <Avatar className="size-6">
                  <AvatarFallback>{initials(creator?.name)}</AvatarFallback>
                </Avatar>
                {creator?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Created at</dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDateTime(selectedTicket.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">SLA deadline</dt>
              <dd className="mt-1 text-sm text-foreground">
                {selectedTicket.slaDeadline
                  ? formatDateTime(selectedTicket.slaDeadline)
                  : "—"}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs text-muted-foreground">Description</dt>
              <dd className="mt-1 text-sm text-foreground">
                {selectedTicket.description || "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader className="py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Assignment
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Who owns this ticket right now.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {assignee ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback>{initials(assignee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {assignee.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assignee.role || "Assigned agent"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This ticket is not assigned yet.
              </p>
            )}

            <div className="flex items-center gap-2">
              {assignee ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReassign}
                    disabled={isAssigning || !onReassign}
                    title="Reassign this ticket"
                  >
                    Reassign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUnassign}
                    disabled={isAssigning || !onUnassign}
                    title="Remove the current assignee"
                  >
                    Unassign
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="primary" size="sm">
                      <UserPlus className="mr-2 size-4" aria-hidden="true" />
                      Assign
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          </div>

          {selectedTicket.cc && (
            <div className="space-y-1.5 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">
                  CC Recipients
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedTicket.cc?.name || "—"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply */}
      <Card>
        <CardHeader className="py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Reply
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Write an internal reply for this ticket.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
          />

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate text-foreground">{f.name}</span>
                  <Button
                    variant="ghost"
                    mode="icon"
                    size="sm"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    title={`Remove ${f.name}`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => replyFileInputRef.current?.click()}
            >
              <Paperclip className="mr-2 size-4" aria-hidden="true" />
              Attach
            </Button>
            <input
              id="replyFileInput"
              ref={replyFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button onClick={handleSendReply}>Send Reply</Button>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}
