"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Skeleton } from "@/components/common/ui/skeleton";
import { StatusBadge } from "@/components/common/ui/badge";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { TruncatedText } from "@/components/common/ui/short-id";
import {
  Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/common/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/common/ui/select";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { usePermissions } from "@/provider/permission-provider";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const fmt = (v, type) => {
  if (v === null || v === undefined || v === "") return "—";
  if (type === "date") return new Date(v).toLocaleDateString();
  if (type === "money") return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  if (type === "csv-list") return String(v).split(",").map((s) => s.trim()).filter(Boolean).join(", ");
  return String(v);
};

// Sentinel used by the dropdown filters for "no filter applied" — a Select
// item always needs a real, non-empty value.
const ALL_FILTER = "__all__";

// Starting width (px) for a generated column, based on what it holds.
const columnSize = (c) => {
  if (c.type === "money") return 120;
  if (c.type === "date") return 130;
  if (c.type === "csv-list") return 180;
  return 150;
};

// Sort like the previous hand-rolled table did: numerically when both values
// are numbers, otherwise as a natural-language string.
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

// ── CSV export/import — generic across every pricing master, driven by the
// same `fields` config each master already uses for its Add/Edit form. ─────

function csvCell(v) {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote whenever the value could otherwise be misread — a comma (multiselect
  // fields like Color/Clarity store "D,E,F"), a quote, or a newline.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(fields, list) {
  const header = ["status", ...fields.map((f) => f.label)];
  const rows = list.map((row) => [
    row.status ?? "active",
    ...fields.map((f) => {
      const v = row[f.key];
      if (f.type === "date" && v) return new Date(v).toISOString().slice(0, 10);
      return v ?? "";
    }),
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

// Same quote-aware parser used by the product CSV importer (see
// app/api/product-management/import-csv/route.js) — kept as a small local
// copy since this one runs client-side in the browser, not in a route.
function parseCsvText(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line) => {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        out.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseRow(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").trim()]));
  });
}

// CSV headers are matched case-insensitively against a field's label OR key,
// so a hand-edited sheet using either convention still imports correctly.
function rowsToItems(csvRows, fields) {
  const lookup = (rowLower, field) => {
    if (field.label.toLowerCase() in rowLower) return rowLower[field.label.toLowerCase()];
    if (field.key.toLowerCase() in rowLower) return rowLower[field.key.toLowerCase()];
    return undefined;
  };
  return csvRows.map((row) => {
    const rowLower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
    const item = {};
    if ("status" in rowLower && rowLower.status) item.status = rowLower.status;
    fields.forEach((f) => {
      const raw = lookup(rowLower, f);
      if (raw === undefined || raw === "") return;
      item[f.key] = f.type === "number" ? Number(raw) : raw;
    });
    return item;
  });
}

// Toggle-chip multi-select, backed by a comma-separated string in form state
// (the DB column is a single string; the pricing engine matches "any of").
const MultiSelectChips = ({ options, loading, value, onChange }) => {
  const selected = (value || "").split(",").map((s) => s.trim()).filter(Boolean);
  // Union with the fetched catalog options so a legacy/custom value already
  // on the row (not in the current catalog list) still shows up, checked.
  const allOptions = [...new Set([...options, ...selected])];
  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
    onChange(next.join(","));
  };
  if (loading) return <p className="text-xs text-muted-foreground">Loading…</p>;
  if (!allOptions.length) return <p className="text-xs text-muted-foreground">No qualities in Catalog Masters yet.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {allOptions.map((opt) => {
        const isSel = selected.includes(opt);
        return (
          <Button
            key={opt}
            type="button"
            variant={isSel ? "primary" : "outline"}
            size="sm"
            aria-pressed={isSel}
            onClick={() => toggle(opt)}
          >
            {opt}
          </Button>
        );
      })}
    </div>
  );
};

// Config-driven CRUD for any effective-dated pricing master.
export default function RateMasterManager({ title, description, resource, columns, fields }) {
  const { can } = usePermissions();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [touched, setTouched] = useState({});
  const [catalogOptions, setCatalogOptions] = useState({}); // { [kind]: string[] }
  const [catalogLoading, setCatalogLoading] = useState({}); // { [kind]: boolean }
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch Catalog Master values for any field sourced from a kind (e.g.
  // "diamond_quality"), once per kind used by this master's fields.
  useEffect(() => {
    const kinds = [...new Set(fields.filter((f) => f.optionsKind).map((f) => f.optionsKind))];
    kinds.forEach(async (kind) => {
      setCatalogLoading((s) => ({ ...s, [kind]: true }));
      try {
        const res = await fetch(`/api/catalog/masters?kind=${encodeURIComponent(kind)}`, { headers: authHeaders() });
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json?.data || [];
        // Prefer .name — that's what product forms store for these same
        // catalog values (diamond shape/quality etc.), so rate masters have
        // to match on the same string or the pricing engine never finds them.
        setCatalogOptions((s) => ({ ...s, [kind]: rows.map((r) => r.name || r.code).filter(Boolean) }));
      } catch {
        setCatalogOptions((s) => ({ ...s, [kind]: [] }));
      } finally {
        setCatalogLoading((s) => ({ ...s, [kind]: false }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pricing-master/${resource}`, { headers: authHeaders() });
      const json = await res.json();
      setList(json?.data || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filters (client-side; masters are at most a few thousand rows)
  const [filters, setFilters] = useState({ status: "", carat: "" });
  const hasCaratBand = columns.some((c) => c.key === "minCarat") && columns.some((c) => c.key === "maxCarat");
  const splitVals = (v) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  // Dropdown filters for text-like columns, with the distinct values present.
  const filterCols = useMemo(
    () =>
      columns
        .filter((c) => !["money", "date", "number", "percent"].includes(c.type) && !["minCarat", "maxCarat", "rateValue"].includes(c.key))
        .map((c) => ({
          ...c,
          values: [...new Set(list.flatMap((r) => splitVals(r[c.key])))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        }))
        .filter((c) => c.values.length > 1),
    [columns, list]
  );
  const visible = useMemo(() => {
    const ct = Number(filters.carat);
    return list.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (hasCaratBand && filters.carat !== "" && Number.isFinite(ct) && !(ct >= Number(r.minCarat) && ct <= Number(r.maxCarat))) return false;
      for (const c of filterCols) {
        const want = filters[c.key];
        // A blank master value is a wildcard, so it matches any filter value.
        if (want && splitVals(r[c.key]).length && !splitVals(r[c.key]).map((x) => x.toLowerCase()).includes(want.toLowerCase())) return false;
      }
      return true;
    });
  }, [list, filters, filterCols, hasCaratBand]);

  const filtersActive = Object.values(filters).some((v) => v !== "" && v !== undefined && v !== null);
  const resetFilters = () =>
    setFilters((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, ""])));

  // The quick search runs through every configured column of the master.
  const filterFunction = useCallback(
    (data, query) => {
      const q = query.trim().toLowerCase();
      if (!q) return data;
      return data.filter((row) =>
        columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(q))
      );
    },
    [columns]
  );

  // Dropdown filters rendered inside the list toolbar.
  const filterDropdownProps = useMemo(() => {
    const dropdowns = {
      status: {
        value: filters.status || ALL_FILTER,
        onChange: (value) =>
          setFilters((f) => ({ ...f, status: value === ALL_FILTER ? "" : value })),
        placeholder: "All statuses",
        options: [
          { value: ALL_FILTER, label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
    };
    filterCols.forEach((c) => {
      dropdowns[c.key] = {
        value: filters[c.key] || ALL_FILTER,
        onChange: (value) =>
          setFilters((f) => ({ ...f, [c.key]: value === ALL_FILTER ? "" : value })),
        placeholder: `All ${c.label}`,
        options: [
          { value: ALL_FILTER, label: `All ${c.label}` },
          ...c.values.map((v) => ({ value: v, label: v })),
        ],
      };
    });
    return dropdowns;
  }, [filters, filterCols]);

  const openAdd = useCallback(() => {
    const blankForm = fields.reduce(
      (a, f) => ({ ...a, [f.key]: f.default ?? "" }),
      { status: "active" }
    );
    setForm(blankForm);
    setEditId(null);
    setTouched({});
    setOpen(true);
  }, [fields]);

  const openEdit = useCallback((row) => {
    const f = {};
    fields.forEach((fl) => {
      f[fl.key] = fl.type === "date" && row[fl.key]
        ? new Date(row[fl.key]).toISOString().slice(0, 10)
        : row[fl.key] ?? "";
    });
    f.status = row.status ?? "active";
    setForm(f); setEditId(row.id); setTouched({}); setOpen(true);
  }, [fields]);

  const handleBulkDelete = useCallback(async (ids) => {
    if (!ids.length) return;
    try {
      // One request, deleted server-side in a single query — firing one
      // DELETE per row (the old approach) fanned a large selection out into
      // that many concurrent requests, which exhausted the DB connection
      // pool, failed silently, and never refreshed the list to show it.
      const res = await fetch(`/api/pricing-master/${resource}/bulk-delete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ids }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(json?.message) ? json.message.join(", ") : json?.message || "Delete failed"
        );
      }
      const deleted = json?.data?.deleted ?? ids.length;
      toast.success(`${deleted} rate(s) deleted`);
    } catch (e) {
      toast.error(e.message || "Failed to delete selected rates");
    } finally {
      // Always refresh, even on failure — a partial delete (or none at all)
      // should still show the admin the current, real state of the table.
      fetchData();
    }
  }, [resource, fetchData]);

  // Grid columns: selection, one column per master field, status and actions.
  const tableColumns = useMemo(() => {
    const cols = [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
        meta: { headerTitle: "Select" },
      },
    ];

    columns.forEach((c, index) => {
      cols.push({
        id: c.key,
        header: ({ column }) => (
          <DataGridColumnHeader title={c.label} column={column} />
        ),
        accessorFn: (row) => row[c.key],
        cell: ({ row }) => {
          const value = fmt(row.original[c.key], c.type);
          return c.type === "csv-list" ? (
            <TruncatedText value={value} />
          ) : (
            <span>{value}</span>
          );
        },
        enableSorting: true,
        sortingFn: compareValues,
        size: columnSize(c),
        meta: {
          headerTitle: c.label,
          identity: index === 0,
          truncate: c.type === "csv-list",
        },
      });
    });

    cols.push({
      id: "status",
      header: ({ column }) => (
        <DataGridColumnHeader title="Status" column={column} />
      ),
      accessorFn: (row) => row.status,
      cell: ({ row }) => <StatusBadge status={row.original.status || "inactive"} />,
      enableSorting: true,
      sortingFn: compareValues,
      size: 110,
      meta: { headerTitle: "Status" },
    });

    cols.push({
      id: "action",
      header: ({ column }) => (
        <DataGridColumnHeader title="Actions" column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {can("pricing", "edit") && (
            <Button
              variant="outline"
              mode="icon"
              size="sm"
              aria-label={`Edit rate ${row.original.id}`}
              title="Edit rate"
              onClick={() => openEdit(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {can("pricing", "delete") && (
            <Button
              variant="outline"
              mode="icon"
              size="sm"
              aria-label={`Delete rate ${row.original.id}`}
              title="Delete rate"
              onClick={() => {
                setDeleteId(row.original.id);
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 96,
      meta: { headerTitle: "Actions" },
    });

    return cols;
  }, [columns, can, openEdit]);

  const isFieldInvalid = (f) => !f.optional && touched[f.key] && !form[f.key];

  const save = async () => {
    const selectFields = fields.filter((f) => f.type === "select" && !f.optional);
    const hasMissing = selectFields.some((f) => !form[f.key]);
    if (hasMissing) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(selectFields.map((f) => [f.key, true])) }));
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.key] !== "" && payload[f.key] != null)
          payload[f.key] = Number(payload[f.key]);
        if (payload[f.key] === "") delete payload[f.key];
      });
      const url = editId
        ? `/api/pricing-master/${resource}/${editId}`
        : `/api/pricing-master/${resource}`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(j?.message) ? j.message.join(", ") : j?.message || "Save failed");
      }
      toast.success(editId ? "Updated" : "Added — new rate is live immediately");
      setOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    try {
      await fetch(`/api/pricing-master/${resource}/${deleteId}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Deleted");
      setConfirmOpen(false); setDeleteId(null); fetchData();
    } catch { toast.error("Delete failed"); }
  };

  const handleExportCsv = () => {
    if (!list.length) {
      toast.error("Nothing to export — this master has no rows yet");
      return;
    }
    const csv = buildCsv(fields, list);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${resource}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const csvRows = parseCsvText(text);
      if (!csvRows.length) throw new Error("No rows found in that file");
      const items = rowsToItems(csvRows, fields);

      const res = await fetch(`/api/pricing-master/${resource}/bulk`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ items }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(json?.message) ? json.message.join(", ") : json?.message || "Import failed"
        );
      }
      const created = Array.isArray(json?.data) ? json.data.length : items.length;
      toast.success(`Imported ${created} row${created === 1 ? "" : "s"} — live immediately`);
      fetchData();
    } catch (e) {
      toast.error(e.message || "Import failed — check the file and try again");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <Page>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline" size="md" onClick={handleExportCsv}>
              <Download className="size-4" /> Export CSV
            </Button>
            {can("pricing", "create") && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {importing ? "Importing…" : "Import CSV"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleImportFile(e.target.files?.[0])}
                />
                <Button variant="primary" size="md" onClick={openAdd}>
                  <Plus className="size-4" /> Add Rate
                </Button>
              </>
            )}
          </>
        }
      />

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No rates configured yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add the first row for this master — it goes live for the pricing
            engine immediately.
          </p>
          {can("pricing", "create") && (
            <Button variant="primary" onClick={openAdd}>
              <Plus className="size-4" /> Add Rate
            </Button>
          )}
        </div>
      ) : (
        <ListWithCardToggle
          title={title}
          titleAs="none"
          data={visible}
          columns={tableColumns}
          filterFunction={filterFunction}
          filterDropdownProps={filterDropdownProps}
          filterActions={
            <>
              {hasCaratBand && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Carat (e.g. 0.03)"
                  value={filters.carat}
                  onChange={(e) => setFilters((f) => ({ ...f, carat: e.target.value }))}
                  className="w-40"
                  title="Show rows whose carat band contains this weight"
                  aria-label="Filter by carat"
                />
              )}
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="size-4" /> Clear
                </Button>
              )}
            </>
          }
          resizableColumns
          bulkActions={
            can("pricing", "delete")
              ? [
                  {
                    key: "delete",
                    label: "Delete",
                    variant: "destructive",
                    confirmMessage:
                      "Delete the selected rate(s)? This cannot be undone.",
                    onRun: async (rows) => {
                      await handleBulkDelete(rows.map((r) => r.id));
                    },
                  },
                ]
              : []
          }
        />
      )}

      <Sheet open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <SheetContent side="right" className="w-[92%] md:max-w-[50vw] lg:max-w-[34vw] inset-4 start-auto h-auto rounded-lg p-0">
          <SheetHeader className="border-b py-3.5 px-5 border-border">
            <SheetTitle>{editId ? "Edit" : "Add"} {title}</SheetTitle>
          </SheetHeader>
          <SheetBody className="px-5 py-4 space-y-4 max-h-[70vh] overflow-auto">
            {fields.map((f) => {
              const invalid = isFieldInvalid(f);
              return (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
                  {f.type === "select" ? (
                    <>
                      <Select
                        value={form[f.key] ? form[f.key] : "__any__"}
                        onValueChange={(v) => setForm((s) => ({ ...s, [f.key]: v === "__any__" ? "" : v }))}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) setTouched((t) => ({ ...t, [f.key]: true }));
                        }}
                      >
                        <SelectTrigger id={`field-${f.key}`} aria-invalid={invalid || undefined}>
                          <SelectValue placeholder={`Select${f.optional ? " (any)" : ""}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {f.optional && <SelectItem value="__any__">Any</SelectItem>}
                          {(f.optionsKind ? catalogOptions[f.optionsKind] || [] : f.options)
                            .filter((o) => o !== "")
                            .map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {f.optionsKind && catalogLoading[f.optionsKind] && (
                        <p className="text-[11px] text-muted-foreground">Loading options…</p>
                      )}
                      {invalid && (
                        <p className="text-xs text-destructive">{f.label} is required</p>
                      )}
                    </>
                  ) : f.type === "multiselect" ? (
                    <>
                      <MultiSelectChips
                        options={catalogOptions[f.optionsKind] || []}
                        loading={!!catalogLoading[f.optionsKind]}
                        value={form[f.key]}
                        onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Select one or more — matches if the product has ANY of these. Leave empty to match any quality.
                      </p>
                    </>
                  ) : (
                    <Input
                      id={`field-${f.key}`}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      step={f.type === "number" ? "any" : undefined}
                      value={form[f.key] ?? ""}
                      placeholder={f.placeholder || ""}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              );
            })}
            <div className="space-y-1.5">
              <Label htmlFor="field-status">Status</Label>
              <Select
                value={form.status ?? "active"}
                onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}
              >
                <SelectTrigger id="field-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SheetBody>
          <SheetFooter className="border-t px-5 py-3 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        title="Delete Rate"
        message="Remove this rate? History is preserved by effective dates; deleting removes the row entirely."
      />
    </Page>
  );
}
