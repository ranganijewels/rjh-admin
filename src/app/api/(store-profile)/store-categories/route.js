import { handleGET } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/masters/categories", { Authorization: authHeader });
}

export async function POST(req) {
  return NextResponse.json({ success: true, message: "Categories saved" });
}
