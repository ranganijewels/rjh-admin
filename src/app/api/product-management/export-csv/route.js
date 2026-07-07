const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// All exportable columns — mirrors the product entity fields.
// Image naming convention: upload files as {productCode}-{metalColor}-main.jpg
// (gallery: {productCode}-{metalColor}-gallery-1.jpg, etc.)
export const HEADERS = [
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
  // Main image URL (optional — paste a public URL; or name files as {productCode}-{metalColor}-main.jpg)
  "mainImageUrl",
  // Descriptions
  "description", "shortDescription", "longDescription",
  // SEO
  "seoTitle", "seoDescription", "shopifyTags",
  // Flags
  "status", "isReadyForQc", "isReadyForShopify",
  // Variant grouping
  "variantType", "variantValue",
];

function esc(v) {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n"))
    return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Extract a field from the product row (handles metadata.gender nesting)
function pick(p, h) {
  if (h === "gender") return p.gender ?? p.metadata?.gender ?? "";
  return p[h] ?? "";
}

export async function GET(req) {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${NEST}/api/v1/products?limit=1000&page=1`, {
      headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
      cache: "no-store",
    });
    const json = await res.json();
    const products = json?.data?.data ?? json?.data ?? [];

    const rows = [HEADERS.join(",")];
    for (const p of products) {
      rows.push(HEADERS.map((h) => esc(pick(p, h))).join(","));
    }
    const csv = rows.join("\r\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
