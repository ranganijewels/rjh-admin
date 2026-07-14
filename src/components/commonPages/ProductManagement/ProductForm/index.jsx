"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/ui/input";
import { Textarea } from "@/components/common/ui/textarea";
import { Button } from "@/components/common/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Save, ChevronDown } from "lucide-react";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import ImageUpload from "./ImageUpload";
import MediaManager, { detectType } from "./MediaManager";

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

const CATEGORIES = ["Rings", "Necklaces", "Wedding Bands", "Bracelets", "Earrings", "Pendants", "Bangles"];
const METAL_COLORS = ["White", "Yellow", "Rose"];
const METAL_TYPES = ["Gold", "Silver", "Platinum", "Rose Gold", "White Gold"];
const METAL_PURITIES = ["24K", "22K", "18K", "14K", "999 (Silver)", "925 (Silver)", "800 (Silver)", "950 (Platinum)", "Custom"];

// Each metal type and the purities + colors it can be offered in. Drives the
// "Metal Options" builder so a product can offer e.g. Gold (14/18/22K) AND
// Silver (925/999), each in its own set of colors.
// Fallback only — the live catalog (metal types, KT purities, colors incl.
// two-tone + swatch hexes) loads from Catalog Masters and is admin-managed.
const METAL_CATALOG = {
  Gold: {
    purities: ["10K", "14K", "18K"],
    colors: ["White", "Yellow", "Rose"],
    colorHex: { White: "#E8E8E8", Yellow: "#E6C200", Rose: "#E0A899" },
  },
  Silver: { purities: ["925", "999", "800"], colors: ["Silver"], colorHex: { Silver: "#C0C0C0" } },
  Platinum: { purities: ["950", "900"], colors: ["Platinum"], colorHex: { Platinum: "#D6D6D6" } },
};
const emptyMetalOption = () => ({ type: "Gold", purities: [], colors: [] });
const emptyWeightRow = () => ({ carat: "", weightG: "" });

// All colors selected across every metal option — drives the media columns.
const colorsFromMetalOptions = (opts) => {
  const set = new Set();
  (opts || []).forEach((o) => (o.colors || []).forEach((c) => set.add(c)));
  return [...set];
};

const GENDERS = ["Women", "Men", "Unisex"];
const CERT_LABS = ["", "GIA", "IGI", "IGL", "HRD", "GCAL", "SGL"];
const DIAMOND_CUTS = ["", "Ideal", "Excellent", "Very Good", "Good", "Fair"];

const EMPTY = {
  title: "", design_no: "", category: "", subcategory: "", collection: "",
  occasion: "", brand: "", gender: "", designer: "", title_line: "",
  // Short description = the 1-2 line teaser shown on the PDP buy box and
  // product cards. Description (below) is the full storefront copy — the
  // two are intentionally separate fields, not derived from one another.
  short_description: "", description: "",
  design_group: "", metal: "Gold", metal_purity: "18K", metal_color: "White",
  shape: "Round", diamond_quality: "", gross_weight: "", net_weight: "", length: "",
  width: "", diamond_wt: "", diamond_pcs: "", labour_amount: "",
  diamond_cut: "", diamond_color: "", diamond_clarity: "",
  cert_lab: "", cert_number: "", cert_url: "",
  product_image: "", is_active: true,
  // Default offering — one Gold option in white; user can add Silver etc.
  metal_options: [{ type: "Gold", purities: ["18K"], colors: ["White"] }],
  weight_matrix: [],
  // ── ERP Design-Master fields ──
  product_type: "", design_style: "", make_type: "", vendor_code: "",
  cad_designer: "", default_size: "", parent_design: "", design_package: "",
  remarks: "",
  mfg_design: "", wax_wt: "", cam_wt: "", molds: [], production_images: [],
  size_weight_diff: [],
  mrp_override: "",
  // Center stone identity — derived from the Materials row flagged as the
  // center stone (see deriveFromMaterials). Blank = no center stone, which
  // hides the center-stone customizer on the storefront entirely.
  center_stone_shape: "", center_stone_weight_ct: "",
  // ── SEO & Google Shopping ──
  seo_title: "", seo_description: "", seo_keywords: "", seo_og_image: "",
  shopping_availability: "", google_product_category: "",
  display_discount_percent: "",
};

// Material row — mirrors the ERP "Material Added In Design" table.
const MATERIAL_TYPES = ["Metal", "Diamond", "Stone", "Misc", "Finding"];
const EMPTY_MATERIAL = {
  component: "", materialType: "", metalStoneType: "", shape: "", quality: "",
  color: "", size: "", setting: "", pcs: "", wt: "", centerStone: false,
};
const emptyMold = () => ({ name: "", locker: "", pcs: "" });
const emptySizeDiff = () => ({ size: "", percent: "" });

// ERP-style totals line: Metal g || Dia pcs/ct || Stone || Misc || Finding
const materialSummary = (rows) => {
  const sum = {};
  (rows || []).forEach((r) => {
    const t = r.materialType || "Misc";
    sum[t] = sum[t] || { pcs: 0, wt: 0 };
    sum[t].pcs += Number(r.pcs) || 0;
    sum[t].wt += Number(r.wt) || 0;
  });
  const fmt = (t) =>
    sum[t] ? `${sum[t].pcs ? sum[t].pcs + " pcs / " : ""}${+sum[t].wt.toFixed(3)}` : "—";
  return `Metal: ${sum.Metal ? +sum.Metal.wt.toFixed(3) + " g" : "—"} || Dia: ${fmt("Diamond")}${sum.Diamond ? " ct" : ""} || Stone: ${fmt("Stone")} || Misc: ${fmt("Misc")} || Finding: ${fmt("Finding")}`;
};

// Nearest-carat lookup into the per-product "Diamond Carat → Metal Weight"
// table — mirrors PricingEngineService.resolveMatrixWeight exactly (exact
// carat wins, else nearest) so the admin preview matches what the engine
// actually charges.
function resolveMatrixWeight(matrix, carat) {
  const rows = (Array.isArray(matrix) ? matrix : [])
    .filter((r) => r.carat !== "" && r.weightG !== "" && r.carat != null && r.weightG != null)
    .map((r) => ({ carat: Number(r.carat), weightG: Number(r.weightG) }));
  if (!rows.length || !carat) return null;
  const exact = rows.find((r) => r.carat === carat);
  if (exact) return exact.weightG;
  let best = null;
  let bestDiff = Infinity;
  for (const r of rows) {
    const d = Math.abs(r.carat - carat);
    if (d < bestDiff) { bestDiff = d; best = r; }
  }
  return best ? best.weightG : null;
}

