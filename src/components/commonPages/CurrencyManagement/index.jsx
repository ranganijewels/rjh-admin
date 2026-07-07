"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Plus, RefreshCw, Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { Checkbox } from "@/components/common/ui/checkbox";
import StatusBadge from "@/components/commonPages/Catalog/StatusBadge";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";

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

const EMPTY = {
  countryCode: "",
  countryName: "",
  currencyCode: "",
  currencySymbol: "",
  rate: "",
  sortOrder: "",
  isActive: true,
};

const ACTIVE_STATUS_MAP = {
  active: "bg-green-100 text-green-700",
  off: "bg-gray-100 text-gray-500",
};

const CurrencyManagement = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/currency-management", {
        headers: authHeaders(),
      });
      const json = await res.json();
      setList(json?.data || []);
    } catch (e) {
      toast.error("Failed to load currencies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshRates = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/currency-management/refresh-rates", {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      const updated = json?.data?.updated ?? json?.updated;
      if (res.ok && updated != null) {
        toast.success(`Live rates updated for ${updated} currencies`);
        fetchData();
      } else {
        toast.error(json?.message || "Rate provider unavailable");
      }
    } catch {
      toast.error("Failed to refresh rates");
    } finally {
      setRefreshing(false);
    }
  };

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      countryCode: c.countryCode || "",
      countryName: c.countryName || "",
      currencyCode: c.currencyCode || "",
      currencySymbol: c.currencySymbol || "",
      rate: c.rate ?? "",
      sortOrder: c.sortOrder ?? "",
      isActive: c.isActive,
    });
    setEditId(c.id);
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.countryCode || !form.countryName || !form.currencyCode) {
      toast.error("Country code, name and currency code are required");
      return;
    }
    setSaving(true);
    try {
      const url = editId
        ? `/api/currency-management/${editId}`
        : "/api/currency-management";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Save failed");
      }
      toast.success(editId ? "Currency updated" : "Currency added");
      setFormOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      const res = await fetch(`/api/currency-management/${c.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...c, isActive: !c.isActive }),
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch {
      toast.error("Failed to update");
    }
  };

  const setDefault = async (c) => {
    try {
      const res = await fetch(`/api/currency-management/${c.id}/default`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      toast.success(`${c.currencyCode} is now the default currency`);
      fetchData();
    } catch {
      toast.error("Failed to set default");
    }
  };

  const doDelete = async () => {
    try {
      const res = await fetch(`/api/currency-management/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      toast.success("Currency removed");
      setConfirmOpen(false);
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (loading) return <ContentLoader />;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Currency &amp; Countries</h1>
          <p className="text-sm text-muted-foreground">
            Storefront currencies, live FX rates, and the default country. Base
            currency is USD (rate = 1 USD in that currency).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshRates}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing…" : "Refresh Live Rates"}
          </Button>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Currency
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th scope="col" className="p-3 font-medium">Country</th>
              <th scope="col" className="p-3 font-medium">Code</th>
              <th scope="col" className="p-3 font-medium">Currency</th>
              <th scope="col" className="p-3 font-medium hidden sm:table-cell">Symbol</th>
              <th scope="col" className="p-3 font-medium text-right">Rate (1 USD =)</th>
              <th scope="col" className="p-3 font-medium text-center">Active</th>
              <th scope="col" className="p-3 font-medium text-center">Default</th>
              <th scope="col" className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">{c.countryName}</td>
                <td className="p-3">{c.countryCode}</td>
                <td className="p-3">{c.currencyCode}</td>
                <td className="p-3 hidden sm:table-cell">{c.currencySymbol}</td>
                <td className="p-3 text-right tabular-nums">
                  {Number(c.rate).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })}
                </td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    aria-pressed={c.isActive}
                    aria-label={
                      c.isActive
                        ? `Deactivate ${c.currencyCode || "currency"}`
                        : `Activate ${c.currencyCode || "currency"}`
                    }
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <StatusBadge
                      status={c.isActive ? "active" : "off"}
                      map={ACTIVE_STATUS_MAP}
                      capitalize
                    />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => setDefault(c)}
                    title={c.isDefault ? "Default country" : "Set as default"}
                    aria-label={
                      c.isDefault
                        ? `${c.currencyCode || "Currency"} is the default currency`
                        : `Set ${c.currencyCode || "currency"} as default currency`
                    }
                    aria-pressed={!!c.isDefault}
                    className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Star
                      className={`h-4 w-4 mx-auto ${
                        c.isDefault
                          ? "fill-yellow-500 text-yellow-700"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      mode="icon"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      mode="icon"
                      onClick={() => {
                        setDeleteId(c.id);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                  No currencies configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit sheet */}
      <Sheet open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <SheetContent
          side="right"
          className="w-[90%] md:max-w-[50vw] lg:max-w-[32vw] inset-5 start-auto h-auto rounded-lg p-0"
        >
          <SheetHeader className="border-b py-3.5 px-5 border-border">
            <SheetTitle>{editId ? "Edit" : "Add"} Currency</SheetTitle>
          </SheetHeader>
          <SheetBody className="px-5 py-4 space-y-4">
            <Field label="Country Code (ISO-2, e.g. US)">
              <Input
                value={form.countryCode}
                maxLength={2}
                onChange={(e) =>
                  setField("countryCode", e.target.value.toUpperCase())
                }
                placeholder="US"
              />
            </Field>
            <Field label="Country Name">
              <Input
                value={form.countryName}
                onChange={(e) => setField("countryName", e.target.value)}
                placeholder="United States"
              />
            </Field>
            <Field label="Currency Code (ISO, e.g. USD)">
              <Input
                value={form.currencyCode}
                maxLength={3}
                onChange={(e) =>
                  setField("currencyCode", e.target.value.toUpperCase())
                }
                placeholder="USD"
              />
            </Field>
            <Field label="Currency Symbol">
              <Input
                value={form.currencySymbol}
                onChange={(e) => setField("currencySymbol", e.target.value)}
                placeholder="$"
              />
            </Field>
            <Field label="Rate (1 USD = ? this currency)">
              <Input
                type="number"
                step="0.0001"
                value={form.rate}
                onChange={(e) => setField("rate", e.target.value)}
                placeholder="1.0"
              />
            </Field>
            <Field label="Sort Order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                placeholder="0"
              />
            </Field>
            <label
              htmlFor="currency-isActive"
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                id="currency-isActive"
                checked={!!form.isActive}
                onCheckedChange={(checked) => setField("isActive", !!checked)}
              />
              Active on storefront
            </label>
          </SheetBody>
          <SheetFooter className="px-5 py-4 gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        title="Delete Currency"
        message="Remove this country/currency from the storefront? This cannot be undone."
      />
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">{label}</label>
    {children}
  </div>
);

export default CurrencyManagement;
