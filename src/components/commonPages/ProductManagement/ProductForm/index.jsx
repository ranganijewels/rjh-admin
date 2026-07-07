"use client";

import React, { useEffect, useState } from "react";
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
const SHAPES = ["Round", "Oval", "Princess", "Emerald", "Cushion", "Pear", "Marquise", "Radiant", "Asscher", "Heart"];
const METAL_COLORS = ["White", "Yellow", "Rose"];
const METAL_TYPES = ["Gold", "Silver", "Platinum", "Rose Gold", "White Gold"];
const METAL_PURITIES = ["24K", "22K", "18K", "14K", "999 (Silver)", "925 (Silver)", "800 (Silver)", "950 (Platinum)", "Custom"];

// Each metal type and the purities + colors it can be offered in. Drives the
// "Metal Options" builder so a product can offer e.g. Gold (14/18/22K) AND
// Silver (925/999), each in its own set of colors.
const METAL_CATALOG = {
  Gold: { purities: ["14K", "18K", "22K", "24K"], colors: ["White", "Yellow", "Rose"] },
  Silver: { purities: ["925", "999", "800"], colors: ["Silver"] },
  Platinum: { purities: ["950", "900"], colors: ["Platinum"] },
};
const METAL_TYPE_OPTIONS = Object.keys(METAL_CATALOG);
const emptyMetalOption = () => ({ type: "Gold", purities: [], colors: [] });
const emptyWeightRow = () => ({ carat: "", weightG: "" });

// All colors selected across every metal option — drives the media columns.
const colorsFromMetalOptions = (opts) => {
  const set = new Set();
  (opts || []).forEach((o) => (o.colors || []).forEach((c) => set.add(c)));
  return [...set];
};

