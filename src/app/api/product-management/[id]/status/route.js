import { handlePATCH } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  const { is_active } = body;

  const status = is_active ? "active" : "inactive";
  return handlePATCH(`/api/v1/products/${(await params).id}`, { status }, { Authorization: authHeader });
}

export async function POST(req, { params }) {
  return PATCH(req, { params });
}
