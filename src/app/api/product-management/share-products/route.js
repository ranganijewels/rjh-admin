import { NextResponse } from "next/server";

export async function POST(req) {
  // Share products is a JewelLabel-specific SaaS feature; stub with success
  return NextResponse.json({ success: true, message: "Products shared" });
}
