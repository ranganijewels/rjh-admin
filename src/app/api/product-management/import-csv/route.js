const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Parse a CSV string into array of objects keyed by header row
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const parseRow = (line) => {
    const fields = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        fields.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    fields.push(cur);
    return fields;
  };

  const headers = parseRow(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").trim()]));
  });
}

function rowToNest(row) {
  const num = (v) => (v !== "" && v != null ? Number(v) : undefined);
  const str = (v) => (v !== "" && v != null ? String(v) : undefined);
  const bool = (v) => v === "true" || v === "1" || v === "yes";
  const body = {};
  const s = (k, v) => { if (v !== undefined) body[k] = v; };

  // Core identity
  s("productName", str(row.productName));
  s("productCode", str(row.productCode));
  s("shopifySku", str(row.shopifySku));

  // Taxonomy
  s("category", str(row.category));
  s("subCategory", str(row.subCategory));
  s("collectionName", str(row.collectionName));

  // Metal
  s("metalType", str(row.metalType));
  s("metalPurity", str(row.metalPurity));
  s("metalColor", str(row.metalColor));

  // Diamond
  s("diamondShape", str(row.diamondShape));
  s("diamondQuality", str(row.diamondQuality));
  s("diamondType", str(row.diamondType));
  s("diamondCount", num(row.diamondCount));
  s("diamondWeightCt", num(row.diamondWeightCt));

  // Diamond 4Cs + certification
  s("diamondCut", str(row.diamondCut));
  s("diamondColor", str(row.diamondColor));
  s("diamondClarity", str(row.diamondClarity));
  s("diamondCertLab", str(row.diamondCertLab));
  s("diamondCertNumber", str(row.diamondCertNumber));
  s("diamondCertUrl", str(row.diamondCertUrl));

  // Center stone
  s("centerStoneShape", str(row.centerStoneShape));
  s("centerStoneWeightCt", num(row.centerStoneWeightCt));
  s("sideStoneDetails", str(row.sideStoneDetails));

  // Weights
  s("grossWeightG", num(row.grossWeightG));
  s("netWeightG", num(row.netWeightG));

  // Dimensions
  s("lengthMm", num(row.lengthMm));
  s("widthMm", num(row.widthMm));
  s("heightMm", num(row.heightMm));

  // Size
  s("ringSize", str(row.ringSize));

  // Descriptions
  s("description", str(row.description));
  s("shortDescription", str(row.shortDescription));
  s("longDescription", str(row.longDescription));

  // SEO
  s("seoTitle", str(row.seoTitle));
  s("seoDescription", str(row.seoDescription));
  s("shopifyTags", str(row.shopifyTags));

  // Status & flags
  s("status", str(row.status) || "active");
  if (row.isReadyForQc !== "") s("isReadyForQc", bool(row.isReadyForQc));
  if (row.isReadyForShopify !== "") s("isReadyForShopify", bool(row.isReadyForShopify));

  // Variant grouping
  s("variantType", str(row.variantType));
  s("variantValue", str(row.variantValue));

  // Gender goes into metadata
  if (row.gender) body.metadata = { gender: row.gender };

  return body;
}

// After product is created, link mainImageUrl as a cover media record
async function linkMainImage(productId, mainImageUrl, productCode, auth) {
  if (!mainImageUrl) return null;
  try {
    const res = await fetch(`${NEST}/api/v1/products/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      body: JSON.stringify({
        productId,
        fileUrl: mainImageUrl,
        fileName: `${productCode || "product"}-main`,
        mediaType: "image",
        isCover: true,
        sortOrder: 0,
      }),
    });
    return res.ok ? "linked" : null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  const auth = req.headers.get("authorization");
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return Response.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) return Response.json({ error: "CSV is empty or has no data rows" }, { status: 400 });

    let created = 0, failed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.productName) {
        errors.push({ row: i + 2, reason: "productName is required" });
        failed++;
        continue;
      }
      try {
        const body = rowToNest(row);
        const res = await fetch(`${NEST}/api/v1/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": TENANT,
            ...(auth && { Authorization: auth }),
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const productId = json?.data?.id ?? json?.id;
          if (productId && row.mainImageUrl) {
            await linkMainImage(productId, row.mainImageUrl, row.productCode || row.productName, auth);
          }
          created++;
        } else {
          const err = await res.json().catch(() => ({}));
          errors.push({ row: i + 2, reason: err?.message || `HTTP ${res.status}` });
          failed++;
        }
      } catch (e) {
        errors.push({ row: i + 2, reason: e.message });
        failed++;
      }
    }

    return Response.json({ total: rows.length, created, failed, errors });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
