import { NextResponse } from "next/server";
import { handleGET } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  // Return product category counts grouped by category
  const res = await handleGET("/api/v1/products?page=1&limit=1", { Authorization: authHeader });
  return res;
}
