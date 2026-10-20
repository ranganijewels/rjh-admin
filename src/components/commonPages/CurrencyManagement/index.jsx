"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Plus, RefreshCw, Star, Trash2, Pencil } from "lucide-react";
import { usePermissions } from "@/provider/permission-provider";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Checkbox } from "@/components/common/ui/checkbox";
import { StatusBadge } from "@/components/common/ui/badge";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { TruncatedText } from "@/components/common/ui/short-id";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { getAuthToken } from "@/lib/auth-token";

const authHeaders = () => {
  const token =
    getAuthToken();
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

// Sort numerically when both values are numbers, otherwise as a
// natural-language string.
const compareValues = (rowA, rowB, columnId) => {
  const av = rowA.getValue(columnId);
  const bv = rowB.getValue(columnId);
  const an = Number(av);
  const bn = Number(bv);
  if (av !== "" && bv !== "" && av != null && bv != null && Number.isFinite(an) && Number.isFinite(bn)) {
    return an - bn;
  }
  return String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
};

const CurrencyManagement = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  // Currencies are store settings.
  const { can } = usePermissions();
  const canCreate = can("settings", "create");
  const canEdit = can("settings", "edit");
  const canDelete = can("settings", "delete");

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

  const openEdit = useCallback((c) => {
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
  }, []);

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

  const toggleActive = useCallback(async (c) => {
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
  }, [fetchData]);

  const setDefault = useCallback(async (c) => {
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
  }, [fetchData]);

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

  const handleBulkDelete = useCallback(async (rows) => {
    try {
      await Promise.all(
        rows.map((c) =>
          fetch(`/api/currency-management/${c.id}`, {
            method: "DELETE",
            headers: authHeaders(),
          })
        )
      );
      toast.success(`${rows.length} currenc(ies) removed`);
      fetchData();
    } catch {
      toast.error("Failed to delete selected currencies");
    }
  }, [fetchData]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Quick search over the currency's identifying fields.
  const filterFunction = useCallback((data, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) =>
      [c.countryName, c.countryCode, c.currencyCode, c.currencySymbol].some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, []);

  const tableColumns = useMemo(
    () => [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
        meta: { headerTitle: "Select" },
      },
      {
        id: "countryName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Country" column={column} />
        ),
        accessorFn: (row) => row.countryName,
        cell: ({ row }) => <TruncatedText value={row.original.countryName} />,
        size: 180,
        meta: { headerTitle: "Country", identity: true, truncate: true },
      },
      {
        id: "countryCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Code" column={column} />
        ),
        accessorFn: (row) => row.countryCode,
        cell: ({ row }) => <span>{row.original.countryCode || "—"}</span>,
        size: 90,
        meta: { headerTitle: "Code" },
      },
      {
        id: "currencyCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Currency" column={column} />
        ),
        accessorFn: (row) => row.currencyCode,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.currencyCode || "—"}
          </span>
        ),
        size: 110,
        meta: { headerTitle: "Currency" },
      },
      {
        id: "currencySymbol",
        header: ({ column }) => (
          <DataGridColumnHeader title="Symbol" column={column} />
        ),
        accessorFn: (row) => row.currencySymbol,
        cell: ({ row }) => <span>{row.original.currencySymbol || "—"}</span>,
        size: 90,
        meta: { headerTitle: "Symbol" },
      },
      {
        id: "rate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Rate (1 USD =)" column={column} />
        ),
        accessorFn: (row) => row.rate,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {Number(row.original.rate).toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
          </span>
        ),
        sortingFn: compareValues,
        size: 130,
        meta: { headerTitle: "Rate (1 USD =)" },
      },
      {
        id: "isActive",
        header: ({ column }) => (
          <DataGridColumnHeader title="Active" column={column} />
        ),
        accessorFn: (row) => row.isActive,
        cell: ({ row }) => {
          const c = row.original;
          const label = c.currencyCode || "currency";
          return (
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={!!c.isActive}
              aria-label={
                c.isActive ? `Deactivate ${label}` : `Activate ${label}`
              }
              title={c.isActive ? "Deactivate" : "Activate"}
              onClick={() => toggleActive(c)}
            >
              <StatusBadge status={c.isActive ? "active" : "inactive"} />
            </Button>
          );
        },
        size: 120,
        meta: { headerTitle: "Active" },
      },
      {
        id: "isDefault",
        header: ({ column }) => (
          <DataGridColumnHeader title="Default" column={column} />
        ),
        accessorFn: (row) => row.isDefault,
        cell: ({ row }) => {
          const c = row.original;
          const label = c.currencyCode || "currency";
          return (
            <Button
              mode="icon"
              variant="ghost"
              size="sm"
              aria-pressed={!!c.isDefault}
              aria-label={
                c.isDefault
                  ? `${label} is the default currency`
                  : `Set ${label} as default currency`
              }
              title={c.isDefault ? "Default country" : "Set as default"}
              onClick={() => setDefault(c)}
            >
              <Star
                className={`size-4 ${
                  c.isDefault
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          );
        },
        size: 90,
        meta: { headerTitle: "Default" },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  mode="icon"
                  size="sm"
                  aria-label={`Edit ${c.currencyCode || "currency"}`}
                  title="Edit currency"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  mode="icon"
                  size="sm"
                  aria-label={`Delete ${c.currencyCode || "currency"}`}
                  title="Delete currency"
                  onClick={() => {
                    setDeleteId(c.id);
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 96,
        meta: { headerTitle: "Actions" },
      },
    ],
    [toggleActive, setDefault, openEdit, canEdit, canDelete]
  );

  if (loading) {
    return (
      <Page>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Currency & Countries"
        description="Storefront currencies, live FX rates, and the default country. Base currency is USD (rate = 1 USD in that currency)."
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={refreshRates}
              disabled={refreshing}
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing…" : "Refresh Live Rates"}
            </Button>
            {canCreate && (
              <Button variant="primary" size="md" onClick={openAdd}>
                <Plus className="size-4" />
                Add Currency
              </Button>
            )}
          </>
        }
      />

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No currencies configured yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a country and its currency to start selling in that market.
          </p>
          {canCreate && (
            <Button variant="primary" onClick={openAdd}>
              <Plus className="size-4" />
              Add Currency
            </Button>
          )}
        </div>
      ) : (
        <ListWithCardToggle
          title="Currencies"
          titleAs="none"
          data={list}
          columns={tableColumns}
          filterFunction={filterFunction}
          resizableColumns
          bulkActions={[
            {
              key: "delete",
              label: "Delete",
              variant: "destructive",
              hidden: !canDelete,
              confirmMessage:
                "Remove the selected currenc(ies) from the storefront? This cannot be undone.",
              onRun: handleBulkDelete,
            },
          ]}
        />
      )}

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
            <Field label="Country Code (ISO-2, e.g. US)" htmlFor="currency-countryCode">
              <Input
                id="currency-countryCode"
                value={form.countryCode}
                maxLength={2}
                onChange={(e) =>
                  setField("countryCode", e.target.value.toUpperCase())
                }
                placeholder="US"
              />
            </Field>
            <Field label="Country Name" htmlFor="currency-countryName">
              <Input
                id="currency-countryName"
                value={form.countryName}
                onChange={(e) => setField("countryName", e.target.value)}
                placeholder="United States"
              />
            </Field>
            <Field label="Currency Code (ISO, e.g. USD)" htmlFor="currency-currencyCode">
              <Input
                id="currency-currencyCode"
                value={form.currencyCode}
                maxLength={3}
                onChange={(e) =>
                  setField("currencyCode", e.target.value.toUpperCase())
                }
                placeholder="USD"
              />
            </Field>
            <Field label="Currency Symbol" htmlFor="currency-currencySymbol">
              <Input
                id="currency-currencySymbol"
                value={form.currencySymbol}
                onChange={(e) => setField("currencySymbol", e.target.value)}
                placeholder="$"
              />
            </Field>
            <Field label="Rate (1 USD = ? this currency)" htmlFor="currency-rate">
              <Input
                id="currency-rate"
                type="number"
                step="0.0001"
                value={form.rate}
                onChange={(e) => setField("rate", e.target.value)}
                placeholder="1.0"
              />
            </Field>
            <Field label="Sort Order" htmlFor="currency-sortOrder">
              <Input
                id="currency-sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                placeholder="0"
              />
            </Field>
            <div className="flex items-center gap-2">
              <Checkbox
                id="currency-isActive"
                checked={!!form.isActive}
                onCheckedChange={(checked) => setField("isActive", !!checked)}
              />
              <Label htmlFor="currency-isActive" className="font-normal">
                Active on storefront
              </Label>
            </div>
          </SheetBody>
          <SheetFooter className="px-5 py-4 gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} disabled={saving}>
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
    </Page>
  );
};

const Field = ({ label, htmlFor, children }) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);

export default CurrencyManagement;
