"use client";
// Bill of Materials editor — versioned weight curves (carat→grams) + ring-size delta.
// This is the engineering source of truth pricing reads from.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Section,
  Grid,
  Field,
  Select,
  Input,
  Textarea,
  Button,
  authHeaders,
} from "@/components/commonPages/Catalog/_ui";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";

const STATUS_OPTIONS = ["draft", "review", "approved", "obsolete"];

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  obsolete: "bg-rose-100 text-rose-700",
};

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

  const load = async () => {
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
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === boms.length ? new Set() : new Set(boms.map((b) => b.id))
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
  }, []);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setCurveRows([{ carat: "", weightG: "" }]);
    setEditorOpen(true);
  };

  const openEdit = (bom) => {
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
  };

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

  const requestRemove = (bom) => setPendingDelete(bom);
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

  const curvePointCount = (curve) =>
    curve && typeof curve === "object" ? Object.keys(curve).length : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--primary)]">
            Bill of Materials
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Versioned weight curves (carat→grams) + ring-size delta. Drives the
            configurator &amp; pricing.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-[var(--primary)] hover:bg-[#091930] text-white"
        >
          New BOM Revision
        </Button>
      </div>

      {/* Editor */}
      {editorOpen && (
        <Section title={editingId ? "Edit BOM Revision" : "New BOM Revision"}>
          <div className="space-y-5">
            <Grid cols={3}>
              <Field
                label="Master Code"
                hint="Product code this BOM applies to, e.g. LR-001-RND"
              >
                <Input
                  value={form.masterCode}
                  onChange={set("masterCode")}
                  placeholder="LR-001-RND"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={set("status")}
                  options={STATUS_OPTIONS}
                />
              </Field>
              <Field label="Effective Date">
                <Input
                  type="date"
                  value={form.effectiveDate}
                  onChange={set("effectiveDate")}
                />
              </Field>

              <Field
                label="Base Ring Size"
                hint="Reference size for the weight curve"
              >
                <Input
                  type="number"
                  step="0.5"
                  value={form.baseRingSize}
                  onChange={set("baseRingSize")}
                />
              </Field>
              <Field
                label="Ring-size Δ per size (g)"
                hint="Grams added/removed per ring size step"
              >
                <Input
                  type="number"
                  step="0.01"
                  value={form.ringSizeDeltaPerSize}
                  onChange={set("ringSizeDeltaPerSize")}
                  placeholder="0.05"
                />
              </Field>
              <Field label="Metal Loss %" hint="Casting / finishing loss">
                <Input
                  type="number"
                  step="0.1"
                  value={form.metalLossPct}
                  onChange={set("metalLossPct")}
                  placeholder="8"
                />
              </Field>

              <Field label="Labor Minutes">
                <Input
                  type="number"
                  step="1"
                  value={form.laborMinutes}
                  onChange={set("laborMinutes")}
                  placeholder="45"
                />
              </Field>
              <Field label="CAD Version">
                <Input
                  value={form.cadVersion}
                  onChange={set("cadVersion")}
                  placeholder="v1.2"
                />
              </Field>
              <Field label="Mold Version">
                <Input
                  value={form.moldVersion}
                  onChange={set("moldVersion")}
                  placeholder="M-04"
                />
              </Field>
            </Grid>

            {/* Weight curve */}
            <div className="rounded-lg border border-border">
              <div className="flex items-center justify-between bg-muted/60 px-4 py-2.5 rounded-t-lg">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--primary)]">
                    Weight Curve
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Carat (ct) → metal weight (g). Pricing interpolates across
                    these points.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCurveRow}
                  className="text-xs font-medium text-[var(--primary)] hover:text-[#091930]"
                >
                  + Add point
                </button>
              </div>
              <div className="p-4 space-y-2">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-3 px-1 text-[11px] font-medium text-muted-foreground">
                  <span>Carat (ct)</span>
                  <span>Weight (g)</span>
                  <span className="w-16 text-right">Remove</span>
                </div>
                {curveRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
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
                    <button
                      type="button"
                      onClick={() => removeCurveRow(idx)}
                      disabled={curveRows.length <= 1}
                      aria-disabled={curveRows.length <= 1}
                      aria-label={`Remove curve point ${idx + 1}`}
                      className="w-16 text-xs text-rose-600 hover:text-rose-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:text-muted-foreground text-right pr-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Field label="Manufacturing Notes" full>
              <Textarea
                rows={3}
                value={form.manufacturingNotes}
                onChange={set("manufacturingNotes")}
                placeholder="Casting tree layout, stone-setting sequence, QC checkpoints…"
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={closeEditor}
                className="px-3 py-2 text-sm rounded-md border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <Button
                onClick={save}
                disabled={saving}
                className="bg-[var(--primary)] hover:bg-[#091930] text-white"
              >
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update Revision"
                    : "Create Revision"}
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <button
            type="button"
            onClick={() => setBulkConfirmOpen(true)}
            className="ms-auto rounded-md border border-rose-200 bg-white dark:bg-card px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--primary)] text-white text-left">
                <th scope="col" className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={boms.length > 0 && selectedIds.size === boms.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer"
                    aria-label="Select all"
                  />
                </th>
                <th scope="col" className="px-4 py-3 font-medium">Master Code</th>
                <th scope="col" className="px-4 py-3 font-medium">Rev</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium"># Curve points</th>
                <th scope="col" className="px-4 py-3 font-medium">Loss %</th>
                <th scope="col" className="px-4 py-3 font-medium">Labor min</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading BOMs…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-rose-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : boms.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No BOMs yet. Create your first revision.
                  </td>
                </tr>
              ) : (
                boms.map((bom, i) => (
                  <tr
                    key={bom.id ?? i}
                    className={i % 2 === 0 ? "bg-white dark:bg-card" : "bg-muted/40"}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(bom.id)}
                        onChange={() => toggleSelectRow(bom.id)}
                        className="h-4 w-4 cursor-pointer"
                        aria-label="Select row"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--primary)]">
                      {bom.masterCode || "—"}
                    </td>
                    <td className="px-4 py-3">{bom.revNo ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                          STATUS_STYLES[bom.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {bom.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {curvePointCount(bom.weightCurve)}
                    </td>
                    <td className="px-4 py-3">
                      {bom.metalLossPct == null ? "—" : bom.metalLossPct}
                    </td>
                    <td className="px-4 py-3">
                      {bom.laborMinutes == null ? "—" : bom.laborMinutes}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(bom)}
                          aria-label={`Edit BOM ${bom.masterCode || ""} revision ${bom.revNo ?? ""}`}
                          className="text-xs font-medium text-[var(--primary)] hover:text-[#091930]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestRemove(bom)}
                          aria-label={`Delete BOM ${bom.masterCode || ""} revision ${bom.revNo ?? ""}`}
                          className="text-xs font-medium text-rose-600 hover:text-rose-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
}
