const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Proxy a multipart file upload to NestJS /media/upload (MinIO/local disk).
// Returns { url }.
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  try {
    const inForm = await req.formData();
    const file = inForm.get("file");
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }
    const outForm = new FormData();
    outForm.append("file", file, file.name || "upload");

    const res = await fetch(
      `${NEST}/api/v1/media/upload?bucket=product-media&prefix=products`,
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
