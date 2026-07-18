const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Generic proxy for a multipart file upload to NestJS /media/upload
// (MinIO-backed). Unlike /api/product-management/upload (hardcoded to the
// product-media bucket), bucket/prefix come from query params so any CMS
// editor (Mega Menu, etc.) can point uploads at its own folder.
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket") || "cms-media";
  const prefix = searchParams.get("prefix") || "cms";
  try {
    const inForm = await req.formData();
    const file = inForm.get("file");
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }
    const outForm = new FormData();
    outForm.append("file", file, file.name || "upload");

    const res = await fetch(
      `${NEST}/api/v1/media/upload?bucket=${encodeURIComponent(bucket)}&prefix=${encodeURIComponent(prefix)}`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": TENANT,
          Authorization: authHeader || "",
        },
        body: outForm,
      }
    );
    const data = await res.json();
    const url = data?.url ?? data?.data?.url;
    return Response.json({ url, ...data }, { status: res.ok ? 200 : res.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
