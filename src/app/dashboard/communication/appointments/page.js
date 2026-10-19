"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/common/ui/page";
import { StatusBadge } from "@/components/common/ui/badge";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import { TruncatedText } from "@/components/common/ui/short-id";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";

const authHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authTokenStoreAdmin")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"];

// Expert-consultation bookings from the storefront "Speak to an Expert" modal.
export default function AppointmentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments${filter && filter !== "all" ? `?status=${filter}` : ""}`,
        { headers: authHeaders(), cache: "no-store" }
      );
      const j = await res.json();
      setRows(Array.isArray(j) ? j : j?.data || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = useCallback(
    async (id, status) => {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error();
        toast.success(`Marked ${status}`);
        load();
      } catch {
        toast.error("Update failed");
      }
    },
    [load]
  );

  const columns = useMemo(
    () => [
      {
        id: "when",
        header: ({ column }) => (
          <DataGridColumnHeader title="When (US Eastern)" column={column} />
        ),
        accessorFn: (row) =>
          row.preferredDate
            ? `${String(row.preferredDate).slice(0, 10)} ${String(
                row.preferredTime || ""
              ).slice(0, 5)}`
            : "",
        cell: ({ row }) => {
          const r = row.original;
          const date = r.preferredDate
            ? String(r.preferredDate).slice(0, 10)
            : "—";
          const time = r.preferredTime
            ? String(r.preferredTime).slice(0, 5)
            : "";
          return (
            <span className="whitespace-nowrap font-medium text-foreground">
              {date}
              {time ? ` · ${time}` : ""}
            </span>
          );
        },
        size: 170,
        meta: { headerTitle: "When (US Eastern)", identity: true },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => <TruncatedText value={row.original.name} />,
        size: 160,
        meta: { headerTitle: "Customer", truncate: true },
      },
      {
        id: "contact",
        header: ({ column }) => (
          <DataGridColumnHeader title="Contact" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-0">
              <TruncatedText value={r.email} />
              {r.phone ? (
                <div className="text-xs text-muted-foreground">{r.phone}</div>
              ) : null}
            </div>
          );
        },
        size: 190,
        meta: { headerTitle: "Contact", truncate: true },
      },
      {
        id: "notes",
        header: ({ column }) => (
          <DataGridColumnHeader title="Regarding" column={column} />
        ),
        accessorFn: (row) => row.notes,
        cell: ({ row }) => <TruncatedText value={row.original.notes || "—"} />,
        size: 260,
        meta: { headerTitle: "Regarding", truncate: true },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 120,
        meta: { headerTitle: "Status" },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <Select
              value={r.status || STATUSES[0]}
              onValueChange={(value) => setStatus(r.id, value)}
            >
              <SelectTrigger
                size="sm"
                className="w-32"
                aria-label={`Change status for ${
                  r.name || "appointment"
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 150,
        meta: { headerTitle: "Actions" },
      },
    ],
    [setStatus]
  );

  return (
    <Page>
      <PageHeader
        title="Appointments"
        description="30-min expert consultations booked from product pages · slots Mon–Fri 9:00–18:00 US Eastern"
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No appointments yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Bookings made from the storefront &quot;Speak to an Expert&quot;
            modal will appear here.
          </p>
        </div>
      ) : (
        <ListWithCardToggle
          title="Appointments"
          titleAs="none"
          data={rows}
          columns={columns}
          paginationResetKey={filter}
          resizableColumns
        />
      )}
    </Page>
  );
}
