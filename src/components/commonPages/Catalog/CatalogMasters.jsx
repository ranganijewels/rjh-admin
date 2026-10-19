"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ImageUp, Pencil, Plus, Trash2, X } from "lucide-react";

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
import { Checkbox } from "@/components/common/ui/checkbox";
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
  { value: "product_badge", label: "Product Badges" },
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
    ? { background: `linear-gradient(135deg, ${hex || "var(--muted)"} 50%, ${hex2} 50%)` }
    : { background: hex || "var(--muted)" };
  return (
    <span
      className="inline-block shrink-0 rounded-full border border-border align-middle"
      style={{ width: size, height: size, ...style }}
      title={hex2 ? `${hex} / ${hex2}` : hex}
    />
  );
}

// Kind-specific "Details" cell for the table.
function renderMasterDetails(row, kind) {
  const md = row?.metadata || {};
  const metals =
    Array.isArray(md.applicableMetals) && md.applicableMetals.length
      ? ` · ${md.applicableMetals.join(", ")}`
      : "";

  if (kind === "metal_color") {
    return (
      <div className="flex items-center gap-2">
        <ColorSwatch hex={md.hex} hex2={md.hex2} />
        <TruncatedText
          value={`${
            md.hex2 ? `Two-tone ${md.hex} / ${md.hex2}` : md.hex || "no color"
          }${metals}`}
          className="min-w-0 text-xs text-muted-foreground"
        />
      </div>
    );
  }
  if (kind === "product_badge") {
    return (
      <div className="flex items-center gap-2">
        <ColorSwatch hex={md.hex} />
        <TruncatedText
          value={md.hex || "no color"}
          className="min-w-0 text-xs text-muted-foreground"
        />
      </div>
    );
  }
  if (kind === "metal_purity") {
    return (
      <TruncatedText
        value={`${
          md.pricingFactor
            ? `factor ${md.pricingFactor} → price = 24K × ${md.pricingFactor} ÷ 99.9`
            : "—"
        }${metals}`}
        className="text-xs text-muted-foreground"
      />
    );
  }
  if (kind === "diamond_shape") {
    return md.iconUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={md.iconUrl}
        alt={row.name}
        className="h-8 w-8 rounded border border-border bg-card object-contain"
      />
    ) : (
      <span className="text-xs text-muted-foreground">no icon</span>
    );
  }
  return (
    <TruncatedText value={md.note || "—"} className="text-xs text-muted-foreground" />
  );
}

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
      <Button
        type="button"
        variant="outline"
        mode="icon"
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload shape icon"
        title="Upload icon"
        className="h-14 w-14 shrink-0 overflow-hidden rounded-md border-dashed bg-card p-0 hover:bg-muted"
      >
        {uploading ? (
          <span className="text-[10px] text-muted-foreground">…</span>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="icon" className="size-full object-contain" />
        ) : (
          <ImageUp className="size-5 text-muted-foreground" aria-hidden="true" />
        )}
      </Button>
      <div className="min-w-0 flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image/SVG URL"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-auto px-0 py-0 text-xs"
            onClick={() => onChange("")}
          >
            Remove icon
          </Button>
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
      {METALS.map((m) => {
        const active = value.includes(m);
        return (
          <Button
            type="button"
            key={m}
            size="sm"
            variant={active ? "primary" : "outline"}
            aria-pressed={active}
            onClick={() => toggle(m)}
          >
            {m.charAt(0) + m.slice(1).toLowerCase()}
          </Button>
        );
      })}
    </div>
  );
}

