import { handleGET } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Whitelist of currency fields we forward to NestJS (camelCase pass-through).
function toBody(b = {}) {
  const out = {};
  const keys = [
    "countryCode",
    "countryName",
    "currencyCode",
    "currencySymbol",
    "rate",
    "isActive",
    "isDefault",
    "sortOrder",
  ];
  for (const k of keys) if (b[k] !== undefined && b[k] !== "") out[k] = b[k];
  if (out.rate !== undefined) out.rate = Number(out.rate);
  if (out.sortOrder !== undefined) out.sortOrder = Number(out.sortOrder);
  return out;
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/currencies/admin/all", { Authorization: authHeader });
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  try {
    const body = await req.json();
    const res = await fetch(`${NEST}/api/v1/currencies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        Authorization: authHeader || "",
      },
      body: JSON.stringify(toBody(body)),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export { toBody };
