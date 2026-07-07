import { handleGETWithMap, handlePOST } from "@/lib/apiHandler";

function mapDepartment(m) {
  return { ...m, name: m.valueLabel ?? m.valueKey };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGETWithMap("/api/v1/masters/values?category=department", { Authorization: authHeader }, mapDepartment);
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  return handlePOST(
    { json: async () => ({ categorySlug: "department", value: body.name || body.value, label: body.label || body.name, metadata: body }), headers: { get: (h) => h === "authorization" ? authHeader : null, "content-type": "application/json" } },
    "/api/v1/masters/values",
    { Authorization: authHeader }
  );
}
