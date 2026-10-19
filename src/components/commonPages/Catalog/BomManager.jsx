"use client";
// Bill of Materials editor — versioned weight curves (carat→grams) + ring-size delta.
// This is the engineering source of truth pricing reads from.
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Skeleton } from "@/components/common/ui/skeleton";
import { TruncatedText } from "@/components/common/ui/short-id";
import { Textarea } from "@/components/common/ui/textarea";
import { authHeaders } from "@/components/commonPages/Catalog/_ui";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["draft", "review", "approved", "obsolete"];

const emptyForm = () => ({
  masterCode: "",
  status: "draft",
  baseRingSize: 6,
  ringSizeDeltaPerSize: "",
  metalLossPct: "",
  laborMinutes: "",
  cadVersion: "",
  moldVersion: "",
  manufacturingNotes: "",
  effectiveDate: "",
});

// Expand a weightCurve object { "0.50": 3.2 } back into editable rows.
const curveToRows = (curve) => {
  if (!curve || typeof curve !== "object") return [{ carat: "", weightG: "" }];
  const rows = Object.entries(curve)
    .map(([carat, weightG]) => ({ carat, weightG }))
    .sort((a, b) => Number(a.carat) - Number(b.carat));
  return rows.length ? rows : [{ carat: "", weightG: "" }];
};

const curvePointCount = (curve) =>
  curve && typeof curve === "object" ? Object.keys(curve).length : 0;

