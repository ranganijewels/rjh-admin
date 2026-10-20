"use client";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProductListColumns } from "./hooks/useProductListColumns";
import ProductCard from "./ProductCard";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Page, PageHeader } from "@/components/common/ui/page";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Button } from "@/components/common/ui/button";
import { Plus, X, Upload, Download, FileDown, CheckCircle, AlertCircle, Loader2, Images } from "lucide-react";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toast } from "sonner";
import { toTitleCase } from "@/lib/utils";
import { PRODUCT_CSV_HEADERS } from "@/lib/csvSubTables";
import { usePermissions } from "@/provider/permission-provider";
import { getAuthToken } from "@/lib/auth-token";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

/* ── Example CSV template ──────────────────────────────────────── */
// Column order is PRODUCT_CSV_HEADERS itself (see src/lib/csvSubTables.js) —
// the SAME list export-csv/route.js and import-csv/route.js use, so this
// template can never silently drift out of sync with what actually round-trips.
// Image naming: upload files as {productCode}-{metalColor}-main.jpg (gallery: -gallery-1.jpg etc.)
// OR paste a direct URL in the mainImageUrl column.
//
// Repeatable sub-tables (materials, weightMatrix, metalOptions, sizeWeightDiff,
// molds, faqs) go in ONE cell each: `;` separates rows, `|` separates fields
// within a row — there's no fixed row count, just add more `;`-separated
// groups for as many rows as you need. See the two example rows below.
const csvValueFor = {
  productName: "Solitaire Diamond Ring",
  productCode: "RJ-RING-001",
  category: "Rings",
  subCategory: "Solitaire",
  collectionName: "Bridal Collection",
  metalType: "Gold",
  metalPurity: "18K",
  metalColor: "Yellow",
  diamondShape: "Round",
  diamondQuality: "VS1",
  diamondType: "Lab Grown Diamond",
  diamondCount: "1",
  diamondWeightCt: "1.5",
  diamondCut: "Excellent",
  diamondColor: "F",
  diamondClarity: "VS1",
  diamondCertLab: "IGI",
  diamondCertNumber: "123456789",
  centerStoneShape: "Round",
  centerStoneWeightCt: "1.5",
  grossWeightG: "4.2",
  netWeightG: "3.8",
  ringSize: "7",
  gender: "Women",
  description: "Classic 4-prong solitaire engagement ring featuring a brilliant round diamond.",
  shortDescription: "Solitaire ring in 18K gold with a round center diamond.",
  seoTitle: "Solitaire Diamond Ring — 18K Gold",
  seoDescription: "Classic round solitaire engagement ring in 18K gold, certified lab-grown diamond.",
  shopifyTags: "diamond ring, solitaire, gold, engagement",
  status: "active",
  isReadyForQc: "false",
  isReadyForShopify: "false",
  designGroup: "RJ-RING-001",
  productType: "Ring",
  style: "Solitaire",
  occasion: "Engagement",
  brand: "Rangani",
  badges: "NEW,BESTSELLER",
  variantLabel: "A",
  aeoSummary: "This is a solitaire engagement ring crafted in 18K gold featuring a round lab-grown diamond.",
  // Materials (BOM) — one row per material: metal + diamond in this example
  materials:
    "Center Stone|Diamond|Diamond|Round|VS1|F||Prong|1|1.5|true;Band|Metal|Gold|||White|||1|3.8|false",
  // Metal options — this product is offered in 2 karats and 3 colors
  metalOptions: "Gold|18K,14K|White,Yellow,Rose",
  // Carat -> metal weight matrix — 6 selectable carat sizes
  weightMatrix: "1|2.5;1.5|2.7;2|2.9;3|3.3;4|3.7;5|4.1",
  faqs:
    "What metal options are available?|Available in 14K and 18K gold, in White, Yellow, or Rose.;Is the diamond certified?|Yes, IGI certified.",
};

