import { NextResponse } from "next/server";

const NEST_API = (process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000") + "/api/v1";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const res = await fetch(`${NEST_API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT_ID,
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || !json?.success) {
      return NextResponse.json({
        status: false,
        error: json?.message || "Invalid credentials",
      });
    }

    const { accessToken, refreshToken, user } = json.data;

    return NextResponse.json({
      status: true,
      data: {
        token: accessToken,
        refresh_token: refreshToken,
        store_id: user?.tenantId || TENANT_ID,
        on_boarding_exists: true,
        on_boarding_request_status: "approved",
        is_plan_purchase: true,
        expires_at: null,
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.fullName,
          role: user?.role,
        },
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: false,
      error: err?.message || "Login failed",
    });
  }
}
