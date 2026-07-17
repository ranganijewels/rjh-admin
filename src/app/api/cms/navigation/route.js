import { handlePOST } from "@/lib/apiHandler";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// GET /api/cms/navigation → forward to the admin (flat, incl. inactive) list,
// NOT the public tree at NestJS GET /cms/navigation (that one is consumed by
// the storefront directly via its own /api/nav-menu proxy).
// Response shape is `{ data: [...] }` (not a bare array) — useCrudList's
// fetchData() reads `res?.data`, matching every other CMS list proxy.
export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    const res = await fetch(`${NEST}/api/v1/cms/navigation/admin/all`, {
      method: "GET",
      headers: {
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const j = await res.json().catch(() => ({}));
    return Response.json({ data: j?.data ?? (Array.isArray(j) ? j : []) }, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return Response.json({ message: err?.message || "Proxy error" }, { status: 500 });
  }
}

// POST /api/cms/navigation → create a navigation item
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/cms/navigation", { Authorization: authHeader });
}
