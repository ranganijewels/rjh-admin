import { handleGETWithMap, handlePATCH, handleDELETE } from "@/lib/apiHandler";

// NestJS product entity (camelCase) → UI snake_case shape used by ProductCardView
function mapProductDetail(p) {
  if (!p || typeof p !== "object") return p;
  return {
    ...p,
    title: p.productName,
    is_active: p.status === "active",
    product_image: p.mainImageUrl,
    design_no: p.productCode,
    collection: p.collectionName,
    category: p.category,
    subcategory: p.subCategory,
    style: p.subCategory,
    metal: p.metalType,
    metal_purity: p.metalPurity,
    metal_color: p.metalColor,
    gender: p.gender ?? p.metadata?.gender ?? null,
    occasion: p.metadata?.occasion ?? null,
    brand: p.metadata?.brand ?? null,
    designer: p.metadata?.designer ?? null,
    title_line: p.metadata?.titleLine ?? p.seoTitle ?? null,
    remarks: p.metadata?.remarks ?? null,
    shape: p.diamondShape,
    diamond_quality: p.diamondQuality,
    diamond_cut: p.diamondCut,
    diamond_color: p.diamondColor,
    diamond_clarity: p.diamondClarity,
    cert_lab: p.diamondCertLab,
    cert_number: p.diamondCertNumber,
    cert_url: p.diamondCertUrl,
    gross_weight: p.grossWeightG,
    net_weight: p.netWeightG,
    length: p.lengthMm,
    width: p.widthMm,
    diamond_wt: p.diamondWeightCt,
    diamond_pcs: p.diamondCount,
    diamond_rate: p.metadata?.diamondRate ?? null,
    labour_rate: p.metadata?.labourRate ?? null,
    labour_amount: p.makingCharge,
    // No stored price — final price is computed live by the Pricing Engine.
    package: p.metadata?.plan ?? null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    // ProductCardView reads media[].url — NestJS returns media[].fileUrl
    media: Array.isArray(p.media)
      ? p.media
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((m) => ({ ...m, url: m.fileUrl ?? m.url }))
      : p.mainImageUrl
      ? [{ url: p.mainImageUrl }]
      : [],
    materials: Array.isArray(p.metadata?.materials)
      ? p.metadata.materials
      : Array.isArray(p.materials)
      ? p.materials
      : [],
    // Pass the raw metadata through so the form can read metalOptions / weightMatrix.
    metadata: p.metadata ?? {},
  };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleGETWithMap(
    `/api/v1/products/${id}`,
    { Authorization: authHeader },
    mapProductDetail
  );
}

