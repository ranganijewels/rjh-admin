import {
  encodeMaterials, encodeWeightMatrix, encodeMetalOptions,
  encodeMolds, encodeSizeWeightDiff, encodeFaqs, PRODUCT_CSV_HEADERS,
} from "@/lib/csvSubTables";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// The backend caps `limit` at 100 (see PaginationDto) — requesting more than
// that 400s, which previously made this route silently export a header-only
// (blank) CSV since the failed fetch's error body has no `data` array. Page
// through in batches instead so every product is included, not just the
// first (broken) request's worth.
const PAGE_SIZE = 100;
const MAX_PAGES = 200; // safety backstop (20,000 products)

// Shared with the "Download example CSV template" button (ProductMasterList.js)
// and import-csv/route.js's parser — one source of truth so all three never
// drift out of sync with what the product form actually writes.
export const HEADERS = PRODUCT_CSV_HEADERS;

function esc(v) {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n"))
    return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Extract a field from the product row — flat entity columns read directly;
// everything else comes out of `metadata` (see toProductBody() for the
// authoritative shape each of these is saved in).
function pick(p, h) {
  const md = p.metadata || {};
  switch (h) {
    case "gender":
      return p.gender ?? md.gender ?? "";
    case "imageAltText": {
      const media = Array.isArray(p.media) ? p.media : [];
      const cover =
        media.find((m) => m.isCover) ||
        media.find((m) => (m.altText || "").toLowerCase() === "main");
      return cover?.seoAltText ?? "";
    }
    case "designGroup": return md.designGroup ?? "";
    case "productType": return md.productType ?? "";
    case "style": return md.style ?? "";
    case "occasion": return md.occasion ?? "";
    case "brand": return md.brand ?? "";
    case "designer": return md.designer ?? "";
    case "titleLine": return md.titleLine ?? "";
    case "remarks": return md.remarks ?? "";
    case "plan": return md.plan ?? "";
    case "makeType": return md.makeType ?? "";
    case "vendorCode": return md.vendorCode ?? "";
    case "cadDesigner": return md.cadDesigner ?? "";
    case "parentDesign": return md.parentDesign ?? "";
    case "designPackage": return md.designPackage ?? "";
    case "displayDiscountPercent": return md.displayDiscountPercent ?? "";
    case "mrpOverride": return md.mrpOverride ?? "";
    case "seoOgImage": return md.seo?.ogImage ?? "";
    case "shoppingAvailability": return md.shopping?.availability ?? "";
    case "googleProductCategory": return md.shopping?.googleProductCategory ?? "";
    case "mfgDesign": return md.mfg?.mfgDesign ?? "";
    case "waxWt": return md.mfg?.waxWt ?? "";
    case "camWt": return md.mfg?.camWt ?? "";
    case "badges": return Array.isArray(md.badges) ? md.badges.join(",") : "";
    case "variantLabel": return md.variantLabel ?? "";
    case "aeoSummary": return md.aeoSummary ?? "";
    case "materials": return encodeMaterials(md.materials);
    case "metalOptions": return encodeMetalOptions(md.metalOptions);
    case "weightMatrix": return encodeWeightMatrix(md.weightMatrix);
    case "sizeWeightDiff": return encodeSizeWeightDiff(md.sizeWeightDiff);
    case "molds": return encodeMolds(md.mfg?.molds);
    case "faqs": return encodeFaqs(md.faqs);
    case "productionImages":
      return Array.isArray(md.mfg?.productionImages) ? md.mfg.productionImages.join(",") : "";
    case "pairsWith": return Array.isArray(md.pairsWith) ? md.pairsWith.join(",") : "";
    default:
      return p[h] ?? "";
  }
}

async function fetchAllProducts(auth) {
  const products = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${NEST}/api/v1/products?limit=${PAGE_SIZE}&page=${page}`, {
      headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        Array.isArray(body?.message) ? body.message.join(", ") : body?.message || `Failed to fetch products (${res.status})`
      );
    }
    const json = await res.json();
    const batch = json?.data ?? [];
    products.push(...batch);
    if (batch.length < PAGE_SIZE) break; // last page
  }
  return products;
}

export async function GET(req) {
  const auth = req.headers.get("authorization");
  try {
    const products = await fetchAllProducts(auth);

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