function buildExampleRow(overrides = {}) {
  const merged = { ...csvValueFor, ...overrides };
  return PRODUCT_CSV_HEADERS.map((h) => {
    const v = merged[h] ?? "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }).join(",");
}

const EXAMPLE_CSV = [
  PRODUCT_CSV_HEADERS.join(","),
  buildExampleRow(),
  buildExampleRow({
    productName: "Halo Diamond Pendant",
    productCode: "RJ-PEND-001",
    category: "Pendants",
    subCategory: "Halo",
    collectionName: "Everyday Luxury",
    metalColor: "White",
    diamondShape: "Oval",
    diamondCount: "12",
    diamondWeightCt: "0.75",
    centerStoneShape: "Oval",
    centerStoneWeightCt: "0.25",
    sideStoneDetails: "12 round side stones",
    grossWeightG: "3.1",
    netWeightG: "2.9",
    description: "Oval center stone surrounded by a halo of round diamonds.",
    shortDescription: "Halo pendant in 18K white gold.",
    designGroup: "RJ-PEND-001",
    productType: "Pendant",
    style: "Halo",
    badges: "",
    variantLabel: "B",
    materials: "Center Stone|Diamond|Diamond|Oval|VS2|G||Prong|1|0.25|true;Halo|Diamond|Diamond|Round|VS2|G||Pave|12|0.5|false",
    metalOptions: "Gold|18K|White,Yellow",
    weightMatrix: "0.5|2.2;0.75|2.4;1|2.6",
    faqs: "",
  }),
].join("\r\n");

function downloadExampleCsv() {
  const blob = new Blob([EXAMPLE_CSV], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "product-import-example.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── Import modal ──────────────────────────────────────────────── */
const ImportModal = ({ open, onClose, onImported }) => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const reset = () => { setFile(null); setStatus("idle"); setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleImport = async () => {
    if (!file) return;
    setStatus("loading");
    const token = getAuthToken();
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/product-management/import-csv", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (json.error) { setResult({ error: json.error }); setStatus("error"); }
      else { setResult(json); setStatus("done"); onImported?.(); }
    } catch (e) {
      setResult({ error: e.message });
      setStatus("error");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Import Products from CSV</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        {status === "idle" || status === "loading" ? (
          <>
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".csv")) setFile(f); }}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              {file ? (
                <p className="text-sm font-medium text-foreground">{file.name} <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span></p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Click or drag & drop a CSV file</p>
                  <p className="text-xs text-muted-foreground mt-1">Only .csv files accepted</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            {/* Example download */}
            <button
              onClick={downloadExampleCsv}
              className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <FileDown className="w-3.5 h-3.5" /> Download example CSV template
            </button>

            {/* CSV column reference */}
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">Required columns</summary>
              <div className="mt-2 font-mono bg-muted rounded p-2 leading-5 break-all">
                productName*, productCode, category, subCategory, metalType, metalPurity, metalColor, diamondShape, diamondQuality, diamondType, diamondCount, diamondWeightCt, grossWeightG, netWeightG, ringSize, collectionName, gender, description, status, makingCharge
              </div>
              <p className="mt-1 text-muted-foreground">* required · all others optional</p>
            </details>

            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={status === "loading"}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleImport} disabled={!file || status === "loading"}>
                {status === "loading" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing…</> : <><Upload className="w-4 h-4 mr-2" />Import</>}
              </Button>
            </div>
          </>
        ) : status === "done" ? (
          <>
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Import Complete</p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="text-center"><p className="text-2xl font-bold text-success">{result.created}</p><p className="text-muted-foreground">Created</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-foreground">{result.total}</p><p className="text-muted-foreground">Total rows</p></div>
                {result.failed > 0 && <div className="text-center"><p className="text-2xl font-bold text-destructive">{result.failed}</p><p className="text-muted-foreground">Failed</p></div>}
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto bg-destructive/10 rounded p-3 text-xs text-destructive space-y-1">
                {result.errors.map((e, i) => <p key={i}>Row {e.row}: {e.reason}</p>)}
              </div>
            )}
            <Button className="w-full mt-5 bg-primary hover:bg-primary/90 text-white" onClick={handleClose}>Done</Button>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Import Failed</p>
              <p className="text-sm text-destructive mt-2">{result?.error}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={reset}>Try Again</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Bulk image upload modal ─────────────────────────────────────
   Matches a folder of real product photos to existing products by
   filename — no internet image search, just your own photos. */
const BulkImageUploadModal = ({ open, onClose, onUploaded }) => {
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [altTextTemplate, setAltTextTemplate] = useState("{productName} - {color}");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const reset = () => { setFiles([]); setStatus("idle"); setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  const addFiles = (fileList) => {
    const media = Array.from(fileList || []).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setFiles((prev) => [...prev, ...media]);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setStatus("loading");
    const token = getAuthToken();
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("altTextTemplate", altTextTemplate);
    try {
      const res = await fetch("/api/product-management/bulk-upload-images", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (json.error) { setResult({ error: json.error }); setStatus("error"); }
      else { setResult(json); setStatus("done"); onUploaded?.(); }
    } catch (e) {
      setResult({ error: e.message });
      setStatus("error");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Bulk Upload Product Media</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        {status === "idle" || status === "loading" ? (
          <>
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Images className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              {files.length ? (
                <p className="text-sm font-medium text-foreground">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Click or drag & drop your product photos or videos</p>
                  <p className="text-xs text-muted-foreground mt-1">jpg, png, webp, gif, mp4, mov, webm — matched by filename</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-3 max-h-28 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                {files.map((f, i) => <p key={i} className="truncate">{f.name}</p>)}
              </div>
            )}

            {/* Alt text template */}
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground">Alt text template (SEO, optional)</label>
              <input
                type="text"
                value={altTextTemplate}
                onChange={(e) => setAltTextTemplate(e.target.value)}
                placeholder="{productName} - {color}"
                className="mt-1 w-full text-xs border border-border rounded-md px-2 py-1.5"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Applied to every matched file. Placeholders: {"{productName}"}, {"{color}"}, {"{role}"}. Leave blank to skip.
              </p>
            </div>

            {/* Naming convention reference */}
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">How files get matched to products</summary>
              <div className="mt-2 font-mono bg-muted rounded p-2 leading-5 break-all space-y-1">
                <p>{"{productCode}"}-main.jpg → cover image</p>
                <p>{"{productCode}"}-{"{metalColor}"}-main.jpg → main image for that color</p>
                <p>{"{productCode}"}-{"{metalColor}"}-rollover.jpg → hover-swap image for that color</p>
                <p>{"{productCode}"}-{"{metalColor}"}-gallery-2.jpg → gallery image #2 for that color</p>
                <p>{"{productCode}"}-White-Rose-main.jpg → the White/Rose two-tone variant&apos;s own photo</p>
              </div>
              <p className="mt-1 text-muted-foreground">
                Every color needs its own file — colors are never shared or duplicated from one upload. productCode must match an existing product exactly (case-insensitive). metalColor is optional on single-color products (White/Yellow/Rose/Gold/Silver/Platinum), plus two-tone combos (White-Rose, White-Yellow, Yellow-Rose). Videos work the same way as images (mp4, mov, webm) — a video can be the &quot;main&quot; or &quot;rollover&quot; slot for a color too. Any image format works (jpg, png, webp, gif).
              </p>
            </details>

            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={status === "loading"}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleUpload} disabled={!files.length || status === "loading"}>
                {status === "loading" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4 mr-2" />Upload &amp; Match</>}
              </Button>
            </div>
          </>
        ) : status === "done" ? (
          <>
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Upload Complete</p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="text-center"><p className="text-2xl font-bold text-success">{result.uploaded}</p><p className="text-muted-foreground">Matched &amp; uploaded</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-foreground">{result.total}</p><p className="text-muted-foreground">Total files</p></div>
                {result.unmatched?.length > 0 && <div className="text-center"><p className="text-2xl font-bold text-destructive">{result.unmatched.length}</p><p className="text-muted-foreground">Unmatched</p></div>}
              </div>
            </div>
            {result.unmatched?.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto bg-destructive/10 rounded p-3 text-xs text-destructive space-y-1">
                {result.unmatched.map((u, i) => <p key={i}><span className="font-medium">{u.fileName}:</span> {u.reason}</p>)}
              </div>
            )}
            <Button className="w-full mt-5 bg-primary hover:bg-primary/90 text-white" onClick={handleClose}>Done</Button>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Upload Failed</p>
              <p className="text-sm text-destructive mt-2">{result?.error}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={reset}>Try Again</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Bulk AI listing generator ─────────────────────────────────── */
// Runs one product at a time (not parallel): fetches the full product detail
// (avoids the partial-PATCH-wipes-diamond-fields gotcha — see toProductBody()
// in ../[id]/route.js), asks the AI for fresh title/descriptions/SEO copy from
// that product's real attributes, merges just those fields in, and saves the
// full object back so nothing else on the product is touched.
const BulkAiGenerateModal = ({ open, onClose, rows, onDone }) => {
  const [model, setModel] = useState("haiku");
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState([]);

  const reset = () => { setStatus("idle"); setProgress({ done: 0, total: 0 }); setResults([]); };
  const handleClose = () => { reset(); onClose(); };

  const authHeaders = () => {
    const token = getAuthToken();
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  const runOne = async (row) => {
    const detailRes = await fetch(`/api/product-management/${row.id}`, { headers: authHeaders() });
    const detailJson = await detailRes.json();
    const detail = detailJson.data || detailJson;
    if (!detailRes.ok || !detail) throw new Error("Could not load full product detail");

    // Send the FULL metal option set (every purity/color, not just one) so the
    // prompt can tell a genuinely variable attribute from a fixed one and knows
    // when to write a {{token}} instead of a single literal value — matches the
    // per-product "Generate with AI" button's payload in ProductForm/index.jsx.
    const metalOptions = Array.isArray(detail.metadata?.metalOptions) && detail.metadata.metalOptions.length
      ? detail.metadata.metalOptions
      : [{ type: detail.metal, purities: [detail.metal_purity].filter(Boolean), colors: [detail.metal_color].filter(Boolean) }];

    const genRes = await fetch("/api/ai/generate-listing", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        productName: detail.title,
        category: detail.category,
        subCategory: detail.style || detail.subcategory,
        collectionName: detail.collection,
        occasion: detail.occasion,
        gender: detail.gender,
        metalOptions: metalOptions.map((m) => ({
          type: m.type || undefined,
          purities: m.purities || [],
          colors: m.colors || [],
        })),
        diamondShape: detail.shape,
        diamondQuality: detail.diamond_quality,
        diamondColor: detail.diamond_color,
        diamondClarity: detail.diamond_clarity,
        diamondCut: detail.diamond_cut,
        diamondCount: detail.diamond_pcs ? Number(detail.diamond_pcs) : undefined,
        diamondWeightCt: detail.diamond_wt ? Number(detail.diamond_wt) : undefined,
        // Every carat the configurator offers — matches the same field in
        // ProductForm/index.jsx's buildAiPayload (see comment there).
        diamondWeightOptions: (Array.isArray(detail.metadata?.weightMatrix) ? detail.metadata.weightMatrix : [])
          .map((r) => Number(r.carat))
          .filter((n) => Number.isFinite(n) && n > 0),
        centerStoneShape: detail.centerStoneShape || undefined,
        centerStoneWeightCt: detail.centerStoneWeightCt ? Number(detail.centerStoneWeightCt) : undefined,
        style: detail.metadata?.style,
        brand: detail.brand,
        model,
      }),
    });
    const genJson = await genRes.json();
    if (!genRes.ok) throw new Error(genJson?.message || "AI generation failed");
    const copy = genJson.data || genJson;

    const merged = {
      ...detail,
      title: copy.productName || detail.title,
      short_description: copy.shortDescription || detail.short_description,
      description: copy.description || detail.description,
      seo_title: copy.seoTitle,
      seo_description: copy.seoDescription,
      seo_keywords: copy.keywords,
      aeo_summary: copy.aeoSummary || detail.metadata?.aeoSummary,
      faqs: Array.isArray(copy.faqs) && copy.faqs.length ? copy.faqs : detail.metadata?.faqs,
    };

    const saveRes = await fetch(`/api/product-management/${row.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(merged),
    });
    const saveJson = await saveRes.json();
    if (!saveRes.ok) throw new Error(saveJson?.message || "Failed to save generated copy");
  };

  const handleRun = async () => {
    setStatus("running");
    setProgress({ done: 0, total: rows.length });
    const outcomes = [];
    for (const row of rows) {
      try {
        await runOne(row);
        outcomes.push({ id: row.id, title: row.title, ok: true });
      } catch (e) {
        outcomes.push({ id: row.id, title: row.title, ok: false, reason: e.message });
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setResults(outcomes);
    setStatus("done");
    onDone?.();
  };

  if (!open) return null;
  const failed = results.filter((r) => !r.ok);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Generate AI Listing Copy</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        {status === "idle" ? (
          <>
            <p className="text-sm text-muted-foreground">
              Rewrite Name, Short Description, Description and SEO fields for {rows.length} selected product{rows.length > 1 ? "s" : ""} from their existing metal, diamond, category and style attributes.
            </p>
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full text-sm border border-border rounded-md px-2 py-1.5">
                <option value="haiku">Haiku 4.5 — fast, cheap, default</option>
                <option value="sonnet">Sonnet 5 — best copy, higher cost</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleRun}>Generate</Button>
            </div>
          </>
        ) : status === "running" ? (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-sm font-medium text-foreground">Generating {progress.done} / {progress.total}…</p>
          </div>
        ) : (
          <>
            <div className="text-center py-4">
              {failed.length === 0 ? (
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              ) : (
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
              )}
              <p className="text-lg font-semibold text-foreground">
                {results.length - failed.length} / {results.length} generated
              </p>
            </div>
            {failed.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto bg-destructive/10 rounded p-3 text-xs text-destructive space-y-1">
                {failed.map((f) => <p key={f.id}><span className="font-medium">{f.title || f.id}:</span> {f.reason}</p>)}
              </div>
            )}
            <Button className="w-full mt-5 bg-primary hover:bg-primary/90 text-white" onClick={handleClose}>Done</Button>
          </>
        )}
      </div>
    </div>
  );
};

// sessionStorage key the list stashes its "where was I" state under right
// before navigating to Add/Edit, and consumes (then deletes) on the way back.
const RESTORE_KEY = "product_master_list_restore";

const CATEGORIES = ["Rings", "Necklaces", "Wedding Bands", "Bracelets", "Earrings", "Pendants", "Bangles"];
const METAL_COLORS = ["White", "Yellow", "Rose"];
const SHAPES = ["Round", "Oval", "Princess", "Emerald", "Cushion", "Pear", "Marquise", "Radiant", "Asscher", "Heart"];

const authHeaders = () => {
  const token = getAuthToken();
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const ProductMasterList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = usePermissions();
  const [pageInfo, setPageInfo] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMap, setPriceMap] = useState({});
  const [importOpen, setImportOpen] = useState(false);
  const [bulkImagesOpen, setBulkImagesOpen] = useState(false);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [aiGenerateRows, setAiGenerateRows] = useState([]);
  const [exporting, setExporting] = useState(false);
  // The filters live in the URL so a view can be bookmarked, shared and
  // survives a refresh.
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get("category") || "",
    metal_color: searchParams.get("metal_color") || "",
    shape: searchParams.get("shape") || "",
    status: searchParams.get("status") || "",
  }));

  const {
    list,
    setList,
    loading,
    error,
    deleteId,
    setDeleteId,
    confirmOpen,
    setConfirmOpen,
    remove,
    fetchData,
    pagination,
  } = useCrudListWithPagination(
    "/api/product-management",
    {},
    { skipInitialFetch: true }
  );

  const { toggleStatus: toggleStatusApi } = useCrudApi("/api/product-management");

  // Shared by the card-view toggle, the table-view toggle, and bulk
  // activate/deactivate — flips one product's status server-side, then
  // patches `list` locally so every view (and the price/media rules that key
  // off it) reflects the change immediately without a full refetch.
  const toggleProductStatus = useCallback(
    async (id, isActive) => {
      await toggleStatusApi(id, isActive);
      setList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: isActive ? "active" : "inactive" } : item
        )
      );
    },
    [toggleStatusApi, setList]
  );

  // Edit/Add navigate to a separate route, which unmounts this whole page —
  // losing the current page, filters and scroll position, so returning from a
  // save always dumped the shopper back at page 1, top of list. handleEdit and
  // handleAdd stash that state before leaving; this restores it (same page,
  // same filters, same search) and scrolls the edited row back into view once
  // the data is in.
  const didInitialFetch = useRef(false);
  useEffect(() => {
    if (didInitialFetch.current) return;
    didInitialFetch.current = true;

    (async () => {
      let restore = null;
      try {
        const raw = sessionStorage.getItem(RESTORE_KEY);
        if (raw) restore = JSON.parse(raw);
      } catch {
        /* ignore malformed/blocked sessionStorage */
      }

      if (!restore) {
        fetchData({
          page: 1,
          pageSize: pageInfo.pageSize,
          ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
          ),
        });
        return;
      }

      sessionStorage.removeItem(RESTORE_KEY);
      const restoredFilters = restore.filters || filters;
      const restoredSearch = restore.searchQuery || "";
      const restoredPageSize = restore.pageSize || pageInfo.pageSize;
      const restoredPageIndex = restore.pageIndex || 0;
      setFilters(restoredFilters);
      setSearchQuery(restoredSearch);
      setPageInfo((p) => ({
        ...p,
        pageIndex: restoredPageIndex,
        pageSize: restoredPageSize,
      }));

      const activeRestoreFilters = Object.fromEntries(
        Object.entries(restoredFilters).filter(([, v]) => v)
      );
      await fetchData({
        page: restoredPageIndex + 1,
        pageSize: restoredPageSize,
        search: restoredSearch,
        ...activeRestoreFilters,
      });

      if (restore.focusId) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document
              .querySelector(`[data-row-id="${restore.focusId}"]`)
              ?.scrollIntoView({ block: "center" });
          });
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Products store no price — fetch the live engine price for the visible page.
  // Only request prices for ids we haven't already priced, so paging through
  // the list never re-fetches pricing for rows that are already priced.
  useEffect(() => {
    const ids = (list || []).map((i) => i.id).filter(Boolean);
    const missingIds = ids.filter((id) => !(id in priceMap));
    if (!missingIds.length) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pricing-engine/batch", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ productIds: missingIds }),
        });
        const json = await res.json();
        if (!cancelled) setPriceMap((prev) => ({ ...prev, ...(json?.map || {}) }));
      } catch {
        /* leave prices blank if the engine is unreachable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list]);

  // Re-fetch from the server whenever a filter changes (reset to page 1).
  const applyFilters = (next) => {
    setFilters(next);
    setPageInfo((p) => ({ ...p, pageIndex: 0 }));
    fetchData({
      page: 1,
      pageSize: pageInfo.pageSize,
      search: searchQuery,
      ...Object.fromEntries(Object.entries(next).filter(([, v]) => v)),
    });
  };

  const setFilter = (key, value) =>
    applyFilters({ ...filters, [key]: value === "all" ? "" : value });

  // Mirror the filters into the URL — without pushing a history entry for
  // every dropdown change.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(
        `${window.location.pathname}${next ? `?${next}` : ""}`,
        { scroll: false }
      );
    }
  }, [filters, router, searchParams]);

  const clearFilters = () => applyFilters({ category: "", metal_color: "", shape: "", status: "" });
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // The filters live in the list card's toolbar (next to Search and the
  // Columns menu) so the whole list header is one row.
  const filterDropdowns = useMemo(
    () => ({
      category: {
        value: filters.category || "all",
        onChange: (v) => setFilter("category", v),
        placeholder: "All categories",
        options: [
          { value: "all", label: "All categories" },
          ...CATEGORIES.map((c) => ({ value: c, label: toTitleCase(c) })),
        ],
      },
      metal_color: {
        value: filters.metal_color || "all",
        onChange: (v) => setFilter("metal_color", v),
        placeholder: "All metal colours",
        options: [
          { value: "all", label: "All colours" },
          ...METAL_COLORS.map((c) => ({ value: c, label: toTitleCase(c) })),
        ],
      },
      shape: {
        value: filters.shape || "all",
        onChange: (v) => setFilter("shape", v),
        placeholder: "All shapes",
        options: [
          { value: "all", label: "All shapes" },
          ...SHAPES.map((c) => ({ value: c, label: toTitleCase(c) })),
        ],
      },
      status: {
        value: filters.status || "all",
        onChange: (v) => setFilter("status", v),
        placeholder: "All statuses",
        options: [
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.category, filters.metal_color, filters.shape, filters.status]
  );

  const rows =
    list?.map((item) => ({
      id: item.id,
      title: item.title,
      product_image: item.product_image,
      design_no: item.design_no,
      category: item.category,
      style: item.style,
      shape: item.shape,
      metal_color: item.metal_color,
      live_price: priceMap[item.id],
      collection: item.collection,
      gender: item.gender,
      active: item.status === "active",
      has_media: !!item.has_media,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) ?? [];

  // Filtering (client-side but applied to currently fetched data only)
  const filteredRows = useMemo(() => {
    let data = rows;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.category?.toLowerCase().includes(q) ||
          r.design_no?.toLowerCase().includes(q) ||
          r.style?.toLowerCase().includes(q)
      );
    }

    return data;
  }, [rows, searchQuery]);

  const handleView = useCallback(
    (product) => router.push(`/dashboard/product-management/view/${product.id}`),
    [router]
  );

  // Stash how much of the list was loaded, the active filters/search, and
  // (for Edit) which row to scroll back to — consumed by the restore effect
  // above once we're back on this page after Add/Edit navigates away.
  const stashListRestoreState = useCallback(
    (focusId) => {
      try {
        sessionStorage.setItem(
          RESTORE_KEY,
          JSON.stringify({
            pageIndex: pageInfo.pageIndex,
            pageSize: pageInfo.pageSize,
            filters,
            searchQuery,
            focusId: focusId ?? null,
          })
        );
      } catch {
        /* ignore blocked/unavailable sessionStorage — worst case, no restore */
      }
    },
    [pageInfo.pageIndex, pageInfo.pageSize, filters, searchQuery]
  );

  const handleAdd = () => {
    stashListRestoreState(null);
    router.push("/dashboard/product-management/add");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/product-management/export-csv", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* silent */ } finally {
      setExporting(false);
    }
  };

  const handleEdit = useCallback(
    (product) => {
      stashListRestoreState(product.id);
      router.push(`/dashboard/product-management/edit/${product.id}`);
    },
    [router, stashListRestoreState]
  );

  const handleAskDelete = useCallback(
    (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
    [setDeleteId, setConfirmOpen]
  );

  // Removes locally instead of the hook's default re-fetch-current-page
  // behaviour, which would collapse the accumulated infinite-scroll list
  // back down to a single page.
  const handleConfirmDelete = async () => {
    try {
      await remove(deleteId);
      setList((prev) => prev.filter((item) => item.id !== deleteId));
      setConfirmOpen(false);
      setDeleteId(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete product");
    }
  };

  const { columns } = useProductListColumns({
    onView: handleView,
    onEdit: can("products", "edit") ? handleEdit : undefined,
    onDelete: can("products", "delete") ? handleAskDelete : undefined,
    toggleStatus: can("products", "edit") ? toggleProductStatus : undefined,
  });

  const renderStoreCardsView = (item) => (
    <ProductCard
      key={item.id}
      {...item}
      onClick={() => handleView(item)}
      onEdit={can("products", "edit") ? () => handleEdit(item) : undefined}
      onDelete={
        can("products", "delete") ? () => handleAskDelete(item.id) : undefined
      }
      toggleStatus={can("products", "edit") ? toggleProductStatus : undefined}
    />
  );

  // Only show the full-page loader on the FIRST load. On pagination/filter
  // fetches keep the list mounted so the view toggle (grid/table) persists.
  if (loading && !list?.length) return <ListPageSkeleton showKpis={false} />;
  if (error) return <div className="text-destructive">Error: {error}</div>;

  const activeFilters = () =>
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v));

  return (
    <>
      <PageHeader
        title="Product Master List"
        description={`All products available in the store · ${pagination?.total ?? list.length} total`}
      />

      <ListWithCardToggle
        title="Products"
        titleAs="h2"
        responsiveCards
        data={filteredRows}
        columns={columns}
        // The catalogue carries more fields than fit on screen — the least
        // used ones stay collapsed until the user opens the Columns menu.
        defaultHiddenColumns={{
          collection: false,
          createdAt: false,
          lastUpdatedDate: false,
          gender: false,
        }}
        filterDropdownProps={filterDropdowns}
        filterActions={
          activeFilterCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              aria-label={`Clear ${activeFilterCount} active filters`}
            >
              <X className="size-3.5" />
              {activeFilterCount}
            </Button>
          ) : null
        }
        resizableColumns
        renderCardView={renderStoreCardsView}
        createBtn={
          <div className="flex flex-wrap items-center gap-2">
            {can("products", "create") && (
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="mr-1.5 h-4 w-4" /> Import CSV
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
              Export CSV
            </Button>
            {can("products", "edit") && (
              <Button variant="outline" size="sm" onClick={() => setBulkImagesOpen(true)}>
                <Images className="mr-1.5 h-4 w-4" /> Bulk Upload Images
              </Button>
            )}
            {can("products", "create") && (
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            )}
          </div>
        }
        pagination={pageInfo}
        onPaginationChange={(updater) => {
          const next =
            typeof updater === "function" ? updater(pageInfo) : updater;
          if (!next) return;

          const pageSize = next.pageSize || pageInfo.pageSize;
          // Changing the rows-per-page can leave the current page past the
          // last one (e.g. 10/page on page 5 → 50/page), so clamp it.
          const totalPages = Math.max(
            1,
            Math.ceil((pagination?.total || 0) / pageSize)
          );
          const pageIndex = Math.min(next.pageIndex, totalPages - 1);

          setPageInfo({ pageIndex, pageSize });
          fetchData({
            page: pageIndex + 1,
            pageSize,
            search: searchQuery,
            ...activeFilters(),
          });
        }}
        pageCount={pagination?.totalPages || 1}
        totalCount={pagination?.total || 0}
        paginationLinks={pagination?.links}
        serverSidePagination
        bulkActions={[
          ...(can("products", "edit")
            ? [
                {
                  key: "ai-generate",
                  label: "Generate AI Listing",
                  onRun: async (rows) => {
                    setAiGenerateRows(rows);
                    setAiGenerateOpen(true);
                  },
                },
                {
                  key: "activate",
                  label: "Activate",
                  onRun: async (rows) => {
                    const results = await Promise.allSettled(
                      rows.map((r) => toggleProductStatus(r.id, true))
                    );
                    const failedCount = results.filter((r) => r.status === "rejected").length;
                    if (failedCount > 0) {
                      toast.error(`${failedCount} of ${rows.length} product(s) could not be activated`);
                    } else {
                      toast.success(`${rows.length} product(s) activated`);
                    }
                  },
                },
                {
                  key: "deactivate",
                  label: "Deactivate",
                  onRun: async (rows) => {
                    const results = await Promise.allSettled(
                      rows.map((r) => toggleProductStatus(r.id, false))
                    );
                    const failedCount = results.filter((r) => r.status === "rejected").length;
                    if (failedCount > 0) {
                      toast.error(`${failedCount} of ${rows.length} product(s) could not be deactivated`);
                    } else {
                      toast.success(`${rows.length} product(s) deactivated`);
                    }
                  },
                },
              ]
            : []),
          ...(can("products", "delete")
            ? [
                {
                  key: "delete",
                  label: "Delete",
                  variant: "destructive",
                  confirmMessage:
                    "Delete the selected product(s)? This cannot be undone.",
                  onRun: async (rows) => {
                    const results = await Promise.allSettled(
                      rows.map((r) => remove(r.id).then(() => r.id))
                    );
                    const deletedIds = new Set(
                      results.filter((r) => r.status === "fulfilled").map((r) => r.value)
                    );
                    const failedCount = results.length - deletedIds.size;
                    setList((prev) => prev.filter((item) => !deletedIds.has(item.id)));
                    if (failedCount > 0) {
                      const firstError = results.find((r) => r.status === "rejected")?.reason;
                      toast.error(
                        `${failedCount} of ${rows.length} product(s) could not be deleted` +
                          (firstError?.message ? `: ${firstError.message}` : "")
                      );
                    }
                  },
                },
              ]
            : []),
        ]}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          fetchData({ search: query, ...activeFilters() });
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => fetchData({ page: 1, pageSize: pageInfo.pageSize })}
      />

      <BulkImageUploadModal
        open={bulkImagesOpen}
        onClose={() => setBulkImagesOpen(false)}
        onUploaded={() => fetchData({ page: 1, pageSize: pageInfo.pageSize })}
      />

      <BulkAiGenerateModal
        open={aiGenerateOpen}
        onClose={() => setAiGenerateOpen(false)}
        rows={aiGenerateRows}
        onDone={() => fetchData({ page: 1, pageSize: pageInfo.pageSize })}
      />
    </>
  );
};

export default ProductMasterList;
