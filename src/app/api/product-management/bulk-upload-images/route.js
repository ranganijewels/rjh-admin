const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Matches a real product's own photos/videos to it by filename, so seeding a
// CSV of products can be followed by dropping in a folder of media instead
// of uploading one file at a time per product in the form. Mirrors the exact
// role system the single-product form already uses (MediaManager.jsx:
// role = "main" | "rollover" | "gallery", one main + one rollover per color).
//
// Expected filename (case-insensitive, extension ignored):
//   {productCode}-main.jpg                    → cover image
//   {productCode}-{metalColor}-main.jpg        → main image for that color
//   {productCode}-{metalColor}-rollover.jpg    → hover-swap image for that color
//   {productCode}-{metalColor}-gallery-2.jpg   → gallery image #2 for that color
// Every color needs its OWN file — colors are never shared across a single
// upload. metalColor is optional on plain files, but required in practice
// once a product has more than one color (each color's main/rollover/gallery
// are tracked separately, exactly like the form).
// videos work identically — {productCode}-{metalColor}-main.mp4 sets that
// color's main slot to a video, same as adding a video in the form.

const COLOR_ALIASES = {
  white: "White", wg: "White", whitegold: "White",
  yellow: "Yellow", yg: "Yellow", yellowgold: "Yellow",
  rose: "Rose", rg: "Rose", rosegold: "Rose",
  gold: "Gold",
  silver: "Silver",
  platinum: "Platinum", plat: "Platinum",
};

// Two-tone combos — each is its OWN distinct color bucket (its own photo),
// not two colors sharing one file. Canonical value uses "/" to match the
// storefront's existing two-tone detection (ProductCard.jsx toSwatchKey()).
const TWO_TONE_ALIASES = {
  "white-rose": "White/Rose", "whiterose": "White/Rose", "rose-white": "White/Rose",
  "white-yellow": "White/Yellow", "whiteyellow": "White/Yellow", "yellow-white": "White/Yellow",
  "yellow-rose": "Yellow/Rose", "yellowrose": "Yellow/Rose", "rose-yellow": "Yellow/Rose",
};

async function fetchProductCodeMap(auth) {
  const map = new Map(); // lowercase productCode -> {id, productCode}
  const PAGE_SIZE = 100;
  for (let page = 1; page <= 200; page++) {
    const res = await fetch(`${NEST}/api/v1/products?limit=${PAGE_SIZE}&page=${page}`, {
      headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
      cache: "no-store",
    });
    if (!res.ok) break;
    const json = await res.json();
    const batch = json?.data ?? [];
    for (const p of batch) {
      if (p.productCode) map.set(String(p.productCode).trim().toLowerCase(), p);
    }
    if (batch.length < PAGE_SIZE) break;
  }
  return map;
}

// Resolves a color token (possibly hyphenated) against single colors first,
// then two-tone combos.
function resolveColor(token) {
  const key = token.toLowerCase().replace(/\s+/g, "");
  return COLOR_ALIASES[key] || TWO_TONE_ALIASES[key] || null;
}

// Parse "{code}-main", "{code}-{color}-main", "{code}-{color}-rollover",
// "{code}-{color}-gallery-N" (case-insensitive) against known product codes.
// Tries the full remainder as the code first so codes that themselves
// contain dashes (e.g. "AUDR-RB-150") still match before a false-positive
// color split.
function parseFileName(fileNameNoExt, codeMap) {
  const parts = fileNameNoExt.split("-").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { error: "Expected {productCode}-main, {productCode}-rollover, or {productCode}-gallery-N" };
  }

  let role = null; // "main" | "rollover" | { gallery: n }
  let rest = parts;
  const last = parts[parts.length - 1].toLowerCase();
  const secondLast = parts.length >= 2 ? parts[parts.length - 2].toLowerCase() : "";

  if (last === "main") {
    role = "main";
    rest = parts.slice(0, -1);
  } else if (last === "rollover") {
    role = "rollover";
    rest = parts.slice(0, -1);
  } else if (secondLast === "gallery" && /^\d+$/.test(last)) {
    role = { gallery: Number(last) };
    rest = parts.slice(0, -2);
  } else if (last === "gallery") {
    role = { gallery: 1 };
    rest = parts.slice(0, -1);
  } else {
    return { error: 'Filename must end in "-main", "-rollover", or "-gallery-N"' };
  }

  if (!rest.length) return { error: "Missing product code" };

  // Try the full remainder as the product code (no color in the name).
  const fullCode = rest.join("-").toLowerCase();
  if (codeMap.has(fullCode)) {
    return { product: codeMap.get(fullCode), role, color: null };
  }

  // Otherwise, try treating the last remaining segment(s) as a color and the
  // rest as the code. Two-tone combos ("White-Rose") span TWO segments, so
  // try that split before falling back to a single-segment color.
  if (rest.length >= 3) {
    const twoToneToken = rest.slice(-2).join("-");
    const color = resolveColor(twoToneToken);
    if (color) {
      const codeWithoutColor = rest.slice(0, -2).join("-").toLowerCase();
      if (codeMap.has(codeWithoutColor)) {
        return { product: codeMap.get(codeWithoutColor), role, color };
      }
    }
  }
  if (rest.length >= 2) {
    const color = resolveColor(rest[rest.length - 1]);
    if (color) {
      const codeWithoutColor = rest.slice(0, -1).join("-").toLowerCase();
      if (codeMap.has(codeWithoutColor)) {
        return { product: codeMap.get(codeWithoutColor), role, color };
      }
    }
  }

  return { error: `No product found with code "${rest.join("-")}"` };
}