// Design Group is AUTO-derived from the product name (no manual entry): the
// leading design name before the carat weight. Every shape of the same design
// shares that leading name, so they auto-link. e.g.
//   "Nirvana 1 ctw Pear Lab Grown Diamond Solitaire Ring"  → "NIRVANA"
//   "Audrey 1 ½ Ctw Round Half Bezel Two Tone Engagement Ring" → "AUDREY"
const CARAT_CUE = "\\d|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]"; // digit OR a unicode vulgar fraction
const deriveDesignGroup = (title) => {
  if (!title || !title.trim()) return "";
  // Strip accents first ("Étoile" → "Etoile") so the A–Z filter below can't
  // corrupt the name (uppercase "É" is not in A–Z and would be dropped).
  const t = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  // Design name = the leading words before the first carat token (a number or a
  // fraction like "1 ½"). If the title has no such token, use the first 2 words.
  const m = t.match(new RegExp(`^(.*?)(?=\\s+(?:${CARAT_CUE}))`, "u"));
  const name = m ? m[1] : t.split(/\s+/).slice(0, 2).join(" ");
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
};
const GENDERS = ["Women", "Men", "Unisex"];
const CERT_LABS = ["", "GIA", "IGI", "IGL", "HRD", "GCAL", "SGL"];
const DIAMOND_CUTS = ["", "Ideal", "Excellent", "Very Good", "Good", "Fair"];
const DIAMOND_COLORS = ["", "D", "E", "F", "G", "H", "I", "J", "K"];
const DIAMOND_CLARITIES = ["", "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];

const EMPTY = {
  title: "", design_no: "", category: "", subcategory: "", collection: "",
  occasion: "", brand: "", gender: "", designer: "", title_line: "", description: "",
  design_group: "", metal: "Gold", metal_purity: "18K", metal_color: "White",
  shape: "Round", diamond_quality: "", gross_weight: "", net_weight: "", length: "",
  width: "", diamond_wt: "", diamond_pcs: "", labour_amount: "",
  diamond_cut: "", diamond_color: "", diamond_clarity: "",
  cert_lab: "", cert_number: "", cert_url: "",
  product_image: "", is_active: true,
  // Default offering — one Gold option in white; user can add Silver etc.
  metal_options: [{ type: "Gold", purities: ["18K"], colors: ["White"] }],
  weight_matrix: [],
};

const EMPTY_MATERIAL = {
  component: "", metalStoneType: "", shape: "", quality: "",
  color: "", size: "", setting: "", pcs: "", wt: "",
};

// Every color any metal can be offered in — each gets a media bucket so the
// columns can be shown/hidden as the user picks colors.
const ALL_MEDIA_COLORS = [
  ...new Set(Object.values(METAL_CATALOG).flatMap((m) => m.colors)),
];
const emptyColorMedia = () =>
  ALL_MEDIA_COLORS.reduce((acc, c) => ({ ...acc, [c]: [] }), {});

export default function ProductForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [materials, setMaterials] = useState([]);
  const [colorMedia, setColorMedia] = useState(emptyColorMedia()); // { White:[{id?,url,type,role}], ... }
  const [existingMediaIds, setExistingMediaIds] = useState([]); // ids present at load

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
          labour_amount: p.labour_amount ?? "",
          product_image: p.product_image ?? "",
          is_active: p.is_active ?? true,
        });
        setMaterials(Array.isArray(p.materials) ? p.materials : []);
        // Reconstruct per-color media lists (role in altText, type in mediaType)
        const media = Array.isArray(p.media) ? p.media : [];
        const cm = emptyColorMedia();
        const ids = [];
        media.forEach((m) => {
          const url = m.url ?? m.fileUrl;
          const color = ALL_MEDIA_COLORS.includes(m.metalColor) ? m.metalColor : null;
          const role = ["main", "rollover"].includes((m.altText || "").toLowerCase())
            ? m.altText.toLowerCase()
            : "gallery";
          const type =
            m.mediaType && m.mediaType !== "image" ? m.mediaType : detectType(url);
          if (color) cm[color].push({ id: m.id, url, type, role });
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
  const coverColors = availableColors.length ? availableColors : ALL_MEDIA_COLORS;
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

      const payload = {
        ...form,
        // Primary scalars derived from the first metal option (back-compat).
        metal: primary.type || form.metal,
        metal_purity: primary.purities?.[0] || form.metal_purity,
        metal_color: primary.colors?.[0] || form.metal_color,
        product_image: cover,
        metadata: {
          // Auto-derived from the product name so same-name shapes link automatically.
          designGroup: deriveDesignGroup(form.title) || undefined,
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
            <Input value={form.design_no} onChange={(e) => set("design_no", e.target.value)} placeholder="RJ-RING-01" />
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
          <Field label="Design Group (auto-linked from name)">
            <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm">
              {deriveDesignGroup(form.title) || (
                <span className="text-muted-foreground">— enter a product name —</span>
              )}
            </div>
          </Field>
        </Grid>
        <Field label="Description" full>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description" />
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
            const cat = METAL_CATALOG[opt.type] || { purities: [], colors: [] };
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
                      {METAL_TYPE_OPTIONS.map((t) => (
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
                      {cat.colors.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setMetalOption(i, { colors: toggleInList(opt.colors, c) })}
                          className={`px-2.5 py-1 rounded-full text-xs border ${
                            opt.colors.includes(c)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-white text-gray-600 border-input"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
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

      {/* Section: Diamond, Weights & live price. Labour is NOT here — it comes from
          the Pricing Engine's Labour Rate master, so a product-level field would mislead. */}
      <Section title="Diamond, Weights & Live Price">
        <p className="text-xs text-muted-foreground mb-3">
          <b>Net weight</b> (metal only) drives the metal cost; <b>gross weight</b> is metal + stones.
          Leave net blank to fall back to the per-product Carat&nbsp;→&nbsp;Metal&nbsp;Weight table above.
          Labour is added automatically from the Pricing&nbsp;Engine — you don&apos;t enter it here.
        </p>
        <Grid>
          <Field label="Diamond Shape"><Select value={form.shape} onChange={(e) => set("shape", e.target.value)} options={SHAPES} /></Field>
          <Field label="Diamond Quality · used for pricing"><Input value={form.diamond_quality} onChange={(e) => set("diamond_quality", e.target.value)} placeholder="VVS-VS / EF" /></Field>
          <Field label="Net Weight (g) · metal only"><Input type="number" value={form.net_weight} onChange={(e) => set("net_weight", e.target.value)} placeholder="0.00" /></Field>
          <Field label="Gross Weight (g) · metal + stones"><Input type="number" value={form.gross_weight} onChange={(e) => set("gross_weight", e.target.value)} placeholder="0.00" /></Field>
          <Field label="Diamond Weight (ct)"><Input type="number" value={form.diamond_wt} onChange={(e) => set("diamond_wt", e.target.value)} placeholder="0.00" /></Field>
          <Field label="Diamond Pieces"><Input type="number" value={form.diamond_pcs} onChange={(e) => set("diamond_pcs", e.target.value)} placeholder="0" /></Field>
          <Field label="Length (mm)"><Input type="number" value={form.length} onChange={(e) => set("length", e.target.value)} placeholder="0" /></Field>
          <Field label="Width (mm)"><Input type="number" value={form.width} onChange={(e) => set("width", e.target.value)} placeholder="0" /></Field>
        </Grid>
        <ComputedPrice form={form} materials={materials} />
      </Section>

      {/* Section: Diamond Certification & 4Cs */}
      <Section
        title="Diamond Certification & 4Cs"
        advanced
        hint="Exact grades from the diamond certificate. Optional — the coarse 'Diamond Quality' above is what pricing uses; add these to show cert details on the product page."
      >
        <Grid>
          <Field label="Cut"><Select value={form.diamond_cut} onChange={(e) => set("diamond_cut", e.target.value)} options={DIAMOND_CUTS} /></Field>
          <Field label="Color"><Select value={form.diamond_color} onChange={(e) => set("diamond_color", e.target.value)} options={DIAMOND_COLORS} /></Field>
          <Field label="Clarity"><Select value={form.diamond_clarity} onChange={(e) => set("diamond_clarity", e.target.value)} options={DIAMOND_CLARITIES} /></Field>
          <Field label="Certifying Lab"><Select value={form.cert_lab} onChange={(e) => set("cert_lab", e.target.value)} options={CERT_LABS} /></Field>
          <Field label="Certificate Number"><Input value={form.cert_number} onChange={(e) => set("cert_number", e.target.value)} placeholder="e.g. 2447851036" /></Field>
          <Field label="Certificate URL (optional)"><Input value={form.cert_url} onChange={(e) => set("cert_url", e.target.value)} placeholder="https://… verify link" /></Field>
        </Grid>
      </Section>

      {/* Section: Material Details */}
      <Section
        title="Material Details"
        advanced
        action={<Button variant="outline" size="sm" onClick={addMaterial}><Plus className="h-4 w-4 mr-1" /> Add Material</Button>}
      >
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {["Component", "Metal/Stone", "Shape", "Quality", "Color", "Size", "Setting", "Pcs", "Wt", ""].map((h) => (
                  <th key={h} className="p-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {["component", "metalStoneType", "shape", "quality", "color", "size", "setting", "pcs", "wt"].map((k) => (
                    <td key={k} className="p-1">
                      <Input className="h-8 text-xs min-w-[70px]" value={row[k] ?? ""} onChange={(e) => setMaterial(i, k, e.target.value)} />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <Button variant="outline" mode="icon" size="sm" onClick={() => removeMaterial(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr><td colSpan={10} className="p-4 text-center text-muted-foreground">No materials added.</td></tr>
              )}
            </tbody>
          </table>
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
      diamondShape: form.shape,
      diamondWeightCt: Number(form.diamond_wt) || 0,
      diamondQuality: form.diamond_quality,
      category: form.category,
      productWeightMatrix: weightMatrix.length ? weightMatrix : undefined,
    };
    if (!attrs.grossWeightG && !attrs.diamondWeightCt) {
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
    form.metal, form.metal_purity, form.metal_color, form.gross_weight,
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
            {loading
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