// UI form fields → NestJS CreateProductDto / UpdateProductDto (camelCase).
// Design-master extras with no dedicated column (occasion, brand, designer,
// gender, titleLine, remarks, materials[]) are folded into `metadata`.
function toProductBody(body = {}) {
  const out = {};
  const set = (k, v) => {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  };
  const num = (k, v) => {
    if (v !== undefined && v !== null && v !== "") out[k] = Number(v);
  };
  set("productName", body.title ?? body.productName ?? body.product_name);
  set("productCode", body.design_no ?? body.productCode ?? body.product_code);
  set("collectionName", body.collection ?? body.collectionName);
  set("category", body.category);
  set("subCategory", body.subcategory ?? body.style ?? body.subCategory);
  set("metalType", body.metal ?? body.metalType ?? body.metal_type);
  set("metalPurity", body.metal_purity ?? body.metalPurity);
  set("metalColor", body.metal_color ?? body.metalColor);
  // Written unconditionally (see centerStoneShape below): these now always
  // mirror the Materials center-stone row, so blank must clear a previous
  // value instead of being skipped.
  out.diamondShape = body.shape || body.diamondShape || null;
  out.diamondQuality = body.diamond_quality || body.diamondQuality || null;
  // Center stone identity — written unconditionally (unlike set()/num() above)
  // because blank is meaningful here: it means "no center stone", and must
  // overwrite a previous value rather than being skipped, or unchecking the
  // center-stone row in Materials would leave stale data behind and the
  // storefront customizer would keep showing for a product that no longer
  // has one.
  out.centerStoneShape = body.center_stone_shape || body.centerStoneShape || null;
  out.centerStoneWeightCt =
    Number(body.center_stone_weight_ct ?? body.centerStoneWeightCt) || 0;
  set("diamondCut", body.diamond_cut ?? body.diamondCut);
  set("diamondColor", body.diamond_color ?? body.diamondColor);
  set("diamondClarity", body.diamond_clarity ?? body.diamondClarity);
  set("diamondCertLab", body.cert_lab ?? body.diamondCertLab);
  set("diamondCertNumber", body.cert_number ?? body.diamondCertNumber);
  set("diamondCertUrl", body.cert_url ?? body.diamondCertUrl);
  // Explicit SEO meta title wins; the marketing Title Line is the fallback.
  set("seoTitle", body.seo_title ?? body.title_line ?? body.seoTitle);
  set("seoDescription", body.seo_description ?? body.seoDescription);
  set("shopifyTags", body.seo_keywords ?? body.shopifyTags);
  set("ringSize", body.default_size ?? body.ringSize);
  set("description", body.description);
  set("shortDescription", body.short_description ?? body.shortDescription);
  num("grossWeightG", body.gross_weight ?? body.grossWeightG);
  num("netWeightG", body.net_weight ?? body.netWeightG);
  num("lengthMm", body.length ?? body.lengthMm);
  num("widthMm", body.width ?? body.widthMm);
  num("diamondWeightCt", body.diamond_wt ?? body.diamondWeightCt);
  num("diamondCount", body.diamond_pcs ?? body.diamondCount);
  num("makingCharge", body.labour_amount ?? body.makingCharge);
  // No price stored on products — mrp/srp removed; price comes from the engine.
  set("mainImageUrl", body.product_image ?? body.mainImageUrl);

  // Fold design-master extras into metadata (no dedicated columns).
  const meta = { ...(body.metadata || {}) };
  const setMeta = (k, v) => {
    if (v !== undefined && v !== null && v !== "") meta[k] = v;
  };
  setMeta("occasion", body.occasion);
  setMeta("brand", body.brand);
  setMeta("designer", body.designer);
  setMeta("gender", body.gender);
  setMeta("titleLine", body.title_line);
  setMeta("remarks", body.remarks);
  setMeta("plan", body.package);
  // ── ERP Design-Master extras ──────────────────────────────────────────
  setMeta("productType", body.product_type);
  setMeta("style", body.design_style);
  setMeta("makeType", body.make_type);
  setMeta("vendorCode", body.vendor_code);
  setMeta("cadDesigner", body.cad_designer);
  setMeta("parentDesign", body.parent_design);
  setMeta("designPackage", body.design_package);
  if (body.mfg && typeof body.mfg === "object") setMeta("mfg", body.mfg);
  if (Array.isArray(body.size_weight_diff))
    meta.sizeWeightDiff = body.size_weight_diff.filter(
      (r) => r && r.size !== "" && r.percent !== ""
    );
  const dd = Number(body.display_discount_percent);
  if (Number.isFinite(dd)) meta.displayDiscountPercent = dd > 0 ? dd : undefined;
  if (meta.displayDiscountPercent === undefined) delete meta.displayDiscountPercent;
  if (Array.isArray(body.pairs_with))
    meta.pairsWith = body.pairs_with.filter(Boolean).slice(0, 4);
  const mrp = Number(body.mrp_override);
  if (Number.isFinite(mrp)) meta.mrpOverride = mrp > 0 ? mrp : undefined;
  if (meta.mrpOverride === undefined) delete meta.mrpOverride;
  // SEO + Google Shopping data (schema/feed read these)
  if (body.seo_og_image !== undefined)
    meta.seo = { ...(meta.seo || {}), ogImage: body.seo_og_image || undefined };
  if (body.shopping_availability || body.google_product_category) {
    meta.shopping = {
      ...(meta.shopping || {}),
      ...(body.shopping_availability
        ? { availability: body.shopping_availability }
        : {}),
      ...(body.google_product_category
        ? { googleProductCategory: body.google_product_category }
        : {}),
    };
  }
  if (Array.isArray(body.materials) && body.materials.length) {
    meta.materials = body.materials.filter(
      (m) => m && Object.values(m).some((v) => v !== "" && v != null)
    );
  }
  if (Object.keys(meta).length) out.metadata = meta;

  if (body.is_active != null)
    out.status = body.is_active ? "active" : "inactive";
  if (body.status) out.status = body.status;
  return out;
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const raw = await req.json();
  return handlePATCH(`/api/v1/products/${id}`, toProductBody(raw), {
    Authorization: authHeader,
  });
}

// storeAdminCrud.update() issues PUT; NestJS exposes PATCH — forward as PATCH.
export async function PUT(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const raw = await req.json();
  return handlePATCH(`/api/v1/products/${id}`, toProductBody(raw), {
    Authorization: authHeader,
  });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/products/${id}`, null, {
    Authorization: authHeader,
  });
}

export { toProductBody };