export default function CatalogMasters() {
  const [kind, setKind] = useState(KINDS[0].value);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
    // The list unmounts while it reloads, which drops the grid selection —
    // keep the bulk-selection state in sync with it.
    setSelectedIds(new Set());
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
    setSelectedIds(new Set());
  }, [kind, loadList]);

  const handleSelectionChange = useCallback((selectedRows) => {
    setSelectedIds(new Set((selectedRows || []).map((row) => row.id)));
  }, []);

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/catalog/masters/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
          })
        )
      );
      toast.success(`${selectedIds.size} value(s) deleted.`);
      setSelectedIds(new Set());
      loadList(kind);
    } catch (err) {
      toast.error(err?.message || "Failed to delete selected values.");
    } finally {
      setBulkDeleting(false);
      setBulkConfirmOpen(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setBaseMetadata({});
    setPanelOpen(true);
  };

  const openEdit = useCallback((row) => {
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
  }, []);

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
    if (kind === "product_badge") {
      if (form.hex) metadata.hex = form.hex;
      else delete metadata.hex;
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

  const handleDelete = useCallback(
    async (row) => {
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
    },
    [kind, loadList]
  );

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
        id: "code",
        header: ({ column }) => (
          <DataGridColumnHeader title="Code" column={column} />
        ),
        accessorFn: (row) => row.code,
        cell: ({ row }) => (
          <TruncatedText value={row.original.code} className="font-mono text-xs" />
        ),
        size: 160,
        meta: { headerTitle: "Code", identity: true, truncate: true },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.name}
            className="font-medium text-foreground"
          />
        ),
        size: 200,
        meta: { headerTitle: "Name", truncate: true },
      },
      {
        id: "details",
        header: ({ column }) => (
          <DataGridColumnHeader title="Details" column={column} />
        ),
        accessorFn: (row) => row?.metadata?.note || "",
        cell: ({ row }) => renderMasterDetails(row.original, kind),
        size: 280,
        meta: { headerTitle: "Details", truncate: true },
      },
      {
        id: "sortOrder",
        header: ({ column }) => (
          <DataGridColumnHeader title="Sort" column={column} />
        ),
        accessorFn: (row) => row.sortOrder ?? 0,
        cell: ({ row }) => <span>{row.original.sortOrder ?? 0}</span>,
        size: 90,
        meta: { headerTitle: "Sort" },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 110,
        meta: { headerTitle: "Status" },
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
              aria-label={`Edit ${row.original.name || row.original.code || "value"}`}
              title="Edit value"
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
              aria-label={`Delete ${row.original.name || row.original.code || "value"}`}
              title="Delete value"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(row.original);
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
    [kind, openEdit, handleDelete]
  );

  const filterFunction = useCallback((data, query) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((row) =>
      [row.code, row.name, row.seoSlug, row.status].some((field) =>
        String(field ?? "").toLowerCase().includes(needle)
      )
    );
  }, []);

  return (
    <Page>
      <PageHeader
        title="Catalog Masters"
        description="Shapes (with icons), KT purities (with pricing factors), metal colors (incl. two-tone) and more — they feed the product form and price dropdowns."
        actions={
          <Button type="button" onClick={openAdd}>
            <Plus className="size-4" />
            Add Value
          </Button>
        }
      />

      {/* Kind pills */}
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => {
          const active = k.value === kind;
          return (
            <Button
              key={k.value}
              type="button"
              size="sm"
              variant={active ? "primary" : "outline"}
              aria-pressed={active}
              onClick={() => setKind(k.value)}
            >
              {k.label}
            </Button>
          );
        })}
      </div>

      {kind === "metal_purity" && (
        <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">How KT pricing works:</span>{" "}
          you enter only the{" "}
          <span className="font-semibold text-foreground">24KT gold rate</span> in
          Pricing → Metal Rates. Every other karat is priced automatically as{" "}
          <span className="font-semibold text-foreground">
            24K price × factor ÷ 99.9
          </span>{" "}
          — e.g. 18KT factor 78, 14KT factor 60, 10KT factor 43. Edit a karat
          below to change its factor.
        </div>
      )}

      {/* Inline add/edit panel */}
      {panelOpen && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold text-foreground">
                {editingId ? "Edit Value" : `Add ${kindLabel.replace(/s$/, "")}`}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {editingId
                  ? `Update this ${kindLabel.toLowerCase()} entry.`
                  : `Create a new ${kindLabel.toLowerCase()} entry.`}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={closePanel}
              aria-label="Close editor"
              title="Close editor"
            >
              <X />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <FormField label="Code" htmlFor="master-code">
                <Input
                  id="master-code"
                  value={form.code}
                  onChange={setField("code")}
                  placeholder="e.g. round"
                />
              </FormField>
              <FormField label="Name" htmlFor="master-name">
                <Input
                  id="master-name"
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="e.g. Round Brilliant"
                />
              </FormField>
              <FormField label="Sort Order" htmlFor="master-sort-order">
                <Input
                  id="master-sort-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={setField("sortOrder")}
                  placeholder="0"
                />
              </FormField>

              {/* ── Kind-specific fields ─────────────────────────────── */}
              {kind === "metal_color" && (
                <>
                  <FormField
                    label="Color"
                    htmlFor="master-hex"
                    hint="Shown as the storefront swatch"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        aria-label="Pick color"
                        value={form.hex || "#cccccc"}
                        onChange={(e) => setField("hex")(e.target.value)}
                        className="h-9 w-12 shrink-0 cursor-pointer p-1"
                      />
                      <Input
                        id="master-hex"
                        value={form.hex}
                        onChange={setField("hex")}
                        placeholder="#E6C200"
                      />
                    </div>
                  </FormField>
                  <FormField
                    label="Two-tone (second color)"
                    htmlFor="master-two-tone"
                    hint="Storefront shows a split swatch of both colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="master-two-tone"
                          checked={form.twoTone}
                          onCheckedChange={(checked) =>
                            setForm((f) => ({ ...f, twoTone: checked === true }))
                          }
                        />
                        <Label
                          htmlFor="master-two-tone"
                          className="text-xs font-normal text-muted-foreground"
                        >
                          Enable two-tone
                        </Label>
                      </div>
                      {form.twoTone ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            aria-label="Pick second color"
                            value={form.hex2 || "#cccccc"}
                            onChange={(e) => setField("hex2")(e.target.value)}
                            className="h-9 w-12 shrink-0 cursor-pointer p-1"
                          />
                          <Input
                            value={form.hex2}
                            onChange={setField("hex2")}
                            placeholder="#E8E8E8"
                            aria-label="Second color hex"
                          />
                          <ColorSwatch hex={form.hex} hex2={form.hex2} size={28} />
                        </div>
                      ) : (
                        <div className="flex h-9 items-center">
                          <ColorSwatch hex={form.hex} size={28} />
                        </div>
                      )}
                    </div>
                  </FormField>
                  <FormField label="Applies to metals">
                    <MetalChecks
                      value={form.applicableMetals}
                      onChange={(v) => setForm((f) => ({ ...f, applicableMetals: v }))}
                    />
                  </FormField>
                </>
              )}

              {kind === "product_badge" && (
                <FormField
                  label="Badge Color"
                  htmlFor="master-badge-hex"
                  hint="Shown as the badge background on product cards and the PDP"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      aria-label="Pick badge color"
                      value={form.hex || "#162640"}
                      onChange={(e) => setField("hex")(e.target.value)}
                      className="h-9 w-12 shrink-0 cursor-pointer p-1"
                    />
                    <Input
                      id="master-badge-hex"
                      value={form.hex}
                      onChange={setField("hex")}
                      placeholder="#162640"
                    />
                    <ColorSwatch hex={form.hex} size={28} />
                  </div>
                </FormField>
              )}

              {kind === "metal_purity" && (
                <>
                  <FormField
                    label="Pricing Factor"
                    htmlFor="master-pricing-factor"
                    hint="price = 24K rate × factor ÷ 99.9 (blank = needs its own rate row)"
                  >
                    <Input
                      id="master-pricing-factor"
                      type="number"
                      step="0.1"
                      value={form.pricingFactor}
                      onChange={setField("pricingFactor")}
                      placeholder="e.g. 78"
                    />
                  </FormField>
                  <FormField label="Applies to metals">
                    <MetalChecks
                      value={form.applicableMetals}
                      onChange={(v) => setForm((f) => ({ ...f, applicableMetals: v }))}
                    />
                  </FormField>
                </>
              )}

              {kind === "diamond_shape" && (
                <FormField
                  label="Shape Icon / Image"
                  hint="Upload a PNG/SVG or paste an image URL"
                  className="sm:col-span-full"
                >
                  <IconUpload
                    value={form.iconUrl}
                    onChange={(v) => setForm((f) => ({ ...f, iconUrl: v }))}
                  />
                </FormField>
              )}

              <FormField label="SEO Slug" htmlFor="master-seo-slug">
                <Input
                  id="master-seo-slug"
                  value={form.seoSlug}
                  onChange={setField("seoSlug")}
                  placeholder="round-brilliant"
                />
              </FormField>
              <FormField
                label="Synonyms"
                htmlFor="master-synonyms"
                hint="Comma-separated (e.g. brilliant, rd)"
              >
                <Input
                  id="master-synonyms"
                  value={form.synonyms}
                  onChange={setField("synonyms")}
                  placeholder="brilliant, rd"
                />
              </FormField>
              <FormField label="Status" htmlFor="master-status">
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status")(value)}
                >
                  <SelectTrigger id="master-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Metadata Note (optional)"
                htmlFor="master-metadata-note"
                className="sm:col-span-full"
              >
                <Textarea
                  id="master-metadata-note"
                  value={form.metadataNote}
                  onChange={setField("metadataNote")}
                  placeholder="Any free-form note stored in metadata"
                  rows={2}
                />
              </FormField>

              <div className="flex items-center gap-2 sm:col-span-full">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update" : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={closePanel}>
                  Cancel
                </Button>
              </div>
            </form>
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

      {/* Values list */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{kindLabel}</h2>
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
            title="Catalog masters"
            titleAs="none"
            data={rows}
            columns={columns}
            filterFunction={filterFunction}
            resizableColumns
            onSelectionChange={handleSelectionChange}
            paginationResetKey={kind}
          />
        )}
      </div>

      <ConfirmDialog
        open={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete selected values"
        message={`Delete ${selectedIds.size} selected value(s)? This cannot be undone.`}
        confirmLabel={bulkDeleting ? "Deleting…" : "Delete"}
      />
    </Page>
  );
}
