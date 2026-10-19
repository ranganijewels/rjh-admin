"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/common/ui/page";
import { StatusBadge } from "@/components/common/ui/badge";
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

  const setStatus = async (id, status) => {
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
  };

  return (
    <div className="space-y-4">
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

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-foreground text-left">
              {["When (US Eastern)", "Customer", "Contact", "Regarding", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No appointments yet.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-gray-50 dark:bg-muted" : "bg-white dark:bg-card"}>
                  <td className="px-4 py-2.5 whitespace-nowrap font-medium">
                    {r.preferredDate ? String(r.preferredDate).slice(0, 10) : "—"}
                    {r.preferredTime ? ` · ${String(r.preferredTime).slice(0, 5)}` : ""}
                  </td>
                  <td className="px-4 py-2.5">{r.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {r.email}
                    {r.phone ? <div>{r.phone}</div> : null}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-[280px]">
                    <span className="line-clamp-2 whitespace-pre-line">{r.notes || "—"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
