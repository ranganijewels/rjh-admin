"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Section,
  Grid,
  Field,
  Select,
  Input,
  Textarea,
  authHeaders,
} from "@/components/commonPages/Catalog/_ui";

// Known kinds rendered as the top pill row. Admin can still create values for
// brand-new kinds via the API, but these cover the standard reference data.
const KINDS = [
  { value: "diamond_shape", label: "Diamond Shapes" },
  { value: "metal_type", label: "Metal Types" },
  { value: "metal_purity", label: "KT / Purity Master" },
  { value: "metal_color", label: "Metal Colors" },
  { value: "diamond_quality", label: "Diamond Qualities" },
  { value: "setting_type", label: "Setting Types" },
  { value: "category", label: "Categories" },
  { value: "style", label: "Styles" },
  { value: "collection", label: "Collections (tag)" },
  { value: "component_type", label: "BOM Components" },
  { value: "stone_type", label: "Stone Types" },
  { value: "diamond_color", label: "Diamond Colors" },
];

const METALS = ["GOLD", "SILVER", "PLATINUM"];

const EMPTY_FORM = {
  code: "",
  name: "",
  sortOrder: 0,
  seoSlug: "",
  synonyms: "",
  metadataNote: "",
  status: "active",
  // kind-specific metadata fields
  hex: "",
  hex2: "",
  twoTone: false,
  iconUrl: "",
  pricingFactor: "",
  applicableMetals: [],
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

// Round color swatch; renders a diagonal split when a second hex is set (two-tone).
export function ColorSwatch({ hex, hex2, size = 22 }) {
  const style = hex2
    ? { background: `linear-gradient(135deg, ${hex || "#ccc"} 50%, ${hex2} 50%)` }
    : { background: hex || "#ccc" };
  return (
    <span
      className="inline-block rounded-full border border-gray-300 align-middle"
      style={{ width: size, height: size, ...style }}
      title={hex2 ? `${hex} / ${hex2}` : hex}
    />
  );
}

// Small inline image uploader for shape icons (reuses the product upload API).
function IconUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/product-management/upload", {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json?.error || "Upload failed");
      onChange(json.url);
      toast.success("Icon uploaded");
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-14 h-14 rounded-md border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
        title="Upload icon"
      >
        {uploading ? (
          <span className="text-[10px] text-muted-foreground">…</span>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="icon" className="w-full h-full object-contain" />
        ) : (
          <span className="text-xl text-gray-400">+</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image/SVG URL"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-600 hover:underline mt-1"
          >
            Remove icon
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function MetalChecks({ value, onChange }) {
  const toggle = (m) =>
    onChange(value.includes(m) ? value.filter((v) => v !== m) : [...value, m]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {METALS.map((m) => (
        <button
          type="button"
          key={m}
          onClick={() => toggle(m)}
          className={`px-2.5 py-1 rounded-full text-xs border ${
            value.includes(m)
              ? "bg-[#162640] text-white border-[#162640]"
              : "bg-white text-gray-600 border-gray-300"
          }`}
        >
          {m.charAt(0) + m.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}

export default function CatalogMasters() {
  const [kind, setKind] = useState(KINDS[0].value);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  // Full metadata of the row being edited — preserved and merged on save so
  // kind-specific keys (hex, factors, …) are never wiped by a generic edit.
  const [baseMetadata, setBaseMetadata] = useState({});
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
    setBaseMetadata({});
    setPanelOpen(true);
  };

  const openEdit = (row) => {
    const md = row?.metadata || {};
    setEditingId(row.id);
    setBaseMetadata(md);
    setForm({
      code: row.code ?? "",
      name: row.name ?? "",
      sortOrder: Number(row.sortOrder ?? 0),
      seoSlug: row.seoSlug ?? "",
      synonyms: Array.isArray(row.synonyms) ? row.synonyms.join(", ") : "",
      metadataNote: md.note ?? "",
      status: row.status ?? "active",
      hex: md.hex ?? "",
      hex2: md.hex2 ?? "",
      twoTone: Boolean(md.hex2),
      iconUrl: md.iconUrl ?? "",
      pricingFactor: md.pricingFactor ?? "",
      applicableMetals: Array.isArray(md.applicableMetals) ? md.applicableMetals : [],
    });
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setBaseMetadata({});
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
    // Merge: keep whatever metadata the row already had, then apply the
    // kind-specific fields from the form on top.
    const metadata = { ...baseMetadata };
    if (form.metadataNote?.trim()) metadata.note = form.metadataNote.trim();
    else delete metadata.note;

    if (kind === "metal_color") {
      if (form.hex) metadata.hex = form.hex;
      else delete metadata.hex;
      if (form.twoTone && form.hex2) {
        metadata.hex2 = form.hex2;
        metadata.twoTone = true;
      } else {
        delete metadata.hex2;
        delete metadata.twoTone;
      }
      metadata.applicableMetals = form.applicableMetals;
    }
    if (kind === "metal_purity") {
      const f = Number(form.pricingFactor);
      if (Number.isFinite(f) && f > 0) metadata.pricingFactor = f;
      else delete metadata.pricingFactor;
      metadata.applicableMetals = form.applicableMetals;
    }
    if (kind === "diamond_shape") {
      if (form.iconUrl?.trim()) metadata.iconUrl = form.iconUrl.trim();
      else delete metadata.iconUrl;
    }

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

  // Kind-specific "Details" cell for the table.
  const renderDetails = (row) => {
    const md = row?.metadata || {};
    if (kind === "metal_color") {
      return (
        <div className="flex items-center gap-2">
          <ColorSwatch hex={md.hex} hex2={md.hex2} />
          <span className="text-xs text-muted-foreground">
            {md.hex2 ? `Two-tone ${md.hex} / ${md.hex2}` : md.hex || "no color"}
            {Array.isArray(md.applicableMetals) && md.applicableMetals.length
              ? ` · ${md.applicableMetals.join(", ")}`
              : ""}
          </span>
        </div>
      );
    }
    if (kind === "metal_purity") {
      return (
        <span className="text-xs text-muted-foreground">
          {md.pricingFactor
            ? `factor ${md.pricingFactor} → price = 24K × ${md.pricingFactor} ÷ 99.9`
            : "—"}
          {Array.isArray(md.applicableMetals) && md.applicableMetals.length
            ? ` · ${md.applicableMetals.join(", ")}`
            : ""}
        </span>
      );
    }
    if (kind === "diamond_shape") {
      return md.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={md.iconUrl}
          alt={row.name}
          className="h-8 w-8 object-contain rounded border border-gray-200 bg-white"
        />
      ) : (
        <span className="text-xs text-muted-foreground">no icon</span>
      );
    }
    return <span className="text-xs text-muted-foreground">{md.note || "—"}</span>;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold" style={{ color: NAVY }}>
          Catalog Masters
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Shapes (with icons), KT purities (with pricing factors), metal colors
          (incl. two-tone) &amp; more — all feed the product form and price
          dropdowns. No code changes needed.
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

      {kind === "metal_purity" && (
        <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-muted-foreground">
          <b className="text-foreground">How KT pricing works:</b> you enter only
          the <b>24KT gold rate</b> in Pricing → Metal Rates. Every other karat is
          priced automatically as <b>24K price × factor ÷ 99.9</b> — e.g. 18KT
          factor 78, 14KT factor 60, 10KT factor 43. Edit a karat below to change
          its factor.
        </div>
      )}

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

              {/* ── Kind-specific fields ─────────────────────────────── */}
              {kind === "metal_color" && (
                <>
                  <Field label="Color" hint="Shown as the storefront swatch">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.hex || "#cccccc"}
                        onChange={(e) => setField("hex")(e.target.value)}
                        className="h-9 w-12 rounded border border-gray-300 bg-white p-0.5 cursor-pointer"
                      />
                      <Input
                        value={form.hex}
                        onChange={setField("hex")}
                        placeholder="#E6C200"
                      />
                    </div>
                  </Field>
                  <Field
                    label={
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.twoTone}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, twoTone: e.target.checked }))
                          }
                        />
                        Two-tone (second color)
                      </span>
                    }
                    hint="Storefront shows a split swatch of both colors"
                  >
                    {form.twoTone ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.hex2 || "#cccccc"}
                          onChange={(e) => setField("hex2")(e.target.value)}
                          className="h-9 w-12 rounded border border-gray-300 bg-white p-0.5 cursor-pointer"
                        />
                        <Input
                          value={form.hex2}
                          onChange={setField("hex2")}
                          placeholder="#E8E8E8"
                        />
                        <ColorSwatch hex={form.hex} hex2={form.hex2} size={28} />
                      </div>
                    ) : (
                      <div className="flex items-center h-9">
                        <ColorSwatch hex={form.hex} size={28} />
                      </div>
                    )}
                  </Field>
                  <Field label="Applies to metals">
                    <MetalChecks
                      value={form.applicableMetals}
                      onChange={(v) => setForm((f) => ({ ...f, applicableMetals: v }))}
                    />
                  </Field>
                </>
              )}

              {kind === "metal_purity" && (
                <>
                  <Field
                    label="Pricing Factor"
                    hint="price = 24K rate × factor ÷ 99.9 (blank = needs its own rate row)"
                  >
                    <Input
                      type="number"
                      step="0.1"
                      value={form.pricingFactor}
                      onChange={setField("pricingFactor")}
                      placeholder="e.g. 78"
                    />
                  </Field>
                  <Field label="Applies to metals">
                    <MetalChecks
                      value={form.applicableMetals}
                      onChange={(v) => setForm((f) => ({ ...f, applicableMetals: v }))}
                    />
                  </Field>
                </>
              )}

              {kind === "diamond_shape" && (
                <Field label="Shape Icon / Image" full>
                  <IconUpload
                    value={form.iconUrl}
                    onChange={(v) => setForm((f) => ({ ...f, iconUrl: v }))}
                  />
                </Field>
              )}

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
                <th className="px-4 py-2.5 font-medium">Details</th>
                <th className="px-4 py-2.5 font-medium">Sort</th>
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
                    <td className="px-4 py-2.5">{renderDetails(row)}</td>
                    <td className="px-4 py-2.5">{row.sortOrder ?? 0}</td>
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