// Casting weight differs by purity (alloy density) — mirrors
// PricingEngineService.purityWeightFactor exactly, anchored at 14K = 1.0:
// 10K = −15%, 18K = +15%, Silver = 10K − 15% (≈ −27.75% off 14K). Purities
// outside this set (22K, Platinum, …) are left unscaled.
function purityWeightFactor(purity) {
  if (!purity) return null;
  const p = String(purity).trim().toUpperCase();
  if (p.includes("10K")) return 0.85;
  if (p.includes("14K")) return 1;
  if (p.includes("18K")) return 1.15;
  if (p.includes("SILVER") || p.includes("925") || p.includes("999") || p.includes("800"))
    return 0.85 * 0.85;
  return null;
}

// Materials is the ONLY place weight/diamond data is entered — the flat
// "Diamond, Weights & Live Price" fields are always a read-only mirror of it:
//   - Net weight = sum of Metal rows, UNLESS a Diamond row is flagged as the
//     center stone AND the Carat → Metal Weight table has a matching/nearest
//     row for that stone's carat — a bigger center stone needs more metal for
//     its setting/prongs, so the matrix row overrides the flat metal sum
//     (same priority the Pricing Engine itself applies at checkout).
//   - Gross weight = net + total diamond weight in grams (1 ct = 0.2 g).
//   - Diamond weight/pieces = sum across ALL Diamond rows (center + accents).
//   - Shape/Quality/Color/centerStoneWeightCt come ONLY from the row
//     explicitly flagged as the center stone — never guessed from the first
//     Diamond row. No flagged row → no center stone → these stay blank
//     (storefront hides the center-stone customizer entirely when blank).
//   - Clarity mirrors Quality: this schema's Materials "Quality" column IS
//     the clarity grade (e.g. "VVS-VS"), matching the Diamond Rate master's
//     separate clarity column so rate matching actually works.
function deriveFromMaterials(materials, weightMatrix) {
  const rows = Array.isArray(materials) ? materials : [];
  const metalRows = rows.filter((r) => r.materialType === "Metal");
  const diamondRows = rows.filter((r) => r.materialType === "Diamond");
  const centerStoneRow = diamondRows.find((r) => r.centerStone) || null;
  const hasCenterStone = !!centerStoneRow;

  const metalSumG = metalRows.reduce((sum, r) => sum + (Number(r.wt) || 0), 0);
  const centerCt = hasCenterStone ? Number(centerStoneRow.wt) || 0 : 0;
  const matrixWeight = hasCenterStone ? resolveMatrixWeight(weightMatrix, centerCt) : null;
  const netWeightG = matrixWeight != null ? matrixWeight : metalSumG;

  const diamondWeightCt = diamondRows.reduce((sum, r) => sum + (Number(r.wt) || 0), 0);
  const diamondPcs = diamondRows.reduce((sum, r) => sum + (Number(r.pcs) || 0), 0);
  const grossWeightG = netWeightG + diamondWeightCt * 0.2; // 1 ct = 0.2 g

  return {
    netWeightG,
    grossWeightG,
    diamondWeightCt,
    diamondPcs,
    hasCenterStone,
    centerStoneWeightCt: centerCt,
    shape: hasCenterStone ? centerStoneRow.shape || "" : "",
    quality: hasCenterStone ? centerStoneRow.quality || "" : "",
    color: hasCenterStone ? centerStoneRow.color || "" : "",
    clarity: hasCenterStone ? centerStoneRow.quality || "" : "",
  };
}

// Media buckets are keyed by color NAME and created lazily — colors are
// admin-managed master data (incl. two-tone entries), so the set is dynamic.