// Small labelled field wrapper: shared Label + optional hint.
function FormField({ label, htmlFor, hint, children, className }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export default function BomManager() {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [curveRows, setCurveRows] = useState([{ carat: "", weightG: "" }]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/catalog/boms", { cache: "no-store" });
      const data = await res.json();
      setBoms(Array.isArray(data) ? data : []);
      setSelectedIds(new Set());
    } catch (e) {
      setError("Failed to load BOMs.");
      setBoms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectionChange = useCallback((selectedRows) => {
    setSelectedIds(new Set((selectedRows || []).map((row) => row.id)));
  }, []);

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/catalog/boms/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
          })
        )
      );
      toast.success(`${selectedIds.size} BOM revision(s) deleted.`);
      setSelectedIds(new Set());
      await load();
    } catch (e) {
      toast.error(e.message || "Failed to delete selected BOMs.");
    } finally {
      setBulkDeleting(false);
      setBulkConfirmOpen(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setCurveRows([{ carat: "", weightG: "" }]);
    setEditorOpen(true);
  };

  const openEdit = useCallback((bom) => {
    setEditingId(bom.id);
    setForm({
      masterCode: bom.masterCode ?? "",
      status: bom.status ?? "draft",
      baseRingSize: bom.baseRingSize ?? 6,
      ringSizeDeltaPerSize: bom.ringSizeDeltaPerSize ?? "",
      metalLossPct: bom.metalLossPct ?? "",
      laborMinutes: bom.laborMinutes ?? "",
      cadVersion: bom.cadVersion ?? "",
      moldVersion: bom.moldVersion ?? "",
      manufacturingNotes: bom.manufacturingNotes ?? "",
      effectiveDate: bom.effectiveDate
        ? String(bom.effectiveDate).slice(0, 10)
        : "",
    });
    setCurveRows(curveToRows(bom.weightCurve));
    setEditorOpen(true);
  }, []);

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
  };

  // ── Weight curve rows ──────────────────────────────────────────────────────
  const setCurveRow = (idx, key) => (e) => {
    const v = e?.target ? e.target.value : e;
    setCurveRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [key]: v } : r))
    );
  };
  const addCurveRow = () =>
    setCurveRows((rows) => [...rows, { carat: "", weightG: "" }]);
  const removeCurveRow = (idx) =>
    setCurveRows((rows) =>
      rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows
    );

  const buildCurve = () => {
    const curve = {};
    for (const r of curveRows) {
      if (r.carat === "" || r.carat === null || r.weightG === "") continue;
      const ct = Number(r.carat);
      const g = Number(r.weightG);
      if (Number.isNaN(ct) || Number.isNaN(g)) continue;
      curve[ct.toFixed(2)] = g;
    }
    return curve;
  };

  const save = async () => {
    if (!form.masterCode.trim()) {
      toast.error("Master Code is required.");
      return;
    }
    const weightCurve = buildCurve();
    const payload = {
      masterCode: form.masterCode.trim(),
      status: form.status,
      weightCurve,
      baseRingSize:
        form.baseRingSize === "" ? null : Number(form.baseRingSize),
      ringSizeDeltaPerSize:
        form.ringSizeDeltaPerSize === ""
          ? null
          : Number(form.ringSizeDeltaPerSize),
      metalLossPct: form.metalLossPct === "" ? null : Number(form.metalLossPct),
      laborMinutes: form.laborMinutes === "" ? null : Number(form.laborMinutes),
      cadVersion: form.cadVersion || null,
      moldVersion: form.moldVersion || null,
      manufacturingNotes: form.manufacturingNotes || null,
      effectiveDate: form.effectiveDate || null,
    };

    setSaving(true);
    try {
      const url = editingId
        ? `/api/catalog/boms/${editingId}`
        : "/api/catalog/boms";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Save failed");
      }
      toast.success(
        editingId ? "BOM revision updated." : "BOM revision created."
      );
      closeEditor();
      await load();
    } catch (e) {
      toast.error(e.message || "Failed to save BOM.");
    } finally {
      setSaving(false);
    }
  };

  const requestRemove = useCallback((bom) => setPendingDelete(bom), []);
  const cancelRemove = () => {
    if (deleting) return;
    setPendingDelete(null);
  };

  const confirmRemove = async () => {
    const bom = pendingDelete;
    if (!bom) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/catalog/boms/${bom.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("BOM deleted.");
      setPendingDelete(null);
      await load();
    } catch (e) {
      toast.error(e.message || "Failed to delete BOM.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 48,
        meta: { headerTitle: "Select" },
      },
      {
        id: "masterCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Master Code" column={column} />
        ),
        accessorFn: (row) => row.masterCode,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.masterCode}
            className="font-medium text-foreground"
          />
        ),
        size: 200,
        meta: { headerTitle: "Master Code", identity: true, truncate: true },
      },
      {
        id: "revNo",
        header: ({ column }) => (
          <DataGridColumnHeader title="Rev" column={column} />
        ),
        accessorFn: (row) => row.revNo,
        cell: ({ row }) => <span>{row.original.revNo ?? "—"}</span>,
        size: 90,
        meta: { headerTitle: "Rev" },
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
        id: "curvePoints",
        header: ({ column }) => (
          <DataGridColumnHeader title="# Curve points" column={column} />
        ),
        accessorFn: (row) => curvePointCount(row.weightCurve),
        cell: ({ row }) => (
          <span>{curvePointCount(row.original.weightCurve)}</span>
        ),
        size: 130,
        meta: { headerTitle: "# Curve points" },
      },
      {
        id: "metalLossPct",
        header: ({ column }) => (
          <DataGridColumnHeader title="Loss %" column={column} />
        ),
        accessorFn: (row) => row.metalLossPct,
        cell: ({ row }) => (
          <span>{row.original.metalLossPct == null ? "—" : row.original.metalLossPct}</span>
        ),
        size: 100,
        meta: { headerTitle: "Loss %" },
      },
      {
        id: "laborMinutes",
        header: ({ column }) => (
          <DataGridColumnHeader title="Labor min" column={column} />
        ),
        accessorFn: (row) => row.laborMinutes,
        cell: ({ row }) => (
          <span>{row.original.laborMinutes == null ? "—" : row.original.laborMinutes}</span>
        ),
        size: 110,
        meta: { headerTitle: "Labor min" },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              mode="icon"
              variant="outline"
              aria-label={`Edit BOM ${row.original.masterCode || ""} revision ${row.original.revNo ?? ""}`}
              title="Edit BOM revision"
              onClick={(event) => {
                event.stopPropagation();
                openEdit(row.original);
              }}
            >
              <Pencil />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              aria-label={`Delete BOM ${row.original.masterCode || ""} revision ${row.original.revNo ?? ""}`}
              title="Delete BOM revision"
              onClick={(event) => {
                event.stopPropagation();
                requestRemove(row.original);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 104,
        meta: { headerTitle: "Actions" },
      },
    ],
    [openEdit, requestRemove]
  );

  const filterFunction = useCallback((data, query) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((row) =>
      [row.masterCode, row.status, row.revNo].some((field) =>
        String(field ?? "").toLowerCase().includes(needle)
      )
    );
  }, []);

  return (
    <Page>
      <PageHeader
        title="Bill of Materials"
        description="Versioned weight curves (carat→grams) + ring-size delta. Drives the configurator & pricing."
        actions={
          <Button type="button" onClick={openNew}>
            <Plus className="size-4" />
            New BOM Revision
          </Button>
        }
      />

      {/* Editor */}
      {editorOpen && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold text-foreground">
                {editingId ? "Edit BOM Revision" : "New BOM Revision"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Weight curve, ring-size delta and the manufacturing details for
                this revision.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={closeEditor}
              aria-label="Close editor"
              title="Close editor"
            >
              <X />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  label="Master Code"
                  htmlFor="bom-master-code"
                  hint="Product code this BOM applies to, e.g. LR-001-RND"
                >
                  <Input
                    id="bom-master-code"
                    value={form.masterCode}
                    onChange={set("masterCode")}
                    placeholder="LR-001-RND"
                  />
                </FormField>
                <FormField label="Status" htmlFor="bom-status">
                  <Select
                    value={form.status}
                    onValueChange={(value) => set("status")(value)}
                  >
                    <SelectTrigger id="bom-status" className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Effective Date" htmlFor="bom-effective-date">
                  <Input
                    id="bom-effective-date"
                    type="date"
                    value={form.effectiveDate}
                    onChange={set("effectiveDate")}
                  />
                </FormField>

                <FormField
                  label="Base Ring Size"
                  htmlFor="bom-base-ring-size"
                  hint="Reference size for the weight curve"
                >
                  <Input
                    id="bom-base-ring-size"
                    type="number"
                    step="0.5"
                    value={form.baseRingSize}
                    onChange={set("baseRingSize")}
                  />
                </FormField>
                <FormField
                  label="Ring-size Δ per size (g)"
                  htmlFor="bom-ring-size-delta"
                  hint="Grams added/removed per ring size step"
                >
                  <Input
                    id="bom-ring-size-delta"
                    type="number"
                    step="0.01"
                    value={form.ringSizeDeltaPerSize}
                    onChange={set("ringSizeDeltaPerSize")}
                    placeholder="0.05"
                  />
                </FormField>
                <FormField
                  label="Metal Loss %"
                  htmlFor="bom-metal-loss"
                  hint="Casting / finishing loss"
                >
                  <Input
                    id="bom-metal-loss"
                    type="number"
                    step="0.1"
                    value={form.metalLossPct}
                    onChange={set("metalLossPct")}
                    placeholder="8"
                  />
                </FormField>

                <FormField label="Labor Minutes" htmlFor="bom-labor-minutes">
                  <Input
                    id="bom-labor-minutes"
                    type="number"
                    step="1"
                    value={form.laborMinutes}
                    onChange={set("laborMinutes")}
                    placeholder="45"
                  />
                </FormField>
                <FormField label="CAD Version" htmlFor="bom-cad-version">
                  <Input
                    id="bom-cad-version"
                    value={form.cadVersion}
                    onChange={set("cadVersion")}
                    placeholder="v1.2"
                  />
                </FormField>
                <FormField label="Mold Version" htmlFor="bom-mold-version">
                  <Input
                    id="bom-mold-version"
                    value={form.moldVersion}
                    onChange={set("moldVersion")}
                    placeholder="M-04"
                  />
                </FormField>
              </div>

              {/* Weight curve */}
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Weight Curve
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Carat (ct) → metal weight (g). Pricing interpolates across
                      these points.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCurveRow}
                  >
                    <Plus className="size-4" />
                    Add point
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="hidden gap-3 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_1fr_auto]">
                    <span>Carat (ct)</span>
                    <span>Weight (g)</span>
                    <span className="w-16 text-right">Remove</span>
                  </div>
                  {curveRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_1fr_auto] items-center gap-3"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        value={row.carat}
                        onChange={setCurveRow(idx, "carat")}
                        placeholder="0.50"
                        aria-label={`Carat (ct), point ${idx + 1}`}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={row.weightG}
                        onChange={setCurveRow(idx, "weightG")}
                        placeholder="3.20"
                        aria-label={`Weight (g), point ${idx + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        onClick={() => removeCurveRow(idx)}
                        disabled={curveRows.length <= 1}
                        aria-disabled={curveRows.length <= 1}
                        aria-label={`Remove curve point ${idx + 1}`}
                        title={`Remove curve point ${idx + 1}`}
                        className="w-16 justify-self-end"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <FormField
                label="Manufacturing Notes"
                htmlFor="bom-manufacturing-notes"
              >
                <Textarea
                  id="bom-manufacturing-notes"
                  rows={3}
                  value={form.manufacturingNotes}
                  onChange={set("manufacturingNotes")}
                  placeholder="Casting tree layout, stone-setting sequence, QC checkpoints…"
                />
              </FormField>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  Cancel
                </Button>
                <Button type="button" onClick={save} disabled={saving}>
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Update Revision"
                      : "Create Revision"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="ms-auto"
            onClick={() => setBulkConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      )}

      {/* BOM list */}
      {loading ? (
        <Card>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : (
        <ListWithCardToggle
          title="BOM revisions"
          titleAs="none"
          data={boms}
          columns={columns}
          filterFunction={filterFunction}
          resizableColumns
          onSelectionChange={handleSelectionChange}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={cancelRemove}
        onConfirm={confirmRemove}
        title="Delete BOM Revision"
        message={
          pendingDelete
            ? `Delete BOM ${pendingDelete.masterCode || ""} rev ${
                pendingDelete.revNo ?? "?"
              }? This cannot be undone.`
            : ""
        }
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete selected BOM revisions"
        message={`Delete ${selectedIds.size} selected BOM revision(s)? This cannot be undone.`}
        confirmLabel={bulkDeleting ? "Deleting…" : "Delete"}
      />
    </Page>
  );
}
