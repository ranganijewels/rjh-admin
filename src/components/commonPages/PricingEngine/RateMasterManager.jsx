"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Plus, Pencil, Trash2, Upload, Download, Loader2, ArrowUp, ArrowDown, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import {
  Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/common/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/common/ui/select";
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
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isSel
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {opt}
          </button>
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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
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
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filters + sorting (client-side; masters are at most a few thousand rows)
  const [filters, setFilters] = useState({ search: "", status: "", carat: "" });
  const [sort, setSort] = useState({ key: null, dir: "asc" });
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
    const q = filters.search.trim().toLowerCase();
    const ct = Number(filters.carat);
    let rows = list.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (q && !columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q))) return false;
      if (hasCaratBand && filters.carat !== "" && Number.isFinite(ct) && !(ct >= Number(r.minCarat) && ct <= Number(r.maxCarat))) return false;
      for (const c of filterCols) {
        const want = filters[c.key];
        // A blank master value is a wildcard, so it matches any filter value.
        if (want && splitVals(r[c.key]).length && !splitVals(r[c.key]).map((x) => x.toLowerCase()).includes(want.toLowerCase())) return false;
      }
      return true;
    });
    if (sort.key) {
      const dir = sort.dir === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        const an = Number(av), bn = Number(bv);
        if (av !== "" && bv !== "" && av != null && bv != null && Number.isFinite(an) && Number.isFinite(bn)) return (an - bn) * dir;
        return String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true }) * dir;
      });
    }
    return rows;
  }, [list, filters, sort, columns, filterCols, hasCaratBand]);
  const toggleSort = (key) =>
    setSort((s) => (s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : { key: null, dir: "asc" }));
  const filtersActive = filters.search || filters.status || filters.carat !== "" || filterCols.some((c) => filters[c.key]);

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === visible.length ? new Set() : new Set(visible.map((r) => r.id))
    );
  };
  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = [...selectedIds];
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
      setSelectedIds(new Set());
    } catch (e) {
      toast.error(e.message || "Failed to delete selected rates");
    } finally {
      // Always refresh, even on failure — a partial delete (or none at all)
      // should still show the admin the current, real state of the table.
      fetchData();
      setBulkDeleting(false);
      setBulkConfirmOpen(false);
    }
  };

  const blank = () =>
    fields.reduce((a, f) => ({ ...a, [f.key]: f.default ?? "" }), { status: "active" });

  const openAdd = () => { setForm(blank()); setEditId(null); setTouched({}); setOpen(true); };
  const openEdit = (row) => {
    const f = {};
    fields.forEach((fl) => {
      f[fl.key] = fl.type === "date" && row[fl.key]
        ? new Date(row[fl.key]).toISOString().slice(0, 10)
        : row[fl.key] ?? "";
    });
    f.status = row.status ?? "active";
    setForm(f); setEditId(row.id); setTouched({}); setOpen(true);
  };

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

  if (loading) return <ContentLoader />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            {can("pricing", "create") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
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
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add Rate
                </Button>
              </>
            )}
          </div>
        }
      />

      {can("pricing", "delete") && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            variant="outline"
            size="sm"
            className="ms-auto text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setBulkConfirmOpen(true)}
          >
            Delete
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <Input
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="w-48"
        />
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
          />
        )}
        {filterCols.map((c) => (
          <select
            key={c.key}
            value={filters[c.key] || ""}
            onChange={(e) => setFilters((f) => ({ ...f, [c.key]: e.target.value }))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            aria-label={`Filter by ${c.label}`}
          >
            <option value="">All {c.label}</option>
            {c.values.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ))}
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ search: "", status: "", carat: "" })}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
        <span className="ms-auto text-xs text-muted-foreground">
          Showing {visible.length} of {list.length}
        </span>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3 font-medium w-10">
                <input
                  type="checkbox"
                  checked={visible.length > 0 && selectedIds.size === visible.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              {columns.map((c) => (
                <th key={c.key} className="p-3 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-foreground">
                    {c.label}
                    {sort.key === c.key ? (
                      sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              <th className="p-3 font-medium text-center">
                <button type="button" onClick={() => toggleSort("status")} className="inline-flex items-center gap-1">
                  Status {sort.key === "status" ? (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelectRow(row.id)}
                    className="h-4 w-4 cursor-pointer"
                    aria-label="Select row"
                  />
                </td>
                {columns.map((c) => (
                  <td key={c.key} className="p-3 whitespace-nowrap">{fmt(row[c.key], c.type)}</td>
                ))}
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}>{row.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    {can("pricing", "edit") && (
                      <Button variant="outline" mode="icon" size="sm" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {can("pricing", "delete") && (
                      <Button variant="outline" mode="icon" size="sm" onClick={() => { setDeleteId(row.id); setConfirmOpen(true); }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={columns.length + 3} className="p-6 text-center text-muted-foreground">
                {list.length ? "No rates match these filters." : "No rates configured yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

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
                  <label htmlFor={`field-${f.key}`} className="text-sm font-medium">{f.label}</label>
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
              <label htmlFor="field-status" className="text-sm font-medium">Status</label>
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
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
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

      <ConfirmDialog
        open={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete selected rates"
        message={`Delete ${selectedIds.size} selected rate(s)? This cannot be undone.`}
        confirmLabel={bulkDeleting ? "Deleting…" : "Delete"}
      />
    </div>
  );
}
