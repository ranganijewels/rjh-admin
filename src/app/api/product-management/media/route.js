const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Create a product media record (gallery / per-metal-color image).
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  const b = await req.json();
  const body = {
    productId: b.productId ?? b.product_id,
    fileUrl: b.url ?? b.fileUrl ?? b.file_url,
    mediaType: b.mediaType ?? "image",
    isCover: b.isCover ?? b.is_cover ?? false,
    sortOrder: b.sortOrder ?? b.sort_order ?? 0,
    metalColor: b.metalColor ?? b.metal_color ?? null,
    title: b.title ?? null,
    altText: b.altText ?? b.alt_text ?? null, // role marker: main | rollover | gallery
    seoAltText: b.seoAltText ?? b.seo_alt_text ?? null, // real image description (SEO/a11y)
  };
  const res = await fetch(`${NEST}/api/v1/products/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      Authorization: authHeader || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}

// Delete a media record by id: /api/product-management/media?id=<mediaId>
export async function DELETE(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const res = await fetch(`${NEST}/api/v1/products/media/${id}`, {
    method: "DELETE",
    headers: {
      "x-tenant-id": TENANT,
      Authorization: authHeader || "",
    },
  });
  const data = await res.json().catch(() => ({ success: res.ok }));
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