export default function ProductForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [materials, setMaterials] = useState([]);
  const [colorMedia, setColorMedia] = useState({}); // { White:[{id?,url,type,role}], ... } — buckets created lazily per color
  const [existingMediaIds, setExistingMediaIds] = useState([]); // ids present at load

  // ── Live catalog from Catalog Masters (types → purities/colors + hexes) ────
  // Falls back to the static METAL_CATALOG if the API is unreachable.
  const [metalCatalog, setMetalCatalog] = useState(METAL_CATALOG);
  // "Pairs well with" — manual picks shown on the PDP under the FAQs.
  const [pairsWithItems, setPairsWithItems] = useState([]); // [{id,title}]
  const [pairSearch, setPairSearch] = useState("");
  const [pairResults, setPairResults] = useState([]);
  useEffect(() => {
    const q = pairSearch.trim();
    if (q.length < 2) { setPairResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/product-management?limit=8&page=1&search=${encodeURIComponent(q)}`, { headers: authHeaders() });
        const j = await r.json();
        setPairResults((j?.data || []).map((x) => ({ id: x.id, title: x.title })));
      } catch { setPairResults([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [pairSearch]);
  const [productTypeOptions, setProductTypeOptions] = useState([
    "Diamond Jewellery", "Gold Jewellery", "Silver Jewellery", "Platinum Jewellery",
  ]);
  useEffect(() => {
    (async () => {
      try {
        const [types, purities, colors, ptypes] = await Promise.all(
          ["metal_type", "metal_purity", "metal_color", "product_type"].map((k) =>
            fetch(`/api/catalog/masters?kind=${k}`, { cache: "no-store" }).then((r) =>
              r.ok ? r.json() : []
            )
          )
        );
        if (!Array.isArray(types) || !types.length) return;
        const bySort = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        const cat = {};
        [...types].sort(bySort).forEach((t) => {
          const KEY = (t.code || t.name || "").toUpperCase();
          const label = t.name || t.code;
          const p = (Array.isArray(purities) ? purities : [])
            .filter((x) => (x.metadata?.applicableMetals || []).includes(KEY))
            .sort(bySort)
            .map((x) => x.code);
          const c = (Array.isArray(colors) ? colors : [])
            .filter((x) => (x.metadata?.applicableMetals || []).includes(KEY))
            .sort(bySort);
          cat[label] = {
            purities: p.length ? p : METAL_CATALOG[label]?.purities || [],
            colors: c.length ? c.map((x) => x.name) : METAL_CATALOG[label]?.colors || [],
            colorHex: c.length
              ? Object.fromEntries(
                  c.map((x) => [x.name, { hex: x.metadata?.hex, hex2: x.metadata?.hex2 }])
                )
              : Object.fromEntries(
                  Object.entries(METAL_CATALOG[label]?.colorHex || {}).map(([k, v]) => [
                    k,
                    { hex: v },
                  ])
                ),
          };
        });
        if (Object.keys(cat).length) setMetalCatalog(cat);
        if (Array.isArray(ptypes) && ptypes.length) {
          setProductTypeOptions([...ptypes].sort(bySort).map((s) => s.name));
        }
      } catch {
        /* keep the static fallback */
      }
    })();
  }, []);
  const metalTypeOptions = Object.keys(metalCatalog);
  // Swatch lookup across all metals (color pills + media column headers).
  const colorHexFor = (name) => {
    for (const m of Object.values(metalCatalog)) {
      const h = m.colorHex?.[name];
      if (h) return typeof h === "string" ? { hex: h } : h;
    }
    return null;
  };

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`/api/product-management/${id}`, { headers: authHeaders() });
        const json = await res.json();
        const p = json?.data || json;
        setForm({
          title: p.title ?? p.productName ?? "",
          design_no: p.design_no ?? p.productCode ?? "",
          category: p.category ?? "",
          subcategory: p.subcategory ?? p.style ?? "",
          collection: p.collection ?? "",
          occasion: p.occasion ?? "",
          brand: p.brand ?? "",
          gender: p.gender ?? "",
          designer: p.designer ?? "",
          title_line: p.title_line ?? "",
          short_description: p.short_description ?? "",
          description: p.description ?? "",
          design_group: p.metadata?.designGroup ?? "",
          metal: p.metal ?? p.metalType ?? p.metadata?.metalOptions?.[0]?.type ?? "Gold",
          // Fall back to the stored metal options so editing+saving can't blank the
          // primary purity (the engine needs it to resolve the metal rate).
          metal_purity:
            p.metal_purity ?? p.metalPurity ?? p.metadata?.metalOptions?.[0]?.purities?.[0] ?? "",
          metal_color:
            p.metal_color ?? p.metalColor ?? p.metadata?.metalOptions?.[0]?.colors?.[0] ?? "White",
          shape: p.shape ?? "",
          diamond_quality: p.diamond_quality ?? "",
          diamond_cut: p.diamond_cut ?? "",
          diamond_color: p.diamond_color ?? "",
          diamond_clarity: p.diamond_clarity ?? "",
          metal_options:
            Array.isArray(p.metadata?.metalOptions) && p.metadata.metalOptions.length
              ? p.metadata.metalOptions
              : [
                  {
                    type: p.metal ?? p.metalType ?? "Gold",
                    purities: [p.metal_purity ?? p.metalPurity].filter(Boolean),
                    colors: [p.metal_color ?? p.metalColor].filter(Boolean),
                  },
                ],
          weight_matrix: Array.isArray(p.metadata?.weightMatrix)
            ? p.metadata.weightMatrix
            : [],
          cert_lab: p.cert_lab ?? "",
          cert_number: p.cert_number ?? "",
          cert_url: p.cert_url ?? "",
          gross_weight: p.gross_weight ?? "",
          net_weight: p.net_weight ?? "",
          length: p.length ?? "",
          width: p.width ?? "",
          diamond_wt: p.diamond_wt ?? "",
          diamond_pcs: p.diamond_pcs ?? "",
          labour_amount: p.labour_amount ?? p.makingCharge ?? "",
          product_image: p.product_image ?? "",
          is_active: p.is_active ?? true,
          // ── ERP fields (metadata-backed) ──
          product_type: p.metadata?.productType ?? "",
          design_style: p.metadata?.style ?? "",
          make_type: p.metadata?.makeType ?? "",
          vendor_code: p.metadata?.vendorCode ?? "",
          cad_designer: p.metadata?.cadDesigner ?? "",
          default_size: p.ringSize ?? "",
          parent_design: p.metadata?.parentDesign ?? "",
          design_package: p.metadata?.designPackage ?? "",
          remarks: p.metadata?.remarks ?? "",
          mfg_design: p.metadata?.mfg?.mfgDesign ?? "",
          wax_wt: p.metadata?.mfg?.waxWt ?? "",
          cam_wt: p.metadata?.mfg?.camWt ?? "",
          molds: Array.isArray(p.metadata?.mfg?.molds) ? p.metadata.mfg.molds : [],
          production_images: Array.isArray(p.metadata?.mfg?.productionImages)
            ? p.metadata.mfg.productionImages
            : [],
          size_weight_diff: Array.isArray(p.metadata?.sizeWeightDiff)
            ? p.metadata.sizeWeightDiff
            : [],
          mrp_override: p.metadata?.mrpOverride ?? "",
          // ── SEO & Google ──
          seo_title: p.seoTitle ?? "",
          seo_description: p.seoDescription ?? "",
          seo_keywords: p.shopifyTags ?? "",
          seo_og_image: p.metadata?.seo?.ogImage ?? "",
          shopping_availability: p.metadata?.shopping?.availability ?? "",
          google_product_category: p.metadata?.shopping?.googleProductCategory ?? "",
          display_discount_percent: p.metadata?.displayDiscountPercent ?? "",
        });
        // Hydrate "pairs well with" titles from the stored ids.
        const pairIds = Array.isArray(p.metadata?.pairsWith) ? p.metadata.pairsWith : [];
        if (pairIds.length) {
          Promise.all(
            pairIds.map((pid) =>
              fetch(`/api/product-management/${pid}`, { headers: authHeaders() })
                .then((r) => r.json())
                .then((j) => ({ id: pid, title: (j?.data || j)?.title || (j?.data || j)?.productName || pid.slice(0, 8) }))
                .catch(() => ({ id: pid, title: pid.slice(0, 8) }))
            )
          ).then(setPairsWithItems);
        }
        setMaterials(Array.isArray(p.materials) ? p.materials : []);
        // Reconstruct per-color media lists (role in altText, type in mediaType)
        const media = Array.isArray(p.media) ? p.media : [];
        const cm = {};
        const ids = [];
        media.forEach((m) => {
          const url = m.url ?? m.fileUrl;
          const color = m.metalColor || null; // buckets are dynamic — any color name works
          const role = ["main", "rollover"].includes((m.altText || "").toLowerCase())
            ? m.altText.toLowerCase()
            : "gallery";
          const type =
            m.mediaType && m.mediaType !== "image" ? m.mediaType : detectType(url);
          if (color) (cm[color] = cm[color] || []).push({ id: m.id, url, type, role });
          if (m.id) ids.push(m.id);
        });
        setColorMedia(cm);
        setExistingMediaIds(ids);
      } catch (e) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addMaterial = () => setMaterials((m) => [...m, { ...EMPTY_MATERIAL }]);
  const removeMaterial = (i) => setMaterials((m) => m.filter((_, idx) => idx !== i));
  const setMaterial = (i, k, v) =>
    setMaterials((m) => m.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  const setMediaForColor = (color, items) =>
    setColorMedia((cm) => ({ ...cm, [color]: items }));

  // Materials is the ONLY place weight/diamond/center-stone data is entered —
  // always mirror the derived totals into the flat pricing fields (Materials
  // empty → all zero/blank, which is correct: nothing to price yet).
  const derived = useMemo(
    () => deriveFromMaterials(materials, form.weight_matrix),
    [materials, form.weight_matrix]
  );
  useEffect(() => {
    setForm((f) => ({
      ...f,
      net_weight: String(derived.netWeightG),
      gross_weight: String(derived.grossWeightG),
      diamond_wt: String(derived.diamondWeightCt),
      diamond_pcs: String(derived.diamondPcs),
      shape: derived.shape,
      diamond_quality: derived.quality,
      diamond_color: derived.color,
      diamond_clarity: derived.clarity,
      center_stone_shape: derived.shape,
      center_stone_weight_ct: derived.hasCenterStone ? String(derived.centerStoneWeightCt) : "",
    }));
  }, [derived]);

  // Preview only — the Pricing Engine applies this same ±15% rule live when a
  // customer switches purity on the storefront; net_weight/metal_purity here
  // are what it uses as the base/anchor.
  const weightByPurity = useMemo(() => {
    const baseFactor = purityWeightFactor(form.metal_purity);
    const netG = Number(form.net_weight) || 0;
    if (!baseFactor || netG <= 0) return null;
    const at = (label, factor) => ({ label, g: (netG * factor) / baseFactor });
    return [at("10K", 0.85), at("14K", 1), at("18K", 1.15), at("Silver", 0.85 * 0.85)];
  }, [form.metal_purity, form.net_weight]);

  // ── Metal options (multi metal type + per-type purities + colors) ──────────
  const availableColors = colorsFromMetalOptions(form.metal_options);
  const addMetalOption = () =>
    setForm((f) => ({ ...f, metal_options: [...f.metal_options, emptyMetalOption()] }));
  const removeMetalOption = (i) =>
    setForm((f) => ({ ...f, metal_options: f.metal_options.filter((_, idx) => idx !== i) }));
  const setMetalOption = (i, patch) =>
    setForm((f) => ({
      ...f,
      metal_options: f.metal_options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  const toggleInList = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // ── Diamond carat → metal weight matrix ────────────────────────────────────
  const addWeightRow = () =>
    setForm((f) => ({ ...f, weight_matrix: [...f.weight_matrix, emptyWeightRow()] }));
  const removeWeightRow = (i) =>
    setForm((f) => ({ ...f, weight_matrix: f.weight_matrix.filter((_, idx) => idx !== i) }));
  const setWeightRow = (i, k, v) =>
    setForm((f) => ({
      ...f,
      weight_matrix: f.weight_matrix.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)),
    }));

  // Pick the overall cover — always an IMAGE (never a video/.glb, which would
  // render broken as an <img> on the storefront). First an image tagged "main",
  // else the first image of any selected color, else the uploaded cover, else "".
  const coverColors = availableColors.length ? availableColors : Object.keys(colorMedia);
  const isImageMedia = (m) => ((m?.type || detectType(m?.url)) === "image");
  const pickCover = () => {
    for (const color of coverColors) {
      const main = (colorMedia[color] || []).find((m) => m.role === "main" && isImageMedia(m));
      if (main) return main.url;
    }
    for (const color of coverColors) {
      const img = (colorMedia[color] || []).find(isImageMedia);
      if (img) return img.url;
    }
    return form.product_image || "";
  };

  const save = async () => {
    if (!form.title?.trim()) {
      toast.error("Product name is required");
      return;
    }
    setSaving(true);
    try {
      // Clean the metal options + weight matrix and derive the primary scalar
      // fields (the first option) so storefront/pricing reading scalars still work.
      const cleanMetalOptions = (form.metal_options || [])
        .filter((o) => o.type && (o.purities?.length || o.colors?.length))
        .map((o) => ({
          type: o.type,
          purities: o.purities || [],
          colors: o.colors || [],
        }));
      const cleanWeightMatrix = (form.weight_matrix || [])
        .filter((r) => r.carat !== "" && r.weightG !== "")
        .map((r) => ({ carat: Number(r.carat), weightG: Number(r.weightG) }))
        .sort((a, b) => a.carat - b.carat);
      const primary = cleanMetalOptions[0] || {};
      const cover = pickCover();
      // Manufacturing block + size→weight rows (folded into metadata server-side).
      const mfg = {
        mfgDesign: form.mfg_design || undefined,
        waxWt: form.wax_wt !== "" ? Number(form.wax_wt) : undefined,
        camWt: form.cam_wt !== "" ? Number(form.cam_wt) : undefined,
        molds: (form.molds || []).filter((m) => m.name || m.locker || m.pcs),
        productionImages: (form.production_images || []).filter(Boolean),
      };
      const cleanSizeDiff = (form.size_weight_diff || [])
        .filter((r) => r.size !== "" && r.percent !== "")
        .map((r) => ({ size: String(r.size), percent: Number(r.percent) }));

      const payload = {
        ...form,
        mfg,
        size_weight_diff: cleanSizeDiff,
        pairs_with: pairsWithItems.map((x) => x.id),
        // Primary scalars derived from the first metal option (back-compat).
        metal: primary.type || form.metal,
        metal_purity: primary.purities?.[0] || form.metal_purity,
        metal_color: primary.colors?.[0] || form.metal_color,
        product_image: cover,
        metadata: {
          // Manual only — never auto-derived from Design No/Name. Type the
          // SAME group code (e.g. "LR-001") on every product that's a
          // diamond-shape variant of one another; leave blank for a
          // standalone product with no shape variants.
          designGroup: (form.design_group || "").trim() || undefined,
          metalOptions: cleanMetalOptions,
          weightMatrix: cleanWeightMatrix,
        },
        materials: materials.filter((m) =>
          Object.values(m).some((v) => v !== "" && v != null)
        ),
      };
      const url = isEdit
        ? `/api/product-management/${id}`
        : "/api/product-management";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(j?.message) ? j.message.join(", ") : j?.message || "Save failed"
        );
      }
      const saved = await res.json();
      const productId = id ?? saved?.data?.id ?? saved?.id;

      // Media sync — create-then-delete so a transient failure can NEVER wipe a
      // product's images. We POST the full current set first; only if EVERY POST
      // succeeds do we remove the rows that existed at load. On any failure we keep
      // the old rows and tell the user, instead of silently ending up with none.
      if (productId) {
        let order = 0;
        let mediaFailures = 0;
        for (const color of coverColors) {
          for (const item of colorMedia[color] || []) {
            if (!item.url) continue;
            order++;
            try {
              const r = await fetch("/api/product-management/media", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                  productId,
                  url: item.url,
                  metalColor: color,
                  mediaType: item.type || detectType(item.url),
                  // Cover = the exact image chosen as the product cover (any color).
                  isCover: !!cover && item.url === cover,
                  sortOrder: order,
                  title: form.title,
                  altText: item.role || "gallery", // main | rollover | gallery
                }),
              });
              if (!r.ok) mediaFailures++;
            } catch {
              mediaFailures++;
            }
          }
        }
        if (mediaFailures === 0) {
          for (const mid of existingMediaIds) {
            await fetch(`/api/product-management/media?id=${mid}`, {
              method: "DELETE",
              headers: authHeaders(),
            }).catch(() => {});
          }
        } else {
          toast.error(
            `${mediaFailures} media item(s) didn't save — your existing images were kept. Please retry.`
          );
        }
      }

      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/dashboard/product-management/my-products");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ContentLoader />;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" mode="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {isEdit ? "Edit Design / Product" : "New Design / Product"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {form.design_no ? `Design No: ${form.design_no}` : "Create a new product"}
            </p>
          </div>
        </div>
      </div>

      {/* Section: Design Info */}
      <Section title="Design Info & Classification">
        <Grid>
          <Field label="Product Name *">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Round Solitaire Ring" />
          </Field>
          <Field label="Design No">
            <Input value={form.design_no} onChange={(e) => set("design_no", e.target.value)} placeholder="LR-001-RND" />
          </Field>
          <Field label="Group (diamond shape variants)" hint="Type the SAME code on every product that's a shape variant of one another, e.g. LR-001-RND / LR-001-OVL / LR-001-PRI all get 'LR-001' — they'll link and show a shape switcher on the storefront. Leave blank for a standalone product with no shape variant.">
            <Input value={form.design_group} onChange={(e) => set("design_group", e.target.value)} placeholder="e.g. LR-001 — blank = no group" />
          </Field>
          <Field label="Product Type">
            <Select value={form.product_type} onChange={(e) => set("product_type", e.target.value)} options={productTypeOptions} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => set("category", e.target.value)} options={CATEGORIES} />
          </Field>
          <Field label="Collection">
            <Input value={form.collection} onChange={(e) => set("collection", e.target.value)} placeholder="e.g. Bridal" />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => set("gender", e.target.value)} options={GENDERS} />
          </Field>
          <Field label="Style">
            <Input value={form.design_style} onChange={(e) => set("design_style", e.target.value)} placeholder="e.g. Solitaire, Halo" />
          </Field>
          <Field label="Make Type">
            <Input value={form.make_type} onChange={(e) => set("make_type", e.target.value)} placeholder="e.g. Casting, Handmade" />
          </Field>
          <Field label="Vendor Code">
            <Input value={form.vendor_code} onChange={(e) => set("vendor_code", e.target.value)} placeholder="Vendor code" />
          </Field>
          <Field label="CAD Designer">
            <Input value={form.cad_designer} onChange={(e) => set("cad_designer", e.target.value)} placeholder="e.g. AKASH" />
          </Field>
          <Field label="Default Size">
            <Input value={form.default_size} onChange={(e) => set("default_size", e.target.value)} placeholder="e.g. US-7" />
          </Field>
          <Field label="Parent Design">
            <Input value={form.parent_design} onChange={(e) => set("parent_design", e.target.value)} placeholder="Parent design no" />
          </Field>
          <Field label="Design Package">
            <Input value={form.design_package} onChange={(e) => set("design_package", e.target.value)} placeholder="Package" />
          </Field>
        </Grid>
        <Field label="Short Description" full hint="1-2 line teaser shown on the PDP buy box and product cards — separate from the full Description below.">
          <Textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)} rows={2} maxLength={160} placeholder="e.g. A sleek half bezel cradles a round brilliant — architectural, modern, unmistakable." />
          <p className="text-[11px] text-muted-foreground">{(form.short_description || "").length}/160</p>
        </Field>
        <Field label="Description" full>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description" />
        </Field>
        <Field label="Remarks" full>
          <Input value={form.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Internal remarks (not shown on storefront)" />
        </Field>
      </Section>

      {/* Section: More classification / marketing — optional, rarely needed */}
      <Section
        title="More Details"
        advanced
        hint="Extra classification & marketing fields — all optional. Most products don't need these."
      >
        <Grid>
          <Field label="Sub Category / Style">
            <Input value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder="e.g. Solitaire" />
          </Field>
          <Field label="Occasion">
            <Input value={form.occasion} onChange={(e) => set("occasion", e.target.value)} placeholder="e.g. Engagement" />
          </Field>
          <Field label="Brand">
            <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="RJ House" />
          </Field>
          <Field label="Designer">
            <Input value={form.designer} onChange={(e) => set("designer", e.target.value)} placeholder="Designer name" />
          </Field>
          <Field label="Title Line">
            <Input value={form.title_line} onChange={(e) => set("title_line", e.target.value)} placeholder="Marketing title" />
          </Field>
        </Grid>
      </Section>

      {/* Section: Metals Offered (multi-type, multi-purity, multi-color) */}
      <Section title="Metals Offered">
        <p className="text-xs text-muted-foreground mb-3">
          Add every metal this product is sold in. For each metal pick the purities and
          colors offered. The first metal/purity/color is used as the default.
        </p>
        <div className="space-y-3">
          {form.metal_options.map((opt, i) => {
            const cat = metalCatalog[opt.type] || { purities: [], colors: [] };
            return (
              <div key={i} className="border border-border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-secondary-foreground">Metal</span>
                    <select
                      value={opt.type}
                      onChange={(e) =>
                        setMetalOption(i, { type: e.target.value, purities: [], colors: [] })
                      }
                      className="border border-input rounded-md px-2.5 py-1.5 text-sm bg-white"
                    >
                      {metalTypeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {form.metal_options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetalOption(i)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-secondary-foreground mb-1.5">
                      Purities / Karat
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.purities.map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setMetalOption(i, { purities: toggleInList(opt.purities, p) })}
                          className={`px-2.5 py-1 rounded-full text-xs border ${
                            opt.purities.includes(p)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-white text-gray-600 border-input"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary-foreground mb-1.5">Colors</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.colors.map((c) => {
                        const sw = colorHexFor(c);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setMetalOption(i, { colors: toggleInList(opt.colors, c) })}
                            className={`px-2.5 py-1 rounded-full text-xs border inline-flex items-center gap-1.5 ${
                              opt.colors.includes(c)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white text-gray-600 border-input"
                            }`}
                          >
                            {sw?.hex && (
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-black/15"
                                style={{
                                  background: sw.hex2
                                    ? `linear-gradient(135deg, ${sw.hex} 50%, ${sw.hex2} 50%)`
                                    : sw.hex,
                                }}
                              />
                            )}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={addMetalOption}>
          <Plus className="size-3.5" /> Add Metal
        </Button>
      </Section>

      {/* Section: per-product Diamond Carat → Metal Weight (managed here per product,
          not from a global master). Primary/visible — this is how size→weight is set. */}
      <Section title="Diamond Carat → Metal Weight">
        <p className="text-xs text-muted-foreground mb-3">
          Set the metal weight (grams) for each diamond carat size <b>for this product</b>.
          Pricing uses the matching row&apos;s metal weight as the net weight — this is where
          each product&apos;s size&nbsp;→&nbsp;weight is managed. e.g. 1.00&nbsp;ct&nbsp;→&nbsp;4.5&nbsp;g,
          1.50&nbsp;ct&nbsp;→&nbsp;5.2&nbsp;g.
        </p>
        <div className="space-y-2 max-w-[480px]">
          {form.weight_matrix.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No rows yet — pricing falls back to the Net / Gross weight fields below.
            </p>
          )}
          {form.weight_matrix.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  step="0.01"
                  value={row.carat}
                  onChange={(e) => setWeightRow(i, "carat", e.target.value)}
                  placeholder="1.00"
                  className="w-28"
                />
                <span className="text-xs text-secondary-foreground">ct</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  step="0.01"
                  value={row.weightG}
                  onChange={(e) => setWeightRow(i, "weightG", e.target.value)}
                  placeholder="4.50"
                  className="w-28"
                />
                <span className="text-xs text-secondary-foreground">g metal</span>
              </div>
              <button
                type="button"
                onClick={() => removeWeightRow(i)}
                className="text-red-500 hover:text-red-600 ms-1"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={addWeightRow}>
          <Plus className="size-3.5" /> Add Carat → Weight Row
        </Button>
      </Section>

      {/* Section: Diamond, Weights & live price. Every figure here is computed
          from Materials — this section is read-only + overrides + live price. */}
      <Section title="Diamond, Weights & Live Price">
        <p className="text-xs text-muted-foreground mb-3">
          Every field below is <b>computed automatically from Materials</b> — add rows there, not
          here. <b>Net weight</b> sums the Metal rows, unless the center stone&apos;s carat matches a
          row in <b>Diamond Carat&nbsp;→&nbsp;Metal&nbsp;Weight</b> above, which then overrides it.{" "}
          <b>Gross weight</b> = net + diamond weight (1&nbsp;ct&nbsp;=&nbsp;0.2&nbsp;g). Shape/Quality
          come only from the Materials row checked as the <b>center stone</b> — no center stone
          checked means no center-stone customizer on the storefront. Labour is added automatically
          from the Pricing&nbsp;Engine — you don&apos;t enter it here.
        </p>
        <Grid>
          <Field label="Diamond Shape (center stone)">
            <ComputedField value={derived.shape || "— no center stone —"} />
          </Field>
          <Field label="Diamond Quality · used for pricing">
            <ComputedField value={derived.quality || "—"} />
          </Field>
          <Field label="Net Weight (g) · metal only">
            <ComputedField value={Number(form.net_weight || 0).toFixed(2)} />
          </Field>
          <Field label="Gross Weight (g) · metal + stones">
            <ComputedField value={Number(form.gross_weight || 0).toFixed(2)} />
          </Field>
          <Field label="Diamond Weight (ct)">
            <ComputedField value={Number(form.diamond_wt || 0).toFixed(2)} />
          </Field>
          <Field label="Diamond Pieces">
            <ComputedField value={Number(form.diamond_pcs || 0)} />
          </Field>
          <Field label="Length (mm)"><Input type="number" value={form.length} onChange={(e) => set("length", e.target.value)} placeholder="0" /></Field>
          <Field label="Width (mm)"><Input type="number" value={form.width} onChange={(e) => set("width", e.target.value)} placeholder="0" /></Field>
        </Grid>
        {weightByPurity && (
          <p className="text-[11px] text-muted-foreground mt-1">
            Weight by purity (auto, ±15% off 14K — base is {form.metal_purity || "—"} at{" "}
            {Number(form.net_weight).toFixed(2)}g):{" "}
            {weightByPurity.map((w) => `${w.label} ${w.g.toFixed(2)}g`).join(" · ")}
          </p>
        )}
        <Grid>
          <Field label="Design MRP Override ($)">
            <Input type="number" value={form.mrp_override} onChange={(e) => set("mrp_override", e.target.value)} placeholder="blank = engine price" />
            <p className="text-[11px] text-muted-foreground">When set, this exact price is charged — the engine price below is ignored.</p>
          </Field>
          <Field label="Labour Amount Override ($)">
            <Input type="number" value={form.labour_amount} onChange={(e) => set("labour_amount", e.target.value)} placeholder="blank = labour master" />
            <p className="text-[11px] text-muted-foreground">Flat labour for this design; overrides the Labour Rate master.</p>
          </Field>
        </Grid>
        <ComputedPrice form={form} materials={materials} />
      </Section>

      {/* Section: ERP "Desig Size Wt Diff" — ring size → weight increase % */}
      <Section title="Size → Weight Adjustment">
        <p className="text-xs text-muted-foreground mb-3">
          Weight increase per ring size vs the default size ({form.default_size || "e.g. US-7"}).
          e.g. US-8 → +5% metal weight. Used for size-based pricing.
        </p>
        <div className="space-y-2 max-w-[520px]">
          {form.size_weight_diff.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No rows — all sizes price at the default weight.</p>
          )}
          {form.size_weight_diff.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={row.size}
                onChange={(e) => set("size_weight_diff", form.size_weight_diff.map((r, idx) => idx === i ? { ...r, size: e.target.value } : r))}
                placeholder="US-8"
                className="w-28"
              />
              <span className="text-muted-foreground">→ +</span>
              <Input
                type="number" step="0.1"
                value={row.percent}
                onChange={(e) => set("size_weight_diff", form.size_weight_diff.map((r, idx) => idx === i ? { ...r, percent: e.target.value } : r))}
                placeholder="5"
                className="w-24"
              />
              <span className="text-xs text-secondary-foreground">%
                {Number(form.net_weight) > 0 && Number(row.percent) > 0 &&
                  ` ≈ +${((Number(form.net_weight) * Number(row.percent)) / 100).toFixed(2)} g`}
              </span>
              <button type="button" onClick={() => set("size_weight_diff", form.size_weight_diff.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-600 ms-1">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => set("size_weight_diff", [...form.size_weight_diff, emptySizeDiff()])}>
          <Plus className="size-3.5" /> Add Size Row
        </Button>
      </Section>

      {/* Section: Manufacturing (ERP Design Master) */}
      <Section title="Manufacturing (ERP)">
        <Grid>
          <Field label="MFG Design"><Input value={form.mfg_design} onChange={(e) => set("mfg_design", e.target.value)} placeholder="MFG design ref" /></Field>
          <Field label="Wax Wt (g)"><Input type="number" value={form.wax_wt} onChange={(e) => set("wax_wt", e.target.value)} placeholder="0.00" /></Field>
          <Field label="Cam Wt (g)"><Input type="number" value={form.cam_wt} onChange={(e) => set("cam_wt", e.target.value)} placeholder="0.00" /></Field>
        </Grid>
        <div className="mt-2">
          <div className="text-xs font-semibold mb-1.5">Mold Library</div>
          <div className="space-y-2 max-w-[560px]">
            {form.molds.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={m.name} onChange={(e) => set("molds", form.molds.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))} placeholder="Mold name" />
                <Input value={m.locker} onChange={(e) => set("molds", form.molds.map((r, idx) => idx === i ? { ...r, locker: e.target.value } : r))} placeholder="Locker" className="w-32" />
                <Input type="number" value={m.pcs} onChange={(e) => set("molds", form.molds.map((r, idx) => idx === i ? { ...r, pcs: e.target.value } : r))} placeholder="Pcs" className="w-20" />
                <button type="button" onClick={() => set("molds", form.molds.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-600">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => set("molds", [...form.molds, emptyMold()])}>
            <Plus className="size-3.5" /> Add Mold
          </Button>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold mb-1.5">Production Images (internal — not shown on storefront)</div>
          <div className="flex flex-wrap gap-3">
            {form.production_images.map((url, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-20 h-20 object-cover rounded border border-border" />
                <button type="button" onClick={() => set("production_images", form.production_images.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 bg-white border border-border rounded-full p-0.5 text-red-500">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <div className="w-20">
              <ImageUpload compact value="" onChange={(v) => v && set("production_images", [...form.production_images, v])} />
            </div>
          </div>
        </div>
      </Section>

      {/* Section: Diamond Certification & 4Cs */}
      <Section
        title="Diamond Certification & 4Cs"
        advanced
        hint="Color/Clarity are computed from the Materials center-stone row (used by both the Pricing Engine's Diamond Rate matching and the product page) — enter them there, not here. Cut and the certificate fields below are separate, cert-specific details."
      >
        <Grid>
          <Field label="Cut"><Select value={form.diamond_cut} onChange={(e) => set("diamond_cut", e.target.value)} options={DIAMOND_CUTS} /></Field>
          <Field label="Color (center stone)"><ComputedField value={derived.color || "— no center stone —"} /></Field>
          <Field label="Clarity (center stone)"><ComputedField value={derived.clarity || "—"} /></Field>
          <Field label="Certifying Lab"><Select value={form.cert_lab} onChange={(e) => set("cert_lab", e.target.value)} options={CERT_LABS} /></Field>
          <Field label="Certificate Number"><Input value={form.cert_number} onChange={(e) => set("cert_number", e.target.value)} placeholder="e.g. 2447851036" /></Field>
          <Field label="Certificate URL (optional)"><Input value={form.cert_url} onChange={(e) => set("cert_url", e.target.value)} placeholder="https://… verify link" /></Field>
        </Grid>
      </Section>

      {/* Section: Material Added In Design (ERP-style BOM) */}
      <Section
        title="Material Added In Design"
        action={<Button variant="outline" size="sm" onClick={addMaterial}><Plus className="h-4 w-4 mr-1" /> Add Material</Button>}
      >
        <p className="text-xs font-medium mb-2 text-secondary-foreground">
          {materialSummary(materials)}
        </p>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {["Component", "Type", "Metal/Stone", "Shape", "Quality", "Color", "Size (MM)", "Setting", "Pcs", "Wt", "Center", ""].map((h) => (
                  <th key={h} className="p-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-1">
                    <Input className="h-8 text-xs min-w-[60px]" value={row.component ?? ""} onChange={(e) => setMaterial(i, "component", e.target.value)} />
                  </td>
                  <td className="p-1">
                    <select
                      value={row.materialType ?? ""}
                      onChange={(e) => setMaterial(i, "materialType", e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-1.5 text-xs min-w-[86px]"
                    >
                      <option value="">Type</option>
                      {MATERIAL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  {["metalStoneType", "shape", "quality", "color", "size", "setting", "pcs", "wt"].map((k) => (
                    <td key={k} className="p-1">
                      <Input className="h-8 text-xs min-w-[62px]" value={row[k] ?? ""} onChange={(e) => setMaterial(i, k, e.target.value)} />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    {/* ERP's red/green dot — green marks the center stone */}
                    <input
                      type="checkbox"
                      checked={!!row.centerStone}
                      onChange={(e) => setMaterial(i, "centerStone", e.target.checked)}
                      title="Center stone"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <Button variant="outline" mode="icon" size="sm" onClick={() => removeMaterial(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr><td colSpan={12} className="p-4 text-center text-muted-foreground">No materials added — e.g. Metal/GOLD/14KT 8.5g, Diamond/CVD/RND 1.40MM ×42.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section: SEO & Google Shopping / AI search */}
      <Section title="SEO & Google Shopping">
        <p className="text-xs text-muted-foreground mb-3">
          Powers Google search snippets, Google Shopping and AI shopping results
          (Google AI, Gemini, ChatGPT). Leave blank to use smart defaults from the
          product name/description.
        </p>
        <Grid>
          <Field label="Meta Title">
            <Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={form.title || "defaults to product name"} maxLength={70} />
            <p className="text-[11px] text-muted-foreground">{(form.seo_title || "").length}/70</p>
          </Field>
          <Field label="Keywords (comma separated)">
            <Input value={form.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)} placeholder="lab grown diamond ring, 14k gold…" />
          </Field>
          <Field label="Availability (Google)">
            <select
              value={form.shopping_availability}
              onChange={(e) => set("shopping_availability", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Made to order (default — listed as In stock)</option>
              <option value="preorder">Preorder</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </Field>
          <Field label="Google Product Category" hint="Auto: Rings 200 · Necklaces 196 · Earrings 194 · Bracelets 191 · Pendants 193">
            <Input value={form.google_product_category} onChange={(e) => set("google_product_category", e.target.value)} placeholder="auto from category" />
          </Field>
          <Field label="Display Discount % (promo)" hint="Storefront shows strikethrough + 'Save X%' + ENDS SOON. Charged price stays the real price. Blank = no promo badge.">
            <Input type="number" min="0" max="89" value={form.display_discount_percent} onChange={(e) => set("display_discount_percent", e.target.value)} placeholder="e.g. 30" />
          </Field>
        </Grid>
        <Field label="Meta Description" full>
          <Textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} rows={3} maxLength={320} placeholder="155–160 characters shown in Google results" />
          <p className="text-[11px] text-muted-foreground">{(form.seo_description || "").length}/320 · 155–160 recommended for Google</p>
        </Field>
        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground">Pairs Well With (max 4) — shown under the FAQs on the product page</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {pairsWithItems.map((it) => (
              <span key={it.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
                {it.title}
                <button type="button" className="text-red-500" onClick={() => setPairsWithItems(pairsWithItems.filter((x) => x.id !== it.id))}>×</button>
              </span>
            ))}
          </div>
          {pairsWithItems.length < 4 && (
            <div className="relative max-w-[380px] mt-1.5">
              <Input value={pairSearch} onChange={(e) => setPairSearch(e.target.value)} placeholder="Search products to pair…" />
              {pairResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow">
                  {pairResults.map((r) => (
                    <button key={r.id} type="button"
                      className="block w-full text-left px-3 py-1.5 text-xs hover:bg-muted"
                      onClick={() => {
                        if (!pairsWithItems.find((x) => x.id === r.id)) setPairsWithItems([...pairsWithItems, r]);
                        setPairSearch(""); setPairResults([]);
                      }}>
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Social Share Image (OG) — optional">
            <ImageUpload compact value={form.seo_og_image} onChange={(v) => set("seo_og_image", v)} />
          </Field>
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
            <div><b>Sent automatically to Google/AI:</b></div>
            <div>Brand: {form.brand || "Rangani Jewelry House"} · MPN: {form.design_no || "—"} · Condition: New</div>
            <div>Item group (shape variants): {form.design_group || "—"}</div>
            <div>No barcode (identifier_exists = no) · Feed: /api/v1/feeds/google.xml</div>
          </div>
        </div>
      </Section>

      {/* Section: Media — primary cover + unbounded per-color images/videos/3D */}
      <Section title="Media (images, videos & 3D)">
        <div className="mb-5 max-w-[220px]">
          <ImageUpload label="Primary / Cover Image" value={form.product_image} onChange={(v) => set("product_image", v)} />
        </div>
        {availableColors.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Pick at least one color under <b>Metals Offered</b> to add media.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {availableColors.map((color) => (
              <MediaManager
                key={color}
                color={color}
                items={colorMedia[color] || []}
                onChange={(items) => setMediaForColor(color, items)}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Media columns follow the colors you selected under <b>Metals Offered</b>.
          Add as many <b>images, videos, or 3D models (.glb)</b> per color as you like.
          Tag one as <b>★ Main</b> (default) and one as <b>↻ Rollover</b> (shown on hover); the rest are gallery.
        </p>
      </Section>

      <label className="flex items-center gap-2 text-sm mt-2">
        <input type="checkbox" checked={!!form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
        Active (visible on storefront)
      </label>

      {/* Sticky action bar (stays inside the content column, respects sidebar) */}
      <div className="sticky bottom-0 -mx-4 md:-mx-6 mt-6 bg-background/95 backdrop-blur border-t border-border px-4 md:px-6 py-3 flex justify-end gap-2 z-20">
        <Button variant="outline" onClick={() => router.push("/dashboard/product-management/my-products")}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save Design"}
        </Button>
      </div>
    </div>
  );
}

// A form section. Pass `advanced` to make it a collapsible "Optional" block that
// starts closed — used to tuck rarely-filled fields (4Cs, material breakdown,
// per-carat weight overrides) out of the common add-product path.
const Section = ({ title, action, children, advanced = false, hint }) => {
  const [open, setOpen] = useState(!advanced);

  if (!advanced) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-md mb-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          {action}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-md mb-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left"
        >
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-[11px] font-normal text-muted-foreground border border-border rounded px-1.5 py-0.5">
            Optional
          </span>
        </button>
        {open && action}
      </div>
      {open && (
        <>
          {hint && <p className="text-xs text-muted-foreground mb-3 -mt-1">{hint}</p>}
          {children}
        </>
      )}
    </div>
  );
};

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
    {children}
  </div>
);

const Field = ({ label, children, full }) => (
  <div className={`space-y-1.5 ${full ? "col-span-full" : ""}`}>
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value || ""}
    onChange={onChange}
    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
  >
    <option value="">Select</option>
    {options.map((o) => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

// Read-only mirror of a value derived from the Materials BOM table.
const ComputedField = ({ value }) => (
  <div className="flex h-9 w-full items-center justify-between rounded-md border border-dashed border-border bg-muted/40 px-3 text-sm text-secondary-foreground">
    <span>{value}</span>
    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">from Materials</span>
  </div>
);

// Read-only live price computed by the Pricing Engine from the rate masters.
// Products never store a price — this just previews what the engine will charge.
function ComputedPrice({ form, materials }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const primaryOpt = (form.metal_options || [])[0] || {};
    const weightMatrix = (form.weight_matrix || [])
      .filter((r) => r.carat !== "" && r.weightG !== "")
      .map((r) => ({ carat: Number(r.carat), weightG: Number(r.weightG) }));
    const attrs = {
      metalType: primaryOpt.type || form.metal,
      metalPurity: primaryOpt.purities?.[0] || form.metal_purity,
      metalColor: primaryOpt.colors?.[0] || form.metal_color,
      grossWeightG: Number(form.gross_weight) || 0,
      netWeightG: Number(form.net_weight) || 0,
      diamondShape: form.shape,
      diamondWeightCt: Number(form.diamond_wt) || 0,
      diamondQuality: form.diamond_quality,
      category: form.category,
      productWeightMatrix: weightMatrix.length ? weightMatrix : undefined,
    };
    if (!attrs.grossWeightG && !attrs.netWeightG && !attrs.diamondWeightCt) {
      setResult(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pricing-engine/preview", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(attrs),
        });
        setResult(await res.json());
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [
    form.metal, form.metal_purity, form.metal_color, form.gross_weight, form.net_weight,
    form.shape, form.diamond_wt, form.diamond_quality, form.category,
    JSON.stringify(form.metal_options), JSON.stringify(form.weight_matrix),
  ]);

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">
            Computed Price (live, from Pricing Engine — not stored)
          </div>
          <div className="text-lg font-semibold">
            {Number(form.mrp_override) > 0
              ? `$${Number(form.mrp_override).toLocaleString()} (MRP override)`
              : loading
              ? "Calculating…"
              : result
              ? `$${Number(result.finalPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "Enter weight / diamond to preview"}
          </div>
        </div>
        {result && (
          <div className="text-right text-[11px] text-muted-foreground leading-tight">
            <div>metal ${result.metalValue} · diamond ${result.diamondValue}</div>
            <div>labour ${result.laborCharge} · charges ${result.additionalCharges}</div>
            {result.warnings?.length > 0 && (
              <div className="text-red-500">⚠ {result.warnings[0]}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
