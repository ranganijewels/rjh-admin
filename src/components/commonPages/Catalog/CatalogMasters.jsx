"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

// Known kinds rendered as the top pill row. Admin can still create values for
// brand-new kinds via the API, but these cover the standard reference data.
const KINDS = [
  { value: "diamond_shape", label: "Diamond Shapes" },
  { value: "metal_type", label: "Metal Types" },
  { value: "metal_purity", label: "Metal Purities" },
  { value: "metal_color", label: "Metal Colors" },
  { value: "diamond_quality", label: "Diamond Qualities" },
  { value: "setting_type", label: "Setting Types" },
];

const EMPTY_FORM = {
  code: "",
  name: "",
  sortOrder: 0,
  seoSlug: "",
  synonyms: "",
  metadataNote: "",
  status: "active",
};

const NAVY = "#162640";

function parseSynonyms(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CatalogMasters() {
  const [kind, setKind] = useState(KINDS[0].value);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const kindLabel = useMemo(
    () => KINDS.find((k) => k.value === kind)?.label ?? kind,
    [kind]
  );

  const loadList = useCallback(async (k) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/catalog/masters?kind=${encodeURIComponent(k)}&all=true`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load values");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList(kind);
  }, [kind, loadList]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPanelOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      code: row.code ?? "",
      name: row.name ?? "",
      sortOrder: Number(row.sortOrder ?? 0),
      seoSlug: row.seoSlug ?? "",
      synonyms: Array.isArray(row.synonyms) ? row.synonyms.join(", ") : "",
      metadataNote: row?.metadata?.note ?? "",
      status: row.status ?? "active",
    });
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const setField = (key) => (e) => {
    const val = e?.target?.value ?? e;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Code and Name are required.");
      return;
    }
    setSaving(true);
    const metadata = form.metadataNote?.trim()
      ? { note: form.metadataNote.trim() }
      : {};
    const payload = {
      kind,
      code: form.code.trim(),
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      seoSlug: form.seoSlug?.trim() || undefined,
      synonyms: parseSynonyms(form.synonyms),
      metadata,
      status: form.status || "active",
    };
    try {
      const url = editingId
        ? `/api/catalog/masters/${editingId}`
        : `/api/catalog/masters`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `Save failed (${res.status})`);
      }
      toast.success(editingId ? "Value updated." : "Value added.");
      closePanel();
      loadList(kind);
    } catch (err) {
      toast.error(err?.message || "Failed to save value.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete "${row.name || row.code}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/catalog/masters/${row.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `Delete failed (${res.status})`);
      }
      toast.success("Value deleted.");
      loadList(kind);
    } catch (err) {
      toast.error(err?.message || "Failed to delete value.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold" style={{ color: NAVY }}>
          Catalog Masters
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Shapes, metals, purities &amp; more — fully admin-extensible (no code
          changes).
        </p>
      </div>

      {/* Kind pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {KINDS.map((k) => {
          const active = k.value === kind;
          return (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className="rounded-full px-4 py-1.5 text-sm font-medium border transition-colors"
              style={
                active
                  ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                  : {
                      backgroundColor: "#fff",
                      color: NAVY,
                      borderColor: "#e5e7eb",
                    }
              }
            >
              {k.label}
            </button>
          );
        })}
      </div>

      <Section
        title={kindLabel}
        action={
          <button
            type="button"
            onClick={openAdd}
            className="rounded-md px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#091930]"
            style={{ backgroundColor: NAVY }}
          >
            + Add Value
          </button>
        }
      >
        {/* Inline add/edit panel */}
        {panelOpen && (
          <form
            onSubmit={handleSave}
            className="mb-5 rounded-lg border border-gray-200 bg-gray-50/60 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold" style={{ color: NAVY }}>
                {editingId ? "Edit Value" : `Add ${kindLabel.replace(/s$/, "")}`}
              </h4>
              <button
                type="button"
                onClick={closePanel}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <Grid cols={3}>
              <Field label="Code">
                <Input
                  value={form.code}
                  onChange={setField("code")}
                  placeholder="e.g. round"
                />
              </Field>
              <Field label="Name">
                <Input
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="e.g. Round Brilliant"
                />
              </Field>
              <Field label="Sort Order">
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={setField("sortOrder")}
                  placeholder="0"
                />
              </Field>
              <Field label="SEO Slug">
                <Input
                  value={form.seoSlug}
                  onChange={setField("seoSlug")}
                  placeholder="round-brilliant"
                />
              </Field>
              <Field
                label="Synonyms"
                hint="Comma-separated (e.g. brilliant, rd)"
              >
                <Input
                  value={form.synonyms}
                  onChange={setField("synonyms")}
                  placeholder="brilliant, rd"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={setField("status")}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </Field>
              <Field label="Metadata Note (optional)" full>
                <Textarea
                  value={form.metadataNote}
                  onChange={setField("metadataNote")}
                  placeholder="Any free-form note stored in metadata"
                  rows={2}
                />
              </Field>
            </Grid>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50 hover:bg-[#091930] disabled:hover:bg-[#162640]"
                style={{ backgroundColor: NAVY }}
              >
                {saving ? "Saving…" : editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#162640] text-white text-left">
                <th className="px-4 py-2.5 font-medium">Code</th>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Sort</th>
                <th className="px-4 py-2.5 font-medium">Synonyms</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No values yet. Click “Add Value” to create one.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={row.id ?? `${row.code}-${i}`}
                    className={i % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {row.code}
                    </td>
                    <td className="px-4 py-2.5">{row.name}</td>
                    <td className="px-4 py-2.5">{row.sortOrder ?? 0}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {Array.isArray(row.synonyms) && row.synonyms.length
                        ? row.synonyms.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.status === "inactive"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {row.status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="text-sm font-medium hover:underline"
                          style={{ color: NAVY }}
                        >
                          Edit
                        </button>
                        <span className="text-border" role="presentation" aria-hidden="true">|</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-sm font-medium text-red-600 hover:underline"
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
      </Section>
    </div>
  );
}
