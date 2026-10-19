// Friendly pipe/semicolon micro-format for repeatable sub-tables inside a
// single CSV cell (Materials, Carat→Weight matrix, Metal Options, Molds,
// Size/Weight diffs, FAQs) — no fixed row count, just add more `;`-separated
// groups. Much easier to hand-type in Excel/Sheets than raw JSON.
//
// Format: fields within one row are `|`-separated, rows are `;`-separated,
// list-valued fields (metal option purities/colors) are `,`-separated within
// their own field. Old exports that used raw JSON-in-cell still parse — any
// cell starting with "[" is treated as JSON for backward compatibility.
const ROW_SEP = ";";
const FIELD_SEP = "|";
const LIST_SEP = ",";

function looksLikeJson(v) {
  return typeof v === "string" && v.trim().startsWith("[");
}

function parseJsonArray(cell) {
  try {
    const parsed = JSON.parse(cell);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function encodeRows(rows, fields) {
  if (!Array.isArray(rows) || !rows.length) return "";
  return rows
    .map((r) =>
      fields.map((f) => (r[f] === undefined || r[f] === null ? "" : String(r[f]))).join(FIELD_SEP)
    )
    .join(ROW_SEP);
}

function decodeRows(cell, fields) {
  if (!cell) return [];
  if (looksLikeJson(cell)) return parseJsonArray(cell);
  return cell
    .split(ROW_SEP)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const parts = r.split(FIELD_SEP);
      const obj = {};
      fields.forEach((f, i) => {
        obj[f] = parts[i] !== undefined ? parts[i].trim() : "";
      });
      return obj;
    });
}

// Materials (BOM) — mirrors ProductForm's EMPTY_MATERIAL field order exactly.
const MATERIAL_FIELDS = [
  "component", "materialType", "metalStoneType", "shape", "quality",
  "color", "size", "setting", "pcs", "wt", "centerStone",
];
export const MATERIAL_FIELD_ORDER = MATERIAL_FIELDS;
export function encodeMaterials(rows) {
  return encodeRows(rows, MATERIAL_FIELDS);
}
export function decodeMaterials(cell) {
  return decodeRows(cell, MATERIAL_FIELDS).map((r) => ({
    ...r,
    centerStone: r.centerStone === "true" || r.centerStone === true,
  }));
}

// Carat → metal weight matrix — mirrors emptyWeightRow(): { carat, weightG }.
const WEIGHT_FIELDS = ["carat", "weightG"];
export const WEIGHT_FIELD_ORDER = WEIGHT_FIELDS;
export function encodeWeightMatrix(rows) {
  return encodeRows(rows, WEIGHT_FIELDS);
}
export function decodeWeightMatrix(cell) {
  return decodeRows(cell, WEIGHT_FIELDS);
}

// Molds — mirrors emptyMold(): { name, locker, pcs }.
const MOLD_FIELDS = ["name", "locker", "pcs"];
export const MOLD_FIELD_ORDER = MOLD_FIELDS;
export function encodeMolds(rows) {
  return encodeRows(rows, MOLD_FIELDS);
}
export function decodeMolds(cell) {
  return decodeRows(cell, MOLD_FIELDS);
}

// Size → weight % diff — mirrors emptySizeDiff(): { size, percent }.
const SIZE_DIFF_FIELDS = ["size", "percent"];
export const SIZE_DIFF_FIELD_ORDER = SIZE_DIFF_FIELDS;
export function encodeSizeWeightDiff(rows) {
  return encodeRows(rows, SIZE_DIFF_FIELDS);
}
export function decodeSizeWeightDiff(cell) {
  return decodeRows(cell, SIZE_DIFF_FIELDS);
}

// FAQs — { question, answer }.
const FAQ_FIELDS = ["question", "answer"];
export const FAQ_FIELD_ORDER = FAQ_FIELDS;
export function encodeFaqs(rows) {
  return encodeRows(rows, FAQ_FIELDS);
}
export function decodeFaqs(cell) {
  return decodeRows(cell, FAQ_FIELDS);
}

