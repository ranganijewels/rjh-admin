import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
    const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

    if (authHeader) {
      await fetch(`${NEST}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "x-tenant-id": TENANT,
        },
      }).catch(() => {});
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("token");
    res.cookies.delete("store_id");
    res.cookies.delete("on_boarding_exists");
    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
