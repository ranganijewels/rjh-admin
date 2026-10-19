"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
const badge = (s) =>
  ({
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-gray-200 dark:bg-secondary text-gray-600 dark:text-muted-foreground",
    no_show: "bg-red-100 text-red-700",
  }[s] || "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground");

// Expert-consultation bookings from the storefront "Speak to an Expert" modal.
export default function AppointmentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments${filter ? `?status=${filter}` : ""}`,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#162640]">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            30-min expert consultations booked from product pages · slots Mon–Fri
            9:00–18:00 US Eastern
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#162640] text-white text-left">
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
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge(r.status)}`}>
                      {r.status}
                    </span>
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
