import { handleGETWithMap } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

function mapUser(u) {
  return {
    ...u,
    name: u.fullName,
    roles: [{ id: u.role, name: u.role }],
    department: null,
    designation: null,
    is_manager: false,
  };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  return handleGETWithMap(`/api/v1/users?page=${page}&limit=${limit}`, { Authorization: authHeader }, mapUser);
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  try {
    const body = await req.json();
    // Create user via auth register endpoint. RegisterDto's `role` is a plain
    // string enum (admin/manager/staff/viewer/customer) — the admin form's
    // role picker sends that same slug as `role`, not a numeric role_id.
    const res = await fetch(`${NEST}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        Authorization: authHeader,
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        fullName: body.name || body.fullName || body.full_name,
        role: body.role || "staff",
        phone: body.phone,
      }),
    });
    const data = await res.json();
    // Previously this always returned success regardless of the backend
    // result, so real failures (duplicate email, weak password, invalid
    // role) were silently swallowed and the UI showed a false "User added".
    if (!res.ok) {
      return NextResponse.json(
        { status: false, error: data?.message || "Failed to create user" },
        { status: res.status }
      );
    }
    return NextResponse.json({ status: true, data: data?.data });
  } catch (err) {
    return NextResponse.json({ status: false, error: err.message }, { status: 500 });
  }
}