async function uploadFile(file, auth) {
  const outForm = new FormData();
  outForm.append("file", file, file.name || "upload");
  const res = await fetch(`${NEST}/api/v1/media/upload?bucket=product-media&prefix=products`, {
    method: "POST",
    headers: { "x-tenant-id": TENANT, Authorization: auth || "" },
    body: outForm,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
  return data?.url ?? data?.data?.url;
}

async function attachMedia(
  { productId, fileUrl, fileName, mediaType, metalColor, role, sortOrder, title, seoAltText },
  auth
) {
  const res = await fetch(`${NEST}/api/v1/products/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      ...(auth && { Authorization: auth }),
    },
    body: JSON.stringify({
      productId,
      fileUrl,
      fileName,
      mediaType,
      isCover: role === "main",
      sortOrder,
      metalColor: metalColor || undefined,
      title,
      altText: role, // role marker: main | rollover | gallery
      seoAltText: seoAltText || undefined,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Failed to attach media (${res.status})`);
  }
}

// Fills {productName}/{color}/{role} placeholders in an optional alt-text
// template, e.g. "{productName} - {color} {role} view".
function renderAltText(template, { productName, color, role }) {
  if (!template) return "";
  const roleLabel = role === "main" ? "main" : role === "rollover" ? "rollover" : "gallery";
  return template
    .replace(/\{productName\}/gi, productName || "")
    .replace(/\{color\}/gi, color || "")
    .replace(/\{role\}/gi, roleLabel)
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req) {
  const auth = req.headers.get("authorization");
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f) => f && typeof f === "object" && "name" in f);
    const altTextTemplate = String(formData.get("altTextTemplate") || "");
    if (!files.length) {
      return Response.json({ error: "No files uploaded" }, { status: 400 });
    }

    const codeMap = await fetchProductCodeMap(auth);

    let uploaded = 0;
    const unmatched = [];

    for (const file of files) {
      const dot = file.name.lastIndexOf(".");
      const nameNoExt = dot > 0 ? file.name.slice(0, dot) : file.name;
      const parsed = parseFileName(nameNoExt, codeMap);

      if (parsed.error) {
        unmatched.push({ fileName: file.name, reason: parsed.error });
        continue;
      }

      try {
        const url = await uploadFile(file, auth);
        if (!url) throw new Error("Upload succeeded but returned no URL");

        const mediaType = file.type?.startsWith("video/") ? "video" : "image";
        const roleValue = parsed.role === "main" || parsed.role === "rollover" ? parsed.role : "gallery";
        const seoAltText = renderAltText(altTextTemplate, {
          productName: parsed.product.productName,
          color: parsed.color,
          role: roleValue,
        });

        await attachMedia(
          {
            productId: parsed.product.id,
            fileUrl: url,
            fileName: file.name,
            mediaType,
            metalColor: parsed.color,
            role: roleValue,
            sortOrder: typeof parsed.role === "object" ? parsed.role.gallery : 0,
            title: parsed.product.productName,
            seoAltText,
          },
          auth
        );
        uploaded++;
      } catch (e) {
        unmatched.push({ fileName: file.name, reason: e.message || "Upload failed" });
      }
    }

    return Response.json({ total: files.length, uploaded, unmatched });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