// Metal options — one row per metal TYPE, purities/colors are comma lists
// within their own field: "Gold|18K,14K|White,Yellow,Rose;Silver|925|Silver"
export const METAL_OPTION_FIELD_ORDER = ["type", "purities", "colors"];
export function encodeMetalOptions(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  return rows
    .map((r) =>
      [r.type || "", (r.purities || []).join(LIST_SEP), (r.colors || []).join(LIST_SEP)].join(
        FIELD_SEP
      )
    )
    .join(ROW_SEP);
}
// All exportable product CSV columns — flat entity columns first, then the
// free-form `metadata` fields the product form actually writes (see
// toProductBody() in app/api/product-management/[id]/route.js) so a full
// export never silently drops real data. Shared by export-csv/route.js,
// import-csv/route.js, and the admin's "Download example CSV template"
// button (ProductMasterList.js) so all three stay in lockstep.
// Image naming convention: upload files as {productCode}-{metalColor}-main.jpg
// (gallery: {productCode}-{metalColor}-gallery-1.jpg, etc.)
export const PRODUCT_CSV_HEADERS = [
  // Core identity
  "productName", "productCode", "shopifySku",
  // Taxonomy
  "category", "subCategory", "collectionName",
  // Metal
  "metalType", "metalPurity", "metalColor",
  // Diamond (total)
  "diamondShape", "diamondQuality", "diamondType", "diamondCount", "diamondWeightCt",
  // Diamond 4Cs + certification
  "diamondCut", "diamondColor", "diamondClarity",
  "diamondCertLab", "diamondCertNumber", "diamondCertUrl",
  // Center stone
  "centerStoneShape", "centerStoneWeightCt", "sideStoneDetails",
  // Weights
  "grossWeightG", "netWeightG",
  // Dimensions
  "lengthMm", "widthMm", "heightMm",
  // Size / variant
  "ringSize", "gender",
  // Media (main image URL — optional; or name files as {productCode}-{metalColor}-main.jpg)
  "mainImageUrl", "imageAltText", "renderFileUrl", "cadFileUrl", "videoUrl",
  // Descriptions
  "description", "shortDescription", "longDescription",
  // SEO
  "seoTitle", "seoDescription", "shopifyTags",
  // Pricing (labour) — products never store MRP/SRP, price is engine-computed
  "makingCharge",
  // Flags
  "status", "isReadyForQc", "isReadyForShopify",
  // Variant grouping (legacy parent/child SKU model)
  "variantType", "variantValue", "parentProductId",

  // ── metadata.* — design-master extras (no dedicated column) ─────────────
  "designGroup", "productType", "style", "occasion", "brand", "designer",
  "titleLine", "remarks", "plan", "makeType", "vendorCode", "cadDesigner",
  "parentDesign", "designPackage",
  "displayDiscountPercent", "mrpOverride",
  "seoOgImage", "shoppingAvailability", "googleProductCategory",
  // Manufacturing block (metadata.mfg)
  "mfgDesign", "waxWt", "camWt",
  // GEO/AEO + merchandising extras (also metadata.*)
  "badges", "variantLabel", "aeoSummary",
  // Nested/repeating sub-tables — no fixed row count per product, so a flat
  // CSV column-per-field layout isn't viable. Each cell holds `;`-separated
  // rows with `|`-separated fields (see the encode/decode functions above for
  // the exact field order per table). Old exports that used raw JSON-in-cell
  // still import fine — any cell starting with "[" is parsed as JSON.
  "materials",         // component|materialType|metalStoneType|shape|quality|color|size|setting|pcs|wt|centerStone ; ...
  "metalOptions",      // type|purity1,purity2|color1,color2 ; type2|... (purities/colors are comma lists)
  "weightMatrix",      // carat|weightG ; carat|weightG ; ...
  "sizeWeightDiff",    // size|percent ; ...
  "molds",             // name|locker|pcs ; ...
  "faqs",              // question|answer ; question|answer ; ...
  "productionImages",  // url1,url2,url3
  "pairsWith",         // productId1,productId2 (max 4)
];

export function decodeMetalOptions(cell) {
  if (!cell) return [];
  if (looksLikeJson(cell)) return parseJsonArray(cell);
  return cell
    .split(ROW_SEP)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const [type, purities, colors] = r.split(FIELD_SEP);
      return {
        type: (type || "").trim(),
        purities: (purities || "").split(LIST_SEP).map((s) => s.trim()).filter(Boolean),
        colors: (colors || "").split(LIST_SEP).map((s) => s.trim()).filter(Boolean),
      };
    });
}
